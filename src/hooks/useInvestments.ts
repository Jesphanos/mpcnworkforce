import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export interface Investment {
  id: string;
  name: string;
  platform: string;
  investment_type: string;
  initial_amount: number;
  current_value: number;
  purchase_date: string;
  notes: string | null;
  status: "active" | "sold" | "matured";
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface CreateInvestmentInput {
  name: string;
  platform: string;
  investment_type: string;
  initial_amount: number;
  current_value: number;
  purchase_date: string;
  notes?: string;
}

export interface UpdateInvestmentInput {
  id: string;
  current_value?: number;
  notes?: string;
  status?: "active" | "sold" | "matured";
}

export function useInvestments() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["investments"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("investments")
        .select("*")
        .order("purchase_date", { ascending: false });

      if (error) throw error;
      return data as Investment[];
    },
    enabled: !!user,
  });
}

export function useCreateInvestment() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (input: CreateInvestmentInput) => {
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("investments")
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
      queryClient.invalidateQueries({ queryKey: ["investments"] });
      toast.success("Investment added successfully");
    },
    onError: (error) => {
      toast.error("Failed to add investment: " + error.message);
    },
  });
}

export function useUpdateInvestment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...input }: UpdateInvestmentInput) => {
      const { data, error } = await supabase
        .from("investments")
        .update(input)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["investments"] });
      toast.success("Investment updated successfully");
    },
    onError: (error) => {
      toast.error("Failed to update investment: " + error.message);
    },
  });
}
