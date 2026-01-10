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
    warning: "ring-2 ring-warning",
    success: "ring-2 ring-success",
    info: "ring-2 ring-info",
    destructive: "ring-2 ring-destructive",
  };

  const iconColorClasses = {
    warning: "text-warning",
    success: "text-success",
    info: "text-info",
    destructive: "text-destructive",
  };

  return (
    <Card
      className={cn(
        "hover:shadow-md transition-all",
        navigateTo && "cursor-pointer hover:scale-[1.02]",
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
        <Icon
          className={cn(
            "h-5 w-5",
            highlight ? iconColorClasses[highlightColor] : "text-muted-foreground"
          )}
        />
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-8 w-16" />
        ) : (
          <div className="text-2xl font-bold">{value}</div>
        )}
        {description && (
          <p className="text-xs text-muted-foreground">{description}</p>
        )}
      </CardContent>
    </Card>
  );
}
