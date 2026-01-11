import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useMyLearningInsights, useSkillProgression } from "@/hooks/useLearningInsights";
import { Lightbulb, TrendingUp, AlertCircle, Sparkles, BookOpen } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

/**
 * Learning Insights Card
 * Shows the worker their post-resolution learning feedback
 */
export function LearningInsightsCard() {
  const { data: insights, isLoading } = useMyLearningInsights();
  const { data: skills, isLoading: skillsLoading } = useSkillProgression();

  const recentInsights = insights?.slice(0, 5) || [];

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
              <Skeleton key={i} className="h-16" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lightbulb className="h-5 w-5 text-warning" />
          Learning Insights
        </CardTitle>
        <CardDescription>
          Feedback from your completed work to help you grow
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Skill Badges */}
        {skills && skills.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5" />
              Skills Developed
            </p>
            <div className="flex flex-wrap gap-1.5">
              {skills.slice(0, 6).map((skill) => (
                <Badge key={skill.skill} variant="secondary" className="text-xs">
                  {skill.skill}
                  <span className="ml-1 text-muted-foreground">×{skill.count}</span>
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Recent Insights */}
        {recentInsights.length > 0 ? (
          <div className="space-y-3">
            {recentInsights.map((insight) => (
              <div
                key={insight.id}
                className="p-3 rounded-lg bg-muted/50 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="text-xs">
                    {insight.entity_type === "task" ? "Task" : "Report"}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(insight.created_at), { addSuffix: true })}
                  </span>
                </div>

                {insight.what_went_well && (
                  <div className="flex gap-2 text-sm">
                    <TrendingUp className="h-4 w-4 text-success shrink-0 mt-0.5" />
                    <span>{insight.what_went_well}</span>
                  </div>
                )}

                {insight.what_to_improve && (
                  <div className="flex gap-2 text-sm">
                    <AlertCircle className="h-4 w-4 text-warning shrink-0 mt-0.5" />
                    <span>{insight.what_to_improve}</span>
                  </div>
                )}

                {insight.suggestions && insight.suggestions.length > 0 && (
                  <div className="flex gap-2 text-sm">
                    <BookOpen className="h-4 w-4 text-info shrink-0 mt-0.5" />
                    <span>{insight.suggestions[0]}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6 text-muted-foreground">
            <Lightbulb className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No insights yet</p>
            <p className="text-xs">Complete tasks to receive learning feedback</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
