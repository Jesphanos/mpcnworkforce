import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { formatDistanceToNow } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Activity, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  CheckCircle,
  XCircle,
  Clock
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ActivityItem {
  id: string;
  type: "trade_open" | "trade_close" | "alert" | "milestone" | "risk_warning";
  title: string;
  description?: string;
  timestamp: Date;
  value?: number;
  status?: "positive" | "negative" | "neutral" | "warning";
}

// Mock activity data - in production this would come from real-time subscriptions
const mockActivities: ActivityItem[] = [
  {
    id: "1",
    type: "trade_close",
    title: "EUR/USD Long Closed",
    description: "+1.5R • Strategy: Breakout",
    timestamp: new Date(Date.now() - 1000 * 60 * 5),
    value: 150.25,
    status: "positive",
  },
  {
    id: "2",
    type: "risk_warning",
    title: "Daily Loss at 50%",
    description: "Consider reducing position sizes",
    timestamp: new Date(Date.now() - 1000 * 60 * 15),
    status: "warning",
  },
  {
    id: "3",
    type: "trade_open",
    title: "BTC/USDT Short Opened",
    description: "Risk: 1% • SL: $67,500",
    timestamp: new Date(Date.now() - 1000 * 60 * 30),
    status: "neutral",
  },
  {
    id: "4",
    type: "milestone",
    title: "10 Trade Streak!",
    description: "Congratulations on consistent execution",
    timestamp: new Date(Date.now() - 1000 * 60 * 60),
    status: "positive",
  },
  {
    id: "5",
    type: "trade_close",
    title: "GBP/JPY Long Stopped",
    description: "-1R • Hit stop loss",
    timestamp: new Date(Date.now() - 1000 * 60 * 90),
    value: -75.50,
    status: "negative",
  },
];

const activityIcons = {
  trade_open: Clock,
  trade_close: CheckCircle,
  alert: AlertTriangle,
  milestone: TrendingUp,
  risk_warning: AlertTriangle,
};

const activityColors = {
  positive: "text-success bg-success/10",
  negative: "text-destructive bg-destructive/10",
  neutral: "text-muted-foreground bg-muted",
  warning: "text-warning bg-warning/10",
};

export function TradingActivityFeed({ className }: { className?: string }) {
  const [activities] = useState<ActivityItem[]>(mockActivities);

  return (
    <Card className={cn("", className)}>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Activity className="h-4 w-4" />
          Recent Activity
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[300px]">
          <div className="space-y-1 p-4 pt-0">
            <AnimatePresence>
              {activities.map((activity, index) => {
                const Icon = activityIcons[activity.type];
                return (
                  <motion.div
                    key={activity.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div
                      className={cn(
                        "p-1.5 rounded-full shrink-0",
                        activityColors[activity.status || "neutral"]
                      )}
                    >
                      <Icon className="h-3.5 w-3.5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm font-medium truncate">{activity.title}</p>
                        {activity.value !== undefined && (
                          <span
                            className={cn(
                              "text-sm font-semibold tabular-nums shrink-0",
                              activity.value >= 0 ? "text-success" : "text-destructive"
                            )}
                          >
                            {activity.value >= 0 ? "+" : ""}${activity.value.toFixed(2)}
                          </span>
                        )}
                      </div>
                      {activity.description && (
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {activity.description}
                        </p>
                      )}
                      <p className="text-[10px] text-muted-foreground mt-1">
                        {formatDistanceToNow(activity.timestamp, { addSuffix: true })}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
