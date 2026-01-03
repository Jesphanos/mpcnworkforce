import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

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
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({
      taskId,
      status,
      rejectionReason,
    }: {
      taskId: string;
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
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      toast.success(`Task ${variables.status} by team lead`);
    },
    onError: (error) => {
      toast.error("Failed to review task: " + error.message);
    },
  });
}

export function useAdminOverride() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({
      taskId,
      status,
      overrideReason,
    }: {
      taskId: string;
      status: "approved" | "rejected";
      overrideReason?: string;
    }) => {
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("tasks")
        .update({
          admin_status: status,
          admin_reviewed_by: user.id,
          admin_reviewed_at: new Date().toISOString(),
          admin_rejection_reason: overrideReason || null,
          final_status: status, // Admin decisions are final
        })
        .eq("id", taskId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      toast.success(`Task ${variables.status} by admin (override)`);
    },
    onError: (error) => {
      toast.error("Failed to override: " + error.message);
    },
  });
}
