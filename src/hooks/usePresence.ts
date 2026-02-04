import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { RealtimeChannel } from "@supabase/supabase-js";

interface PresenceUser {
  id: string;
  name: string;
  avatar_url?: string;
  status: "online" | "away" | "busy";
  last_seen: string;
}

interface UsePresenceOptions {
  channelName: string;
  enabled?: boolean;
}

export function usePresence({ channelName, enabled = true }: UsePresenceOptions) {
  const { user, profile } = useAuth();
  const [users, setUsers] = useState<PresenceUser[]>([]);
  const [channel, setChannel] = useState<RealtimeChannel | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  // Track user's own presence
  const trackPresence = useCallback(async (status: "online" | "away" | "busy" = "online") => {
    if (!channel || !user || !profile) return;

    try {
      await channel.track({
        id: user.id,
        name: profile.full_name || "Anonymous",
        avatar_url: profile.avatar_url,
        status,
        last_seen: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Error tracking presence:", error);
    }
  }, [channel, user, profile]);

  // Set up presence channel
  useEffect(() => {
    if (!enabled || !user) return;

    const presenceChannel = supabase.channel(`presence:${channelName}`, {
      config: {
        presence: {
          key: user.id,
        },
      },
    });

    presenceChannel
      .on("presence", { event: "sync" }, () => {
        const state = presenceChannel.presenceState();
        const presenceUsers: PresenceUser[] = [];
        
        Object.values(state).forEach((presence: any[]) => {
          presence.forEach((p) => {
            if (p.id !== user.id) {
              presenceUsers.push({
                id: p.id,
                name: p.name,
                avatar_url: p.avatar_url,
                status: p.status || "online",
                last_seen: p.last_seen,
              });
            }
          });
        });
        
        setUsers(presenceUsers);
      })
      .on("presence", { event: "join" }, ({ key, newPresences }) => {
        console.log("User joined:", key, newPresences);
      })
      .on("presence", { event: "leave" }, ({ key, leftPresences }) => {
        console.log("User left:", key, leftPresences);
      })
      .subscribe(async (status) => {
        if (status === "SUBSCRIBED") {
          setIsConnected(true);
          // Track own presence on subscribe
          if (profile) {
            await presenceChannel.track({
              id: user.id,
              name: profile.full_name || "Anonymous",
              avatar_url: profile.avatar_url,
              status: "online",
              last_seen: new Date().toISOString(),
            });
          }
        }
      });

    setChannel(presenceChannel);

    // Handle visibility change to update status
    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        presenceChannel.track({
          id: user.id,
          name: profile?.full_name || "Anonymous",
          avatar_url: profile?.avatar_url,
          status: "away",
          last_seen: new Date().toISOString(),
        });
      } else {
        presenceChannel.track({
          id: user.id,
          name: profile?.full_name || "Anonymous",
          avatar_url: profile?.avatar_url,
          status: "online",
          last_seen: new Date().toISOString(),
        });
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      presenceChannel.unsubscribe();
    };
  }, [channelName, enabled, user, profile]);

  return {
    users,
    isConnected,
    trackPresence,
    userCount: users.length + (isConnected ? 1 : 0), // Include self
  };
}

// Simple hook for page-level presence
export function usePagePresence(pageName: string) {
  return usePresence({
    channelName: `page:${pageName}`,
    enabled: true,
  });
}
