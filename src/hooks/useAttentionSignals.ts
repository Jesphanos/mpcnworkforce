import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export type AttentionLevel = "informational" | "support_needed" | "review_required";

export interface AttentionSignal {
  id: string;
  user_id: string;
  signal_type: string;
  level: AttentionLevel;
  trigger_count: number;
  trigger_threshold: number;
  related_entity_type: string | null;
  related_entity_id: string | null;
  triggered_by: string | null;
  resolved_at: string | null;
  resolved_by: string | null;
  resolution_notes: string | null;
  is_private: boolean;
  created_at: string;
  updated_at: string;
  // Joined fields
  user_name?: string;
  triggered_by_name?: string;
}

export function useAttentionSignals(options?: { unresolvedOnly?: boolean }) {
  return useQuery({
    queryKey: ["attention-signals", options],
    queryFn: async () => {
      let query = supabase
        .from("attention_signals")
        .select("*")
        .order("created_at", { ascending: false });

      if (options?.unresolvedOnly) {
        query = query.is("resolved_at", null);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as AttentionSignal[];
    },
  });
}

export function useMyAttentionSignals() {
  return useQuery({
    queryKey: ["my-attention-signals"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from("attention_signals")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as AttentionSignal[];
    },
  });
}

export function useResolveAttentionSignal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      signalId, 
      resolutionNotes 
    }: { 
      signalId: string; 
      resolutionNotes: string 
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase
        .from("attention_signals")
        .update({
          resolved_at: new Date().toISOString(),
          resolved_by: user.id,
          resolution_notes: resolutionNotes,
        })
        .eq("id", signalId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["attention-signals"] });
      toast.success("Attention signal resolved");
    },
    onError: (error) => {
      toast.error("Failed to resolve signal: " + error.message);
    },
  });
}

// Signal type labels (humane terminology)
export const SIGNAL_TYPE_LABELS: Record<string, { label: string; description: string }> = {
  repeated_revisions: {
    label: "Support Review Recommended",
    description: "Multiple revision requests in a short period may indicate a need for additional guidance.",
  },
  repeated_adjustments: {
    label: "Pattern Review",
    description: "Frequent decision adjustments for the same user warrant a governance review.",
  },
  self_approval_attempt: {
    label: "Policy Reminder Needed",
    description: "An attempt to approve one's own work was automatically prevented.",
  },
};

export const ATTENTION_LEVEL_CONFIG: Record<AttentionLevel, { 
  label: string; 
  color: string; 
  bgColor: string 
}> = {
  informational: {
    label: "For Awareness",
    color: "text-info",
    bgColor: "bg-info/10",
  },
  support_needed: {
    label: "Support Recommended",
    color: "text-warning",
    bgColor: "bg-warning/10",
  },
  review_required: {
    label: "Review Required",
    color: "text-destructive",
    bgColor: "bg-destructive/10",
  },
};
