import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export type InvestorType = "financial" | "strategic" | "employee_investor" | "founding";
export type InvestorVerificationStatus = "pending" | "verified" | "rejected";
export type InvestmentScope = "general_fund" | "project_specific" | "team_specific";
export type InvestmentRiskLevel = "low" | "medium" | "high";
export type InvestmentStatus = "active" | "matured" | "loss" | "recovered" | "withdrawn";
export type WithdrawalStatus = "requested" | "approved" | "paid" | "rejected";

export interface InvestorProfile {
  id: string;
  full_name: string | null;
  is_investor: boolean | null;
  investor_type: InvestorType | null;
  investor_verification_status: InvestorVerificationStatus | null;
  investor_verified_at: string | null;
  investor_entity_type: string | null;
  initial_investment: number | null;
  total_withdrawn: number | null;
  total_reinvested: number | null;
  country: string | null;
  currency_preference: string | null;
}

export interface InvestorInvestment {
  id: string;
  name: string;
  platform: string;
  investment_type: string;
  initial_amount: number;
  current_value: number;
  purchase_date: string;
  status: string;
  investment_scope: InvestmentScope | null;
  risk_level: InvestmentRiskLevel | null;
  expected_return_model: string | null;
  gross_profit: number | null;
  operational_deduction: number | null;
  net_profit: number | null;
  investor_share: number | null;
  loss_amount: number | null;
  is_reinvestment: boolean | null;
  holding_period_days: number | null;
  maturity_date: string | null;
  notes: string | null;
}

export interface WithdrawalRequest {
  id: string;
  investor_id: string;
  investment_id: string | null;
  requested_amount: number;
  available_balance: number;
  status: WithdrawalStatus;
  requested_at: string;
  reviewed_at: string | null;
  reviewed_by: string | null;
  paid_at: string | null;
  rejection_reason: string | null;
  notes: string | null;
}

export interface InvestorAuditLog {
  id: string;
  investor_id: string;
  action_type: string;
  amount: number | null;
  related_entity_type: string | null;
  related_entity_id: string | null;
  description: string | null;
  performed_by: string | null;
  created_at: string;
}

export interface InvestorNotice {
  id: string;
  title: string;
  message: string;
  notice_type: string;
  published_at: string;
  expires_at: string | null;
}

/**
 * Hook to fetch investor profile data
 */
export function useInvestorProfile() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["investor-profile", user?.id],
    queryFn: async (): Promise<InvestorProfile | null> => {
      if (!user) return null;

      const { data, error } = await supabase
        .from("profiles")
        .select(`
          id, full_name, is_investor, investor_type, 
          investor_verification_status, investor_verified_at,
          investor_entity_type, initial_investment,
          total_withdrawn, total_reinvested,
          country, currency_preference
        `)
        .eq("id", user.id)
        .maybeSingle();

      if (error) throw error;
      return data as InvestorProfile | null;
    },
    enabled: !!user,
  });
}

/**
 * Hook to fetch investor's investments
 */
export function useInvestorInvestments(investorId?: string) {
  const { user } = useAuth();
  const id = investorId || user?.id;

  return useQuery({
    queryKey: ["investor-investments", id],
    queryFn: async (): Promise<InvestorInvestment[]> => {
      if (!id) return [];

      const { data, error } = await supabase
        .from("investments")
        .select("*")
        .eq("investor_id", id)
        .order("purchase_date", { ascending: false });

      if (error) throw error;
      return (data || []) as InvestorInvestment[];
    },
    enabled: !!id,
  });
}

/**
 * Hook to fetch withdrawal requests
 */
export function useWithdrawalRequests(investorId?: string) {
  const { user } = useAuth();
  const id = investorId || user?.id;

  return useQuery({
    queryKey: ["withdrawal-requests", id],
    queryFn: async (): Promise<WithdrawalRequest[]> => {
      if (!id) return [];

      const { data, error } = await supabase
        .from("withdrawal_requests")
        .select("*")
        .eq("investor_id", id)
        .order("requested_at", { ascending: false });

      if (error) throw error;
      return (data || []) as WithdrawalRequest[];
    },
    enabled: !!id,
  });
}

/**
 * Hook to create withdrawal request
 */
export function useCreateWithdrawalRequest() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (input: { 
      requested_amount: number; 
      available_balance: number;
      investment_id?: string;
      notes?: string;
    }) => {
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("withdrawal_requests")
        .insert({
          investor_id: user.id,
          requested_amount: input.requested_amount,
          available_balance: input.available_balance,
          investment_id: input.investment_id,
          notes: input.notes,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["withdrawal-requests"] });
      toast.success("Withdrawal request submitted successfully");
    },
    onError: (error) => {
      toast.error("Failed to submit withdrawal request: " + error.message);
    },
  });
}

/**
 * Hook to fetch investor audit log
 */
export function useInvestorAuditLog(investorId?: string) {
  const { user } = useAuth();
  const id = investorId || user?.id;

  return useQuery({
    queryKey: ["investor-audit-log", id],
    queryFn: async (): Promise<InvestorAuditLog[]> => {
      if (!id) return [];

      const { data, error } = await supabase
        .from("investor_audit_log")
        .select("*")
        .eq("investor_id", id)
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) throw error;
      return (data || []) as InvestorAuditLog[];
    },
    enabled: !!id,
  });
}

/**
 * Hook to fetch investor notices
 */
export function useInvestorNotices() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["investor-notices"],
    queryFn: async (): Promise<InvestorNotice[]> => {
      if (!user) return [];

      const { data, error } = await supabase
        .from("investor_notices")
        .select("id, title, message, notice_type, published_at, expires_at")
        .or(`expires_at.is.null,expires_at.gt.${new Date().toISOString()}`)
        .order("published_at", { ascending: false })
        .limit(10);

      if (error) throw error;
      return (data || []) as InvestorNotice[];
    },
    enabled: !!user,
  });
}

/**
 * Hook to calculate comprehensive investor summary
 */
export function useInvestorSummary() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["investor-summary", user?.id],
    queryFn: async () => {
      if (!user) return null;

      // Get profile data
      const { data: profile } = await supabase
        .from("profiles")
        .select("initial_investment, total_withdrawn, total_reinvested, is_investor")
        .eq("id", user.id)
        .maybeSingle();

      if (!profile?.is_investor) return null;

      // Get investments
      const { data: investments } = await supabase
        .from("investments")
        .select("initial_amount, current_value, status, gross_profit, net_profit, loss_amount")
        .eq("investor_id", user.id);

      // Get returns
      const { data: returns } = await supabase
        .from("investment_returns")
        .select("return_amount")
        .eq("user_id", user.id);

      // Get pending withdrawals
      const { data: pendingWithdrawals } = await supabase
        .from("withdrawal_requests")
        .select("requested_amount")
        .eq("investor_id", user.id)
        .in("status", ["requested", "approved"]);

      const totalInvested = investments?.reduce((sum, inv) => sum + Number(inv.initial_amount), 0) || 0;
      const currentValue = investments?.reduce((sum, inv) => sum + Number(inv.current_value), 0) || 0;
      const activeInvestments = investments?.filter(inv => inv.status === "active").length || 0;
      const totalReturns = returns?.reduce((sum, ret) => sum + Number(ret.return_amount), 0) || 0;
      const totalLosses = investments?.reduce((sum, inv) => sum + Number(inv.loss_amount || 0), 0) || 0;
      const pendingWithdrawalAmount = pendingWithdrawals?.reduce((sum, w) => sum + Number(w.requested_amount), 0) || 0;
      const totalWithdrawn = Number(profile.total_withdrawn || 0);
      const totalReinvested = Number(profile.total_reinvested || 0);

      // Net position = current value + returns received - losses
      const netGainLoss = (currentValue - totalInvested) + totalReturns - totalLosses;
      const roiPercent = totalInvested > 0 ? (netGainLoss / totalInvested) * 100 : 0;

      return {
        totalInvested,
        currentValue,
        activeInvestments,
        totalWithdrawn,
        totalReinvested,
        totalReturns,
        totalLosses,
        netGainLoss,
        roiPercent,
        pendingWithdrawalAmount,
        availableBalance: currentValue - pendingWithdrawalAmount,
      };
    },
    enabled: !!user,
  });
}
