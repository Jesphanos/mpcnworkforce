import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export interface Complaint {
  id: string;
  user_id: string;
  category: string;
  description: string;
  attachment_url: string | null;
  status: "pending" | "under_review" | "resolved";
  escalated: boolean;
  escalated_at: string | null;
  assigned_to: string | null;
  resolved_at: string | null;
  resolved_by: string | null;
  resolution_notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateComplaintInput {
  category: string;
  description: string;
  attachment_url?: string;
}

export function useComplaints() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["complaints"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("complaints")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as Complaint[];
    },
    enabled: !!user,
  });
}

export function useMyComplaints() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["my-complaints", user?.id],
    queryFn: async () => {
      if (!user) throw new Error("Not authenticated");
      
      const { data, error } = await supabase
        .from("complaints")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as Complaint[];
    },
    enabled: !!user,
  });
}

export function useCreateComplaint() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (input: CreateComplaintInput) => {
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("complaints")
        .insert({
          ...input,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["complaints"] });
      queryClient.invalidateQueries({ queryKey: ["my-complaints"] });
      toast.success("Complaint submitted successfully");
    },
    onError: (error) => {
      toast.error("Failed to submit complaint: " + error.message);
    },
  });
}

export function useUpdateComplaintStatus() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({
      complaintId,
      status,
      resolutionNotes,
      escalate,
    }: {
      complaintId: string;
      status?: "pending" | "under_review" | "resolved";
      resolutionNotes?: string;
      escalate?: boolean;
    }) => {
      if (!user) throw new Error("Not authenticated");

      const updates: Record<string, unknown> = {};
      
      if (status) {
        updates.status = status;
        if (status === "resolved") {
          updates.resolved_at = new Date().toISOString();
          updates.resolved_by = user.id;
        }
      }
      
      if (resolutionNotes) {
        updates.resolution_notes = resolutionNotes;
      }
      
      if (escalate) {
        updates.escalated = true;
        updates.escalated_at = new Date().toISOString();
      }

      const { data, error } = await supabase
        .from("complaints")
        .update(updates)
        .eq("id", complaintId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["complaints"] });
      queryClient.invalidateQueries({ queryKey: ["my-complaints"] });
      toast.success("Complaint updated successfully");
    },
    onError: (error) => {
      toast.error("Failed to update complaint: " + error.message);
    },
  });
}
