import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Brain, TrendingUp, TrendingDown, AlertTriangle, CheckCircle, 
  Lightbulb, RefreshCw, Sparkles, ChevronRight, Zap
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface Insight {
  id: string;
  type: "positive" | "warning" | "suggestion" | "trend";
  title: string;
  description: string;
  metric?: string;
  change?: number;
  priority: "high" | "medium" | "low";
}

// Mock AI-generated insights
const mockInsights: Insight[] = [
  {
    id: "1",
    type: "positive",
    title: "Productivity Surge Detected",
    description: "Your team's output has increased by 23% this week compared to the monthly average.",
    metric: "+23%",
    change: 23,
    priority: "high",
  },
  {
    id: "2",
    type: "warning",
    title: "Report Approval Backlog",
    description: "15 reports are pending review for more than 48 hours. Consider prioritizing reviews.",
    metric: "15 pending",
    priority: "high",
  },
  {
    id: "3",
    type: "suggestion",
    title: "Skill Development Opportunity",
    description: "Based on recent tasks, your team could benefit from data analysis training.",
    priority: "medium",
  },
  {
    id: "4",
    type: "trend",
    title: "Peak Performance Hours",
    description: "Most approved reports are submitted between 9 AM - 11 AM. Consider focusing high-value work during these hours.",
    priority: "low",
  },
];

const insightStyles = {
  positive: {
    icon: CheckCircle,
    color: "text-success",
    bg: "bg-success/10",
    border: "border-success/20",
  },
  warning: {
    icon: AlertTriangle,
    color: "text-warning",
    bg: "bg-warning/10",
    border: "border-warning/20",
  },
  suggestion: {
    icon: Lightbulb,
    color: "text-primary",
    bg: "bg-primary/10",
    border: "border-primary/20",
  },
  trend: {
    icon: TrendingUp,
    color: "text-blue-500",
    bg: "bg-blue-500/10",
    border: "border-blue-500/20",
  },
};

interface AIInsightsCardProps {
  showRefresh?: boolean;
  compact?: boolean;
  maxInsights?: number;
}

export function AIInsightsCard({ 
  showRefresh = true, 
  compact = false,
  maxInsights = 4 
}: AIInsightsCardProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [insights, setInsights] = useState(mockInsights.slice(0, maxInsights));
  const [expandedInsight, setExpandedInsight] = useState<string | null>(null);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    // Simulate AI refresh
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsRefreshing(false);
  };

  return (
    <Card>
      <CardHeader className={compact ? "pb-2" : undefined}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
              <Brain className="h-4 w-4 text-primary-foreground" />
            </div>
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                AI Insights
                <Badge variant="secondary" className="gap-1 text-xs">
                  <Sparkles className="h-3 w-3" />
                  Beta
                </Badge>
              </CardTitle>
              {!compact && (
                <CardDescription className="text-xs">
                  Powered by pattern analysis
                </CardDescription>
              )}
            </div>
          </div>
          {showRefresh && (
            <Button
              variant="ghost"
              size="icon"
              onClick={handleRefresh}
              disabled={isRefreshing}
            >
              <RefreshCw className={cn("h-4 w-4", isRefreshing && "animate-spin")} />
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent>
        {isRefreshing ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex gap-3 p-3 rounded-lg bg-muted/50">
                <Skeleton className="w-8 h-8 rounded-full flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-full" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {insights.map((insight, index) => {
              const style = insightStyles[insight.type];
              const Icon = style.icon;
              const isExpanded = expandedInsight === insight.id;

              return (
                <motion.div
                  key={insight.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  onClick={() => setExpandedInsight(isExpanded ? null : insight.id)}
                  className={cn(
                    "p-3 rounded-lg border cursor-pointer transition-all",
                    style.bg,
                    style.border,
                    isExpanded && "ring-1 ring-offset-1"
                  )}
                >
                  <div className="flex items-start gap-3">
                    <div className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0",
                      style.bg
                    )}>
                      <Icon className={cn("h-4 w-4", style.color)} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <h4 className="text-sm font-medium truncate">
                          {insight.title}
                        </h4>
                        {insight.metric && (
                          <Badge variant="outline" className={cn("text-xs flex-shrink-0", style.color)}>
                            {insight.metric}
                          </Badge>
                        )}
                      </div>
                      <AnimatePresence>
                        {(isExpanded || !compact) && (
                          <motion.p
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="text-xs text-muted-foreground mt-1"
                          >
                            {insight.description}
                          </motion.p>
                        )}
                      </AnimatePresence>
                    </div>
                    <ChevronRight 
                      className={cn(
                        "h-4 w-4 text-muted-foreground transition-transform flex-shrink-0",
                        isExpanded && "rotate-90"
                      )} 
                    />
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {!compact && (
          <div className="mt-4 pt-4 border-t">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Zap className="h-3 w-3" />
                Updated 5 minutes ago
              </span>
              <Button variant="link" size="sm" className="h-auto p-0 text-xs">
                View all insights
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
