import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

/**
 * Learning Insight Types
 * Post-resolution feedback linked to skills
 */
export interface LearningInsight {
  id: string;
  user_id: string;
  entity_type: "task" | "report";
  entity_id: string;
  what_went_well: string | null;
  what_to_improve: string | null;
  skill_signal: string | null;
  suggestions: string[] | null;
  generated_by: "system" | "reviewer" | "overseer";
  resolution_status: string;
  created_at: string;
}

export interface CreateLearningInsightInput {
  user_id: string;
  entity_type: "task" | "report";
  entity_id: string;
  what_went_well?: string;
  what_to_improve?: string;
  skill_signal?: string;
  suggestions?: string[];
  generated_by: "system" | "reviewer" | "overseer";
  resolution_status: string;
}

/**
 * Hook to fetch learning insights for the current user
 */
export function useMyLearningInsights() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["learning-insights", "my", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("learning_insights")
        .select("*")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as LearningInsight[];
    },
    enabled: !!user?.id,
  });
}

/**
 * Hook to fetch learning insights for a specific entity
 */
export function useLearningInsightsForEntity(entityType: "task" | "report", entityId: string) {
  return useQuery({
    queryKey: ["learning-insights", "entity", entityType, entityId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("learning_insights")
        .select("*")
        .eq("entity_type", entityType)
        .eq("entity_id", entityId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as LearningInsight[];
    },
    enabled: !!entityId,
  });
}

/**
 * Hook to create a learning insight (for reviewers)
 */
export function useCreateLearningInsight() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (input: CreateLearningInsightInput) => {
      const { data, error } = await supabase
        .from("learning_insights")
        .insert(input)
        .select()
        .single();

      if (error) throw error;
      return data as LearningInsight;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["learning-insights"] });
      toast({
        title: "Learning insight created",
        description: "Feedback has been added to help the worker grow.",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to create insight",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

/**
 * Hook to get skill progression over time
 */
export function useSkillProgression() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["skill-progression", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("learning_insights")
        .select("skill_signal, created_at, resolution_status")
        .eq("user_id", user!.id)
        .not("skill_signal", "is", null)
        .order("created_at", { ascending: true });

      if (error) throw error;

      // Group by skill and track progression
      const skillMap: Record<string, { count: number; firstSeen: string; lastSeen: string }> = {};
      
      data.forEach((insight) => {
        const skill = insight.skill_signal!;
        if (!skillMap[skill]) {
          skillMap[skill] = { count: 0, firstSeen: insight.created_at, lastSeen: insight.created_at };
        }
        skillMap[skill].count++;
        skillMap[skill].lastSeen = insight.created_at;
      });

      return Object.entries(skillMap).map(([skill, data]) => ({
        skill,
        ...data,
      }));
    },
    enabled: !!user?.id,
  });
}
