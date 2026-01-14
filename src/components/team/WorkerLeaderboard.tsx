import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useWorkerLeaderboard } from "@/hooks/useWorkerLeaderboard";
import { Trophy, Medal, Award, Zap, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

function getRankIcon(rank: number) {
  switch (rank) {
    case 1:
      return <Trophy className="h-5 w-5 text-yellow-500" />;
    case 2:
      return <Medal className="h-5 w-5 text-gray-400" />;
    case 3:
      return <Award className="h-5 w-5 text-amber-600" />;
    default:
      return <span className="text-sm font-bold text-muted-foreground">#{rank}</span>;
  }
}

function getRankBg(rank: number) {
  switch (rank) {
    case 1:
      return "bg-yellow-500/10 border-yellow-500/30";
    case 2:
      return "bg-gray-400/10 border-gray-400/30";
    case 3:
      return "bg-amber-600/10 border-amber-600/30";
    default:
      return "bg-muted/50";
  }
}

function getInitials(name: string | null) {
  if (!name) return "U";
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

interface WorkerLeaderboardProps {
  limit?: number;
  className?: string;
}

export function WorkerLeaderboard({ limit = 10, className }: WorkerLeaderboardProps) {
  const { data: leaderboard, isLoading } = useWorkerLeaderboard(limit);

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-primary" />
            Top Performers
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!leaderboard || leaderboard.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-primary" />
            Top Performers
          </CardTitle>
          <CardDescription>Ranking by skill signals and completed tasks</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground py-8">
            No performance data yet. Complete tasks to appear on the leaderboard!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-primary" />
          Top Performers
        </CardTitle>
        <CardDescription>Ranked by skill signals and completed tasks</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {leaderboard.map((entry) => (
            <div
              key={entry.user_id}
              className={cn(
                "flex items-center gap-4 p-3 rounded-lg border transition-colors",
                getRankBg(entry.rank)
              )}
            >
              {/* Rank */}
              <div className="flex items-center justify-center w-10">
                {getRankIcon(entry.rank)}
              </div>

              {/* Avatar */}
              <Avatar className="h-10 w-10">
                <AvatarImage src={entry.avatar_url || undefined} />
                <AvatarFallback>{getInitials(entry.full_name)}</AvatarFallback>
              </Avatar>

              {/* Name and skills */}
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">
                  {entry.full_name || "Anonymous Worker"}
                </p>
                <div className="flex flex-wrap gap-1 mt-1">
                  {entry.top_skills.slice(0, 3).map((skill) => (
                    <Badge key={skill} variant="secondary" className="text-xs">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Stats */}
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1" title="Skill Signals">
                  <Zap className="h-4 w-4 text-primary" />
                  <span className="font-medium">{entry.skill_count}</span>
                </div>
                <div className="flex items-center gap-1" title="Completed Tasks">
                  <CheckCircle2 className="h-4 w-4 text-success" />
                  <span className="font-medium">{entry.completed_tasks}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
