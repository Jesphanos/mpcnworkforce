import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import type { TraderClassification } from "./useTrading";

interface TraderWithStats {
  id: string;
  user_id: string;
  classification: TraderClassification;
  is_active: boolean;
  suspended_at: string | null;
  live_trading_enabled: boolean;
  demo_phase_completed: boolean;
  profile: {
    full_name: string | null;
  } | null;
  weeklyPnl: number;
  winRate: number;
  riskScore: number;
  openTrades: number;
  kpiScore?: number;
  consistencyScore?: number;
  recommendedClassification?: string;
}

interface AggregatedStats {
  activeTraders: number;
  liveTraders: number;
  demoTraders: number;
  weeklyPnl: number;
  avgWinRate: number;
  activeAlerts: number;
  criticalAlerts: number;
  warningAlerts: number;
}

/**
 * Hook to fetch all desk data for Trading Department Head
 */
export function useDeskHeadData() {
  const { user } = useAuth();

  // Fetch all traders with profiles
  const tradersQuery = useQuery({
    queryKey: ["desk-head-traders"],
    queryFn: async (): Promise<TraderWithStats[]> => {
      const { data: traders, error } = await supabase
        .from("trader_profiles")
        .select("*")
        .eq("is_active", true);

      if (error) throw error;

      const tradersWithStats = await Promise.all(
        (traders || []).map(async (trader: any) => {
          // Get profile
          const { data: profile } = await supabase
            .from("profiles")
            .select("full_name")
            .eq("id", trader.user_id)
            .maybeSingle();

          // Get this week's closed trades
          const weekStart = new Date();
          weekStart.setDate(weekStart.getDate() - 7);

          const { data: trades } = await supabase
            .from("trades")
            .select("pnl_percentage, status")
            .eq("trader_id", trader.id)
            .gte("entry_time", weekStart.toISOString());

          const closedTrades = trades?.filter((t: any) => t.status === "closed") || [];
          const openTrades = trades?.filter((t: any) => t.status === "open") || [];
          const winningTrades = closedTrades.filter((t: any) => (t.pnl_percentage || 0) > 0);

          const weeklyPnl = closedTrades.reduce((sum: number, t: any) => sum + (t.pnl_percentage || 0), 0);
          const winRate = closedTrades.length > 0 ? (winningTrades.length / closedTrades.length) * 100 : 0;

          // Get latest KPI score
          const { data: kpi } = await supabase
            .from("trader_kpi_scores")
            .select("risk_discipline_score")
            .eq("trader_id", trader.id)
            .order("period_end", { ascending: false })
            .limit(1)
            .maybeSingle();

          return {
            ...trader,
            profile: profile,
            weeklyPnl,
            winRate,
            riskScore: kpi?.risk_discipline_score || 0,
            openTrades: openTrades.length,
          };
        })
      );

      return tradersWithStats;
    },
    enabled: !!user,
  });

  // Fetch pending strategies
  const strategiesQuery = useQuery({
    queryKey: ["pending-strategies"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("trading_strategies")
        .select("*")
        .eq("is_approved", false)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
  });

  // Fetch recent alerts
  const alertsQuery = useQuery({
    queryKey: ["desk-alerts"],
    queryFn: async () => {
      const { data: alerts, error } = await supabase
        .from("trader_alerts")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) throw error;
      
      // Fetch trader info for each alert
      const alertsWithTrader = await Promise.all(
        (alerts || []).map(async (alert: any) => {
          const { data: trader } = await supabase
            .from("trader_profiles")
            .select("id, user_id, classification")
            .eq("id", alert.trader_id)
            .maybeSingle();
          
          let profile = null;
          if (trader) {
            const { data: p } = await supabase
              .from("profiles")
              .select("full_name")
              .eq("id", trader.user_id)
              .maybeSingle();
            profile = p;
          }
          
          return { ...alert, trader: trader ? { ...trader, profile } : null };
        })
      );

      return alertsWithTrader;
    },
    enabled: !!user,
  });

  // Calculate aggregated stats
  const aggregatedStats: AggregatedStats = {
    activeTraders: tradersQuery.data?.length || 0,
    liveTraders: tradersQuery.data?.filter(t => t.live_trading_enabled).length || 0,
    demoTraders: tradersQuery.data?.filter(t => !t.live_trading_enabled).length || 0,
    weeklyPnl: tradersQuery.data?.reduce((sum, t) => sum + t.weeklyPnl, 0) || 0,
    avgWinRate: tradersQuery.data?.length 
      ? tradersQuery.data.reduce((sum, t) => sum + t.winRate, 0) / tradersQuery.data.length 
      : 0,
    activeAlerts: alertsQuery.data?.filter((a: any) => !a.resolved).length || 0,
    criticalAlerts: alertsQuery.data?.filter((a: any) => !a.resolved && a.severity === "critical").length || 0,
    warningAlerts: alertsQuery.data?.filter((a: any) => !a.resolved && a.severity === "warning").length || 0,
  };

  // Identify promotion candidates (KPI score > 75, consistent performance)
  const promotionCandidates = useQuery({
    queryKey: ["promotion-candidates"],
    queryFn: async () => {
      const { data: kpiScores, error } = await supabase
        .from("trader_kpi_scores")
        .select("*")
        .gte("total_score", 75)
        .eq("recommended_action", "promote")
        .is("action_taken", null)
        .order("period_end", { ascending: false });

      if (error) throw error;

      // Fetch trader and profile for each KPI
      const candidates = await Promise.all(
        (kpiScores || []).map(async (kpi: any) => {
          const { data: trader } = await supabase
            .from("trader_profiles")
            .select("id, user_id, classification")
            .eq("id", kpi.trader_id)
            .maybeSingle();
          
          let profile = null;
          if (trader) {
            const { data: p } = await supabase
              .from("profiles")
              .select("full_name")
              .eq("id", trader.user_id)
              .maybeSingle();
            profile = p;
          }
          
          return {
            id: trader?.id,
            profile,
            classification: trader?.classification,
            kpiScore: kpi.total_score,
            winRate: kpi.win_rate,
            consistencyScore: kpi.consistency_score,
            recommendedClassification: getNextClassification(trader?.classification),
          };
        })
      );

      return candidates;
    },
    enabled: !!user,
  });

  return {
    allTraders: tradersQuery.data,
    pendingStrategies: strategiesQuery.data,
    aggregatedStats,
    recentAlerts: alertsQuery.data,
    promotionCandidates: promotionCandidates.data,
    isLoading: tradersQuery.isLoading || strategiesQuery.isLoading,
  };
}

function getNextClassification(current: TraderClassification): TraderClassification {
  const order: TraderClassification[] = ["trainee", "junior", "senior", "lead"];
  const currentIndex = order.indexOf(current);
  return currentIndex < order.length - 1 ? order[currentIndex + 1] : current;
}

/**
 * Hook to approve/reject trading strategies
 */
export function useApproveStrategy() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (input: { strategy_id: string; approved: boolean }) => {
      const { data, error } = await supabase
        .from("trading_strategies")
        .update({
          is_approved: input.approved,
          approved_by: input.approved ? user?.id : null,
          approved_at: input.approved ? new Date().toISOString() : null,
        })
        .eq("id", input.strategy_id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["pending-strategies"] });
      queryClient.invalidateQueries({ queryKey: ["trading-strategies"] });
      toast.success(variables.approved ? "Strategy approved" : "Strategy rejected");
    },
    onError: (error) => {
      toast.error("Failed to update strategy: " + error.message);
    },
  });
}

/**
 * Hook to update trader classification (promotion)
 */
export function useUpdateTraderClassification() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (input: {
      trader_id: string;
      new_classification: TraderClassification;
      notes?: string;
    }) => {
      // Update trader profile
      const { data: trader, error: traderError } = await supabase
        .from("trader_profiles")
        .update({
          classification: input.new_classification,
          last_review_date: new Date().toISOString(),
        })
        .eq("id", input.trader_id)
        .select()
        .single();

      if (traderError) throw traderError;

      // Update KPI record to mark action taken
      const { error: kpiError } = await supabase
        .from("trader_kpi_scores")
        .update({
          action_taken: `Promoted to ${input.new_classification}`,
          action_taken_at: new Date().toISOString(),
          action_taken_by: user?.id,
          notes: input.notes,
        })
        .eq("trader_id", input.trader_id)
        .is("action_taken", null)
        .eq("recommended_action", "promote");

      if (kpiError) console.warn("Failed to update KPI record:", kpiError);

      return trader;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["desk-head-traders"] });
      queryClient.invalidateQueries({ queryKey: ["promotion-candidates"] });
      toast.success("Promotion recommendation submitted");
    },
    onError: (error) => {
      toast.error("Failed to process promotion: " + error.message);
    },
  });
}

/**
 * Hook to set trader risk limits (Department Head cannot modify system limits)
 */
export function useSetRiskLimits() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (input: {
      trader_id: string;
      limits: Partial<{
        max_risk_per_trade: number;
        daily_loss_limit: number;
        weekly_loss_limit: number;
        max_open_trades: number;
      }>;
    }) => {
      // Department Head can only recommend, not directly modify
      // This would typically go through an approval workflow
      toast.info("Risk limit changes require system approval");
      return null;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["trader-risk-limits"] });
    },
  });
}
