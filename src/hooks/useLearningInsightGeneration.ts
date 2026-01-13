import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

/**
 * Skill inference based on platform and task type
 */
function inferSkillSignal(platform: string, taskType?: string | null): string {
  const platformSkills: Record<string, string> = {
    "Upwork": "Freelancing",
    "Fiverr": "Service Delivery",
    "99designs": "Design",
    "Toptal": "Expert Consulting",
    "Freelancer": "Project Bidding",
    "PeoplePerHour": "Hourly Services",
    "Guru": "Professional Services",
  };

  const taskSkills: Record<string, string> = {
    "research": "Research & Analysis",
    "coding": "Software Development",
    "design": "Creative Design",
    "support": "Customer Support",
    "writing": "Content Creation",
    "data_entry": "Data Processing",
    "quality_assurance": "Quality Control",
    "project_management": "Project Leadership",
  };

  // Priority: task type > platform
  if (taskType && taskSkills[taskType]) {
    return taskSkills[taskType];
  }
  
  return platformSkills[platform] || "General Proficiency";
}

/**
 * Generate feedback based on resolution status
 */
function generateFeedback(
  status: "approved" | "rejected",
  platform: string,
  taskType?: string | null
): {
  whatWentWell: string | null;
  whatToImprove: string | null;
  suggestions: string[];
} {
  if (status === "approved") {
    return {
      whatWentWell: `Successfully completed work on ${platform}. Quality standards met.`,
      whatToImprove: null,
      suggestions: [
        "Consider documenting your approach for future reference",
        "Look for opportunities to optimize your workflow",
      ],
    };
  }

  // Rejection feedback
  return {
    whatWentWell: null,
    whatToImprove: `Submission requires revision. Review feedback carefully.`,
    suggestions: [
      "Review the specific feedback provided",
      "Ask for clarification if requirements are unclear",
      "Take time to understand quality expectations",
    ],
  };
}

interface GenerateLearningInsightInput {
  userId: string;
  entityId: string;
  entityType: "task" | "report";
  resolutionStatus: "approved" | "rejected";
  platform: string;
  taskType?: string | null;
  feedbackNotes?: string | null;
}

/**
 * Hook to automatically generate learning insights during approval/rejection
 */
export function useGenerateLearningInsight() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (input: GenerateLearningInsightInput) => {
      const skillSignal = inferSkillSignal(input.platform, input.taskType);
      const feedback = generateFeedback(input.resolutionStatus, input.platform, input.taskType);

      const insertData = {
        user_id: input.userId,
        entity_id: input.entityId,
        entity_type: input.entityType,
        resolution_status: input.resolutionStatus,
        generated_by: "reviewer" as const,
        skill_signal: skillSignal,
        what_went_well: feedback.whatWentWell,
        what_to_improve: input.feedbackNotes || feedback.whatToImprove,
        suggestions: feedback.suggestions,
      };

      const { data, error } = await supabase
        .from("learning_insights")
        .insert(insertData)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["learning-insights"] });
    },
    onError: (error) => {
      console.error("Failed to generate learning insight:", error);
      // Silent failure - don't interrupt the main workflow
    },
  });
}

/**
 * Hook that wraps report approval with automatic learning insight generation
 */
export function useReportApprovalWithInsight() {
  const generateInsight = useGenerateLearningInsight();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return {
    generateInsightForReport: async (
      reportId: string,
      userId: string,
      status: "approved" | "rejected",
      platform: string,
      taskType?: string | null,
      feedbackNotes?: string | null
    ) => {
      await generateInsight.mutateAsync({
        userId,
        entityId: reportId,
        entityType: "report",
        resolutionStatus: status,
        platform,
        taskType,
        feedbackNotes,
      });
    },
    isPending: generateInsight.isPending,
  };
}