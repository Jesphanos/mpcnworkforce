import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

/**
 * Leadership Signal Types
 * Non-financial incentives for mentorship quality
 */
export type LeadershipSignalType =
  | "revision_helpfulness"
  | "worker_improvement_delta"
  | "escalation_restraint"
  | "override_justification_quality"
  | "reversal_rate"
  | "fairness_feedback";

export interface LeadershipSignal {
  id: string;
  user_id: string;
  role: string;
  signal_type: LeadershipSignalType;
  signal_value: number;
  period_start: string;
  period_end: string;
  notes: string | null;
  calculated_at: string;
  created_at: string;
}

/**
 * Signal type configurations for display
 */
export const LEADERSHIP_SIGNAL_CONFIG: Record<LeadershipSignalType, {
  label: string;
  description: string;
  interpretation: string;
  goodDirection: "higher" | "lower";
}> = {
  revision_helpfulness: {
    label: "Revision Helpfulness",
    description: "Quality of feedback provided during revisions",
    interpretation: "Based on worker improvement after receiving revision feedback",
    goodDirection: "higher",
  },
  worker_improvement_delta: {
    label: "Worker Development",
    description: "Rate of skill improvement in team members",
    interpretation: "Measures how much workers improve under this leader",
    goodDirection: "higher",
  },
  escalation_restraint: {
    label: "Escalation Restraint",
    description: "Tendency to resolve vs. escalate issues",
    interpretation: "Higher = resolves more locally without unnecessary escalation",
    goodDirection: "higher",
  },
  override_justification_quality: {
    label: "Override Justification",
    description: "Quality of reasoning when overriding decisions",
    interpretation: "Based on clarity and fairness of override explanations",
    goodDirection: "higher",
  },
  reversal_rate: {
    label: "Decision Stability",
    description: "How often decisions are reversed by higher authority",
    interpretation: "Lower = decisions more likely to be upheld",
    goodDirection: "lower",
  },
  fairness_feedback: {
    label: "Fairness Score",
    description: "Worker perception of fair treatment",
    interpretation: "Based on anonymous feedback from reviewed workers",
    goodDirection: "higher",
  },
};

/**
 * Hook to fetch leadership signals (Overseer only)
 */
export function useLeadershipSignals(userId?: string) {
  const { hasRole } = useAuth();
  const isOverseer = hasRole("general_overseer");

  return useQuery({
    queryKey: ["leadership-signals", userId],
    queryFn: async () => {
      let query = supabase
        .from("leadership_signals")
        .select("*")
        .order("calculated_at", { ascending: false });

      if (userId) {
        query = query.eq("user_id", userId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as LeadershipSignal[];
    },
    enabled: isOverseer,
  });
}

/**
 * Hook to calculate leadership metrics for a user
 * This aggregates signals into a summary
 */
export function useLeadershipSummary(userId: string) {
  const { data: signals, isLoading } = useLeadershipSignals(userId);

  const summary = signals ? {
    totalSignals: signals.length,
    averageHelpfulness: calculateAverage(signals, "revision_helpfulness"),
    averageImprovementDelta: calculateAverage(signals, "worker_improvement_delta"),
    averageEscalationRestraint: calculateAverage(signals, "escalation_restraint"),
    averageOverrideQuality: calculateAverage(signals, "override_justification_quality"),
    averageReversalRate: calculateAverage(signals, "reversal_rate"),
    averageFairness: calculateAverage(signals, "fairness_feedback"),
    overallScore: calculateOverallScore(signals),
  } : null;

  return { summary, isLoading };
}

function calculateAverage(signals: LeadershipSignal[], type: LeadershipSignalType): number {
  const typeSignals = signals.filter((s) => s.signal_type === type);
  if (typeSignals.length === 0) return 0;
  return typeSignals.reduce((sum, s) => sum + Number(s.signal_value), 0) / typeSignals.length;
}

function calculateOverallScore(signals: LeadershipSignal[]): number {
  if (signals.length === 0) return 0;
  
  // Weighted average based on importance
  const weights: Record<LeadershipSignalType, number> = {
    revision_helpfulness: 1.5,
    worker_improvement_delta: 2.0,
    escalation_restraint: 1.0,
    override_justification_quality: 1.2,
    reversal_rate: -1.5, // Negative because lower is better
    fairness_feedback: 1.8,
  };

  let weightedSum = 0;
  let totalWeight = 0;

  Object.entries(weights).forEach(([type, weight]) => {
    const avg = calculateAverage(signals, type as LeadershipSignalType);
    if (avg > 0) {
      weightedSum += avg * Math.abs(weight) * (weight < 0 ? -1 : 1);
      totalWeight += Math.abs(weight);
    }
  });

  return totalWeight > 0 ? weightedSum / totalWeight : 0;
}
