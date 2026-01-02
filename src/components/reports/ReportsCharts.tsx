import { useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, CartesianGrid } from "recharts";
import { WorkReport } from "@/hooks/useWorkReports";
import { format, parseISO, startOfWeek, endOfWeek, eachWeekOfInterval, subWeeks } from "date-fns";

interface ReportsChartsProps {
  reports: WorkReport[];
}

const chartConfig = {
  earnings: { label: "Earnings", color: "hsl(var(--success))" },
  hours: { label: "Hours", color: "hsl(var(--info))" },
};

const platformColors = [
  "hsl(var(--primary))",
  "hsl(var(--success))",
  "hsl(var(--warning))",
  "hsl(var(--info))",
  "hsl(142, 76%, 36%)",
  "hsl(280, 65%, 60%)",
];

export function ReportsCharts({ reports }: ReportsChartsProps) {
  const weeklyData = useMemo(() => {
    if (reports.length === 0) return [];

    const now = new Date();
    const startDate = subWeeks(now, 7);
    const weeks = eachWeekOfInterval({ start: startDate, end: now });

    return weeks.map((weekStart) => {
      const weekEnd = endOfWeek(weekStart);
      const weekReports = reports.filter((r) => {
        const date = parseISO(r.work_date);
        return date >= weekStart && date <= weekEnd;
      });

      const earnings = weekReports.reduce((sum, r) => sum + Number(r.earnings), 0);
      const hours = weekReports.reduce((sum, r) => sum + Number(r.hours_worked), 0);

      return {
        week: format(weekStart, "MMM d"),
        earnings,
        hours,
      };
    });
  }, [reports]);

  const platformData = useMemo(() => {
    const platformMap = new Map<string, { earnings: number; hours: number }>();

    reports.forEach((r) => {
      const existing = platformMap.get(r.platform) || { earnings: 0, hours: 0 };
      platformMap.set(r.platform, {
        earnings: existing.earnings + Number(r.earnings),
        hours: existing.hours + Number(r.hours_worked),
      });
    });

    return Array.from(platformMap.entries()).map(([name, data], index) => ({
      name,
      value: data.earnings,
      hours: data.hours,
      fill: platformColors[index % platformColors.length],
    }));
  }, [reports]);

  const monthlyData = useMemo(() => {
    const monthMap = new Map<string, { approved: number; pending: number; rejected: number }>();

    reports.forEach((r) => {
      const month = format(parseISO(r.work_date), "MMM");
      const existing = monthMap.get(month) || { approved: 0, pending: 0, rejected: 0 };
      monthMap.set(month, {
        ...existing,
        [r.status]: existing[r.status as keyof typeof existing] + 1,
      });
    });

    return Array.from(monthMap.entries()).map(([month, data]) => ({
      month,
      ...data,
    }));
  }, [reports]);

  if (reports.length === 0) {
    return null;
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle className="text-base">Earnings Over Time</CardTitle>
          <CardDescription>Weekly earnings trend</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[250px] w-full">
            <AreaChart data={weeklyData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="earningsGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--success))" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(var(--success))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="week" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 12 }} tickLine={false} axisLine={false} tickFormatter={(v) => `$${v}`} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Area
                type="monotone"
                dataKey="earnings"
                stroke="hsl(var(--success))"
                strokeWidth={2}
                fill="url(#earningsGradient)"
              />
            </AreaChart>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Earnings by Platform</CardTitle>
          <CardDescription>Distribution across platforms</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[250px] w-full">
            <PieChart>
              <Pie
                data={platformData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={2}
              >
                {platformData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <ChartTooltip
                content={({ payload }) => {
                  if (!payload?.length) return null;
                  const data = payload[0].payload;
                  return (
                    <div className="rounded-lg bg-background border p-2 shadow-md">
                      <p className="font-medium">{data.name}</p>
                      <p className="text-sm text-muted-foreground">${data.value.toFixed(2)}</p>
                    </div>
                  );
                }}
              />
            </PieChart>
          </ChartContainer>
          <div className="flex flex-wrap gap-2 justify-center mt-2">
            {platformData.map((p, i) => (
              <div key={p.name} className="flex items-center gap-1 text-xs">
                <div className="h-2 w-2 rounded-full" style={{ backgroundColor: p.fill }} />
                <span>{p.name}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="lg:col-span-3">
        <CardHeader>
          <CardTitle className="text-base">Hours Worked Weekly</CardTitle>
          <CardDescription>Track your work hours over time</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[200px] w-full">
            <BarChart data={weeklyData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="week" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 12 }} tickLine={false} axisLine={false} tickFormatter={(v) => `${v}h`} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="hours" fill="hsl(var(--info))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
}
