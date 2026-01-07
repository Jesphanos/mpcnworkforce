import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export type ResolutionStatus = "open" | "under_review" | "mediation" | "resolved" | "escalated";

export interface ResolutionRequest {
  id: string;
  raised_by: string;
  against_user_id: string | null;
  category: string;
  title: string;
  description: string;
  evidence_url: string | null;
  status: ResolutionStatus;
  priority: string;
  assigned_to: string | null;
  assigned_at: string | null;
  sla_due_at: string | null;
  sla_breached: boolean;
  mediator_id: string | null;
  mediation_started_at: string | null;
  mediation_notes: string | null;
  resolution: string | null;
  resolved_by: string | null;
  resolved_at: string | null;
  escalated_to: string | null;
  escalated_at: string | null;
  escalation_reason: string | null;
  related_entity_type: string | null;
  related_entity_id: string | null;
  is_confidential: boolean;
  created_at: string;
  updated_at: string;
}

export function useResolutionRequests(options?: { status?: ResolutionStatus }) {
  return useQuery({
    queryKey: ["resolution-requests", options],
    queryFn: async () => {
      let query = supabase
        .from("resolution_requests")
        .select("*")
        .order("created_at", { ascending: false });

      if (options?.status) {
        query = query.eq("status", options.status);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as ResolutionRequest[];
    },
  });
}

export function useMyResolutionRequests() {
  return useQuery({
    queryKey: ["my-resolution-requests"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from("resolution_requests")
        .select("*")
        .eq("raised_by", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as ResolutionRequest[];
    },
  });
}

export function useCreateResolutionRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (request: {
      category: string;
      title: string;
      description: string;
      priority?: string;
      evidence_url?: string;
      related_entity_type?: string;
      related_entity_id?: string;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("resolution_requests")
        .insert({
          ...request,
          raised_by: user.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["resolution-requests"] });
      queryClient.invalidateQueries({ queryKey: ["my-resolution-requests"] });
      toast.success("Resolution request submitted");
    },
    onError: (error) => {
      toast.error("Failed to submit request: " + error.message);
    },
  });
}

export function useUpdateResolutionRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      requestId,
      updates,
    }: {
      requestId: string;
      updates: Partial<ResolutionRequest>;
    }) => {
      const { error } = await supabase
        .from("resolution_requests")
        .update(updates)
        .eq("id", requestId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["resolution-requests"] });
      queryClient.invalidateQueries({ queryKey: ["my-resolution-requests"] });
      toast.success("Request updated");
    },
    onError: (error) => {
      toast.error("Failed to update request: " + error.message);
    },
  });
}

// Category labels
export const RESOLUTION_CATEGORIES: Record<string, { label: string; description: string }> = {
  work_decision: {
    label: "Work Decision",
    description: "Concerns about task or report decisions",
  },
  rate_dispute: {
    label: "Rate Concern",
    description: "Questions about rate calculations or changes",
  },
  conduct: {
    label: "Conduct",
    description: "Interpersonal or professional conduct concerns",
  },
  policy: {
    label: "Policy Clarification",
    description: "Questions about MPCN policies or procedures",
  },
  other: {
    label: "Other",
    description: "General concerns or feedback",
  },
};

// Status config
export const RESOLUTION_STATUS_CONFIG: Record<ResolutionStatus, {
  label: string;
  color: string;
  bgColor: string;
}> = {
  open: {
    label: "Open",
    color: "text-warning",
    bgColor: "bg-warning/10",
  },
  under_review: {
    label: "Under Review",
    color: "text-info",
    bgColor: "bg-info/10",
  },
  mediation: {
    label: "In Mediation",
    color: "text-primary",
    bgColor: "bg-primary/10",
  },
  resolved: {
    label: "Resolved",
    color: "text-success",
    bgColor: "bg-success/10",
  },
  escalated: {
    label: "Escalated",
    color: "text-destructive",
    bgColor: "bg-destructive/10",
  },
};
