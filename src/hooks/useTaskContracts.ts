import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

/**
 * Task Contract Types
 * Defines the explicit responsibility contract for each task
 */
export type EffortBand = "low" | "medium" | "high";
export type ReviewType = "automated" | "team_lead" | "admin";
export type PaymentLogicType = "fixed" | "variable" | "milestone";
export type FailureHandlingPolicy = "revision" | "partial_approval" | "escalation";

export interface TaskContract {
  task_purpose: string | null;
  success_criteria: string | null;
  effort_band: EffortBand;
  review_type: ReviewType;
  payment_logic_type: PaymentLogicType;
  failure_handling_policy: FailureHandlingPolicy;
}

export interface TaskWithContract {
  id: string;
  title: string;
  description: string | null;
  platform: string;
  task_type: string | null;
  work_date: string;
  hours_worked: number;
  base_rate: number;
  current_rate: number;
  final_status: string;
  // Contract fields
  task_purpose: string | null;
  success_criteria: string | null;
  effort_band: EffortBand | null;
  review_type: ReviewType | null;
  payment_logic_type: PaymentLogicType | null;
  failure_handling_policy: FailureHandlingPolicy | null;
  is_shared: boolean | null;
  outcome_evaluation: string | null;
}

/**
 * Effort band descriptions for UI
 */
export const EFFORT_BAND_CONFIG: Record<EffortBand, { label: string; description: string; color: string }> = {
  low: { label: "Low Effort", description: "Simple, routine task", color: "bg-success/20 text-success" },
  medium: { label: "Medium Effort", description: "Standard complexity", color: "bg-warning/20 text-warning" },
  high: { label: "High Effort", description: "Complex, requires expertise", color: "bg-destructive/20 text-destructive" },
};

/**
 * Review type descriptions
 */
export const REVIEW_TYPE_CONFIG: Record<ReviewType, { label: string; description: string }> = {
  automated: { label: "Automated", description: "System-verified completion" },
  team_lead: { label: "Team Lead Review", description: "First-level manual review" },
  admin: { label: "Admin Review", description: "Direct admin approval required" },
};

/**
 * Payment logic descriptions
 */
export const PAYMENT_LOGIC_CONFIG: Record<PaymentLogicType, { label: string; description: string }> = {
  fixed: { label: "Fixed Rate", description: "Pay based on hours × rate" },
  variable: { label: "Variable Rate", description: "Rate adjustable during review" },
  milestone: { label: "Milestone-Based", description: "Pay on completion milestones" },
};

/**
 * Hook to update task contract fields
 */
export function useUpdateTaskContract() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ taskId, contract }: { taskId: string; contract: Partial<TaskContract> }) => {
      const { error } = await supabase
        .from("tasks")
        .update({
          task_purpose: contract.task_purpose,
          success_criteria: contract.success_criteria,
          effort_band: contract.effort_band,
          review_type: contract.review_type,
          payment_logic_type: contract.payment_logic_type,
          failure_handling_policy: contract.failure_handling_policy,
        })
        .eq("id", taskId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      toast({
        title: "Task contract updated",
        description: "The task responsibility contract has been saved.",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to update contract",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

/**
 * Hook to evaluate task outcome
 */
export function useEvaluateTaskOutcome() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ taskId, evaluation }: { taskId: string; evaluation: string }) => {
      const { error } = await supabase
        .from("tasks")
        .update({ outcome_evaluation: evaluation })
        .eq("id", taskId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      toast({
        title: "Outcome evaluated",
        description: "Task outcome has been recorded.",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to evaluate outcome",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}
