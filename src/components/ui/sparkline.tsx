import { Line, LineChart, ResponsiveContainer } from "recharts";
import { cn } from "@/lib/utils";

interface SparklineProps {
  data: number[];
  color?: string;
  className?: string;
  height?: number;
  strokeWidth?: number;
  showTrend?: boolean;
}

export function Sparkline({
  data,
  color,
  className,
  height = 24,
  strokeWidth = 1.5,
  showTrend = false,
}: SparklineProps) {
  if (!data || data.length < 2) {
    return (
      <div className={cn("flex items-center justify-center text-muted-foreground text-xs", className)}>
        —
      </div>
    );
  }

  const chartData = data.map((value, index) => ({ value, index }));
  
  // Determine trend color if not specified
  const firstValue = data[0];
  const lastValue = data[data.length - 1];
  const trend = lastValue - firstValue;
  const trendColor = color || (trend >= 0 ? "hsl(var(--success))" : "hsl(var(--destructive))");
  const trendPercentage = firstValue !== 0 ? ((trend / firstValue) * 100).toFixed(1) : "0";

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div style={{ width: 60, height }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <Line
              type="monotone"
              dataKey="value"
              stroke={trendColor}
              strokeWidth={strokeWidth}
              dot={false}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      {showTrend && (
        <span
          className={cn(
            "text-xs font-medium",
            trend >= 0 ? "text-success" : "text-destructive"
          )}
        >
          {trend >= 0 ? "+" : ""}{trendPercentage}%
        </span>
      )}
    </div>
  );
}

// Generate mock sparkline data for demo purposes
export function generateSparklineData(
  baseValue: number,
  points: number = 7,
  volatility: number = 0.1
): number[] {
  const data: number[] = [baseValue];
  for (let i = 1; i < points; i++) {
    const change = baseValue * volatility * (Math.random() - 0.5);
    data.push(Math.max(0, data[i - 1] + change));
  }
  return data;
}
