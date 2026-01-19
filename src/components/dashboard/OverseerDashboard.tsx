import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RoleAuthorityBanner } from "@/components/ui/RoleAuthorityBanner";
import { useDashboardStats } from "@/hooks/useDashboardStats";
import { useWorkReports } from "@/hooks/useWorkReports";
import { useAuditLogs } from "@/hooks/useAuditLogs";
import { useAttentionSignals } from "@/hooks/useAttentionSignals";
import { TrendsChart } from "@/components/dashboard/TrendsChart";
import { PlatformChart } from "@/components/dashboard/PlatformChart";
import { AttentionSignalsList } from "@/components/governance/AttentionSignalsList";
import { LeadershipOverviewCard } from "@/components/leadership/LeadershipOverviewCard";
import { OverseerCommandLayer } from "@/components/dashboard/OverseerCommandLayer";
import { 
  Building2,
  Users,
  Shield,
  Activity,
  TrendingUp,
  DollarSign,
  FileText,
  Settings,
  ArrowRight,
  AlertTriangle,
  Eye,
  Bell,
  Crown,
} from "lucide-react";
import { DateRange } from "react-day-picker";

interface OverseerDashboardProps {
  dateRange?: DateRange;
}

/**
 * General Overseer Dashboard - Strategic Oversight
 * Focus on visibility, not micromanagement
 * High-level KPIs, conflicts, and system health
 */
export function OverseerDashboard({ dateRange }: OverseerDashboardProps) {
  const navigate = useNavigate();
  const { data: stats, isLoading } = useDashboardStats(dateRange);
  const { data: reports } = useWorkReports();
  const { data: auditLogs } = useAuditLogs();
  const { data: attentionSignals } = useAttentionSignals({ unresolvedOnly: true });

  // Calculate key metrics
  const totalWorkers = stats?.teamMembers ?? 0;
  const pendingApprovals = reports?.filter(r => r.final_status === "pending").length || 0;
  const overridesThisMonth = auditLogs?.filter(
    log => log.action.includes("override") && 
    new Date(log.performed_at).getMonth() === new Date().getMonth()
  ).length || 0;
  const conflicts = reports?.filter(
    r => r.team_lead_status === "rejected" && r.final_status === "pending"
  ).length || 0;
  const activeSignals = attentionSignals?.length || 0;

  const kpiCards = [
    {
      title: "Total Workers",
      value: totalWorkers,
      icon: Users,
      color: "text-info",
    },
    {
      title: "Pending Approvals",
      value: pendingApprovals,
      icon: FileText,
      color: pendingApprovals > 10 ? "text-warning" : "text-muted-foreground",
    },
    {
      title: "Overrides This Month",
      value: overridesThisMonth,
      icon: Shield,
      color: overridesThisMonth > 5 ? "text-warning" : "text-muted-foreground",
    },
    {
      title: "Active Conflicts",
      value: conflicts,
      icon: AlertTriangle,
      color: conflicts > 0 ? "text-destructive" : "text-success",
    },
    {
      title: "Attention Signals",
      value: activeSignals,
      icon: Bell,
      color: activeSignals > 0 ? "text-warning" : "text-success",
    },
  ];

  const strategicCards = [
    {
      title: "Organization Overview",
      description: "All teams, members, and performance",
      icon: Building2,
      url: "/team",
      color: "text-primary",
      bg: "bg-primary/10",
    },
    {
      title: "Overrides & Conflicts",
      description: "Review disputed decisions",
      icon: Shield,
      url: "/reports?tab=overrides",
      count: conflicts,
      color: "text-warning",
      bg: "bg-warning/10",
    },
    {
      title: "Audit Trail",
      description: "Complete system activity log",
      icon: Activity,
      url: "/activity",
      color: "text-muted-foreground",
      bg: "bg-muted",
    },
    {
      title: "Financial Overview",
      description: "MPCN pool and investments",
      icon: TrendingUp,
      url: "/investments",
      color: "text-success",
      bg: "bg-success/10",
    },
    {
      title: "Finance & HR",
      description: "Payroll and salary periods",
      icon: DollarSign,
      url: "/finance-hr",
      color: "text-info",
      bg: "bg-info/10",
    },
    {
      title: "System Settings",
      description: "Platform configuration",
      icon: Settings,
      url: "/settings",
      color: "text-muted-foreground",
      bg: "bg-muted",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Overseer Authority Banner */}
      <RoleAuthorityBanner
        variant="warning"
        title="Full Governance Authority — With Full Accountability"
        description="You have complete system access. Every action you take is permanently recorded with your justification. This is your trust contract with the organization."
      />

      {/* Executive Banner */}
      <div className="rounded-lg gradient-primary p-6 text-primary-foreground">
        <div className="flex items-center gap-3 mb-2">
          <Crown className="h-6 w-6" />
          <h2 className="text-xl font-semibold">Global Strategic Overview</h2>
        </div>
        <p className="text-primary-foreground/80 text-sm">
          System-wide oversight of the MPCN organization. Focus on governance patterns, not individual tasks.
        </p>
      </div>

      {/* KPI Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {kpiCards.map((kpi) => (
          <Card key={kpi.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {kpi.title}
              </CardTitle>
              <kpi.icon className={`h-5 w-5 ${kpi.color}`} />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <div className="text-2xl font-bold">{kpi.value}</div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Conflicts Alert */}
      {conflicts > 0 && (
        <Card className="border-warning/30 bg-warning/5">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-warning" />
                <CardTitle className="text-base">Active Conflicts Require Attention</CardTitle>
              </div>
              <Badge variant="secondary" className="bg-warning/20 text-warning">
                {conflicts} conflict{conflicts > 1 ? "s" : ""}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-3">
              There are reports where Admin and Team Lead decisions conflict. These require your review.
            </p>
            <Button variant="outline" size="sm" onClick={() => navigate("/reports?tab=overrides")}>
              Review Conflicts
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Strategic Access Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {strategicCards.map((card) => (
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
                    <CardDescription className="text-xs">{card.description}</CardDescription>
                  </div>
                </div>
                {card.count !== undefined && card.count > 0 && (
                  <Badge variant="destructive">{card.count}</Badge>
                )}
              </div>
            </CardHeader>
          </Card>
        ))}
      </div>

      {/* Attention Signals */}
      {activeSignals > 0 && (
        <AttentionSignalsList />
      )}

      {/* Leadership Quality Monitoring */}
      <LeadershipOverviewCard />

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
