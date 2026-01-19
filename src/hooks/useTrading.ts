import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export type TraderClassification = "trainee" | "junior" | "senior" | "lead";
export type TradeStatus = "open" | "closed" | "cancelled";
export type MarketType = "forex" | "crypto" | "stocks" | "commodities" | "indices" | "options";

export interface TraderProfile {
  id: string;
  user_id: string;
  classification: TraderClassification;
  markets_approved: MarketType[];
  risk_tier: number;
  trading_school_id: string | null;
  certification_id: string | null;
  is_active: boolean;
  demo_phase_completed: boolean;
  live_trading_enabled: boolean;
  capital_tier: number;
  onboarding_completed: boolean;
  ethics_acknowledged_at: string | null;
  capital_protection_acknowledged_at: string | null;
  loss_policy_acknowledged_at: string | null;
  suspended_at: string | null;
  suspension_reason: string | null;
  last_review_date: string | null;
  next_review_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface TraderRiskLimits {
  id: string;
  trader_id: string;
  max_risk_per_trade: number;
  daily_loss_limit: number;
  weekly_loss_limit: number;
  max_open_trades: number;
  max_position_size: number | null;
  max_leverage: number;
  set_by: string;
  set_at: string;
  notes: string | null;
}

export interface TradingStrategy {
  id: string;
  name: string;
  version: string;
  description: string | null;
  markets: MarketType[];
  min_classification: TraderClassification;
  is_approved: boolean;
  approved_by: string | null;
  approved_at: string | null;
  created_by: string;
}

export interface Trade {
  id: string;
  trader_id: string;
  strategy_id: string | null;
  instrument: string;
  market: MarketType;
  direction: "long" | "short";
  entry_price: number;
  exit_price: number | null;
  position_size: number;
  risk_percentage: number;
  stop_loss: number;
  take_profit: number | null;
  status: TradeStatus;
  pnl_amount: number | null;
  pnl_percentage: number | null;
  r_multiple: number | null;
  trade_rationale: string | null;
  emotional_state: string | null;
  execution_notes: string | null;
  pre_trade_checklist_completed: boolean;
  entry_time: string;
  exit_time: string | null;
  external_trade_id: string | null;
  platform: string | null;
  screenshots_url: string[] | null;
  is_demo: boolean;
  rules_followed: boolean | null;
  rule_violations: string[] | null;
  created_at: string;
}

export interface TraderKpiScore {
  id: string;
  trader_id: string;
  period_start: string;
  period_end: string;
  risk_discipline_score: number;
  consistency_score: number;
  strategy_execution_score: number;
  profitability_score: number;
  total_score: number;
  total_trades: number;
  winning_trades: number;
  win_rate: number;
  average_r_multiple: number | null;
  max_drawdown: number | null;
  expectancy: number | null;
  recommended_action: "promote" | "maintain" | "retrain" | "suspend" | null;
  action_taken: string | null;
  notes: string | null;
}

export interface TraderAlert {
  id: string;
  trader_id: string;
  alert_type: string;
  severity: "warning" | "critical" | "suspension";
  message: string;
  related_trade_id: string | null;
  triggered_action: "none" | "lock" | "review" | "suspend" | null;
  acknowledged: boolean;
  resolved: boolean;
  created_at: string;
}

export interface TraderDailyReport {
  id: string;
  trader_id: string;
  report_date: string;
  trades_taken: number;
  rules_followed_count: number;
  rules_breached_count: number;
  net_pnl: number;
  net_pnl_percentage: number;
  max_drawdown: number | null;
  notes: string | null;
}

/**
 * Hook to fetch trader profile for current user
 */
export function useTraderProfile() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["trader-profile", user?.id],
    queryFn: async (): Promise<TraderProfile | null> => {
      if (!user) return null;

      const { data, error } = await supabase
        .from("trader_profiles")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) throw error;
      return data as TraderProfile | null;
    },
    enabled: !!user,
  });
}

/**
 * Hook to create trader profile (during onboarding)
 */
export function useCreateTraderProfile() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (input: {
      ethics_acknowledged: boolean;
      capital_protection_acknowledged: boolean;
      loss_policy_acknowledged: boolean;
      trading_school_id?: string;
    }) => {
      if (!user) throw new Error("Not authenticated");

      const now = new Date().toISOString();

      const { data, error } = await supabase
        .from("trader_profiles")
        .insert({
          user_id: user.id,
          classification: "trainee",
          onboarding_completed: true,
          ethics_acknowledged_at: input.ethics_acknowledged ? now : null,
          capital_protection_acknowledged_at: input.capital_protection_acknowledged ? now : null,
          loss_policy_acknowledged_at: input.loss_policy_acknowledged ? now : null,
          trading_school_id: input.trading_school_id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["trader-profile"] });
      toast.success("Trader profile created successfully");
    },
    onError: (error) => {
      toast.error("Failed to create trader profile: " + error.message);
    },
  });
}

/**
 * Hook to fetch risk limits for trader
 */
export function useTraderRiskLimits(traderId?: string) {
  return useQuery({
    queryKey: ["trader-risk-limits", traderId],
    queryFn: async (): Promise<TraderRiskLimits | null> => {
      if (!traderId) return null;

      const { data, error } = await supabase
        .from("trader_risk_limits")
        .select("*")
        .eq("trader_id", traderId)
        .maybeSingle();

      if (error) throw error;
      return data as TraderRiskLimits | null;
    },
    enabled: !!traderId,
  });
}

/**
 * Hook to fetch approved trading strategies
 */
export function useTradingStrategies(classification?: TraderClassification) {
  return useQuery({
    queryKey: ["trading-strategies", classification],
    queryFn: async (): Promise<TradingStrategy[]> => {
      let query = supabase
        .from("trading_strategies")
        .select("*")
        .eq("is_approved", true);

      const { data, error } = await query.order("name");

      if (error) throw error;
      
      // Filter by classification level
      const classificationOrder: TraderClassification[] = ["trainee", "junior", "senior", "lead"];
      const userLevel = classification ? classificationOrder.indexOf(classification) : 0;
      
      return (data || []).filter((strategy: any) => {
        const strategyLevel = classificationOrder.indexOf(strategy.min_classification);
        return strategyLevel <= userLevel;
      }) as TradingStrategy[];
    },
  });
}

/**
 * Hook to fetch trader's trades
 */
export function useTraderTrades(traderId?: string, status?: TradeStatus) {
  return useQuery({
    queryKey: ["trader-trades", traderId, status],
    queryFn: async (): Promise<Trade[]> => {
      if (!traderId) return [];

      let query = supabase
        .from("trades")
        .select("*")
        .eq("trader_id", traderId);

      if (status) {
        query = query.eq("status", status);
      }

      const { data, error } = await query.order("entry_time", { ascending: false });

      if (error) throw error;
      return (data || []) as Trade[];
    },
    enabled: !!traderId,
  });
}

/**
 * Hook to create a new trade
 */
export function useCreateTrade() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: {
      trader_id: string;
      strategy_id: string;
      instrument: string;
      market: MarketType;
      direction: "long" | "short";
      entry_price: number;
      position_size: number;
      risk_percentage: number;
      stop_loss: number;
      take_profit?: number;
      trade_rationale: string;
      emotional_state: string;
      is_demo: boolean;
    }) => {
      // Validate pre-trade requirements
      if (!input.stop_loss) {
        throw new Error("Stop-loss is mandatory for all trades");
      }

      if (!input.strategy_id) {
        throw new Error("A strategy must be selected before execution");
      }

      if (!input.trade_rationale) {
        throw new Error("Trade rationale is required");
      }

      const { data, error } = await supabase
        .from("trades")
        .insert({
          ...input,
          pre_trade_checklist_completed: true,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["trader-trades", data.trader_id] });
      toast.success("Trade logged successfully");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
}

/**
 * Hook to close a trade
 */
export function useCloseTrade() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: {
      trade_id: string;
      exit_price: number;
      execution_notes?: string;
    }) => {
      // Get the trade to calculate PnL
      const { data: trade, error: fetchError } = await supabase
        .from("trades")
        .select("*")
        .eq("id", input.trade_id)
        .single();

      if (fetchError) throw fetchError;

      const pnl_amount = trade.direction === "long"
        ? (input.exit_price - trade.entry_price) * trade.position_size
        : (trade.entry_price - input.exit_price) * trade.position_size;

      const pnl_percentage = ((pnl_amount / (trade.entry_price * trade.position_size)) * 100);

      // Calculate R-multiple (risk/reward)
      const riskAmount = Math.abs(trade.entry_price - trade.stop_loss) * trade.position_size;
      const r_multiple = riskAmount > 0 ? pnl_amount / riskAmount : 0;

      const { data, error } = await supabase
        .from("trades")
        .update({
          exit_price: input.exit_price,
          exit_time: new Date().toISOString(),
          status: "closed",
          pnl_amount,
          pnl_percentage,
          r_multiple,
          execution_notes: input.execution_notes,
          rules_followed: true, // Can be expanded to validate against rules
        })
        .eq("id", input.trade_id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["trader-trades", data.trader_id] });
      toast.success("Trade closed successfully");
    },
    onError: (error) => {
      toast.error("Failed to close trade: " + error.message);
    },
  });
}

/**
 * Hook to fetch trader KPI scores
 */
export function useTraderKpiScores(traderId?: string) {
  return useQuery({
    queryKey: ["trader-kpi-scores", traderId],
    queryFn: async (): Promise<TraderKpiScore[]> => {
      if (!traderId) return [];

      const { data, error } = await supabase
        .from("trader_kpi_scores")
        .select("*")
        .eq("trader_id", traderId)
        .order("period_end", { ascending: false });

      if (error) throw error;
      return (data || []) as TraderKpiScore[];
    },
    enabled: !!traderId,
  });
}

/**
 * Hook to fetch trader alerts
 */
export function useTraderAlerts(traderId?: string, unresolvedOnly = true) {
  return useQuery({
    queryKey: ["trader-alerts", traderId, unresolvedOnly],
    queryFn: async (): Promise<TraderAlert[]> => {
      if (!traderId) return [];

      let query = supabase
        .from("trader_alerts")
        .select("*")
        .eq("trader_id", traderId);

      if (unresolvedOnly) {
        query = query.eq("resolved", false);
      }

      const { data, error } = await query.order("created_at", { ascending: false });

      if (error) throw error;
      return (data || []) as TraderAlert[];
    },
    enabled: !!traderId,
  });
}

/**
 * Hook to fetch daily reports
 */
export function useTraderDailyReports(traderId?: string, limit = 7) {
  return useQuery({
    queryKey: ["trader-daily-reports", traderId, limit],
    queryFn: async (): Promise<TraderDailyReport[]> => {
      if (!traderId) return [];

      const { data, error } = await supabase
        .from("trader_daily_reports")
        .select("*")
        .eq("trader_id", traderId)
        .order("report_date", { ascending: false })
        .limit(limit);

      if (error) throw error;
      return (data || []) as TraderDailyReport[];
    },
    enabled: !!traderId,
  });
}

/**
 * Calculate trading statistics for current session
 */
export function useTraderSessionStats(traderId?: string) {
  const today = new Date().toISOString().split("T")[0];
  
  return useQuery({
    queryKey: ["trader-session-stats", traderId, today],
    queryFn: async () => {
      if (!traderId) return null;

      // Get today's trades
      const { data: trades, error } = await supabase
        .from("trades")
        .select("*")
        .eq("trader_id", traderId)
        .gte("entry_time", `${today}T00:00:00`)
        .lte("entry_time", `${today}T23:59:59`);

      if (error) throw error;

      const closedTrades = trades?.filter(t => t.status === "closed") || [];
      const openTrades = trades?.filter(t => t.status === "open") || [];

      const totalPnl = closedTrades.reduce((sum, t) => sum + (t.pnl_amount || 0), 0);
      const winningTrades = closedTrades.filter(t => (t.pnl_amount || 0) > 0).length;
      const losingTrades = closedTrades.filter(t => (t.pnl_amount || 0) < 0).length;
      const avgR = closedTrades.length > 0
        ? closedTrades.reduce((sum, t) => sum + (t.r_multiple || 0), 0) / closedTrades.length
        : 0;

      return {
        totalTrades: trades?.length || 0,
        openTrades: openTrades.length,
        closedTrades: closedTrades.length,
        winningTrades,
        losingTrades,
        totalPnl,
        averageR: avgR,
        winRate: closedTrades.length > 0 ? (winningTrades / closedTrades.length) * 100 : 0,
      };
    },
    enabled: !!traderId,
  });
}
