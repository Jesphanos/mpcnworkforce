import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface Department {
  id: string;
  name: string;
  description: string | null;
  head_id: string | null;
  parent_department_id: string | null;
  skill_focus: string | null;
  region: string | null;
  is_active: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
  // Joined fields
  head_name?: string;
  parent_name?: string;
  team_count?: number;
}

export function useDepartments(options?: { includeInactive?: boolean }) {
  return useQuery({
    queryKey: ["departments", options],
    queryFn: async () => {
      let query = supabase
        .from("departments")
        .select("*")
        .order("name");

      if (!options?.includeInactive) {
        query = query.eq("is_active", true);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as Department[];
    },
  });
}

export function useCreateDepartment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (department: {
      name: string;
      description?: string;
      head_id?: string;
      parent_department_id?: string;
      skill_focus?: string;
      region?: string;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("departments")
        .insert({
          ...department,
          created_by: user.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["departments"] });
      toast.success("Department created");
    },
    onError: (error) => {
      toast.error("Failed to create department: " + error.message);
    },
  });
}

export function useUpdateDepartment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      departmentId,
      updates,
    }: {
      departmentId: string;
      updates: Partial<Department>;
    }) => {
      const { error } = await supabase
        .from("departments")
        .update(updates)
        .eq("id", departmentId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["departments"] });
      queryClient.invalidateQueries({ queryKey: ["teams"] });
      toast.success("Department updated");
    },
    onError: (error) => {
      toast.error("Failed to update department: " + error.message);
    },
  });
}

export function useAssignTeamToDepartment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      teamId,
      departmentId,
    }: {
      teamId: string;
      departmentId: string | null;
    }) => {
      const { error } = await supabase
        .from("teams")
        .update({ department_id: departmentId })
        .eq("id", teamId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teams"] });
      queryClient.invalidateQueries({ queryKey: ["departments"] });
      toast.success("Team assignment updated");
    },
    onError: (error) => {
      toast.error("Failed to assign team: " + error.message);
    },
  });
}
