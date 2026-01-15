import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useTeamPerformance, TeamPerformance } from "@/hooks/useTeamPerformance";
import { Trophy, Users, Target, Star, TrendingUp } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

export function TeamPerformanceChart() {
  const { data: teams, isLoading } = useTeamPerformance();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[300px] w-full" />
        </CardContent>
      </Card>
    );
  }

  if (!teams || teams.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-primary" />
            Team Performance Comparison
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
            <Users className="h-12 w-12 mb-4 opacity-50" />
            <p>No teams available for comparison</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const chartData = teams.map((team) => ({
    name: team.team_name.length > 12 ? team.team_name.substring(0, 12) + "..." : team.team_name,
    fullName: team.team_name,
    skills: team.total_skills,
    tasks: team.completed_tasks,
    members: team.member_count,
    rating: team.average_rating ? Number(team.average_rating.toFixed(1)) : 0,
    score: Math.round(team.score),
  }));

  const getRankBadge = (rank: number) => {
    if (rank === 1) return <Badge className="bg-yellow-500 text-white">🥇 1st</Badge>;
    if (rank === 2) return <Badge className="bg-gray-400 text-white">🥈 2nd</Badge>;
    if (rank === 3) return <Badge className="bg-amber-600 text-white">🥉 3rd</Badge>;
    return <Badge variant="outline">#{rank}</Badge>;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-primary" />
          Team Performance Comparison
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Chart */}
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="name" className="text-xs" />
              <YAxis className="text-xs" />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-popover p-3 rounded-lg shadow-lg border">
                        <p className="font-semibold">{data.fullName}</p>
                        <div className="text-sm space-y-1 mt-2">
                          <p>Skills Gained: {data.skills}</p>
                          <p>Tasks Completed: {data.tasks}</p>
                          <p>Members: {data.members}</p>
                          <p>Avg Rating: {data.rating || "N/A"}</p>
                          <p className="font-semibold text-primary">Score: {data.score}</p>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Legend />
              <Bar dataKey="skills" name="Skills" fill="hsl(var(--chart-1))" radius={[4, 4, 0, 0]} />
              <Bar dataKey="tasks" name="Tasks" fill="hsl(var(--chart-2))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Team Rankings */}
        <div className="space-y-3">
          <h4 className="font-medium flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Team Rankings
          </h4>
          <div className="grid gap-3">
            {teams.map((team) => (
              <div
                key={team.team_id}
                className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  {getRankBadge(team.rank)}
                  <div>
                    <p className="font-medium">{team.team_name}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      {team.skill_focus && (
                        <span className="flex items-center gap-1">
                          <Target className="h-3 w-3" />
                          {team.skill_focus}
                        </span>
                      )}
                      {team.region && <span>• {team.region}</span>}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-sm">
                  <div className="text-center">
                    <p className="font-semibold">{team.member_count}</p>
                    <p className="text-xs text-muted-foreground">Members</p>
                  </div>
                  <div className="text-center">
                    <p className="font-semibold">{team.total_skills}</p>
                    <p className="text-xs text-muted-foreground">Skills</p>
                  </div>
                  <div className="text-center">
                    <p className="font-semibold">{team.completed_tasks}</p>
                    <p className="text-xs text-muted-foreground">Tasks</p>
                  </div>
                  {team.average_rating && (
                    <div className="text-center">
                      <p className="font-semibold flex items-center gap-1">
                        <Star className="h-3 w-3 text-yellow-500" />
                        {team.average_rating.toFixed(1)}
                      </p>
                      <p className="text-xs text-muted-foreground">Rating</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
