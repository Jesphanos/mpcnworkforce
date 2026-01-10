/**
 * Action Panel - Quick action card for dashboards
 * 
 * Displays an actionable card with:
 * - Icon
 * - Title and description
 * - Optional badge
 * - Click navigation
 */
import { LucideIcon, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export interface ActionPanelProps {
  title: string;
  description: string;
  icon: LucideIcon;
  iconColor?: "primary" | "warning" | "success" | "info" | "destructive";
  badge?: {
    text: string;
    variant?: "default" | "secondary" | "destructive" | "outline";
    color?: string;
  };
  actionLabel: string;
  navigateTo: string;
  className?: string;
}

export function ActionPanel({
  title,
  description,
  icon: Icon,
  iconColor = "primary",
  badge,
  actionLabel,
  navigateTo,
  className,
}: ActionPanelProps) {
  const navigate = useNavigate();

  const iconBgClasses = {
    primary: "bg-primary/10",
    warning: "bg-warning/10",
    success: "bg-success/10",
    info: "bg-info/10",
    destructive: "bg-destructive/10",
  };

  const iconTextClasses = {
    primary: "text-primary",
    warning: "text-warning",
    success: "text-success",
    info: "text-info",
    destructive: "text-destructive",
  };

  return (
    <Card
      className={cn(
        "hover:shadow-md transition-all cursor-pointer",
        className
      )}
      onClick={() => navigate(navigateTo)}
    >
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className={cn(
                "h-10 w-10 rounded-lg flex items-center justify-center",
                iconBgClasses[iconColor]
              )}
            >
              <Icon className={cn("h-5 w-5", iconTextClasses[iconColor])} />
            </div>
            <div>
              <CardTitle className="text-base">{title}</CardTitle>
              <CardDescription>{description}</CardDescription>
            </div>
          </div>
          {badge && (
            <Badge
              variant={badge.variant || "secondary"}
              className={badge.color}
            >
              {badge.text}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <Button variant="outline" size="sm" className="w-full">
          {actionLabel}
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </CardContent>
    </Card>
  );
}
