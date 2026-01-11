import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

/**
 * Task Contribution Types
 * For collaborative work units
 */
export interface TaskContribution {
  id: string;
  task_id: string;
  user_id: string;
  contribution_weight: number;
  contribution_notes: string | null;
  verified_by: string | null;
  verified_at: string | null;
  created_at: string;
}

export interface CreateContributionInput {
  task_id: string;
  user_id: string;
  contribution_weight: number;
  contribution_notes?: string;
}

/**
 * Hook to fetch contributions for a task
 */
export function useTaskContributions(taskId: string) {
  return useQuery({
    queryKey: ["task-contributions", taskId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("task_contributions")
        .select("*")
        .eq("task_id", taskId)
        .order("contribution_weight", { ascending: false });

      if (error) throw error;
      return data as TaskContribution[];
    },
    enabled: !!taskId,
  });
}

/**
 * Hook to fetch my contributions
 */
export function useMyContributions() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["task-contributions", "my", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("task_contributions")
        .select("*")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as TaskContribution[];
    },
    enabled: !!user?.id,
  });
}

/**
 * Hook to create contributions for a shared task
 */
export function useCreateContributions() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (contributions: CreateContributionInput[]) => {
      const { data, error } = await supabase
        .from("task_contributions")
        .insert(contributions)
        .select();

      if (error) throw error;
      return data as TaskContribution[];
    },
    onSuccess: (_, variables) => {
      if (variables.length > 0) {
        queryClient.invalidateQueries({ queryKey: ["task-contributions", variables[0].task_id] });
      }
      queryClient.invalidateQueries({ queryKey: ["task-contributions"] });
      toast({
        title: "Contributions recorded",
        description: "Team contributions have been documented.",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to record contributions",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

/**
 * Hook to verify contributions
 */
export function useVerifyContribution() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (contributionId: string) => {
      const { error } = await supabase
        .from("task_contributions")
        .update({
          verified_by: user!.id,
          verified_at: new Date().toISOString(),
        })
        .eq("id", contributionId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["task-contributions"] });
      toast({
        title: "Contribution verified",
        description: "The contribution has been confirmed.",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to verify",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

/**
 * Calculate weighted earnings for a shared task
 */
export function calculateWeightedEarnings(
  totalEarnings: number,
  contributions: TaskContribution[]
): { userId: string; amount: number; weight: number }[] {
  const totalWeight = contributions.reduce((sum, c) => sum + c.contribution_weight, 0);
  
  if (totalWeight === 0) return [];
  
  return contributions.map((c) => ({
    userId: c.user_id,
    amount: (c.contribution_weight / totalWeight) * totalEarnings,
    weight: c.contribution_weight,
  }));
}
