import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export interface WorkReport {
  id: string;
  user_id: string;
  platform: string;
  work_date: string;
  hours_worked: number;
  earnings: number;
  description: string | null;
  status: "pending" | "approved" | "rejected";
  reviewed_by: string | null;
  reviewed_at: string | null;
  rejection_reason: string | null;
  base_rate: number | null;
  current_rate: number | null;
  team_lead_status: string | null;
  team_lead_rejection_reason: string | null;
  team_lead_reviewed_by: string | null;
  team_lead_reviewed_at: string | null;
  admin_status: string | null;
  admin_override_reason: string | null;
  final_status: string;
  task_type: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateWorkReportInput {
  platform: string;
  work_date: string;
  hours_worked: number;
  earnings: number;
  description?: string;
}

export function useWorkReports() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["work-reports", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("work_reports")
        .select("*")
        .order("work_date", { ascending: false });

      if (error) throw error;
      return data as WorkReport[];
    },
    enabled: !!user,
  });
}

export function useCreateWorkReport() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (input: CreateWorkReportInput) => {
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("work_reports")
        .insert({
          user_id: user.id,
          ...input,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    // Optimistic update
    onMutate: async (newReport) => {
      await queryClient.cancelQueries({ queryKey: ["work-reports", user?.id] });
      const previousReports = queryClient.getQueryData(["work-reports", user?.id]);
      
      const optimisticReport = {
        id: `temp-${Date.now()}`,
        user_id: user?.id,
        ...newReport,
        status: "pending" as const,
        final_status: "pending",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      
      queryClient.setQueryData(["work-reports", user?.id], (old: WorkReport[] | undefined) =>
        old ? [optimisticReport as WorkReport, ...old] : [optimisticReport as WorkReport]
      );
      
      return { previousReports };
    },
    onError: (error, _, context) => {
      if (context?.previousReports) {
        queryClient.setQueryData(["work-reports", user?.id], context.previousReports);
      }
      toast.error("Failed to submit report: " + error.message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["work-reports"] });
      toast.success("Report submitted successfully");
    },
  });
}

export function useUpdateReportStatus() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({
      reportId,
      status,
      rejectionReason,
    }: {
      reportId: string;
      status: "approved" | "rejected";
      rejectionReason?: string;
    }) => {
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("work_reports")
        .update({
          status,
          reviewed_by: user.id,
          reviewed_at: new Date().toISOString(),
          rejection_reason: rejectionReason || null,
          final_status: status,
        })
        .eq("id", reportId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["work-reports"] });
      toast.success(`Report ${variables.status} successfully`);
    },
    onError: (error) => {
      toast.error("Failed to update report: " + error.message);
    },
  });
}

export function useTeamLeadReportReview() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({
      reportId,
      status,
      rejectionReason,
      userId,
      platform,
      taskType,
    }: {
      reportId: string;
      status: "approved" | "rejected";
      rejectionReason?: string;
      userId?: string;
      platform?: string;
      taskType?: string | null;
    }) => {
      if (!user) throw new Error("Not authenticated");

      const updateData: Record<string, unknown> = {
        team_lead_status: status,
        team_lead_reviewed_by: user.id,
        team_lead_reviewed_at: new Date().toISOString(),
        team_lead_rejection_reason: rejectionReason || null,
      };

      // If team lead approves, set final status
      if (status === "approved") {
        updateData.final_status = "approved";
        updateData.status = "approved";
      }

      // If rejected, increment revisions count
      if (status === "rejected") {
        updateData.revisions_count = supabase.rpc ? undefined : 1; // Will be handled separately
      }

      const { data, error } = await supabase
        .from("work_reports")
        .update(updateData)
        .eq("id", reportId)
        .select()
        .single();

      if (error) throw error;
      
      // Generate learning insight
      if (userId && platform) {
        await supabase.from("learning_insights").insert({
          user_id: userId,
          entity_id: reportId,
          entity_type: "report",
          resolution_status: status,
          generated_by: "reviewer",
          skill_signal: inferSkillFromPlatform(platform, taskType),
          what_went_well: status === "approved" ? `Successfully completed work on ${platform}. Quality standards met.` : null,
          what_to_improve: status === "rejected" ? rejectionReason || "Submission requires revision." : null,
          suggestions: status === "approved" 
            ? ["Continue maintaining quality standards", "Document successful approaches"]
            : ["Review the specific feedback provided", "Ask for clarification if needed"],
        });
      }

      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["work-reports"] });
      queryClient.invalidateQueries({ queryKey: ["learning-insights"] });
      toast.success(`Report ${variables.status} by team lead`);
    },
    onError: (error) => {
      toast.error("Failed to review report: " + error.message);
    },
  });
}

function inferSkillFromPlatform(platform: string, taskType?: string | null): string {
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

  if (taskType && taskSkills[taskType]) {
    return taskSkills[taskType];
  }
  
  const platformSkills: Record<string, string> = {
    "Upwork": "Freelancing",
    "Fiverr": "Service Delivery",
    "99designs": "Design",
  };

  return platformSkills[platform] || "General Proficiency";
}

export function useAdminReportOverride() {
  const queryClient = useQueryClient();
  const { user, hasRole } = useAuth();

  return useMutation({
    mutationFn: async ({
      reportId,
      status,
      overrideReason,
    }: {
      reportId: string;
      status: "approved" | "rejected";
      overrideReason: string;
    }) => {
      if (!user) throw new Error("Not authenticated");
      
      const isOverseer = hasRole("general_overseer");
      
      // Mandatory reason for general_overseer overrides
      if (isOverseer && !overrideReason?.trim()) {
        throw new Error("Override reason is required for overseer actions");
      }

      const { data, error } = await supabase
        .from("work_reports")
        .update({
          admin_status: status,
          admin_override_reason: overrideReason,
          final_status: status,
          status: status,
          reviewed_by: user.id,
          reviewed_at: new Date().toISOString(),
        })
        .eq("id", reportId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["work-reports"] });
      toast.success(`Report ${variables.status} by admin (override)`);
    },
    onError: (error) => {
      toast.error("Failed to override: " + error.message);
    },
  });
}

export function useUpdateReportRateWithReason() {
  const queryClient = useQueryClient();
  const { user, hasRole } = useAuth();

  return useMutation({
    mutationFn: async ({ 
      reportId, 
      newRate,
      previousRate,
      reason 
    }: { 
      reportId: string; 
      newRate: number;
      previousRate: number;
      reason: string;
    }) => {
      if (!user) throw new Error("Not authenticated");
      
      const isOverseer = hasRole("general_overseer");
      
      // Mandatory reason for general_overseer rate changes
      if (isOverseer && !reason?.trim()) {
        throw new Error("Reason is required for overseer rate changes");
      }

      const { data, error } = await supabase
        .from("work_reports")
        .update({ current_rate: newRate })
        .eq("id", reportId)
        .select()
        .single();

      if (error) throw error;

      // Log the rate change with reason via RPC
      await supabase.rpc("log_audit_event", {
        p_entity_type: "work_report",
        p_entity_id: reportId,
        p_action: "rate_override",
        p_performed_by: user.id,
        p_previous_values: { current_rate: previousRate },
        p_new_values: { current_rate: newRate },
        p_notes: reason,
      });

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["work-reports"] });
      toast.success("Rate updated with audit log");
    },
    onError: (error) => {
      toast.error("Failed to update rate: " + error.message);
    },
  });
}

export function useUpdateReportRate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ reportId, newRate }: { reportId: string; newRate: number }) => {
      const { data, error } = await supabase
        .from("work_reports")
        .update({ current_rate: newRate })
        .eq("id", reportId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["work-reports"] });
      toast.success("Rate updated successfully");
    },
    onError: (error) => {
      toast.error("Failed to update rate: " + error.message);
    },
  });
}
