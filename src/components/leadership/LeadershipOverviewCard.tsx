import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useLeadershipSignals, LEADERSHIP_SIGNAL_CONFIG, LeadershipSignalType } from "@/hooks/useLeadershipSignals";
import { Award, Users, Eye } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

/**
 * Leadership Overview Card
 * Shows aggregate leadership signals for all leaders (Overseer dashboard)
 */
export function LeadershipOverviewCard() {
  const { data: signals, isLoading } = useLeadershipSignals();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-4 w-60" />
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-16" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!signals || signals.length === 0) {
    return (
      <Card className="border-dashed">
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <Award className="h-4 w-4" />
            Leadership Quality Signals
          </CardTitle>
          <CardDescription>
            No leadership signals recorded yet. Signals are generated during report reviews.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  // Group signals by user
  const signalsByUser = signals.reduce((acc, signal) => {
    if (!acc[signal.user_id]) {
      acc[signal.user_id] = { signals: [], role: signal.role };
    }
    acc[signal.user_id].signals.push(signal);
    return acc;
  }, {} as Record<string, { signals: typeof signals; role: string }>);

  // Calculate average scores per user
  const userSummaries = Object.entries(signalsByUser).map(([userId, data]) => {
    const avgScore = data.signals.reduce((sum, s) => sum + Number(s.signal_value), 0) / data.signals.length;
    const latestSignal = data.signals[0];
    return {
      userId,
      role: data.role,
      avgScore,
      signalCount: data.signals.length,
      latestAt: latestSignal.calculated_at,
    };
  }).sort((a, b) => b.avgScore - a.avgScore);

  const getScoreColor = (score: number) => {
    if (score > 0.7) return "text-success";
    if (score > 0.4) return "text-warning";
    return "text-destructive";
  };

  const getRoleBadgeColor = (role: string) => {
    if (role === "team_lead") return "bg-info/10 text-info";
    if (role === "report_admin") return "bg-warning/10 text-warning";
    return "bg-muted text-muted-foreground";
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm flex items-center gap-2">
            <Award className="h-4 w-4 text-warning" />
            Leadership Quality Signals
          </CardTitle>
          <Badge variant="outline" className="text-xs">
            <Eye className="h-3 w-3 mr-1" />
            Overseer Only
          </Badge>
        </div>
        <CardDescription>
          Mentorship quality metrics for team leads and admins
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {userSummaries.slice(0, 5).map((summary) => (
          <div 
            key={summary.userId} 
            className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
          >
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                <Users className="h-4 w-4 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm font-medium flex items-center gap-2">
                  Leader ID: {summary.userId.slice(0, 8)}...
                  <Badge variant="secondary" className={`text-xs ${getRoleBadgeColor(summary.role)}`}>
                    {summary.role.replace("_", " ")}
                  </Badge>
                </p>
                <p className="text-xs text-muted-foreground">
                  {summary.signalCount} signal{summary.signalCount !== 1 ? "s" : ""} • 
                  Last {formatDistanceToNow(new Date(summary.latestAt), { addSuffix: true })}
                </p>
              </div>
            </div>
            <div className="text-right">
              <span className={`text-lg font-bold ${getScoreColor(summary.avgScore)}`}>
                {(summary.avgScore * 100).toFixed(0)}%
              </span>
              <p className="text-xs text-muted-foreground">avg score</p>
            </div>
          </div>
        ))}

        {userSummaries.length > 5 && (
          <p className="text-xs text-center text-muted-foreground pt-2">
            +{userSummaries.length - 5} more leader{userSummaries.length - 5 !== 1 ? "s" : ""}
          </p>
        )}

        <p className="text-xs text-muted-foreground pt-2 border-t">
          Based on {signals.length} total signal{signals.length !== 1 ? "s" : ""} across {userSummaries.length} leader{userSummaries.length !== 1 ? "s" : ""}
        </p>
      </CardContent>
    </Card>
  );
}
