import { useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import { Investment } from "@/hooks/useInvestments";
import { FinancialNarrativeCard } from "./FinancialNarrativeCard";
import { useMpcnFinancials } from "@/hooks/useMpcnFinancials";

interface InvestmentChartsProps {
  investments: Investment[];
}

const chartConfig = {
  initial: { label: "Initial", color: "hsl(var(--muted-foreground))" },
  current: { label: "Current", color: "hsl(var(--success))" },
  return: { label: "Return", color: "hsl(var(--primary))" },
};

const typeColors = [
  "hsl(var(--primary))",
  "hsl(var(--success))",
  "hsl(var(--warning))",
  "hsl(var(--info))",
  "hsl(280, 65%, 60%)",
  "hsl(340, 75%, 55%)",
];

const platformColors = [
  "hsl(var(--info))",
  "hsl(var(--warning))",
  "hsl(var(--success))",
  "hsl(var(--primary))",
  "hsl(280, 65%, 60%)",
  "hsl(340, 75%, 55%)",
];

export function InvestmentCharts({ investments }: InvestmentChartsProps) {
  const { financials } = useMpcnFinancials();

  const allocationByType = useMemo(() => {
    const typeMap = new Map<string, number>();

    investments.forEach((inv) => {
      const existing = typeMap.get(inv.investment_type) || 0;
      typeMap.set(inv.investment_type, existing + Number(inv.current_value));
    });

    return Array.from(typeMap.entries()).map(([name, value], index) => ({
      name,
      value,
      fill: typeColors[index % typeColors.length],
    }));
  }, [investments]);

  const allocationByPlatform = useMemo(() => {
    const platformMap = new Map<string, number>();

    investments.forEach((inv) => {
      const existing = platformMap.get(inv.platform) || 0;
      platformMap.set(inv.platform, existing + Number(inv.current_value));
    });

    return Array.from(platformMap.entries()).map(([name, value], index) => ({
      name,
      value,
      fill: platformColors[index % platformColors.length],
    }));
  }, [investments]);

  const performanceData = useMemo(() => {
    return investments
      .filter((inv) => inv.status === "active")
      .map((inv) => {
        const returnAmount = Number(inv.current_value) - Number(inv.initial_amount);
        const returnPercent = Number(inv.initial_amount) > 0
          ? (returnAmount / Number(inv.initial_amount)) * 100
          : 0;

        return {
          name: inv.name.length > 12 ? inv.name.substring(0, 12) + "..." : inv.name,
          fullName: inv.name,
          initial: Number(inv.initial_amount),
          current: Number(inv.current_value),
          return: returnPercent,
        };
      })
      .sort((a, b) => b.return - a.return)
      .slice(0, 8);
  }, [investments]);

  // Get the latest finalized financial period for narrative display
  const latestPeriodId = financials.length > 0 ? financials[0].id : null;

  if (investments.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      {/* Financial Narrative - Why This Changed */}
      {latestPeriodId && (
        <FinancialNarrativeCard periodId={latestPeriodId} />
      )}
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Allocation by Type</CardTitle>
          <CardDescription>Investment distribution</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[250px] w-full">
            <PieChart>
              <Pie
                data={allocationByType}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={2}
              >
                {allocationByType.map((entry, index) => (
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
                      <p className="text-sm text-muted-foreground">${data.value.toLocaleString()}</p>
                    </div>
                  );
                }}
              />
            </PieChart>
          </ChartContainer>
          <div className="flex flex-wrap gap-2 justify-center mt-2">
            {allocationByType.map((t) => (
              <div key={t.name} className="flex items-center gap-1 text-xs">
                <div className="h-2 w-2 rounded-full" style={{ backgroundColor: t.fill }} />
                <span>{t.name}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Allocation by Platform</CardTitle>
          <CardDescription>Distribution across platforms</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[250px] w-full">
            <PieChart>
              <Pie
                data={allocationByPlatform}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={2}
              >
                {allocationByPlatform.map((entry, index) => (
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
                      <p className="text-sm text-muted-foreground">${data.value.toLocaleString()}</p>
                    </div>
                  );
                }}
              />
            </PieChart>
          </ChartContainer>
          <div className="flex flex-wrap gap-2 justify-center mt-2">
            {allocationByPlatform.map((p) => (
              <div key={p.name} className="flex items-center gap-1 text-xs">
                <div className="h-2 w-2 rounded-full" style={{ backgroundColor: p.fill }} />
                <span>{p.name}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="md:col-span-2 lg:col-span-1">
        <CardHeader>
          <CardTitle className="text-base">Top Performers</CardTitle>
          <CardDescription>Return % by investment</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[250px] w-full">
            <BarChart data={performanceData} layout="vertical" margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} tickFormatter={(v) => `${v}%`} />
              <YAxis dataKey="name" type="category" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} width={80} />
              <ChartTooltip
                content={({ payload }) => {
                  if (!payload?.length) return null;
                  const data = payload[0].payload;
                  return (
                    <div className="rounded-lg bg-background border p-2 shadow-md">
                      <p className="font-medium">{data.fullName}</p>
                      <p className="text-sm text-success">Return: {data.return.toFixed(2)}%</p>
                      <p className="text-xs text-muted-foreground">
                        ${data.initial.toLocaleString()} → ${data.current.toLocaleString()}
                      </p>
                    </div>
                  );
                }}
              />
              <Bar
                dataKey="return"
                radius={[0, 4, 4, 0]}
                fill="hsl(var(--primary))"
              />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card className="lg:col-span-3">
        <CardHeader>
          <CardTitle className="text-base">Investment Comparison</CardTitle>
          <CardDescription>Initial vs Current Value</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[200px] w-full">
            <BarChart data={performanceData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} tickFormatter={(v) => `$${v >= 1000 ? (v / 1000).toFixed(0) + "k" : v}`} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="initial" fill="hsl(var(--muted-foreground))" radius={[4, 4, 0, 0]} name="Initial" />
              <Bar dataKey="current" fill="hsl(var(--success))" radius={[4, 4, 0, 0]} name="Current" />
            </BarChart>
          </ChartContainer>
          <div className="flex gap-4 justify-center mt-2">
            <div className="flex items-center gap-1 text-xs">
              <div className="h-2 w-2 rounded-full bg-muted-foreground" />
              <span>Initial</span>
            </div>
            <div className="flex items-center gap-1 text-xs">
              <div className="h-2 w-2 rounded-full bg-success" />
              <span>Current</span>
            </div>
          </div>
        </CardContent>
      </Card>
      </div>
    </div>
  );
}
