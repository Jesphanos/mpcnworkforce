import { ComponentType } from "react";
import { DateRange } from "react-day-picker";
import { WorkerDashboard } from "./WorkerDashboard";
import { TeamLeadDashboard } from "./TeamLeadDashboard";
import { AdminDashboard } from "./AdminDashboard";
import { OverseerDashboard } from "./OverseerDashboard";
import { InvestorDashboardView } from "./InvestorDashboardView";

type AdminType = "report_admin" | "finance_hr_admin" | "investment_admin" | "user_admin";

interface DashboardProps {
  dateRange?: DateRange;
  adminType?: AdminType;
}

interface DashboardConfig {
  component: ComponentType<DashboardProps>;
  adminType?: AdminType;
  label: string;
  authorityTier: 0 | 1 | 2 | 3;
}

/**
 * MPCN Role Dashboard Registry
 * 
 * Maps roles to their dashboard components with authority tier info.
 * 
 * Authority Tiers:
 * 0 = Supreme Authority (General Overseer)
 * 1 = Administrator (System managers)
 * 2 = Management (Team Leads, Department Heads)
 * 3 = Operational (Workers, Traders)
 */
export const DASHBOARD_REGISTRY: Record<string, DashboardConfig> = {
  // Tier 0: Supreme Authority
  general_overseer: {
    component: OverseerDashboard,
    label: "General Overseer",
    authorityTier: 0,
  },
  
  // Tier 1: Administrators (NOT General Overseer - separate authority level)
  report_admin: {
    component: AdminDashboard,
    adminType: "report_admin",
    label: "Report Administrator",
    authorityTier: 1,
  },
  finance_hr_admin: {
    component: AdminDashboard,
    adminType: "finance_hr_admin",
    label: "Finance & HR Administrator",
    authorityTier: 1,
  },
  investment_admin: {
    component: AdminDashboard,
    adminType: "investment_admin",
    label: "Investment Administrator",
    authorityTier: 1,
  },
  user_admin: {
    component: AdminDashboard,
    adminType: "user_admin",
    label: "User Administrator",
    authorityTier: 1,
  },
  
  // Tier 2: Management
  department_head: {
    component: TeamLeadDashboard, // Reuses TeamLeadDashboard with extended permissions
    label: "Department Head",
    authorityTier: 2,
  },
  team_lead: {
    component: TeamLeadDashboard,
    label: "Team Lead",
    authorityTier: 2,
  },
  
  // Tier 3: Operational
  trader: {
    component: WorkerDashboard, // Uses WorkerDashboard with trading-specific features
    label: "Trader",
    authorityTier: 3,
  },
  employee: {
    component: WorkerDashboard,
    label: "Team Member",
    authorityTier: 3,
  },
  
  // Parallel Authority: Investor (not hierarchical)
  investor_only: {
    component: InvestorDashboardView,
    label: "Investor",
    authorityTier: 3, // Capital authority, parallel to operational
  },
};

interface DashboardResolverProps {
  role: string | null;
  isInvestorOnly: boolean;
  dateRange?: DateRange;
}

export function resolveDashboard({ role, isInvestorOnly, dateRange }: DashboardResolverProps) {
  // Handle investor-only case first
  if (isInvestorOnly) {
    const config = DASHBOARD_REGISTRY.investor_only;
    const Component = config.component;
    return <Component dateRange={dateRange} />;
  }

  // Get dashboard config for role
  const config = role ? DASHBOARD_REGISTRY[role] : DASHBOARD_REGISTRY.employee;
  
  if (!config) {
    // Fallback to worker dashboard
    const Component = DASHBOARD_REGISTRY.employee.component;
    return <Component dateRange={dateRange} />;
  }

  const Component = config.component;
  return <Component dateRange={dateRange} adminType={config.adminType} />;
}

export function getRoleLabel(role: string | null): string {
  if (!role) return "Employee";
  return DASHBOARD_REGISTRY[role]?.label || role.split("_").map(w => 
    w.charAt(0).toUpperCase() + w.slice(1)
  ).join(" ");
}
