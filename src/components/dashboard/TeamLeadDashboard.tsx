import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { RoleAuthorityBanner } from "@/components/ui/RoleAuthorityBanner";
import { useDashboardStats } from "@/hooks/useDashboardStats";
import { useWorkReports } from "@/hooks/useWorkReports";
import { TeamStats } from "@/components/team/TeamStats";
import { TrendsChart } from "@/components/dashboard/TrendsChart";
import { 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Users,
  FileText,
  ArrowRight,
  AlertTriangle,
} from "lucide-react";
import { DateRange } from "react-day-picker";

interface TeamLeadDashboardProps {
  dateRange?: DateRange;
}

/**
 * Team Lead Dashboard - First-Level Review
 * Shows team overview, pending reviews, and team performance
 * Clear messaging that decisions are NOT final
 */
export function TeamLeadDashboard({ dateRange }: TeamLeadDashboardProps) {
  const navigate = useNavigate();
  const { data: stats, isLoading } = useDashboardStats(dateRange);
  const { data: reports } = useWorkReports();

  // Count pending reviews for team
  const pendingReviews = reports?.filter(
    (r) => r.status === "pending" && !r.team_lead_status
  ).length || 0;

  const rejectedByMe = reports?.filter(
    (r) => r.team_lead_status === "rejected" && r.final_status === "pending"
  ).length || 0;

  const statsCards = [
    {
      title: "Pending Reviews",
      value: pendingReviews,
      description: "Reports awaiting your review",
      icon: AlertCircle,
      url: "/reports?tab=review",
      highlight: pendingReviews > 0,
    },
    {
      title: "Team Members",
      value: stats?.teamMembers ?? 0,
      description: "Active in your team",
      icon: Users,
      url: "/team",
    },
    {
      title: "Completed This Period",
      value: stats?.completedTasks ?? 0,
      description: "Approved reports",
      icon: CheckCircle2,
      url: "/team",
    },
    {
      title: "My Active Tasks",
      value: stats?.activeTasks ?? 0,
      description: "Tasks in progress",
      icon: Clock,
      url: "/tasks",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Authority Banner */}
      <RoleAuthorityBanner
        variant="constraint"
        title="Review Only — Final approval handled by Admin"
        description="Your approvals move reports to the admin queue. Rejections do not delete reports and can be overridden."
      />

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statsCards.map((stat) => (
          <Card 
            key={stat.title} 
            className={`hover:shadow-md transition-all cursor-pointer hover:scale-[1.02] ${
              stat.highlight ? "ring-2 ring-warning" : ""
            }`}
            onClick={() => navigate(stat.url)}
            role="button"
            tabIndex={0}
          >
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <stat.icon className={`h-5 w-5 ${stat.highlight ? "text-warning" : "text-muted-foreground"}`} />
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

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="hover:shadow-md transition-all cursor-pointer" onClick={() => navigate("/reports?tab=review")}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-warning/10 flex items-center justify-center">
                  <FileText className="h-5 w-5 text-warning" />
                </div>
                <div>
                  <CardTitle className="text-base">Reports Pending Review</CardTitle>
                  <CardDescription>Review team member submissions</CardDescription>
                </div>
              </div>
              {pendingReviews > 0 && (
                <Badge variant="secondary" className="bg-warning/20 text-warning">
                  {pendingReviews} pending
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <Button variant="outline" size="sm" className="w-full">
              Review Reports
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-all cursor-pointer" onClick={() => navigate("/team")}>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-info/10 flex items-center justify-center">
                <Users className="h-5 w-5 text-info" />
              </div>
              <div>
                <CardTitle className="text-base">Team Overview</CardTitle>
                <CardDescription>View member progress and performance</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Button variant="outline" size="sm" className="w-full">
              View Team
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Rejected Reports Notice */}
      {rejectedByMe > 0 && (
        <Card className="border-warning/30 bg-warning/5">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-warning" />
              <CardTitle className="text-base">Rejected Reports in System</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-3">
              You have {rejectedByMe} rejected report{rejectedByMe > 1 ? "s" : ""} that remain{rejectedByMe === 1 ? "s" : ""} in the system. 
              These can be overridden by an Admin.
            </p>
            <Button variant="outline" size="sm" onClick={() => navigate("/reports?tab=review")}>
              View Reports
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Team Stats */}
      <TeamStats />

      {/* Performance Chart */}
      <TrendsChart dateRange={dateRange} />
    </div>
  );
}
