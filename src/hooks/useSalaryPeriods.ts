import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export interface SalaryPeriod {
  id: string;
  name: string;
  start_date: string;
  end_date: string;
  status: "open" | "closed";
  created_by: string;
  closed_at: string | null;
  closed_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateSalaryPeriodInput {
  name: string;
  start_date: string;
  end_date: string;
}

export function useSalaryPeriods() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["salary-periods"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("salary_periods")
        .select("*")
        .order("start_date", { ascending: false });

      if (error) throw error;
      return data as SalaryPeriod[];
    },
    enabled: !!user,
  });
}

export function useCreateSalaryPeriod() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (input: CreateSalaryPeriodInput) => {
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("salary_periods")
        .insert({
          ...input,
          created_by: user.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["salary-periods"] });
      toast.success("Salary period created successfully");
    },
    onError: (error) => {
      toast.error("Failed to create period: " + error.message);
    },
  });
}

export function useToggleSalaryPeriodStatus() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ periodId, currentStatus }: { periodId: string; currentStatus: "open" | "closed" }) => {
      if (!user) throw new Error("Not authenticated");

      const newStatus = currentStatus === "open" ? "closed" : "open";
      const updateData: Record<string, unknown> = { status: newStatus };

      if (newStatus === "closed") {
        updateData.closed_at = new Date().toISOString();
        updateData.closed_by = user.id;
      } else {
        updateData.closed_at = null;
        updateData.closed_by = null;
      }

      const { data, error } = await supabase
        .from("salary_periods")
        .update(updateData)
        .eq("id", periodId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["salary-periods"] });
      toast.success(`Period ${data.status === "closed" ? "closed" : "reopened"} successfully`);
    },
    onError: (error) => {
      toast.error("Failed to update period: " + error.message);
    },
  });
}
