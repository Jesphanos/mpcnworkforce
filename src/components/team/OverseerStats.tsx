import { useOverseerStats } from "@/hooks/useOverseerData";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, ClipboardList, FileText, Clock, DollarSign, TrendingUp, Timer } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export function OverseerStats() {
  const { data: stats, isLoading } = useOverseerStats();

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-8 w-8 rounded-lg" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-16 mb-1" />
              <Skeleton className="h-3 w-20" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const statItems = [
    {
      title: "Total Members",
      value: stats?.total_members || 0,
      icon: Users,
      description: "Active users",
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    },
    {
      title: "Pending Reviews",
      value: stats?.pending_reviews || 0,
      icon: Clock,
      description: "Tasks & reports awaiting review",
      color: "text-amber-600",
      bgColor: "bg-amber-100",
    },
    {
      title: "Total Hours",
      value: stats?.total_hours_worked?.toFixed(1) || 0,
      icon: Timer,
      description: "Hours worked",
      color: "text-purple-600",
      bgColor: "bg-purple-100",
    },
    {
      title: "Total Earnings",
      value: `$${(stats?.total_earnings || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      icon: DollarSign,
      description: "Approved earnings",
      color: "text-green-600",
      bgColor: "bg-green-100",
    },
    {
      title: "Total Tasks",
      value: stats?.total_tasks || 0,
      icon: ClipboardList,
      description: "All submitted tasks",
      color: "text-indigo-600",
      bgColor: "bg-indigo-100",
    },
    {
      title: "Total Reports",
      value: stats?.total_reports || 0,
      icon: FileText,
      description: "All submitted reports",
      color: "text-cyan-600",
      bgColor: "bg-cyan-100",
    },
    {
      title: "Approval Rate",
      value: `${(stats?.approval_rate || 0).toFixed(1)}%`,
      icon: TrendingUp,
      description: "Overall approval rate",
      color: "text-emerald-600",
      bgColor: "bg-emerald-100",
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7">
      {statItems.map((stat) => (
        <Card key={stat.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
            <div className={`p-2 rounded-lg ${stat.bgColor}`}>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
            <p className="text-xs text-muted-foreground">{stat.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
