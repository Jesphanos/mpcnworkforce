import { useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useSkillProgression } from "@/hooks/useLearningInsights";
import { TrendingUp, Award, Calendar } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { format, parseISO } from "date-fns";

/**
 * Skill Progression Chart
 * Shows growth over time based on learning insights
 */
export function SkillProgressionChart() {
  const { data: skillProgression, isLoading } = useSkillProgression();

  const chartData = useMemo(() => {
    if (!skillProgression || skillProgression.length === 0) return [];

    // Group by month for cleaner visualization
    const monthlyData: Record<string, number> = {};
    
    skillProgression.forEach((skill) => {
      const month = format(parseISO(skill.firstSeen), "MMM yyyy");
      monthlyData[month] = (monthlyData[month] || 0) + skill.count;
    });

    return Object.entries(monthlyData).map(([month, count]) => ({
      month,
      skills: count,
    }));
  }, [skillProgression]);

  const topSkills = useMemo(() => {
    if (!skillProgression) return [];
    return [...skillProgression]
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }, [skillProgression]);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-48" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-48 w-full" />
        </CardContent>
      </Card>
    );
  }

  const hasData = skillProgression && skillProgression.length > 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-primary" />
          Skill Progression
        </CardTitle>
        <CardDescription>
          Your growth over time based on learning insights
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {hasData ? (
          <>
            {/* Top Skills */}
            <div className="space-y-2">
              <h4 className="text-sm font-medium flex items-center gap-2">
                <Award className="h-4 w-4" />
                Most Developed Skills
              </h4>
              <div className="flex flex-wrap gap-2">
                {topSkills.map((skill) => (
                  <Badge key={skill.skill} variant="secondary" className="gap-1">
                    {skill.skill}
                    <span className="text-xs bg-primary/20 px-1.5 rounded-full">
                      {skill.count}
                    </span>
                  </Badge>
                ))}
              </div>
            </div>

            {/* Timeline Chart */}
            {chartData.length > 1 && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Growth Timeline
                </h4>
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis 
                        dataKey="month" 
                        tick={{ fontSize: 12 }} 
                        className="text-muted-foreground"
                      />
                      <YAxis 
                        tick={{ fontSize: 12 }} 
                        className="text-muted-foreground"
                      />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px',
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="skills"
                        stroke="hsl(var(--primary))"
                        fill="hsl(var(--primary) / 0.2)"
                        name="Skills Gained"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {/* Summary Stats */}
            <div className="grid grid-cols-3 gap-4 pt-2 border-t">
              <div className="text-center">
                <p className="text-2xl font-bold text-primary">
                  {skillProgression.length}
                </p>
                <p className="text-xs text-muted-foreground">Skills Developed</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-primary">
                  {skillProgression.reduce((sum, s) => sum + s.count, 0)}
                </p>
                <p className="text-xs text-muted-foreground">Total Signals</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-primary">
                  {topSkills[0]?.count || 0}
                </p>
                <p className="text-xs text-muted-foreground">Top Skill Count</p>
              </div>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <TrendingUp className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No skill progression data yet</p>
            <p className="text-sm text-muted-foreground mt-1">
              Complete tasks and receive feedback to build your skill profile
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}