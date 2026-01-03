import { useMemberPerformance, usePeriodEarnings } from "@/hooks/useOverseerData";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";
import { BarChart3, PieChart as PieChartIcon } from "lucide-react";

const COLORS = ["#22c55e", "#f59e0b", "#ef4444", "#6366f1"];

export function TeamPerformanceCharts() {
  const { data: members } = useMemberPerformance();
  const { data: periods } = usePeriodEarnings();

  // Top performers by earnings
  const topPerformers = [...(members || [])]
    .sort((a, b) => b.total_earnings - a.total_earnings)
    .slice(0, 8)
    .map((m) => ({
      name: m.full_name?.split(" ")[0] || "Unknown",
      earnings: m.total_earnings,
      hours: m.total_hours,
    }));

  // Status distribution
  const statusData = members?.reduce(
    (acc, m) => {
      acc.approved += m.approved_tasks + m.approved_reports;
      acc.pending += m.pending_tasks + m.pending_reports;
      acc.rejected += m.rejected_tasks + m.rejected_reports;
      return acc;
    },
    { approved: 0, pending: 0, rejected: 0 }
  ) || { approved: 0, pending: 0, rejected: 0 };

  const pieData = [
    { name: "Approved", value: statusData.approved, color: "#22c55e" },
    { name: "Pending", value: statusData.pending, color: "#f59e0b" },
    { name: "Rejected", value: statusData.rejected, color: "#ef4444" },
  ].filter((d) => d.value > 0);

  // Period earnings trend
  const periodTrend = [...(periods || [])]
    .reverse()
    .slice(-6)
    .map((p) => ({
      name: p.period_name.length > 10 ? p.period_name.slice(0, 10) + "..." : p.period_name,
      earnings: p.total_earnings,
      hours: p.total_hours,
    }));

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Top Performers
          </CardTitle>
          <CardDescription>By total approved earnings</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            {topPerformers.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topPerformers} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" tickFormatter={(v) => `$${v}`} />
                  <YAxis type="category" dataKey="name" width={80} />
                  <Tooltip
                    formatter={(value: number) => [`$${value.toFixed(2)}`, "Earnings"]}
                  />
                  <Bar dataKey="earnings" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                No performance data available
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PieChartIcon className="h-5 w-5" />
            Status Distribution
          </CardTitle>
          <CardDescription>Tasks and reports by status</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                No status data available
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Earnings by Period
          </CardTitle>
          <CardDescription>Total approved earnings per salary period</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[250px]">
            {periodTrend.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={periodTrend}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis tickFormatter={(v) => `$${v}`} />
                  <Tooltip
                    formatter={(value: number) => [`$${value.toFixed(2)}`, "Earnings"]}
                  />
                  <Bar dataKey="earnings" fill="hsl(var(--chart-2))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                No period data available
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
