import { useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Trade } from "@/hooks/useTrading";
import { format } from "date-fns";

interface EquityCurveChartProps {
  trades: Trade[];
  startingBalance?: number;
}

export function EquityCurveChart({
  trades,
  startingBalance = 10000,
}: EquityCurveChartProps) {
  const chartData = useMemo(() => {
    // Sort trades by date
    const sortedTrades = [...trades]
      .filter((t) => t.status === "closed")
      .sort((a, b) => new Date(a.exit_time || a.entry_time).getTime() - new Date(b.exit_time || b.entry_time).getTime());

    let runningBalance = startingBalance;
    const data = [
      {
        date: sortedTrades[0]?.entry_time 
          ? format(new Date(sortedTrades[0].entry_time), "MMM dd")
          : "Start",
        balance: startingBalance,
        pnl: 0,
      },
    ];

    sortedTrades.forEach((trade) => {
      runningBalance += trade.pnl_amount || 0;
      data.push({
        date: format(new Date(trade.exit_time || trade.entry_time), "MMM dd"),
        balance: runningBalance,
        pnl: trade.pnl_amount || 0,
      });
    });

    return data;
  }, [trades, startingBalance]);

  const currentBalance = chartData[chartData.length - 1]?.balance || startingBalance;
  const totalPnl = currentBalance - startingBalance;
  const pnlPercent = ((totalPnl / startingBalance) * 100).toFixed(2);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Equity Curve</CardTitle>
            <CardDescription>Account balance over time</CardDescription>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold">
              ${currentBalance.toLocaleString("en-US", { minimumFractionDigits: 2 })}
            </p>
            <p
              className={`text-sm font-medium ${
                totalPnl >= 0 ? "text-success" : "text-destructive"
              }`}
            >
              {totalPnl >= 0 ? "+" : ""}
              {pnlPercent}%
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted/30" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 12 }}
                tickLine={false}
                className="text-muted-foreground"
              />
              <YAxis
                tick={{ fontSize: 12 }}
                tickLine={false}
                tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                className="text-muted-foreground"
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  borderColor: "hsl(var(--border))",
                  borderRadius: "8px",
                }}
                formatter={(value: number) => [
                  `$${value.toLocaleString("en-US", { minimumFractionDigits: 2 })}`,
                  "Balance",
                ]}
              />
              <ReferenceLine
                y={startingBalance}
                stroke="hsl(var(--muted-foreground))"
                strokeDasharray="5 5"
                label={{
                  value: "Starting",
                  position: "right",
                  fill: "hsl(var(--muted-foreground))",
                  fontSize: 10,
                }}
              />
              <Line
                type="monotone"
                dataKey="balance"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
