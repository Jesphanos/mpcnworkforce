import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Users, 
  FileText, 
  DollarSign, 
  TrendingUp, 
  Clock, 
  CheckCircle2,
  AlertCircle,
  ArrowUpRight
} from "lucide-react";

const statsCards = [
  {
    title: "Active Tasks",
    value: "12",
    description: "+2 from yesterday",
    icon: Clock,
    trend: "up",
  },
  {
    title: "Completed",
    value: "48",
    description: "This month",
    icon: CheckCircle2,
    trend: "up",
  },
  {
    title: "Pending Reviews",
    value: "5",
    description: "Awaiting approval",
    icon: AlertCircle,
    trend: "neutral",
  },
  {
    title: "Team Members",
    value: "24",
    description: "Active users",
    icon: Users,
    trend: "up",
  },
];

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

export default function Dashboard() {
  const { profile, role, hasRole } = useAuth();
  const navigate = useNavigate();

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
        {/* Welcome Section */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              Dashboard
            </h1>
            <p className="text-muted-foreground">
              {getRoleLabel(role)} Overview
            </p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {statsCards.map((stat) => (
            <Card key={stat.title} className="hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <stat.icon className="h-5 w-5 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">{stat.value}</div>
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  {stat.trend === "up" && (
                    <ArrowUpRight className="h-3 w-3 text-success" />
                  )}
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
                  className="hover:shadow-md transition-all cursor-pointer hover:scale-[1.02]"
                  onClick={() => navigate(card.url)}
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

        {/* Recent Activity Placeholder */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Your latest updates and notifications</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="flex items-center gap-4 p-3 rounded-lg bg-muted/50"
                >
                  <div className="h-2 w-2 rounded-full bg-primary" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">
                      Activity placeholder {i}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      This will show real activity data in future updates
                    </p>
                  </div>
                  <span className="text-xs text-muted-foreground">Just now</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}