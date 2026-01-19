import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

/**
 * KPI Scoring Weights (as defined in MPCN Trading System)
 * - Risk Discipline: 40%
 * - Consistency: 25%
 * - Strategy Execution: 20%
 * - Profitability: 15%
 */
const KPI_WEIGHTS = {
  riskDiscipline: 0.40,
  consistency: 0.25,
  strategyExecution: 0.20,
  profitability: 0.15,
};

interface TradeData {
  id: string;
  pnl_percentage: number | null;
  pnl_amount: number | null;
  r_multiple: number | null;
  risk_percentage: number;
  rules_followed: boolean | null;
  rule_violations: string[] | null;
  strategy_id: string | null;
  stop_loss: number;
  entry_price: number;
  exit_price: number | null;
  direction: string;
  status: string;
}

interface RiskLimits {
  max_risk_per_trade: number;
  daily_loss_limit: number;
  weekly_loss_limit: number;
}

interface KpiScoreResult {
  riskDisciplineScore: number;
  consistencyScore: number;
  strategyExecutionScore: number;
  profitabilityScore: number;
  totalScore: number;
  totalTrades: number;
  winningTrades: number;
  winRate: number;
  averageRMultiple: number;
  maxDrawdown: number;
  expectancy: number;
  recommendedAction: "promote" | "maintain" | "retrain" | "suspend";
}

/**
 * Calculate Risk Discipline Score (40%)
 * Based on:
 * - Average risk per trade vs allowed
 * - Stop-loss adherence
 * - Rule violations
 */
function calculateRiskDisciplineScore(trades: TradeData[], riskLimits: RiskLimits): number {
  if (trades.length === 0) return 0;

  let score = 100;
  
  // Check average risk per trade
  const avgRisk = trades.reduce((sum, t) => sum + t.risk_percentage, 0) / trades.length;
  const riskRatio = avgRisk / riskLimits.max_risk_per_trade;
  if (riskRatio > 1) {
    score -= Math.min(40, (riskRatio - 1) * 40); // Penalize for exceeding risk limits
  } else if (riskRatio < 0.8) {
    score -= 5; // Slight penalty for too conservative (not utilizing capital)
  }

  // Check stop-loss adherence
  const tradesWithStopLoss = trades.filter(t => t.stop_loss > 0);
  const stopLossAdherence = tradesWithStopLoss.length / trades.length;
  score *= stopLossAdherence;

  // Check rule violations
  const violationCount = trades.reduce((count, t) => 
    count + (t.rule_violations?.length || 0), 0);
  score -= Math.min(30, violationCount * 5);

  // Check rules followed
  const rulesFollowedRate = trades.filter(t => t.rules_followed === true).length / trades.length;
  score *= (0.5 + rulesFollowedRate * 0.5);

  return Math.max(0, Math.min(100, score));
}

/**
 * Calculate Consistency Score (25%)
 * Based on:
 * - Win/loss distribution stability
 * - No revenge trading patterns
 * - Session discipline
 */
function calculateConsistencyScore(trades: TradeData[]): number {
  if (trades.length < 5) return 50; // Not enough data

  let score = 100;
  
  // Calculate win/loss streaks
  let maxWinStreak = 0;
  let maxLossStreak = 0;
  let currentStreak = 0;
  let isWinning = false;

  trades.forEach((trade, i) => {
    const isProfitable = (trade.pnl_amount || 0) > 0;
    
    if (i === 0) {
      currentStreak = 1;
      isWinning = isProfitable;
    } else if (isProfitable === isWinning) {
      currentStreak++;
    } else {
      if (isWinning) {
        maxWinStreak = Math.max(maxWinStreak, currentStreak);
      } else {
        maxLossStreak = Math.max(maxLossStreak, currentStreak);
      }
      currentStreak = 1;
      isWinning = isProfitable;
    }
  });

  // Finalize last streak
  if (isWinning) {
    maxWinStreak = Math.max(maxWinStreak, currentStreak);
  } else {
    maxLossStreak = Math.max(maxLossStreak, currentStreak);
  }

  // Penalize long loss streaks (potential revenge trading)
  if (maxLossStreak > 3) {
    score -= (maxLossStreak - 3) * 10;
  }

  // Check for consistent position sizing
  const avgSize = trades.reduce((sum, t) => sum + t.risk_percentage, 0) / trades.length;
  const sizeVariance = trades.reduce((sum, t) => 
    sum + Math.pow(t.risk_percentage - avgSize, 2), 0) / trades.length;
  
  if (sizeVariance > 1) {
    score -= Math.min(20, sizeVariance * 5); // Penalize inconsistent sizing
  }

  return Math.max(0, Math.min(100, score));
}

/**
 * Calculate Strategy Execution Score (20%)
 * Based on:
 * - Strategy compliance rate
 * - Execution quality
 */
function calculateStrategyExecutionScore(trades: TradeData[]): number {
  if (trades.length === 0) return 0;

  let score = 100;
  
  // Check strategy compliance (all trades should have a strategy)
  const tradesWithStrategy = trades.filter(t => t.strategy_id !== null);
  const strategyCompliance = tradesWithStrategy.length / trades.length;
  score *= strategyCompliance;

  // Check if trades were closed properly (not cancelled)
  const closedTrades = trades.filter(t => t.status === "closed");
  const cancelledTrades = trades.filter(t => t.status === "cancelled");
  const properExecutionRate = closedTrades.length / (closedTrades.length + cancelledTrades.length || 1);
  score *= (0.5 + properExecutionRate * 0.5);

  return Math.max(0, Math.min(100, score));
}

/**
 * Calculate Profitability Score (15%)
 * Based on:
 * - Risk-adjusted returns (R-multiple)
 * - Expectancy
 */
function calculateProfitabilityScore(trades: TradeData[]): number {
  const closedTrades = trades.filter(t => t.status === "closed" && t.r_multiple !== null);
  if (closedTrades.length === 0) return 50; // Neutral if no closed trades

  let score = 50; // Start at neutral

  // Calculate average R-multiple
  const avgR = closedTrades.reduce((sum, t) => sum + (t.r_multiple || 0), 0) / closedTrades.length;
  
  // Positive R means profitable
  if (avgR > 0) {
    score += Math.min(50, avgR * 25); // Up to +50 for R > 2
  } else {
    score += Math.max(-50, avgR * 25); // Down to 0 for R < -2
  }

  return Math.max(0, Math.min(100, score));
}

/**
 * Calculate maximum drawdown
 */
function calculateMaxDrawdown(trades: TradeData[]): number {
  if (trades.length === 0) return 0;

  let peak = 0;
  let maxDrawdown = 0;
  let cumulative = 0;

  trades.forEach(trade => {
    cumulative += (trade.pnl_percentage || 0);
    if (cumulative > peak) {
      peak = cumulative;
    }
    const drawdown = peak - cumulative;
    if (drawdown > maxDrawdown) {
      maxDrawdown = drawdown;
    }
  });

  return maxDrawdown;
}

/**
 * Calculate expectancy (average R per trade)
 */
function calculateExpectancy(trades: TradeData[]): number {
  const closedTrades = trades.filter(t => t.status === "closed" && t.r_multiple !== null);
  if (closedTrades.length === 0) return 0;

  const winningTrades = closedTrades.filter(t => (t.pnl_amount || 0) > 0);
  const losingTrades = closedTrades.filter(t => (t.pnl_amount || 0) <= 0);

  const winRate = winningTrades.length / closedTrades.length;
  const avgWin = winningTrades.length > 0
    ? winningTrades.reduce((sum, t) => sum + (t.r_multiple || 0), 0) / winningTrades.length
    : 0;
  const avgLoss = losingTrades.length > 0
    ? Math.abs(losingTrades.reduce((sum, t) => sum + (t.r_multiple || 0), 0) / losingTrades.length)
    : 0;

  return (winRate * avgWin) - ((1 - winRate) * avgLoss);
}

/**
 * Determine recommended action based on scores
 */
function getRecommendedAction(totalScore: number, maxDrawdown: number): "promote" | "maintain" | "retrain" | "suspend" {
  if (maxDrawdown > 20) return "suspend"; // Exceeded max drawdown
  if (totalScore < 40) return "retrain";
  if (totalScore < 60) return "maintain";
  if (totalScore >= 80) return "promote";
  return "maintain";
}

/**
 * Main KPI Calculation Function
 */
export function calculateKpiScores(
  trades: TradeData[],
  riskLimits: RiskLimits
): KpiScoreResult {
  const riskDisciplineScore = calculateRiskDisciplineScore(trades, riskLimits);
  const consistencyScore = calculateConsistencyScore(trades);
  const strategyExecutionScore = calculateStrategyExecutionScore(trades);
  const profitabilityScore = calculateProfitabilityScore(trades);

  const totalScore = 
    riskDisciplineScore * KPI_WEIGHTS.riskDiscipline +
    consistencyScore * KPI_WEIGHTS.consistency +
    strategyExecutionScore * KPI_WEIGHTS.strategyExecution +
    profitabilityScore * KPI_WEIGHTS.profitability;

  const closedTrades = trades.filter(t => t.status === "closed");
  const winningTrades = closedTrades.filter(t => (t.pnl_amount || 0) > 0);
  const winRate = closedTrades.length > 0 ? (winningTrades.length / closedTrades.length) * 100 : 0;
  const avgR = closedTrades.length > 0
    ? closedTrades.reduce((sum, t) => sum + (t.r_multiple || 0), 0) / closedTrades.length
    : 0;
  const maxDrawdown = calculateMaxDrawdown(trades);
  const expectancy = calculateExpectancy(trades);

  return {
    riskDisciplineScore,
    consistencyScore,
    strategyExecutionScore,
    profitabilityScore,
    totalScore,
    totalTrades: closedTrades.length,
    winningTrades: winningTrades.length,
    winRate,
    averageRMultiple: avgR,
    maxDrawdown,
    expectancy,
    recommendedAction: getRecommendedAction(totalScore, maxDrawdown),
  };
}

/**
 * Hook to calculate and save monthly KPI scores
 */
export function useCalculateMonthlyKpi() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (input: { trader_id: string; period_start: string; period_end: string }) => {
      // Fetch trades for the period
      const { data: trades, error: tradesError } = await supabase
        .from("trades")
        .select("*")
        .eq("trader_id", input.trader_id)
        .gte("entry_time", input.period_start)
        .lte("entry_time", input.period_end);

      if (tradesError) throw tradesError;

      // Fetch risk limits
      const { data: riskLimits, error: limitsError } = await supabase
        .from("trader_risk_limits")
        .select("*")
        .eq("trader_id", input.trader_id)
        .maybeSingle();

      if (limitsError) throw limitsError;

      const defaultLimits: RiskLimits = {
        max_risk_per_trade: 2,
        daily_loss_limit: 5,
        weekly_loss_limit: 10,
      };

      const limits = riskLimits || defaultLimits;
      const scores = calculateKpiScores(trades || [], limits as RiskLimits);

      // Save KPI scores
      const { data, error } = await supabase
        .from("trader_kpi_scores")
        .upsert({
          trader_id: input.trader_id,
          period_start: input.period_start,
          period_end: input.period_end,
          risk_discipline_score: scores.riskDisciplineScore,
          consistency_score: scores.consistencyScore,
          strategy_execution_score: scores.strategyExecutionScore,
          profitability_score: scores.profitabilityScore,
          total_score: scores.totalScore,
          total_trades: scores.totalTrades,
          winning_trades: scores.winningTrades,
          win_rate: scores.winRate,
          average_r_multiple: scores.averageRMultiple,
          max_drawdown: scores.maxDrawdown,
          expectancy: scores.expectancy,
          recommended_action: scores.recommendedAction,
          calculated_by: user?.id,
        }, {
          onConflict: "trader_id,period_start,period_end",
        })
        .select()
        .single();

      if (error) throw error;
      return { ...data, scores };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["trader-kpi-scores", data.trader_id] });
      toast.success(`KPI score calculated: ${data.scores.totalScore.toFixed(1)}/100`);
    },
    onError: (error) => {
      toast.error("Failed to calculate KPI: " + error.message);
    },
  });
}

/**
 * Hook to calculate KPIs for all traders (batch operation)
 */
export function useBatchCalculateKpi() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (input: { period_start: string; period_end: string }) => {
      // Fetch all active traders
      const { data: traders, error: tradersError } = await supabase
        .from("trader_profiles")
        .select("id")
        .eq("is_active", true);

      if (tradersError) throw tradersError;

      const results = [];

      for (const trader of traders || []) {
        try {
          // Fetch trades for the period
          const { data: trades } = await supabase
            .from("trades")
            .select("*")
            .eq("trader_id", trader.id)
            .gte("entry_time", input.period_start)
            .lte("entry_time", input.period_end);

          // Fetch risk limits
          const { data: riskLimits } = await supabase
            .from("trader_risk_limits")
            .select("*")
            .eq("trader_id", trader.id)
            .maybeSingle();

          const defaultLimits: RiskLimits = {
            max_risk_per_trade: 2,
            daily_loss_limit: 5,
            weekly_loss_limit: 10,
          };

          const limits = riskLimits || defaultLimits;
          const scores = calculateKpiScores(trades || [], limits as RiskLimits);

          // Save KPI scores
          await supabase
            .from("trader_kpi_scores")
            .upsert({
              trader_id: trader.id,
              period_start: input.period_start,
              period_end: input.period_end,
              risk_discipline_score: scores.riskDisciplineScore,
              consistency_score: scores.consistencyScore,
              strategy_execution_score: scores.strategyExecutionScore,
              profitability_score: scores.profitabilityScore,
              total_score: scores.totalScore,
              total_trades: scores.totalTrades,
              winning_trades: scores.winningTrades,
              win_rate: scores.winRate,
              average_r_multiple: scores.averageRMultiple,
              max_drawdown: scores.maxDrawdown,
              expectancy: scores.expectancy,
              recommended_action: scores.recommendedAction,
              calculated_by: user?.id,
            }, {
              onConflict: "trader_id,period_start,period_end",
            });

          results.push({ trader_id: trader.id, success: true, scores });
        } catch (error) {
          results.push({ trader_id: trader.id, success: false, error });
        }
      }

      return results;
    },
    onSuccess: (results) => {
      const successCount = results.filter(r => r.success).length;
      queryClient.invalidateQueries({ queryKey: ["trader-kpi-scores"] });
      queryClient.invalidateQueries({ queryKey: ["promotion-candidates"] });
      toast.success(`Calculated KPIs for ${successCount}/${results.length} traders`);
    },
    onError: (error) => {
      toast.error("Batch KPI calculation failed: " + error.message);
    },
  });
}
