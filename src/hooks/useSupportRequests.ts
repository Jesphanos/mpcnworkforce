/**
 * Support Requests Hook
 * 
 * @deprecated useComplaints is deprecated. Use this hook instead.
 * This hook uses resolution_requests for new entries and reads from both tables for migration.
 * 
 * Migration path:
 * - New requests go to resolution_requests
 * - Existing complaints remain read-only
 */
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export interface SupportRequest {
  id: string;
  raised_by: string;
  category: string;
  title: string;
  description: string;
  status: "open" | "under_review" | "mediation" | "resolved" | "escalated";
  priority: string;
  evidence_url: string | null;
  assigned_to: string | null;
  resolved_at: string | null;
  resolved_by: string | null;
  resolution: string | null;
  is_confidential: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateSupportRequestInput {
  category: string;
  title: string;
  description: string;
  priority?: "low" | "normal" | "high" | "urgent";
  evidence_url?: string;
  is_confidential?: boolean;
}

/**
 * Fetch all support requests (admin view)
 */
export function useSupportRequests() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["support-requests"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("resolution_requests")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as SupportRequest[];
    },
    enabled: !!user,
  });
}

/**
 * Fetch user's own support requests
 */
export function useMySupportRequests() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["my-support-requests", user?.id],
    queryFn: async () => {
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("resolution_requests")
        .select("*")
        .eq("raised_by", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as SupportRequest[];
    },
    enabled: !!user,
  });
}

/**
 * Create a new support request
 */
export function useCreateSupportRequest() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (input: CreateSupportRequestInput) => {
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("resolution_requests")
        .insert({
          ...input,
          raised_by: user.id,
          priority: input.priority || "normal",
          is_confidential: input.is_confidential ?? true,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["support-requests"] });
      queryClient.invalidateQueries({ queryKey: ["my-support-requests"] });
      toast.success("Support request submitted successfully");
    },
    onError: (error) => {
      toast.error("Failed to submit request: " + error.message);
    },
  });
}

/**
 * Update support request status
 */
export function useUpdateSupportRequestStatus() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({
      requestId,
      status,
      resolution,
    }: {
      requestId: string;
      status?: SupportRequest["status"];
      resolution?: string;
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

      if (resolution) {
        updates.resolution = resolution;
      }

      const { data, error } = await supabase
        .from("resolution_requests")
        .update(updates)
        .eq("id", requestId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["support-requests"] });
      queryClient.invalidateQueries({ queryKey: ["my-support-requests"] });
      toast.success("Request updated successfully");
    },
    onError: (error) => {
      toast.error("Failed to update request: " + error.message);
    },
  });
}
