/**
 * Dashboard Shell - Shared primitive for all role dashboards
 * 
 * Provides consistent layout with:
 * - Role authority banner
 * - Header section
 * - Content area
 */
import { ReactNode } from "react";
import { RoleAuthorityBanner, BannerVariant } from "@/components/ui/RoleAuthorityBanner";

export interface DashboardShellProps {
  children: ReactNode;
  /** Role authority banner configuration */
  authority?: {
    variant: BannerVariant | "none";
    title: string;
    description?: string;
  };
  /** Optional header content */
  header?: ReactNode;
  className?: string;
}

export function DashboardShell({
  children,
  authority,
  header,
  className = "",
}: DashboardShellProps) {
  return (
    <div className={`space-y-6 ${className}`}>
      {authority && authority.variant !== "none" && (
        <RoleAuthorityBanner
          variant={authority.variant}
          title={authority.title}
          description={authority.description}
        />
      )}
      {header}
      {children}
    </div>
  );
}
