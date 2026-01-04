import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useRecentActivity } from "@/hooks/useRecentActivity";
import { useDashboardStats } from "@/hooks/useDashboardStats";
import { DateRangeFilter } from "@/components/dashboard/DateRangeFilter";
import { TrendsChart } from "@/components/dashboard/TrendsChart";
import { formatDistanceToNow } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { DateRange } from "react-day-picker";
import { 
  Users, 
  FileText, 
  DollarSign, 
  TrendingUp, 
  Clock, 
  CheckCircle2,
  AlertCircle,
  ArrowUpRight,
  ClipboardList,
  ArrowRight
} from "lucide-react";
const adminCards = [
  {
    title: "Reports Management",
    description: "View and manage employee reports",
    icon: FileText,
    role: "report_admin",
    color: "text-info",
    url: "/reports",
  },
  {
    title: "Finance & HR",
    description: "Manage payroll and HR functions",
    icon: DollarSign,
    role: "finance_hr_admin",
    color: "text-success",
    url: "/finance-hr",
  },
  {
    title: "Investments",
    description: "Track and manage investments",
    icon: TrendingUp,
    role: "investment_admin",
    color: "text-warning",
    url: "/investments",
  },
  {
    title: "User Administration",
    description: "Manage user accounts and roles",
    icon: Users,
    role: "user_admin",
    color: "text-primary",
    url: "/users",
  },
];

function RecentActivitySection({ navigate }: { navigate: (path: string) => void }) {
  const { data: activities, isLoading } = useRecentActivity(5);

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
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Your latest updates and notifications</CardDescription>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate("/activity")}
          className="text-primary hover:text-primary/80"
        >
          View All
          <ArrowRight className="h-4 w-4 ml-1" />
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {isLoading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 p-3 rounded-lg bg-muted/50">
                <Skeleton className="h-8 w-8 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-1/3" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
                <Skeleton className="h-3 w-16" />
              </div>
            ))
          ) : activities && activities.length > 0 ? (
            activities.map((activity) => {
              const Icon = getActivityIcon(activity.type);
              return (
                <div
                  key={activity.id}
                  className="flex items-center gap-4 p-3 rounded-lg bg-muted/50 hover:bg-muted cursor-pointer transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                  onClick={() => navigate(activity.url)}
                  onKeyDown={(e) => e.key === "Enter" && navigate(activity.url)}
                  tabIndex={0}
                  role="button"
                >
                  <div className={`h-8 w-8 rounded-full flex items-center justify-center bg-muted-foreground/10`}>
                    <Icon className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {activity.title}
                    </p>
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
  );
}

export default function Dashboard() {
  const { profile, role, hasRole } = useAuth();
  const navigate = useNavigate();
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const { data: stats, isLoading: statsLoading } = useDashboardStats(dateRange);
  const isAdmin = hasRole("user_admin") || hasRole("general_overseer") || hasRole("team_lead");

  const statsCards = [
    {
      title: "Active Tasks",
      value: stats?.activeTasks ?? 0,
      description: "Currently in progress",
      icon: Clock,
      url: "/tasks",
    },
    {
      title: "Completed",
      value: stats?.completedTasks ?? 0,
      description: "Approved tasks",
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
    ...(isAdmin ? [{
      title: "Team Members",
      value: stats?.teamMembers ?? 0,
      description: "Active users",
      icon: Users,
      url: "/team",
    }] : []),
  ];

  const getRoleLabel = (role: string | null) => {
    if (!role) return "Employee";
    return role
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const visibleAdminCards = adminCards.filter((card) => 
    hasRole(card.role as any)
  );

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Welcome Section with Date Filter */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              Dashboard
            </h1>
            <p className="text-muted-foreground">
              {getRoleLabel(role)} Overview
            </p>
          </div>
          <DateRangeFilter dateRange={dateRange} onDateRangeChange={setDateRange} />
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {statsCards.map((stat) => (
            <Card 
              key={stat.title} 
              className="hover:shadow-md transition-all cursor-pointer hover:scale-[1.02] focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
              onClick={() => navigate(stat.url)}
              tabIndex={0}
              onKeyDown={(e) => e.key === "Enter" && navigate(stat.url)}
              role="button"
            >
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <stat.icon className="h-5 w-5 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {statsLoading ? (
                  <Skeleton className="h-8 w-16" />
                ) : (
                  <div className="text-2xl font-bold text-foreground">{stat.value}</div>
                )}
                <p className="text-xs text-muted-foreground">
                  {stat.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Admin Quick Access */}
        {visibleAdminCards.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-foreground">
              Quick Access
            </h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {visibleAdminCards.map((card) => (
                <Card 
                  key={card.title} 
                  className="hover:shadow-md transition-all cursor-pointer hover:scale-[1.02] focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                  onClick={() => navigate(card.url)}
                  tabIndex={0}
                  onKeyDown={(e) => e.key === "Enter" && navigate(card.url)}
                  role="button"
                >
                  <CardHeader>
                    <div className={`h-10 w-10 rounded-lg bg-muted flex items-center justify-center mb-2`}>
                      <card.icon className={`h-5 w-5 ${card.color}`} />
                    </div>
                    <CardTitle className="text-base">{card.title}</CardTitle>
                    <CardDescription>{card.description}</CardDescription>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Trends Chart */}
        <TrendsChart dateRange={dateRange} />

        {/* Recent Activity */}
        <RecentActivitySection navigate={navigate} />
      </div>
    </DashboardLayout>
  );
}