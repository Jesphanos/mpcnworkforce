/**
 * MPCN Role Authority Configuration
 * 
 * Defines the authority messaging and UI constraints for each role.
 * Used to display appropriate banners and reinforce the governance hierarchy.
 */

import { Shield, Eye, Users, Scale, Crown, Landmark } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { AppRole } from "./roleCapabilities";

export interface RoleAuthorityConfig {
  /** Role identifier */
  role: AppRole;
  /** Display name */
  displayName: string;
  /** One-line philosophy */
  philosophy: string;
  /** Authority banner title */
  bannerTitle: string;
  /** Authority banner description */
  bannerDescription: string;
  /** Banner variant */
  bannerVariant: "info" | "warning" | "constraint" | "readonly";
  /** Icon for the role */
  icon: LucideIcon;
  /** Key responsibilities */
  responsibilities: string[];
  /** What this role CANNOT do (for clarity) */
  constraints: string[];
  /** Accountability notes */
  accountability: string;
}

/**
 * Role authority configurations
 * Provides explicit messaging about what each role can and cannot do
 */
export const ROLE_AUTHORITY: Record<AppRole, RoleAuthorityConfig> = {
  employee: {
    role: "employee",
    displayName: "Team Member",
    philosophy: "My work contributes to something larger",
    bannerTitle: "Your Workspace",
    bannerDescription: "Tasks, reports, and your progress within the organization.",
    bannerVariant: "info",
    icon: Users,
    responsibilities: [
      "Submit tasks and reports for review",
      "Track your progress and contributions",
      "Request support when needed",
      "Revise work based on feedback",
    ],
    constraints: [
      "Cannot view other members' submissions",
      "Cannot approve or adjust work",
      "Cannot modify finalized records",
    ],
    accountability: "Your submissions are reviewed for quality, with feedback designed to support improvement.",
  },

  trader: {
    role: "trader",
    displayName: "Trader",
    philosophy: "I execute with discipline, not emotion",
    bannerTitle: "Trade Execution",
    bannerDescription: "Execute trades following approved strategies. All positions are monitored and logged.",
    bannerVariant: "info",
    icon: Users,
    responsibilities: [
      "Execute trades per approved strategies",
      "Manage positions within risk limits",
      "Document trade rationale",
      "Report daily P&L",
    ],
    constraints: [
      "Cannot exceed position limits",
      "Cannot trade unapproved instruments",
      "Must follow risk management rules",
    ],
    accountability: "All trades are logged with timestamps and reviewed for compliance.",
  },
  
  team_lead: {
    role: "team_lead",
    displayName: "Team Lead",
    philosophy: "I mentor, not police",
    bannerTitle: "Review Only — Final approval handled by Admin",
    bannerDescription: "Your approvals move reports to the admin queue. Rejections do not delete reports and can be overridden.",
    bannerVariant: "constraint",
    icon: Users,
    responsibilities: [
      "Review team member submissions",
      "Provide constructive feedback",
      "Request revisions with guidance",
      "Support team members' growth",
    ],
    constraints: [
      "Cannot give final approval",
      "Cannot delete submissions",
      "Cannot override admin decisions",
      "Decisions can be reviewed by admins",
    ],
    accountability: "All review decisions are logged and visible to administrators.",
  },
  
  report_admin: {
    role: "report_admin",
    displayName: "Report Administrator",
    philosophy: "I ensure fairness and consistency",
    bannerTitle: "Quality Administration",
    bannerDescription: "You have authority to override team lead decisions. All overrides require justification and are logged.",
    bannerVariant: "warning",
    icon: Scale,
    responsibilities: [
      "Final approval of reports and tasks",
      "Override team lead decisions when warranted",
      "Ensure consistent quality standards",
      "Monitor approval patterns",
    ],
    constraints: [
      "Cannot modify finalized records",
      "Must provide reasons for overrides",
      "Actions are visible to General Overseer",
    ],
    accountability: "Every override action is logged with your justification, visible to the General Overseer.",
  },

  department_head: {
    role: "department_head",
    displayName: "Department Head",
    philosophy: "I build organizational capacity",
    bannerTitle: "Department Management",
    bannerDescription: "Manage department structure and team leads. You cannot override admin decisions but can escalate.",
    bannerVariant: "constraint",
    icon: Scale,
    responsibilities: [
      "Structure department teams",
      "Assign team leads",
      "Monitor department performance",
      "Escalate issues to administrators",
    ],
    constraints: [
      "Cannot override administrator decisions",
      "Cannot assign administrator roles",
      "Decisions are logged and reviewable",
    ],
    accountability: "Department management decisions are logged and visible to administrators.",
  },
  
  finance_hr_admin: {
    role: "finance_hr_admin",
    displayName: "Finance & HR Administrator",
    philosophy: "I ensure accuracy and fairness in compensation",
    bannerTitle: "Payroll & HR Administration",
    bannerDescription: "Manage salary periods and payroll calculations. All financial changes are audited.",
    bannerVariant: "warning",
    icon: Landmark,
    responsibilities: [
      "Manage salary periods",
      "Calculate payroll",
      "Handle HR documentation",
      "Ensure payment accuracy",
    ],
    constraints: [
      "Cannot modify approved report rates",
      "Cannot close periods without approval",
      "Financial changes require audit trail",
    ],
    accountability: "All payroll calculations and period management are permanently logged.",
  },
  
  investment_admin: {
    role: "investment_admin",
    displayName: "Investment Administrator",
    philosophy: "I steward shared growth",
    bannerTitle: "Investment Management",
    bannerDescription: "Manage platform investments and financial periods. All changes are transparent to investors.",
    bannerVariant: "warning",
    icon: Landmark,
    responsibilities: [
      "Manage investments and returns",
      "Calculate profit distributions",
      "Maintain investment records",
      "Provide investor reports",
    ],
    constraints: [
      "Cannot modify finalized periods without overseer",
      "Must document all financial adjustments",
    ],
    accountability: "Investment changes are visible to all investors and the General Overseer.",
  },
  
  user_admin: {
    role: "user_admin",
    displayName: "User Administrator",
    philosophy: "I enable the organization",
    bannerTitle: "User & Team Management",
    bannerDescription: "Manage users, teams, and departments. Role assignments require approval for elevated privileges.",
    bannerVariant: "warning",
    icon: Shield,
    responsibilities: [
      "Manage user accounts",
      "Assign team memberships",
      "Create and manage departments",
      "Handle role assignments",
    ],
    constraints: [
      "Cannot assign General Overseer role",
      "Role changes are logged",
      "Cannot delete user data without approval",
    ],
    accountability: "All user and role changes are permanently logged and auditable.",
  },
  
  general_overseer: {
    role: "general_overseer",
    displayName: "General Overseer",
    philosophy: "I steward the organization's integrity",
    bannerTitle: "Organizational Governance",
    bannerDescription: "Strategic oversight with full accountability. Every decision is permanently recorded.",
    bannerVariant: "warning",
    icon: Crown,
    responsibilities: [
      "System-wide strategic oversight",
      "Adjust any decision with documented reasoning",
      "Configure platform settings",
      "Final authority on governance matters",
    ],
    constraints: [
      "Must document reasoning for all adjustments",
      "All actions are permanently logged",
      "Authority carries full accountability",
    ],
    accountability: "As the highest authority, every action is permanently recorded. This is your trust contract with the organization.",
  },
};

/**
 * Get authority config for a role
 */
export function getRoleAuthority(role: AppRole | null): RoleAuthorityConfig | null {
  if (!role) return null;
  return ROLE_AUTHORITY[role];
}

/**
 * Get banner props for a role
 */
export function getRoleBannerProps(role: AppRole | null) {
  if (!role) return null;
  const config = ROLE_AUTHORITY[role];
  return {
    variant: config.bannerVariant,
    title: config.bannerTitle,
    description: config.bannerDescription,
  };
}
