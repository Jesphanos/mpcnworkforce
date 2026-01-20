import { useMemo, memo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, DollarSign, CheckCircle, XCircle, TrendingUp } from "lucide-react";
import { WorkReport } from "@/hooks/useWorkReports";

interface ReportsStatsProps {
  reports: WorkReport[];
}

export const ReportsStats = memo(function ReportsStats({ reports }: ReportsStatsProps) {
  const { totalHours, totalEarnings, approvedReports, pendingReports, avgHourlyRate } = useMemo(() => {
    const totalHours = reports.reduce((acc, r) => acc + Number(r.hours_worked), 0);
    const totalEarnings = reports.reduce((acc, r) => acc + Number(r.earnings), 0);
    const approvedReports = reports.filter((r) => r.status === "approved").length;
    const pendingReports = reports.filter((r) => r.status === "pending").length;
    const avgHourlyRate = totalHours > 0 ? totalEarnings / totalHours : 0;
    
    return { totalHours, totalEarnings, approvedReports, pendingReports, avgHourlyRate };
  }, [reports]);

  const stats = [
    {
      title: "Total Hours",
      value: `${totalHours.toFixed(1)}h`,
      icon: Clock,
      color: "text-info",
      bg: "bg-info/10",
    },
    {
      title: "Total Earnings",
      value: `$${totalEarnings.toFixed(2)}`,
      icon: DollarSign,
      color: "text-success",
      bg: "bg-success/10",
    },
    {
      title: "Approved",
      value: approvedReports.toString(),
      icon: CheckCircle,
      color: "text-success",
      bg: "bg-success/10",
    },
    {
      title: "Pending",
      value: pendingReports.toString(),
      icon: XCircle,
      color: "text-warning",
      bg: "bg-warning/10",
    },
    {
      title: "Avg Rate",
      value: `$${avgHourlyRate.toFixed(2)}/h`,
      icon: TrendingUp,
      color: "text-primary",
      bg: "bg-primary/10",
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
      {stats.map((stat) => (
        <Card key={stat.title}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {stat.title}
            </CardTitle>
            <div className={`rounded-lg p-2 ${stat.bg}`}>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{stat.value}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
});
