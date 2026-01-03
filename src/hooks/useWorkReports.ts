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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["work-reports"] });
      toast.success("Report submitted successfully");
    },
    onError: (error) => {
      toast.error("Failed to submit report: " + error.message);
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
    }: {
      reportId: string;
      status: "approved" | "rejected";
      rejectionReason?: string;
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

      const { data, error } = await supabase
        .from("work_reports")
        .update(updateData)
        .eq("id", reportId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["work-reports"] });
      toast.success(`Report ${variables.status} by team lead`);
    },
    onError: (error) => {
      toast.error("Failed to review report: " + error.message);
    },
  });
}

export function useAdminReportOverride() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({
      reportId,
      status,
      overrideReason,
    }: {
      reportId: string;
      status: "approved" | "rejected";
      overrideReason?: string;
    }) => {
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("work_reports")
        .update({
          admin_status: status,
          admin_override_reason: overrideReason || null,
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
