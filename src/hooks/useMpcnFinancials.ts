import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export type FinancialPeriodStatus = "draft" | "finalized" | "corrected";

export interface MpcnFinancial {
  id: string;
  total_pool: number;
  total_profit: number;
  profit_date: string;
  notes: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
  // New finalization fields
  status: FinancialPeriodStatus;
  finalized_at: string | null;
  finalized_by: string | null;
  correction_reason: string | null;
  corrected_at: string | null;
  corrected_by: string | null;
  disclosure_notes: string | null;
  original_total_pool: number | null;
  original_total_profit: number | null;
}

interface InvestmentReturn {
  id: string;
  investment_id: string;
  user_id: string;
  return_amount: number;
  profit_date: string;
  financial_period_id: string | null;
  notes: string | null;
  created_at: string;
  investor_name?: string;
}

export function useMpcnFinancials() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const financialsQuery = useQuery({
    queryKey: ["mpcn-financials"],
    queryFn: async (): Promise<MpcnFinancial[]> => {
      const { data, error } = await supabase
        .from("mpcn_financials")
        .select("*")
        .order("profit_date", { ascending: false });

      if (error) throw error;
      return (data || []) as MpcnFinancial[];
    },
    enabled: !!user,
  });

  const createFinancial = useMutation({
    mutationFn: async (input: {
      total_pool: number;
      total_profit: number;
      profit_date: string;
      notes?: string;
    }) => {
      const { data, error } = await supabase
        .from("mpcn_financials")
        .insert({
          ...input,
          created_by: user!.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["mpcn-financials"] });
      toast.success("Financial record created");
    },
    onError: (error) => {
      toast.error("Failed to create financial record: " + error.message);
    },
  });

  const updateFinancial = useMutation({
    mutationFn: async (input: {
      id: string;
      total_pool?: number;
      total_profit?: number;
      notes?: string;
      disclosure_notes?: string;
      correction_reason?: string;
    }) => {
      const { id, ...updates } = input;
      const { error } = await supabase
        .from("mpcn_financials")
        .update(updates)
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["mpcn-financials"] });
      toast.success("Financial record updated");
    },
    onError: (error) => {
      toast.error("Failed to update financial record: " + error.message);
    },
  });

  const finalizeFinancial = useMutation({
    mutationFn: async (input: { id: string; disclosure_notes?: string }) => {
      const { error } = await supabase
        .from("mpcn_financials")
        .update({
          status: "finalized",
          disclosure_notes: input.disclosure_notes,
        })
        .eq("id", input.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["mpcn-financials"] });
      toast.success("Financial period finalized");
    },
    onError: (error) => {
      toast.error("Failed to finalize: " + error.message);
    },
  });

  const correctFinancial = useMutation({
    mutationFn: async (input: {
      id: string;
      total_pool?: number;
      total_profit?: number;
      correction_reason: string;
    }) => {
      const { id, ...updates } = input;
      const { error } = await supabase
        .from("mpcn_financials")
        .update(updates)
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["mpcn-financials"] });
      toast.success("Financial correction applied");
    },
    onError: (error) => {
      toast.error("Correction failed: " + error.message);
    },
  });

  return {
    financials: financialsQuery.data || [],
    isLoading: financialsQuery.isLoading,
    createFinancial,
    updateFinancial,
    finalizeFinancial,
    correctFinancial,
  };
}

export function useInvestmentReturns(userId?: string) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const returnsQuery = useQuery({
    queryKey: ["investment-returns", userId],
    queryFn: async (): Promise<InvestmentReturn[]> => {
      let query = supabase
        .from("investment_returns")
        .select("*")
        .order("profit_date", { ascending: false });

      if (userId) {
        query = query.eq("user_id", userId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return (data || []) as InvestmentReturn[];
    },
    enabled: !!user,
  });

  const createReturn = useMutation({
    mutationFn: async (input: {
      investment_id: string;
      user_id: string;
      return_amount: number;
      profit_date: string;
      financial_period_id?: string;
      notes?: string;
    }) => {
      const { data, error } = await supabase
        .from("investment_returns")
        .insert(input)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["investment-returns"] });
      toast.success("Investment return recorded");
    },
    onError: (error) => {
      toast.error("Failed to record return: " + error.message);
    },
  });

  return {
    returns: returnsQuery.data || [],
    isLoading: returnsQuery.isLoading,
    createReturn,
  };
}

export function useUserInvestmentSummary() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["user-investment-summary", user?.id],
    queryFn: async () => {
      // Get user's investments
      const { data: investments, error: invError } = await supabase
        .from("investments")
        .select("*")
        .order("purchase_date", { ascending: false });

      if (invError) throw invError;

      // Get user's returns
      const { data: returns, error: retError } = await supabase
        .from("investment_returns")
        .select("*")
        .eq("user_id", user!.id);

      if (retError) throw retError;

      // Get latest financial period
      const { data: latestFinancial } = await supabase
        .from("mpcn_financials")
        .select("*")
        .order("profit_date", { ascending: false })
        .limit(1)
        .maybeSingle();

      const totalInvested = investments?.reduce(
        (sum, inv) => sum + Number(inv.initial_amount || 0),
        0
      ) || 0;

      const currentValue = investments?.reduce(
        (sum, inv) => sum + Number(inv.current_value || 0),
        0
      ) || 0;

      const totalReturns = returns?.reduce(
        (sum, ret) => sum + Number(ret.return_amount || 0),
        0
      ) || 0;

      const totalPoolShare = investments?.reduce(
        (sum, inv) => sum + Number(inv.percentage_of_pool || 0),
        0
      ) || 0;

      return {
        totalInvested,
        currentValue,
        totalReturns,
        totalPoolShare,
        latestPoolTotal: latestFinancial?.total_pool || 0,
        latestProfit: latestFinancial?.total_profit || 0,
        investmentCount: investments?.length || 0,
        returnCount: returns?.length || 0,
      };
    },
    enabled: !!user,
  });
}
