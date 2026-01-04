import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { sendTaskNotification } from "@/lib/notifications";

export interface Task {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  platform: string;
  work_date: string;
  hours_worked: number;
  base_rate: number;
  current_rate: number;
  calculated_earnings: number;
  status: string;
  team_lead_status: string | null;
  team_lead_rejection_reason: string | null;
  team_lead_reviewed_by: string | null;
  team_lead_reviewed_at: string | null;
  admin_status: string | null;
  admin_rejection_reason: string | null;
  admin_reviewed_by: string | null;
  admin_reviewed_at: string | null;
  final_status: string;
  created_at: string;
  updated_at: string;
}

export interface CreateTaskInput {
  title: string;
  description?: string;
  platform: string;
  work_date: string;
  hours_worked: number;
  base_rate: number;
  current_rate?: number;
}

export function useTasks() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["tasks", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tasks")
        .select("*")
        .order("work_date", { ascending: false });

      if (error) throw error;
      return data as Task[];
    },
    enabled: !!user,
  });
}

export function useCreateTask() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (input: CreateTaskInput) => {
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("tasks")
        .insert({
          user_id: user.id,
          ...input,
          current_rate: input.current_rate ?? input.base_rate,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      toast.success("Task created successfully");
    },
    onError: (error) => {
      toast.error("Failed to create task: " + error.message);
    },
  });
}

export function useUpdateTaskRate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ taskId, newRate }: { taskId: string; newRate: number }) => {
      const { data, error } = await supabase
        .from("tasks")
        .update({ current_rate: newRate })
        .eq("id", taskId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      toast.success("Rate updated successfully");
    },
    onError: (error) => {
      toast.error("Failed to update rate: " + error.message);
    },
  });
}

export function useTeamLeadReview() {
  const queryClient = useQueryClient();
  const { user, profile } = useAuth();

  return useMutation({
    mutationFn: async ({
      taskId,
      status,
      rejectionReason,
      task,
    }: {
      taskId: string;
      status: "approved" | "rejected";
      rejectionReason?: string;
      task: Task;
    }) => {
      if (!user) throw new Error("Not authenticated");

      const updateData: Record<string, unknown> = {
        team_lead_status: status,
        team_lead_reviewed_by: user.id,
        team_lead_reviewed_at: new Date().toISOString(),
        team_lead_rejection_reason: rejectionReason || null,
      };

      // If team lead approves, set final status to approved
      if (status === "approved") {
        updateData.final_status = "approved";
      }
      // Team lead rejections are non-final (can be overridden)

      const { data, error } = await supabase
        .from("tasks")
        .update(updateData)
        .eq("id", taskId)
        .select()
        .single();

      if (error) throw error;

      // Send email notification
      sendTaskNotification({
        type: "task",
        action: status,
        userId: task.user_id,
        itemTitle: task.title,
        platform: task.platform,
        workDate: task.work_date,
        reason: rejectionReason,
        reviewerName: profile?.full_name || "Team Lead",
        isOverride: false,
      });

      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      queryClient.invalidateQueries({ queryKey: ["team-tasks"] });
      toast.success(`Task ${variables.status} by team lead`);
    },
    onError: (error) => {
      toast.error("Failed to review task: " + error.message);
    },
  });
}

export function useAdminOverride() {
  const queryClient = useQueryClient();
  const { user, profile, hasRole } = useAuth();

  return useMutation({
    mutationFn: async ({
      taskId,
      status,
      overrideReason,
      task,
    }: {
      taskId: string;
      status: "approved" | "rejected";
      overrideReason: string;
      task: Task;
    }) => {
      if (!user) throw new Error("Not authenticated");
      
      const isOverseer = hasRole("general_overseer");
      
      // Mandatory reason for general_overseer overrides
      if (isOverseer && !overrideReason?.trim()) {
        throw new Error("Override reason is required for overseer actions");
      }

      const { data, error } = await supabase
        .from("tasks")
        .update({
          admin_status: status,
          admin_reviewed_by: user.id,
          admin_reviewed_at: new Date().toISOString(),
          admin_rejection_reason: overrideReason,
          final_status: status, // Admin decisions are final
        })
        .eq("id", taskId)
        .select()
        .single();

      if (error) throw error;

      // Send email notification
      sendTaskNotification({
        type: "task",
        action: status,
        userId: task.user_id,
        itemTitle: task.title,
        platform: task.platform,
        workDate: task.work_date,
        reason: overrideReason,
        reviewerName: profile?.full_name || "Admin",
        isOverride: true,
      });

      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      queryClient.invalidateQueries({ queryKey: ["team-tasks"] });
      toast.success(`Task ${variables.status} by admin (override)`);
    },
    onError: (error) => {
      toast.error("Failed to override: " + error.message);
    },
  });
}

export function useUpdateTaskRateWithReason() {
  const queryClient = useQueryClient();
  const { user, hasRole } = useAuth();

  return useMutation({
    mutationFn: async ({ 
      taskId, 
      newRate,
      previousRate,
      reason 
    }: { 
      taskId: string; 
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
        .from("tasks")
        .update({ current_rate: newRate })
        .eq("id", taskId)
        .select()
        .single();

      if (error) throw error;

      // Log the rate change with reason via RPC
      await supabase.rpc("log_audit_event", {
        p_entity_type: "task",
        p_entity_id: taskId,
        p_action: "rate_override",
        p_performed_by: user.id,
        p_previous_values: { current_rate: previousRate },
        p_new_values: { current_rate: newRate },
        p_notes: reason,
      });

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      toast.success("Rate updated with audit log");
    },
    onError: (error) => {
      toast.error("Failed to update rate: " + error.message);
    },
  });
}
