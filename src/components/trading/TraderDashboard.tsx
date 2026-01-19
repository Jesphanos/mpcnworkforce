import { format } from "date-fns";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Target,
  AlertTriangle,
  Activity,
  BarChart3,
  Clock,
} from "lucide-react";
import {
  useTraderProfile,
  useTraderRiskLimits,
  useTraderSessionStats,
  useTraderAlerts,
} from "@/hooks/useTrading";
import { cn } from "@/lib/utils";

const classificationLabels: Record<string, { label: string; color: string }> = {
  trainee: { label: "Trainee Trader", color: "bg-blue-500/10 text-blue-600" },
  junior: { label: "Junior Trader", color: "bg-green-500/10 text-green-600" },
  senior: { label: "Senior Trader", color: "bg-purple-500/10 text-purple-600" },
  lead: { label: "Trading Dept Head", color: "bg-amber-500/10 text-amber-600" },
};

export function TraderDashboard() {
  const { data: profile, isLoading: profileLoading } = useTraderProfile();
  const { data: riskLimits, isLoading: limitsLoading } = useTraderRiskLimits(profile?.id);
  const { data: sessionStats, isLoading: statsLoading } = useTraderSessionStats(profile?.id);
  const { data: alerts } = useTraderAlerts(profile?.id);

  if (profileLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-32 w-full" />
        <div className="grid gap-4 md:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  if (!profile) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <TrendingUp className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-lg font-medium">No Trader Profile</p>
          <p className="text-muted-foreground">
            Complete the trader onboarding to access the trading dashboard.
          </p>
        </CardContent>
      </Card>
    );
  }

  const classification = classificationLabels[profile.classification] || classificationLabels.trainee;
  const unresolvedAlerts = alerts?.filter(a => !a.resolved) || [];

  return (
    <div className="space-y-6">
      {/* Alerts Banner */}
      {unresolvedAlerts.length > 0 && (
        <Card className="border-warning bg-warning/5">
          <CardContent className="py-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-warning" />
              <div>
                <p className="font-medium">
                  {unresolvedAlerts.length} Active Alert{unresolvedAlerts.length > 1 ? "s" : ""}
                </p>
                <p className="text-sm text-muted-foreground">
                  {unresolvedAlerts[0].message}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Performance Snapshot */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Performance Snapshot
              </CardTitle>
              <CardDescription>
                {format(new Date(), "EEEE, MMMM d, yyyy")}
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Badge className={classification.color}>
                {classification.label}
              </Badge>
              {profile.demo_phase_completed && !profile.live_trading_enabled ? (
                <Badge variant="secondary">Evaluation</Badge>
              ) : profile.live_trading_enabled ? (
                <Badge variant="default">Live Trading</Badge>
              ) : (
                <Badge variant="outline">Demo Mode</Badge>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            {/* Daily P/L */}
            <div className="p-4 rounded-lg bg-muted/50">
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                <DollarSign className="h-4 w-4" />
                Daily P/L
              </div>
              {statsLoading ? (
                <Skeleton className="h-8 w-20" />
              ) : (
                <div className={cn(
                  "text-2xl font-bold",
                  (sessionStats?.totalPnl || 0) >= 0 ? "text-success" : "text-destructive"
                )}>
                  {(sessionStats?.totalPnl || 0) >= 0 ? "+" : ""}
                  ${(sessionStats?.totalPnl || 0).toFixed(2)}
                </div>
              )}
            </div>

            {/* Trades Today */}
            <div className="p-4 rounded-lg bg-muted/50">
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                <BarChart3 className="h-4 w-4" />
                Trades Today
              </div>
              {statsLoading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <div className="text-2xl font-bold">
                  {sessionStats?.totalTrades || 0}
                </div>
              )}
              <div className="text-xs text-muted-foreground mt-1">
                {sessionStats?.openTrades || 0} open
              </div>
            </div>

            {/* Win Rate */}
            <div className="p-4 rounded-lg bg-muted/50">
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                <Target className="h-4 w-4" />
                Win Rate
              </div>
              {statsLoading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <div className="text-2xl font-bold">
                  {(sessionStats?.winRate || 0).toFixed(0)}%
                </div>
              )}
              <div className="text-xs text-muted-foreground mt-1">
                {sessionStats?.winningTrades || 0}W / {sessionStats?.losingTrades || 0}L
              </div>
            </div>

            {/* Avg R-Multiple */}
            <div className="p-4 rounded-lg bg-muted/50">
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                {(sessionStats?.averageR || 0) >= 0 ? (
                  <TrendingUp className="h-4 w-4" />
                ) : (
                  <TrendingDown className="h-4 w-4" />
                )}
                Avg R-Multiple
              </div>
              {statsLoading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <div className={cn(
                  "text-2xl font-bold",
                  (sessionStats?.averageR || 0) >= 0 ? "text-success" : "text-destructive"
                )}>
                  {(sessionStats?.averageR || 0).toFixed(2)}R
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Risk Control Panel */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Risk Control Panel
            <Badge variant="outline" className="ml-2">Read-Only</Badge>
          </CardTitle>
          <CardDescription>
            These limits are set by MPCN and cannot be modified by traders.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {limitsLoading ? (
            <div className="grid gap-4 md:grid-cols-4">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-20" />
              ))}
            </div>
          ) : riskLimits ? (
            <div className="grid gap-4 md:grid-cols-4">
              {/* Max Risk Per Trade */}
              <div className="p-4 rounded-lg border">
                <div className="text-sm text-muted-foreground mb-1">Max Risk/Trade</div>
                <div className="text-2xl font-bold">{riskLimits.max_risk_per_trade}%</div>
                <Progress 
                  value={0} 
                  className="mt-2" 
                />
              </div>

              {/* Daily Loss Limit */}
              <div className="p-4 rounded-lg border">
                <div className="text-sm text-muted-foreground mb-1">Daily Loss Limit</div>
                <div className="text-2xl font-bold">{riskLimits.daily_loss_limit}%</div>
                <Progress 
                  value={(Math.abs(sessionStats?.totalPnl || 0) / 1000) * 100} 
                  className="mt-2"
                />
              </div>

              {/* Weekly Loss Limit */}
              <div className="p-4 rounded-lg border">
                <div className="text-sm text-muted-foreground mb-1">Weekly Loss Limit</div>
                <div className="text-2xl font-bold">{riskLimits.weekly_loss_limit}%</div>
                <Progress value={0} className="mt-2" />
              </div>

              {/* Max Open Trades */}
              <div className="p-4 rounded-lg border">
                <div className="text-sm text-muted-foreground mb-1">Max Open Trades</div>
                <div className="text-2xl font-bold">
                  {sessionStats?.openTrades || 0} / {riskLimits.max_open_trades}
                </div>
                <Progress 
                  value={((sessionStats?.openTrades || 0) / riskLimits.max_open_trades) * 100} 
                  className="mt-2" 
                />
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Clock className="h-8 w-8 mx-auto mb-2" />
              <p>Risk limits will be assigned after your first evaluation.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Account Status */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Account Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Capital Tier</span>
                <span className="font-medium">Tier {profile.capital_tier}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Risk Tier</span>
                <span className="font-medium">Level {profile.risk_tier}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Demo Completed</span>
                <span className="font-medium">
                  {profile.demo_phase_completed ? "Yes" : "No"}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Live Trading</span>
                <Badge variant={profile.live_trading_enabled ? "default" : "secondary"}>
                  {profile.live_trading_enabled ? "Enabled" : "Disabled"}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Approved Markets</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {profile.markets_approved && profile.markets_approved.length > 0 ? (
                profile.markets_approved.map((market) => (
                  <Badge key={market} variant="outline" className="capitalize">
                    {market}
                  </Badge>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">
                  No markets approved yet. Complete your training to unlock markets.
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
