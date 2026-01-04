import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip } from "@/components/ui/chart";
import { PieChart, Pie, Cell } from "recharts";
import { Skeleton } from "@/components/ui/skeleton";
import { usePlatformDistribution } from "@/hooks/usePlatformDistribution";
import { DateRange } from "react-day-picker";

interface PlatformChartProps {
  dateRange?: DateRange;
}

const platformColors = [
  "hsl(var(--primary))",
  "hsl(var(--success))",
  "hsl(var(--warning))",
  "hsl(var(--info))",
  "hsl(262, 83%, 58%)",
  "hsl(340, 82%, 52%)",
  "hsl(180, 70%, 45%)",
  "hsl(30, 90%, 55%)",
];

const chartConfig = {
  total: { label: "Total", color: "hsl(var(--primary))" },
};

export function PlatformChart({ dateRange }: PlatformChartProps) {
  const { data: platformData, isLoading } = usePlatformDistribution(dateRange);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-4 w-56" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[200px] w-full" />
        </CardContent>
      </Card>
    );
  }

  if (!platformData || platformData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Platform Distribution</CardTitle>
          <CardDescription>Tasks and reports by platform</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-[200px] text-muted-foreground">
            No data available
          </div>
        </CardContent>
      </Card>
    );
  }

  const dataWithColors = platformData.map((item, index) => ({
    ...item,
    fill: platformColors[index % platformColors.length],
  }));

  const totalItems = platformData.reduce((sum, p) => sum + p.total, 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Platform Distribution</CardTitle>
        <CardDescription>Tasks and reports by platform</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[200px] w-full">
          <PieChart>
            <Pie
              data={dataWithColors}
              dataKey="total"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius={45}
              outerRadius={75}
              paddingAngle={2}
            >
              {dataWithColors.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Pie>
            <ChartTooltip
              content={({ payload }) => {
                if (!payload?.length) return null;
                const data = payload[0].payload;
                const percentage = ((data.total / totalItems) * 100).toFixed(1);
                return (
                  <div className="rounded-lg bg-background border p-2 shadow-md">
                    <p className="font-medium">{data.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {data.total} items ({percentage}%)
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {data.tasks} tasks · {data.reports} reports
                    </p>
                  </div>
                );
              }}
            />
          </PieChart>
        </ChartContainer>
        <div className="flex flex-wrap justify-center gap-3 mt-2">
          {dataWithColors.slice(0, 6).map((p) => (
            <div key={p.name} className="flex items-center gap-1.5 text-xs">
              <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: p.fill }} />
              <span className="text-muted-foreground">{p.name}</span>
            </div>
          ))}
          {dataWithColors.length > 6 && (
            <span className="text-xs text-muted-foreground">+{dataWithColors.length - 6} more</span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
