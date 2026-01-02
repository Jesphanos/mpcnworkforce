import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, TrendingUp, TrendingDown, PieChart } from "lucide-react";
import { Investment } from "@/hooks/useInvestments";

interface InvestmentStatsProps {
  investments: Investment[];
}

export function InvestmentStats({ investments }: InvestmentStatsProps) {
  const totalInvested = investments.reduce((acc, inv) => acc + Number(inv.initial_amount), 0);
  const totalValue = investments.reduce((acc, inv) => acc + Number(inv.current_value), 0);
  const totalReturn = totalValue - totalInvested;
  const returnPercent = totalInvested > 0 ? (totalReturn / totalInvested) * 100 : 0;
  const activeCount = investments.filter((inv) => inv.status === "active").length;

  const isPositive = totalReturn >= 0;

  const stats = [
    {
      title: "Total Invested",
      value: `$${totalInvested.toLocaleString()}`,
      icon: DollarSign,
      color: "text-primary",
      bg: "bg-primary/10",
    },
    {
      title: "Current Value",
      value: `$${totalValue.toLocaleString()}`,
      icon: PieChart,
      color: "text-info",
      bg: "bg-info/10",
    },
    {
      title: "Total Return",
      value: `${isPositive ? "+" : ""}$${totalReturn.toLocaleString()}`,
      icon: isPositive ? TrendingUp : TrendingDown,
      color: isPositive ? "text-success" : "text-destructive",
      bg: isPositive ? "bg-success/10" : "bg-destructive/10",
    },
    {
      title: "Return %",
      value: `${isPositive ? "+" : ""}${returnPercent.toFixed(2)}%`,
      icon: isPositive ? TrendingUp : TrendingDown,
      color: isPositive ? "text-success" : "text-destructive",
      bg: isPositive ? "bg-success/10" : "bg-destructive/10",
    },
    {
      title: "Active Investments",
      value: activeCount.toString(),
      icon: PieChart,
      color: "text-warning",
      bg: "bg-warning/10",
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
}
