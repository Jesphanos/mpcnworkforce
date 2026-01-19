/**
 * MPCN Role Capability Matrix
 * 
 * This is the single source of truth for role-based permissions.
 * All UI guards should reference this config.
 * 
 * Note: This is for UI/UX convenience only. 
 * Server-side RLS policies are the actual security boundary.
 */

export type AppRole = 
  | "employee" 
  | "trader"
  | "team_lead" 
  | "department_head"
  | "report_admin" 
  | "finance_hr_admin" 
  | "investment_admin" 
  | "user_admin" 
  | "general_overseer";

export interface RoleCapabilities {
  // Report & Task Capabilities
  canSubmitReports: boolean;
  canSubmitTasks: boolean;
  canApproveReports: boolean;
  canApproveTasks: boolean;
  canOverrideReports: boolean;
  canOverrideTasks: boolean;
  
  // Team Capabilities
  canViewOwnTeam: boolean;
  canViewAllTeams: boolean;
  canManageTeams: boolean;
  canAssignTeamMembers: boolean;
  
  // User Management
  canViewAllUsers: boolean;
  canManageUsers: boolean;
  canAssignRoles: boolean;
  
  // Finance Capabilities
  canViewPayroll: boolean;
  canManagePayroll: boolean;
  canManageSalaryPeriods: boolean;
  
  // Investment Capabilities
  canViewInvestments: boolean;
  canManageInvestments: boolean;
  canViewOwnReturns: boolean;
  canManageFinancials: boolean;
  
  // Audit & Settings
  canViewAuditLogs: boolean;
  canManageSettings: boolean;
  canManagePlatforms: boolean;
  
  // Override Authority (requires reason logging)
  canOverrideAdminDecisions: boolean;
  canReopenClosedPeriods: boolean;
  canModifyApprovedRates: boolean;
}

/**
 * Role Capability Definitions
 * 
 * Hierarchy Notes:
 * - employee: Base worker role, can only manage own work
 * - team_lead: Manages team members, first review stage
 * - *_admin: Domain-specific admin access (reports, finance, investments, users)
 * - general_overseer: Universal access with accountability logging
 */
export const roleCapabilities: Record<AppRole, RoleCapabilities> = {
  employee: {
    // Report & Task
    canSubmitReports: true,
    canSubmitTasks: true,
    canApproveReports: false,
    canApproveTasks: false,
    canOverrideReports: false,
    canOverrideTasks: false,
    // Team
    canViewOwnTeam: true,
    canViewAllTeams: false,
    canManageTeams: false,
    canAssignTeamMembers: false,
    // User Management
    canViewAllUsers: false,
    canManageUsers: false,
    canAssignRoles: false,
    // Finance
    canViewPayroll: false,
    canManagePayroll: false,
    canManageSalaryPeriods: false,
    // Investment
    canViewInvestments: false, // Unless is_investor flag
    canManageInvestments: false,
    canViewOwnReturns: true, // If is_investor
    canManageFinancials: false,
    // Audit & Settings
    canViewAuditLogs: false,
    canManageSettings: false,
    canManagePlatforms: false,
    // Override Authority
    canOverrideAdminDecisions: false,
    canReopenClosedPeriods: false,
    canModifyApprovedRates: false,
  },

  trader: {
    // Report & Task
    canSubmitReports: true,
    canSubmitTasks: true,
    canApproveReports: false,
    canApproveTasks: false,
    canOverrideReports: false,
    canOverrideTasks: false,
    // Team
    canViewOwnTeam: true,
    canViewAllTeams: false,
    canManageTeams: false,
    canAssignTeamMembers: false,
    // User Management
    canViewAllUsers: false,
    canManageUsers: false,
    canAssignRoles: false,
    // Finance
    canViewPayroll: false,
    canManagePayroll: false,
    canManageSalaryPeriods: false,
    // Investment
    canViewInvestments: false,
    canManageInvestments: false,
    canViewOwnReturns: true,
    canManageFinancials: false,
    // Audit & Settings
    canViewAuditLogs: false,
    canManageSettings: false,
    canManagePlatforms: false,
    // Override Authority
    canOverrideAdminDecisions: false,
    canReopenClosedPeriods: false,
    canModifyApprovedRates: false,
  },

  team_lead: {
    // Report & Task
    canSubmitReports: true,
    canSubmitTasks: true,
    canApproveReports: true, // First review stage
    canApproveTasks: true,
    canOverrideReports: false,
    canOverrideTasks: false,
    // Team
    canViewOwnTeam: true,
    canViewAllTeams: false,
    canManageTeams: true, // Own team only
    canAssignTeamMembers: false, // Admins assign
    // User Management
    canViewAllUsers: false,
    canManageUsers: false,
    canAssignRoles: false,
    // Finance
    canViewPayroll: false,
    canManagePayroll: false,
    canManageSalaryPeriods: false,
    // Investment
    canViewInvestments: false,
    canManageInvestments: false,
    canViewOwnReturns: true,
    canManageFinancials: false,
    // Audit & Settings
    canViewAuditLogs: false,
    canManageSettings: false,
    canManagePlatforms: false,
    // Override Authority
    canOverrideAdminDecisions: false,
    canReopenClosedPeriods: false,
    canModifyApprovedRates: false,
  },

  department_head: {
    // Report & Task
    canSubmitReports: false,
    canSubmitTasks: false,
    canApproveReports: true, // Can approve within department
    canApproveTasks: true,
    canOverrideReports: false,
    canOverrideTasks: false,
    // Team
    canViewOwnTeam: true,
    canViewAllTeams: true, // View all teams in department
    canManageTeams: true,
    canAssignTeamMembers: true, // Within department
    // User Management
    canViewAllUsers: false,
    canManageUsers: false,
    canAssignRoles: false,
    // Finance
    canViewPayroll: false,
    canManagePayroll: false,
    canManageSalaryPeriods: false,
    // Investment
    canViewInvestments: false,
    canManageInvestments: false,
    canViewOwnReturns: true,
    canManageFinancials: false,
    // Audit & Settings
    canViewAuditLogs: true, // Department-level audit access
    canManageSettings: false,
    canManagePlatforms: false,
    // Override Authority
    canOverrideAdminDecisions: false,
    canReopenClosedPeriods: false,
    canModifyApprovedRates: false,
  },

  report_admin: {
    // Report & Task
    canSubmitReports: false,
    canSubmitTasks: false,
    canApproveReports: true, // Final approval stage
    canApproveTasks: true,
    canOverrideReports: true, // Can override team lead
    canOverrideTasks: true,
    // Team
    canViewOwnTeam: true,
    canViewAllTeams: true,
    canManageTeams: false,
    canAssignTeamMembers: false,
    // User Management
    canViewAllUsers: false,
    canManageUsers: false,
    canAssignRoles: false,
    // Finance
    canViewPayroll: false,
    canManagePayroll: false,
    canManageSalaryPeriods: false,
    // Investment
    canViewInvestments: false,
    canManageInvestments: false,
    canViewOwnReturns: true,
    canManageFinancials: false,
    // Audit & Settings
    canViewAuditLogs: true,
    canManageSettings: false,
    canManagePlatforms: false,
    // Override Authority
    canOverrideAdminDecisions: false,
    canReopenClosedPeriods: false,
    canModifyApprovedRates: false,
  },

  finance_hr_admin: {
    // Report & Task
    canSubmitReports: false,
    canSubmitTasks: false,
    canApproveReports: false,
    canApproveTasks: false,
    canOverrideReports: false,
    canOverrideTasks: false,
    // Team
    canViewOwnTeam: true,
    canViewAllTeams: true,
    canManageTeams: false,
    canAssignTeamMembers: false,
    // User Management
    canViewAllUsers: true, // For payroll
    canManageUsers: false,
    canAssignRoles: false,
    // Finance
    canViewPayroll: true,
    canManagePayroll: true,
    canManageSalaryPeriods: true,
    // Investment
    canViewInvestments: false,
    canManageInvestments: false,
    canViewOwnReturns: true,
    canManageFinancials: false,
    // Audit & Settings
    canViewAuditLogs: true,
    canManageSettings: false,
    canManagePlatforms: false,
    // Override Authority
    canOverrideAdminDecisions: false,
    canReopenClosedPeriods: false,
    canModifyApprovedRates: false,
  },

  investment_admin: {
    // Report & Task
    canSubmitReports: false,
    canSubmitTasks: false,
    canApproveReports: false,
    canApproveTasks: false,
    canOverrideReports: false,
    canOverrideTasks: false,
    // Team
    canViewOwnTeam: true,
    canViewAllTeams: false,
    canManageTeams: false,
    canAssignTeamMembers: false,
    // User Management
    canViewAllUsers: false,
    canManageUsers: false,
    canAssignRoles: false,
    // Finance
    canViewPayroll: false,
    canManagePayroll: false,
    canManageSalaryPeriods: false,
    // Investment
    canViewInvestments: true,
    canManageInvestments: true,
    canViewOwnReturns: true,
    canManageFinancials: true,
    // Audit & Settings
    canViewAuditLogs: false,
    canManageSettings: false,
    canManagePlatforms: false,
    // Override Authority
    canOverrideAdminDecisions: false,
    canReopenClosedPeriods: false,
    canModifyApprovedRates: false,
  },

  user_admin: {
    // Report & Task
    canSubmitReports: false,
    canSubmitTasks: false,
    canApproveReports: false,
    canApproveTasks: false,
    canOverrideReports: false,
    canOverrideTasks: false,
    // Team
    canViewOwnTeam: true,
    canViewAllTeams: true,
    canManageTeams: true,
    canAssignTeamMembers: true,
    // User Management
    canViewAllUsers: true,
    canManageUsers: true,
    canAssignRoles: true, // Except general_overseer
    // Finance
    canViewPayroll: false,
    canManagePayroll: false,
    canManageSalaryPeriods: false,
    // Investment
    canViewInvestments: false,
    canManageInvestments: false,
    canViewOwnReturns: true,
    canManageFinancials: false,
    // Audit & Settings
    canViewAuditLogs: true,
    canManageSettings: false,
    canManagePlatforms: false,
    // Override Authority
    canOverrideAdminDecisions: false,
    canReopenClosedPeriods: false,
    canModifyApprovedRates: false,
  },

  general_overseer: {
    // Report & Task — Full access
    canSubmitReports: false, // Doesn't submit, only oversees
    canSubmitTasks: false,
    canApproveReports: true,
    canApproveTasks: true,
    canOverrideReports: true,
    canOverrideTasks: true,
    // Team — Full access
    canViewOwnTeam: true,
    canViewAllTeams: true,
    canManageTeams: true,
    canAssignTeamMembers: true,
    // User Management — Full access
    canViewAllUsers: true,
    canManageUsers: true,
    canAssignRoles: true,
    // Finance — Full access
    canViewPayroll: true,
    canManagePayroll: true,
    canManageSalaryPeriods: true,
    // Investment — Full access
    canViewInvestments: true,
    canManageInvestments: true,
    canViewOwnReturns: true,
    canManageFinancials: true,
    // Audit & Settings — Full access
    canViewAuditLogs: true,
    canManageSettings: true,
    canManagePlatforms: true,
    // Override Authority — Full (with mandatory audit logging)
    canOverrideAdminDecisions: true,
    canReopenClosedPeriods: true,
    canModifyApprovedRates: true,
  },
};

/**
 * Report Lifecycle Status
 * Immutable progression with audit trail
 */
export const REPORT_STATUSES = {
  DRAFT: "draft",
  SUBMITTED: "submitted",
  UNDER_REVIEW: "under_review",
  REJECTED: "rejected",
  RESUBMITTED: "resubmitted",
  APPROVED: "approved",
  FINALIZED: "finalized",
  OVERRIDDEN: "overridden",
} as const;

export type ReportStatus = typeof REPORT_STATUSES[keyof typeof REPORT_STATUSES];

/**
 * Status transition rules
 */
export const REPORT_STATUS_TRANSITIONS: Record<ReportStatus, ReportStatus[]> = {
  draft: ["submitted"],
  submitted: ["under_review"],
  under_review: ["approved", "rejected"],
  rejected: ["resubmitted"],
  resubmitted: ["under_review"],
  approved: ["finalized", "overridden"],
  finalized: ["overridden"], // Only by general_overseer
  overridden: [], // Terminal state
};

/**
 * Who can transition to each status
 */
export const STATUS_TRANSITION_ROLES: Record<ReportStatus, AppRole[]> = {
  draft: ["employee"],
  submitted: ["employee"],
  under_review: ["team_lead", "report_admin", "general_overseer"],
  rejected: ["team_lead", "report_admin", "general_overseer"],
  resubmitted: ["employee"],
  approved: ["team_lead", "report_admin", "general_overseer"],
  finalized: ["report_admin", "general_overseer"],
  overridden: ["general_overseer"],
};

/**
 * Get capabilities for a role
 */
export function getCapabilities(role: AppRole | null): RoleCapabilities | null {
  if (!role) return null;
  return roleCapabilities[role];
}

/**
 * Check if a role has a specific capability
 */
export function hasCapability(
  role: AppRole | null, 
  capability: keyof RoleCapabilities
): boolean {
  if (!role) return false;
  return roleCapabilities[role]?.[capability] ?? false;
}

/**
 * Check if a role can perform a status transition
 */
export function canTransitionTo(
  role: AppRole | null,
  currentStatus: ReportStatus,
  targetStatus: ReportStatus
): boolean {
  if (!role) return false;
  
  const allowedTransitions = REPORT_STATUS_TRANSITIONS[currentStatus];
  if (!allowedTransitions.includes(targetStatus)) return false;
  
  const allowedRoles = STATUS_TRANSITION_ROLES[targetStatus];
  return allowedRoles.includes(role);
}
