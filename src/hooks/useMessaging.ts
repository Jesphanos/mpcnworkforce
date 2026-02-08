import { useState, useEffect, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export type ChannelType = "team" | "department" | "announcement" | "direct";

export interface Channel {
  id: string;
  name: string;
  description: string | null;
  channel_type: ChannelType;
  team_id: string | null;
  department_id: string | null;
  created_by: string;
  is_archived: boolean;
  created_at: string;
  updated_at: string;
  unread_count?: number;
}

export interface Message {
  id: string;
  channel_id: string;
  sender_id: string;
  content: string;
  attachment_url: string | null;
  attachment_type: string | null;
  is_pinned: boolean;
  is_edited: boolean;
  reply_to_id: string | null;
  created_at: string;
  updated_at: string;
  sender?: {
    id: string;
    full_name: string | null;
    avatar_url: string | null;
  };
}

export interface ChannelParticipant {
  id: string;
  channel_id: string;
  user_id: string;
  role: "admin" | "moderator" | "member";
  last_read_at: string;
  joined_at: string;
  profile?: {
    id: string;
    full_name: string | null;
    avatar_url: string | null;
  };
}

export function useChannels() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["channels", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("channels")
        .select("*")
        .eq("is_archived", false)
        .order("channel_type")
        .order("name");

      if (error) throw error;
      return data as Channel[];
    },
    enabled: !!user,
  });
}

export function useChannelMessages(channelId: string | null) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["messages", channelId],
    queryFn: async () => {
      if (!channelId) return [];

      // Get messages
      const { data: messagesData, error } = await supabase
        .from("messages")
        .select("*")
        .eq("channel_id", channelId)
        .order("created_at", { ascending: true })
        .limit(100);

      if (error) throw error;

      // Get unique sender IDs
      const senderIds = [...new Set(messagesData.map(m => m.sender_id))];
      
      // Fetch profiles for senders
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, full_name, avatar_url")
        .in("id", senderIds);

      const profileMap = new Map(profiles?.map(p => [p.id, p]) || []);

      // Combine messages with sender profiles
      return messagesData.map(msg => ({
        ...msg,
        sender: profileMap.get(msg.sender_id) || null,
      })) as Message[];
    },
    enabled: !!channelId && !!user,
  });
}

export function useChannelParticipants(channelId: string | null) {
  return useQuery({
    queryKey: ["channel-participants", channelId],
    queryFn: async () => {
      if (!channelId) return [];

      // Get participants
      const { data: participantsData, error } = await supabase
        .from("channel_participants")
        .select("*")
        .eq("channel_id", channelId);

      if (error) throw error;

      // Get unique user IDs
      const userIds = [...new Set(participantsData.map(p => p.user_id))];
      
      // Fetch profiles
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, full_name, avatar_url")
        .in("id", userIds);

      const profileMap = new Map(profiles?.map(p => [p.id, p]) || []);

      return participantsData.map(p => ({
        ...p,
        role: p.role as "admin" | "moderator" | "member",
        profile: profileMap.get(p.user_id) || null,
      })) as ChannelParticipant[];
    },
    enabled: !!channelId,
  });
}

export function useSendMessage() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({
      channelId,
      content,
      attachmentUrl,
      attachmentType,
      replyToId,
    }: {
      channelId: string;
      content: string;
      attachmentUrl?: string;
      attachmentType?: string;
      replyToId?: string;
    }) => {
      const { data, error } = await supabase
        .from("messages")
        .insert({
          channel_id: channelId,
          sender_id: user?.id,
          content,
          attachment_url: attachmentUrl,
          attachment_type: attachmentType,
          reply_to_id: replyToId,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["messages", variables.channelId] });
    },
    onError: (error) => {
      toast.error("Failed to send message", { description: error.message });
    },
  });
}

export function useCreateChannel() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({
      name,
      description,
      channelType,
      teamId,
      departmentId,
      participantIds,
    }: {
      name: string;
      description?: string;
      channelType: ChannelType;
      teamId?: string;
      departmentId?: string;
      participantIds?: string[];
    }) => {
      // Create channel
      const { data: channel, error: channelError } = await supabase
        .from("channels")
        .insert({
          name,
          description,
          channel_type: channelType,
          team_id: teamId,
          department_id: departmentId,
          created_by: user?.id,
        })
        .select()
        .single();

      if (channelError) throw channelError;

      // Add creator as admin
      const { error: creatorError } = await supabase
        .from("channel_participants")
        .insert({
          channel_id: channel.id,
          user_id: user?.id,
          role: "admin",
        });

      if (creatorError) throw creatorError;

      // Add other participants
      if (participantIds && participantIds.length > 0) {
        const participants = participantIds
          .filter((id) => id !== user?.id)
          .map((userId) => ({
            channel_id: channel.id,
            user_id: userId,
            role: "member" as const,
          }));

        if (participants.length > 0) {
          const { error: participantsError } = await supabase
            .from("channel_participants")
            .insert(participants);

          if (participantsError) throw participantsError;
        }
      }

      return channel;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["channels"] });
      toast.success("Channel created successfully");
    },
    onError: (error) => {
      toast.error("Failed to create channel", { description: error.message });
    },
  });
}

export function useRealtimeMessages(channelId: string | null) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!channelId) return;

    const channel = supabase
      .channel(`messages:${channelId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "messages",
          filter: `channel_id=eq.${channelId}`,
        },
        (payload) => {
          console.log("[Messaging] Realtime update:", payload);
          queryClient.invalidateQueries({ queryKey: ["messages", channelId] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [channelId, queryClient]);
}

export function useUnreadCounts() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["unread-counts", user?.id],
    queryFn: async () => {
      // Get user's channel participation with last read times
      const { data: participation, error } = await supabase
        .from("channel_participants")
        .select("channel_id, last_read_at")
        .eq("user_id", user?.id);

      if (error) throw error;

      // For each channel, count messages after last_read_at
      const counts: Record<string, number> = {};
      
      for (const p of participation || []) {
        const { count, error: countError } = await supabase
          .from("messages")
          .select("*", { count: "exact", head: true })
          .eq("channel_id", p.channel_id)
          .gt("created_at", p.last_read_at)
          .neq("sender_id", user?.id);

        if (!countError) {
          counts[p.channel_id] = count || 0;
        }
      }

      return counts;
    },
    enabled: !!user,
    refetchInterval: 30000, // Refresh every 30 seconds
  });
}

export function useMarkChannelRead() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (channelId: string) => {
      const { error } = await supabase
        .from("channel_participants")
        .update({ last_read_at: new Date().toISOString() })
        .eq("channel_id", channelId)
        .eq("user_id", user?.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["unread-counts"] });
    },
  });
}
