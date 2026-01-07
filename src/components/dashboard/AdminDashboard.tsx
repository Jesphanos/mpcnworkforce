import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { RoleAuthorityBanner } from "@/components/ui/RoleAuthorityBanner";
import { useDashboardStats } from "@/hooks/useDashboardStats";
import { useWorkReports } from "@/hooks/useWorkReports";
import { TrendsChart } from "@/components/dashboard/TrendsChart";
import { PlatformChart } from "@/components/dashboard/PlatformChart";
import { 
  FileText,
  Users,
  Activity,
  Shield,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  Building2,
} from "lucide-react";
import { DateRange } from "react-day-picker";

interface AdminDashboardProps {
  dateRange?: DateRange;
  adminType: "report_admin" | "finance_hr_admin" | "investment_admin" | "user_admin";
}

/**
 * Admin Dashboard - Governance Layer
 * Shows system inbox, reports needing attention, and governance tools
 * Clear messaging that actions are logged and reviewable
 */
export function AdminDashboard({ dateRange, adminType }: AdminDashboardProps) {
  const navigate = useNavigate();
  const { data: stats, isLoading } = useDashboardStats(dateRange);
  const { data: reports } = useWorkReports();

  // Count reports needing attention
  const pendingApprovals = reports?.filter(
    (r) => r.team_lead_status === "approved" && r.final_status === "pending"
  ).length || 0;

  const needsOverride = reports?.filter(
    (r) => r.team_lead_status === "rejected" && r.final_status === "pending"
  ).length || 0;

  // Flagged reports count (using rejection as proxy for flagged state)
  const flaggedReports = 0;

  const getDomainCards = () => {
    switch (adminType) {
      case "report_admin":
        return [
          {
            title: "System Inbox",
            description: "Reports approved by Team Leads",
            icon: FileText,
            count: pendingApprovals,
            url: "/reports?tab=review",
            color: "text-info",
            bg: "bg-info/10",
          },
          {
            title: "Needs Override",
            description: "Rejected by Team Leads",
            icon: Shield,
            count: needsOverride,
            url: "/reports?tab=overrides",
            color: "text-warning",
            bg: "bg-warning/10",
          },
          {
            title: "All Reports",
            description: "Global report view",
            icon: FileText,
            count: reports?.length || 0,
            url: "/reports?tab=all",
            color: "text-muted-foreground",
            bg: "bg-muted",
          },
          {
            title: "Activity Logs",
            description: "Audit trail",
            icon: Activity,
            url: "/activity",
            color: "text-muted-foreground",
            bg: "bg-muted",
          },
        ];
      case "finance_hr_admin":
        return [
          {
            title: "Finance & HR",
            description: "Manage payroll and periods",
            icon: Building2,
            url: "/finance-hr",
            color: "text-success",
            bg: "bg-success/10",
          },
          {
            title: "Employee Directory",
            description: "View all employees",
            icon: Users,
            count: stats?.teamMembers || 0,
            url: "/users",
            color: "text-info",
            bg: "bg-info/10",
          },
          {
            title: "Teams View",
            description: "Organization structure",
            icon: Users,
            url: "/team",
            color: "text-muted-foreground",
            bg: "bg-muted",
          },
          {
            title: "Activity Logs",
            description: "Audit trail",
            icon: Activity,
            url: "/activity",
            color: "text-muted-foreground",
            bg: "bg-muted",
          },
        ];
      case "investment_admin":
        return [
          {
            title: "Investments",
            description: "Manage investment portfolio",
            icon: Building2,
            url: "/investments",
            color: "text-warning",
            bg: "bg-warning/10",
          },
          {
            title: "MPCN Financials",
            description: "Pool and profit management",
            icon: Activity,
            url: "/investments?tab=financials",
            color: "text-success",
            bg: "bg-success/10",
          },
        ];
      case "user_admin":
        return [
          {
            title: "User Management",
            description: "Manage users and roles",
            icon: Users,
            count: stats?.teamMembers || 0,
            url: "/users",
            color: "text-primary",
            bg: "bg-primary/10",
          },
          {
            title: "Team Management",
            description: "Organize team structure",
            icon: Building2,
            url: "/team",
            color: "text-info",
            bg: "bg-info/10",
          },
          {
            title: "Activity Logs",
            description: "Audit trail",
            icon: Activity,
            url: "/activity",
            color: "text-muted-foreground",
            bg: "bg-muted",
          },
        ];
      default:
        return [];
    }
  };

  const domainCards = getDomainCards();

  return (
    <div className="space-y-6">
      {/* Authority Banner */}
      <RoleAuthorityBanner
        variant="warning"
        title="Admin actions are logged and visible to the General Overseer"
        description="All approvals, rejections, and overrides are permanently recorded in the audit trail."
      />

      {/* Quick Stats */}
      {adminType === "report_admin" && (
        <div className="grid gap-4 md:grid-cols-3">
          <Card className={pendingApprovals > 0 ? "ring-2 ring-info" : ""}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Awaiting Approval
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold">{pendingApprovals}</span>
                  {pendingApprovals > 0 && (
                    <Badge variant="secondary" className="bg-info/20 text-info">
                      Action needed
                    </Badge>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className={needsOverride > 0 ? "ring-2 ring-warning" : ""}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Needs Override
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold">{needsOverride}</span>
                  {needsOverride > 0 && (
                    <Badge variant="secondary" className="bg-warning/20 text-warning">
                      Review
                    </Badge>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Processed Today
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold">{stats?.completedTasks ?? 0}</span>
                  <CheckCircle2 className="h-5 w-5 text-success" />
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Domain Cards */}
      <div className="grid gap-4 md:grid-cols-2">
        {domainCards.map((card) => (
          <Card 
            key={card.title}
            className="hover:shadow-md transition-all cursor-pointer hover:scale-[1.02]"
            onClick={() => navigate(card.url)}
          >
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`h-10 w-10 rounded-lg ${card.bg} flex items-center justify-center`}>
                    <card.icon className={`h-5 w-5 ${card.color}`} />
                  </div>
                  <div>
                    <CardTitle className="text-base">{card.title}</CardTitle>
                    <CardDescription>{card.description}</CardDescription>
                  </div>
                </div>
                {card.count !== undefined && card.count > 0 && (
                  <Badge variant="outline">{card.count}</Badge>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <Button variant="outline" size="sm" className="w-full">
                Open
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <TrendsChart dateRange={dateRange} />
        </div>
        <PlatformChart dateRange={dateRange} />
      </div>
    </div>
  );
}
