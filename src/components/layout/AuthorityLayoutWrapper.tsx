/**
 * Authority-Tier Layout Wrappers
 * 
 * Implements layout density based on authority tiers:
 * - Tier 3 (Workers/Traders): Guided, low-density layouts
 * - Tier 2 (Team Leads/Dept Heads): Supervisory mixed layouts
 * - Tier 1 (Administrators): System-control layouts with configuration access
 * - Tier 0 (General Overseer): Command-level dashboard with maximum density
 */

import { cn } from "@/lib/utils";
import { ReactNode } from "react";
import type { AppRole } from "@/config/roleCapabilities";

interface AuthorityLayoutWrapperProps {
  role: AppRole | null;
  children: ReactNode;
  className?: string;
}

/**
 * Get authority tier from role
 * Tier 0 = Supreme (General Overseer)
 * Tier 1 = Administrators
 * Tier 2 = Management (Team Lead)
 * Tier 3 = Operational (Employee)
 */
export function getAuthorityTier(role: AppRole | null): 0 | 1 | 2 | 3 {
  if (!role) return 3;
  
  switch (role) {
    case "general_overseer":
      return 0;
    case "report_admin":
    case "finance_hr_admin":
    case "investment_admin":
    case "user_admin":
      return 1;
    case "team_lead":
      return 2;
    case "employee":
    default:
      return 3;
  }
}

/**
 * Get layout configuration based on authority tier
 */
function getLayoutConfig(tier: 0 | 1 | 2 | 3) {
  switch (tier) {
    case 0: // General Overseer - Maximum density
      return {
        gridCols: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
        gap: "gap-4",
        padding: "p-4 md:p-6",
        cardSize: "compact",
        showSystemControls: true,
        showAuditPanel: true,
        showOverrideControls: true,
      };
    case 1: // Administrators - High density with configuration
      return {
        gridCols: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
        gap: "gap-4 md:gap-5",
        padding: "p-4 md:p-6",
        cardSize: "standard",
        showSystemControls: true,
        showAuditPanel: true,
        showOverrideControls: false,
      };
    case 2: // Team Leads - Mixed supervisory layout
      return {
        gridCols: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
        gap: "gap-4 md:gap-6",
        padding: "p-4 md:p-6",
        cardSize: "standard",
        showSystemControls: false,
        showAuditPanel: false,
        showOverrideControls: false,
      };
    case 3: // Workers - Guided, low-density
    default:
      return {
        gridCols: "grid-cols-1 md:grid-cols-2",
        gap: "gap-5 md:gap-6",
        padding: "p-4 md:p-6 lg:p-8",
        cardSize: "comfortable",
        showSystemControls: false,
        showAuditPanel: false,
        showOverrideControls: false,
      };
  }
}

export function AuthorityLayoutWrapper({ 
  role, 
  children,
  className 
}: AuthorityLayoutWrapperProps) {
  const tier = getAuthorityTier(role);
  const config = getLayoutConfig(tier);

  return (
    <div 
      className={cn(
        config.padding,
        className
      )}
      data-authority-tier={tier}
      data-role={role}
    >
      {children}
    </div>
  );
}

/**
 * Grid wrapper for authority-based content density
 */
export function AuthorityGrid({ 
  role, 
  children,
  className 
}: AuthorityLayoutWrapperProps) {
  const tier = getAuthorityTier(role);
  const config = getLayoutConfig(tier);

  return (
    <div 
      className={cn(
        "grid",
        config.gridCols,
        config.gap,
        className
      )}
    >
      {children}
    </div>
  );
}

/**
 * Hook to get layout configuration for current role
 */
export function useAuthorityLayout(role: AppRole | null) {
  const tier = getAuthorityTier(role);
  return {
    tier,
    config: getLayoutConfig(tier),
    isSupremeAuthority: tier === 0,
    isAdministrator: tier === 1,
    isManagement: tier === 2,
    isOperational: tier === 3,
  };
}

export { getLayoutConfig };
