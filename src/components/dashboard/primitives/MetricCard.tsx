/**
 * Metric Card - Reusable dashboard stat card
 * 
 * Displays a single metric with:
 * - Title
 * - Value (with loading state)
 * - Description
 * - Icon
 * - Optional highlight state
 * - Click navigation
 */
import { LucideIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export interface MetricCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon: LucideIcon;
  isLoading?: boolean;
  highlight?: boolean;
  highlightColor?: "warning" | "success" | "info" | "destructive";
  navigateTo?: string;
  className?: string;
}

export function MetricCard({
  title,
  value,
  description,
  icon: Icon,
  isLoading = false,
  highlight = false,
  highlightColor = "warning",
  navigateTo,
  className,
}: MetricCardProps) {
  const navigate = useNavigate();

  const handleClick = () => {
    if (navigateTo) {
      navigate(navigateTo);
    }
  };

  const highlightClasses = {
    warning: "ring-2 ring-warning/50 bg-warning/5",
    success: "ring-2 ring-success/50 bg-success/5",
    info: "ring-2 ring-info/50 bg-info/5",
    destructive: "ring-2 ring-destructive/50 bg-destructive/5",
  };

  const iconColorClasses = {
    warning: "text-warning",
    success: "text-success",
    info: "text-info",
    destructive: "text-destructive",
  };

  const iconBgClasses = {
    warning: "bg-warning/10",
    success: "bg-success/10",
    info: "bg-info/10",
    destructive: "bg-destructive/10",
  };

  return (
    <Card
      variant={navigateTo ? "interactive" : "elevated"}
      className={cn(
        highlight && highlightClasses[highlightColor],
        className
      )}
      onClick={handleClick}
      role={navigateTo ? "button" : undefined}
      tabIndex={navigateTo ? 0 : undefined}
    >
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <div className={cn(
          "p-2 rounded-lg transition-colors",
          highlight ? iconBgClasses[highlightColor] : "bg-muted/50"
        )}>
          <Icon
            className={cn(
              "h-4 w-4",
              highlight ? iconColorClasses[highlightColor] : "text-muted-foreground"
            )}
          />
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-8 w-20" />
        ) : (
          <div className="text-2xl font-bold tracking-tight">{value}</div>
        )}
        {description && (
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        )}
      </CardContent>
    </Card>
  );
}
