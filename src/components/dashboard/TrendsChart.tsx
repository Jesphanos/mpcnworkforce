import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid } from "recharts";
import { Skeleton } from "@/components/ui/skeleton";
import { useDashboardTrends } from "@/hooks/useDashboardTrends";
import { DateRange } from "react-day-picker";

interface TrendsChartProps {
  dateRange?: DateRange;
}

const chartConfig = {
  tasks: { label: "Tasks", color: "hsl(var(--primary))" },
  reports: { label: "Reports", color: "hsl(var(--success))" },
};

export function TrendsChart({ dateRange }: TrendsChartProps) {
  const { data: trendData, isLoading } = useDashboardTrends(dateRange);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-4 w-48" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[200px] w-full" />
        </CardContent>
      </Card>
    );
  }

  if (!trendData || trendData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Activity Trends</CardTitle>
          <CardDescription>Tasks and reports over time</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-[200px] text-muted-foreground">
            No data available for the selected period
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Activity Trends</CardTitle>
        <CardDescription>Tasks and reports over time</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[200px] w-full">
          <AreaChart data={trendData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="tasksGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="reportsGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--success))" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(var(--success))" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis 
              dataKey="date" 
              tick={{ fontSize: 11 }} 
              tickLine={false} 
              axisLine={false}
              interval="preserveStartEnd"
            />
            <YAxis 
              tick={{ fontSize: 11 }} 
              tickLine={false} 
              axisLine={false} 
              allowDecimals={false}
            />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Area
              type="monotone"
              dataKey="tasks"
              stroke="hsl(var(--primary))"
              strokeWidth={2}
              fill="url(#tasksGradient)"
            />
            <Area
              type="monotone"
              dataKey="reports"
              stroke="hsl(var(--success))"
              strokeWidth={2}
              fill="url(#reportsGradient)"
            />
          </AreaChart>
        </ChartContainer>
        <div className="flex justify-center gap-6 mt-3">
          <div className="flex items-center gap-2 text-sm">
            <div className="h-3 w-3 rounded-full bg-primary" />
            <span className="text-muted-foreground">Tasks</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <div className="h-3 w-3 rounded-full bg-success" />
            <span className="text-muted-foreground">Reports</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
