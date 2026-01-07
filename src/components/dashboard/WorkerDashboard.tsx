import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useDashboardStats } from "@/hooks/useDashboardStats";
import { useRecentActivity, ActivityFilters } from "@/hooks/useRecentActivity";
import { TeamSnapshotCard } from "@/components/employee/TeamSnapshotCard";
import { InvestmentOverviewCard } from "@/components/employee/InvestmentOverviewCard";
import { ComplaintsPanel } from "@/components/employee/ComplaintsPanel";
import { ReferralCard } from "@/components/employee/ReferralCard";
import { TrendsChart } from "@/components/dashboard/TrendsChart";
import { useCapabilities } from "@/hooks/useCapabilities";
import { formatDistanceToNow } from "date-fns";
import { 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  ClipboardList, 
  FileText,
  ArrowRight,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DateRange } from "react-day-picker";

interface WorkerDashboardProps {
  dateRange?: DateRange;
}

/**
 * Worker Dashboard - Execution Layer
 * Shows only personal tasks, reports, and performance
 * No team-wide or admin visibility
 */
export function WorkerDashboard({ dateRange }: WorkerDashboardProps) {
  const navigate = useNavigate();
  const { isInvestor } = useCapabilities();
  const { data: stats, isLoading } = useDashboardStats(dateRange);
  const [activityFilters, setActivityFilters] = useState<ActivityFilters>({
    type: "all",
    status: "all",
  });
  const { data: activities, isLoading: activitiesLoading } = useRecentActivity(5, activityFilters);

  const statsCards = [
    {
      title: "Active Tasks",
      value: stats?.activeTasks ?? 0,
      description: "Tasks in progress",
      icon: Clock,
      url: "/tasks",
    },
    {
      title: "Completed",
      value: stats?.completedTasks ?? 0,
      description: "Approved work",
      icon: CheckCircle2,
      url: "/tasks",
    },
    {
      title: "Pending Reviews",
      value: stats?.pendingReviews ?? 0,
      description: "Awaiting approval",
      icon: AlertCircle,
      url: "/reports",
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved": return "bg-success";
      case "rejected": return "bg-destructive";
      case "pending": return "bg-warning";
      default: return "bg-primary";
    }
  };

  const getActivityIcon = (type: string) => {
    return type === "task" ? ClipboardList : FileText;
  };

  return (
    <div className="space-y-6">
      {/* Stats Grid - Personal metrics only */}
      <div className="grid gap-4 md:grid-cols-3">
        {statsCards.map((stat) => (
          <Card 
            key={stat.title} 
            className="hover:shadow-md transition-all cursor-pointer hover:scale-[1.02]"
            onClick={() => navigate(stat.url)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === "Enter" && navigate(stat.url)}
          >
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <stat.icon className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <div className="text-2xl font-bold">{stat.value}</div>
              )}
              <p className="text-xs text-muted-foreground">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Secondary Cards - Team & Investment (if investor) */}
      <div className="grid gap-4 lg:grid-cols-2">
        <TeamSnapshotCard />
        {isInvestor() && <InvestmentOverviewCard />}
      </div>

      {/* Performance Trends */}
      <TrendsChart dateRange={dateRange} />

      {/* Recent Activity */}
      <Card>
        <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <CardTitle>My Recent Activity</CardTitle>
            <CardDescription>Your latest tasks and report updates</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Select
              value={activityFilters.type}
              onValueChange={(value) => setActivityFilters((prev) => ({ ...prev, type: value as ActivityFilters["type"] }))}
            >
              <SelectTrigger className="w-[100px] h-8 text-xs">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="task">Tasks</SelectItem>
                <SelectItem value="report">Reports</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/activity")}
              className="text-primary hover:text-primary/80"
            >
              View All
              <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {activitiesLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex items-center gap-4 p-3 rounded-lg bg-muted/50">
                  <Skeleton className="h-8 w-8 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-1/3" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                </div>
              ))
            ) : activities && activities.length > 0 ? (
              activities.map((activity) => {
                const Icon = getActivityIcon(activity.type);
                return (
                  <div
                    key={activity.id}
                    className="flex items-center gap-4 p-3 rounded-lg bg-muted/50 hover:bg-muted cursor-pointer transition-colors"
                    onClick={() => navigate(activity.url)}
                    role="button"
                    tabIndex={0}
                  >
                    <div className="h-8 w-8 rounded-full flex items-center justify-center bg-muted-foreground/10">
                      <Icon className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{activity.title}</p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                        <span className={`h-1.5 w-1.5 rounded-full ${getStatusColor(activity.status)}`} />
                        {activity.description}
                      </p>
                    </div>
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                    </span>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-6 text-muted-foreground">
                <p className="text-sm">No recent activity</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Bottom Cards */}
      <div className="grid gap-4 lg:grid-cols-2">
        <ComplaintsPanel />
        <ReferralCard />
      </div>
    </div>
  );
}
