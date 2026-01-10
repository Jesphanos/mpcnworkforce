import { AlertCircle, Info, Shield, Eye, Crown } from "lucide-react";
import { cn } from "@/lib/utils";

export type BannerVariant = "info" | "warning" | "constraint" | "readonly" | "full" | "scoped";

interface RoleAuthorityBannerProps {
  variant?: BannerVariant;
  title: string;
  description?: string;
  className?: string;
}

const variantStyles: Record<BannerVariant, { bg: string; border: string; icon: React.ElementType; iconColor: string }> = {
  info: {
    bg: "bg-info/10",
    border: "border-info/20",
    icon: Info,
    iconColor: "text-info",
  },
  warning: {
    bg: "bg-warning/10",
    border: "border-warning/20",
    icon: AlertCircle,
    iconColor: "text-warning",
  },
  constraint: {
    bg: "bg-muted",
    border: "border-border",
    icon: Shield,
    iconColor: "text-muted-foreground",
  },
  readonly: {
    bg: "bg-secondary/50",
    border: "border-secondary",
    icon: Eye,
    iconColor: "text-secondary-foreground",
  },
  full: {
    bg: "bg-primary/10",
    border: "border-primary/20",
    icon: Crown,
    iconColor: "text-primary",
  },
  scoped: {
    bg: "bg-info/10",
    border: "border-info/20",
    icon: Shield,
    iconColor: "text-info",
  },
};

/**
 * Banner component to communicate authority constraints and role limitations
 * Used throughout the UI to reinforce the MPCN hierarchy
 */
export function RoleAuthorityBanner({
  variant = "info",
  title,
  description,
  className,
}: RoleAuthorityBannerProps) {
  const styles = variantStyles[variant];
  const Icon = styles.icon;

  return (
    <div
      className={cn(
        "rounded-lg border p-4 flex items-start gap-3",
        styles.bg,
        styles.border,
        className
      )}
    >
      <Icon className={cn("h-5 w-5 mt-0.5 shrink-0", styles.iconColor)} />
      <div>
        <p className="font-medium text-sm">{title}</p>
        {description && (
          <p className="text-sm text-muted-foreground mt-1">{description}</p>
        )}
      </div>
    </div>
  );
}
