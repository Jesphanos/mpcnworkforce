import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

/**
 * Financial Narrative Types
 * Human-readable explanations for financial periods
 */
export interface FinancialNarrative {
  id: string;
  financial_period_id: string;
  period_summary: string;
  primary_drivers: string[];
  negative_drivers: string[];
  adjustment_notes: string | null;
  workforce_impact: string | null;
  next_period_outlook: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface CreateFinancialNarrativeInput {
  financial_period_id: string;
  period_summary: string;
  primary_drivers: string[];
  negative_drivers?: string[];
  adjustment_notes?: string;
  workforce_impact?: string;
  next_period_outlook?: string;
}

/**
 * Hook to fetch all financial narratives
 */
export function useFinancialNarratives() {
  return useQuery({
    queryKey: ["financial-narratives"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("financial_narratives")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as FinancialNarrative[];
    },
  });
}

/**
 * Hook to fetch narrative for a specific financial period
 */
export function useFinancialNarrativeForPeriod(periodId: string) {
  return useQuery({
    queryKey: ["financial-narratives", periodId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("financial_narratives")
        .select("*")
        .eq("financial_period_id", periodId)
        .maybeSingle();

      if (error) throw error;
      return data as FinancialNarrative | null;
    },
    enabled: !!periodId,
  });
}

/**
 * Hook to create a financial narrative
 */
export function useCreateFinancialNarrative() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (input: CreateFinancialNarrativeInput) => {
      const { data, error } = await supabase
        .from("financial_narratives")
        .insert({
          ...input,
          created_by: user!.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data as FinancialNarrative;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["financial-narratives"] });
      toast({
        title: "Narrative created",
        description: "Financial period explanation has been published.",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to create narrative",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

/**
 * Hook to update a financial narrative
 */
export function useUpdateFinancialNarrative() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<FinancialNarrative> & { id: string }) => {
      const { data, error } = await supabase
        .from("financial_narratives")
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data as FinancialNarrative;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["financial-narratives"] });
      toast({
        title: "Narrative updated",
        description: "Financial period explanation has been updated.",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to update narrative",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}
