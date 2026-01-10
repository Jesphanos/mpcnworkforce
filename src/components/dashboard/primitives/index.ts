/**
 * Dashboard Primitives
 * 
 * Shared components for composing role-specific dashboards.
 * Each role dashboard should use these primitives instead of
 * duplicating layout and styling logic.
 */
export { DashboardShell } from "./DashboardShell";
export type { DashboardShellProps } from "./DashboardShell";

export { MetricCard } from "./MetricCard";
export type { MetricCardProps } from "./MetricCard";

export { ActionPanel } from "./ActionPanel";
export type { ActionPanelProps } from "./ActionPanel";
