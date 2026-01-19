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
}

// Registry mapping roles to their dashboard components
export const DASHBOARD_REGISTRY: Record<string, DashboardConfig> = {
  general_overseer: {
    component: OverseerDashboard,
    label: "General Overseer",
  },
  report_admin: {
    component: AdminDashboard,
    adminType: "report_admin",
    label: "Report Admin",
  },
  finance_hr_admin: {
    component: AdminDashboard,
    adminType: "finance_hr_admin",
    label: "Finance & HR",
  },
  investment_admin: {
    component: AdminDashboard,
    adminType: "investment_admin",
    label: "Investment Admin",
  },
  user_admin: {
    component: AdminDashboard,
    adminType: "user_admin",
    label: "User Admin",
  },
  team_lead: {
    component: TeamLeadDashboard,
    label: "Team Lead",
  },
  employee: {
    component: WorkerDashboard,
    label: "Employee",
  },
  investor_only: {
    component: InvestorDashboardView,
    label: "Investor",
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
