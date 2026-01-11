import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { useLeadershipSummary, LEADERSHIP_SIGNAL_CONFIG, LeadershipSignalType } from "@/hooks/useLeadershipSignals";
import { Award, TrendingUp, TrendingDown, Minus, Eye } from "lucide-react";

interface LeadershipSignalsCardProps {
  userId: string;
  userName?: string;
}

/**
 * Leadership Signals Card
 * Displays leadership quality metrics (Overseer only)
 */
export function LeadershipSignalsCard({ userId, userName }: LeadershipSignalsCardProps) {
  const { summary, isLoading } = useLeadershipSummary(userId);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-4 w-48" />
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-12" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!summary || summary.totalSignals === 0) {
    return (
      <Card className="border-dashed">
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <Award className="h-4 w-4" />
            Leadership Quality
          </CardTitle>
          <CardDescription>
            No leadership signals recorded yet
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const getScoreColor = (score: number, type: LeadershipSignalType) => {
    const config = LEADERSHIP_SIGNAL_CONFIG[type];
    if (config.goodDirection === "lower") {
      // For reversal rate, lower is better
      if (score < 0.3) return "text-success";
      if (score < 0.6) return "text-warning";
      return "text-destructive";
    }
    // For most metrics, higher is better
    if (score > 0.7) return "text-success";
    if (score > 0.4) return "text-warning";
    return "text-destructive";
  };

  const getTrendIcon = (score: number, type: LeadershipSignalType) => {
    const config = LEADERSHIP_SIGNAL_CONFIG[type];
    const isGood = config.goodDirection === "higher" ? score > 0.6 : score < 0.4;
    const isBad = config.goodDirection === "higher" ? score < 0.4 : score > 0.6;
    
    if (isGood) return <TrendingUp className="h-4 w-4 text-success" />;
    if (isBad) return <TrendingDown className="h-4 w-4 text-destructive" />;
    return <Minus className="h-4 w-4 text-muted-foreground" />;
  };

  const allSignals: { type: LeadershipSignalType; value: number }[] = [
    { type: "revision_helpfulness" as LeadershipSignalType, value: summary.averageHelpfulness },
    { type: "worker_improvement_delta" as LeadershipSignalType, value: summary.averageImprovementDelta },
    { type: "escalation_restraint" as LeadershipSignalType, value: summary.averageEscalationRestraint },
    { type: "override_justification_quality" as LeadershipSignalType, value: summary.averageOverrideQuality },
    { type: "reversal_rate" as LeadershipSignalType, value: summary.averageReversalRate },
    { type: "fairness_feedback" as LeadershipSignalType, value: summary.averageFairness },
  ];
  const signals = allSignals.filter((s) => s.value > 0);

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm flex items-center gap-2">
            <Award className="h-4 w-4 text-warning" />
            Leadership Quality
            {userName && <span className="text-muted-foreground font-normal">— {userName}</span>}
          </CardTitle>
          <Badge variant="outline" className="text-xs">
            <Eye className="h-3 w-3 mr-1" />
            Overseer View
          </Badge>
        </div>
        <CardDescription>
          Non-financial mentorship quality metrics
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Overall Score */}
        <div className="p-3 rounded-lg bg-muted/50">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Overall Leadership Score</span>
            <span className={`text-lg font-bold ${summary.overallScore > 0.6 ? "text-success" : summary.overallScore > 0.4 ? "text-warning" : "text-destructive"}`}>
              {(summary.overallScore * 100).toFixed(0)}%
            </span>
          </div>
          <Progress value={summary.overallScore * 100} className="h-2" />
        </div>

        {/* Individual Signals */}
        <div className="space-y-3">
          {signals.map(({ type, value }) => {
            const config = LEADERSHIP_SIGNAL_CONFIG[type];
            return (
              <div key={type} className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{config.label}</p>
                  <p className="text-xs text-muted-foreground truncate">{config.description}</p>
                </div>
                <div className="flex items-center gap-2 ml-2">
                  <span className={`text-sm font-medium ${getScoreColor(value, type)}`}>
                    {(value * 100).toFixed(0)}%
                  </span>
                  {getTrendIcon(value, type)}
                </div>
              </div>
            );
          })}
        </div>

        <p className="text-xs text-muted-foreground pt-2 border-t">
          Based on {summary.totalSignals} recorded signal{summary.totalSignals !== 1 ? "s" : ""}
        </p>
      </CardContent>
    </Card>
  );
}
