/**
 * MPCN Role Hierarchy Configuration
 * 
 * Single source of truth for role hierarchy and authority levels.
 * This enforces the distinction between Administrators and General Overseer.
 * 
 * ❗ CORE RULE: Administrator ≠ General Overseer
 * 
 * General Overseer = Supreme authority (can override governance)
 * Administrator = Operational manager (cannot override governance)
 */

import type { AppRole } from "./roleCapabilities";

/**
 * Authority Tier Levels
 * 
 * 0 = Supreme Authority (General Overseer only)
 * 1 = Administrator (System managers)
 * 2 = Management (Team Leads, Department Heads)
 * 3 = Operational (Workers, Traders)
 * 
 * Investor is PARALLEL, not hierarchical (capital authority)
 */
export type AuthorityTier = 0 | 1 | 2 | 3;

export interface RoleHierarchyEntry {
  role: AppRole;
  tier: AuthorityTier;
  displayName: string;
  shortName: string;
  description: string;
  isSupremeAuthority: boolean;
  isAdministrator: boolean;
  isManagement: boolean;
  isOperational: boolean;
  canOverrideGovernance: boolean;
  canRestructureOrganization: boolean;
  canDeleteUsers: boolean;
  canAssignAnyRole: boolean;
}

/**
 * Complete role hierarchy with authority characteristics
 */
export const ROLE_HIERARCHY: Record<AppRole, RoleHierarchyEntry> = {
  employee: {
    role: "employee",
    tier: 3,
    displayName: "Team Member",
    shortName: "Worker",
    description: "Core workforce member who submits tasks and reports",
    isSupremeAuthority: false,
    isAdministrator: false,
    isManagement: false,
    isOperational: true,
    canOverrideGovernance: false,
    canRestructureOrganization: false,
    canDeleteUsers: false,
    canAssignAnyRole: false,
  },
  
  team_lead: {
    role: "team_lead",
    tier: 2,
    displayName: "Team Lead",
    shortName: "Lead",
    description: "Supervises team members and provides first-level review",
    isSupremeAuthority: false,
    isAdministrator: false,
    isManagement: true,
    isOperational: false,
    canOverrideGovernance: false,
    canRestructureOrganization: false,
    canDeleteUsers: false,
    canAssignAnyRole: false,
  },
  
  report_admin: {
    role: "report_admin",
    tier: 1,
    displayName: "Report Administrator",
    shortName: "Report Admin",
    description: "Final approval authority for work reports and tasks",
    isSupremeAuthority: false,
    isAdministrator: true,
    isManagement: false,
    isOperational: false,
    canOverrideGovernance: false,
    canRestructureOrganization: false,
    canDeleteUsers: false,
    canAssignAnyRole: false,
  },
  
  finance_hr_admin: {
    role: "finance_hr_admin",
    tier: 1,
    displayName: "Finance & HR Administrator",
    shortName: "Finance Admin",
    description: "Manages payroll, salary periods, and HR functions",
    isSupremeAuthority: false,
    isAdministrator: true,
    isManagement: false,
    isOperational: false,
    canOverrideGovernance: false,
    canRestructureOrganization: false,
    canDeleteUsers: false,
    canAssignAnyRole: false,
  },
  
  investment_admin: {
    role: "investment_admin",
    tier: 1,
    displayName: "Investment Administrator",
    shortName: "Investment Admin",
    description: "Manages investments, returns, and financial periods",
    isSupremeAuthority: false,
    isAdministrator: true,
    isManagement: false,
    isOperational: false,
    canOverrideGovernance: false,
    canRestructureOrganization: false,
    canDeleteUsers: false,
    canAssignAnyRole: false,
  },
  
  user_admin: {
    role: "user_admin",
    tier: 1,
    displayName: "User Administrator",
    shortName: "User Admin",
    description: "Manages user accounts, teams, and role assignments",
    isSupremeAuthority: false,
    isAdministrator: true,
    isManagement: false,
    isOperational: false,
    canOverrideGovernance: false,
    canRestructureOrganization: false,
    canDeleteUsers: true, // Can delete tier 2-3 users only
    canAssignAnyRole: false, // Cannot assign general_overseer
  },
  
  general_overseer: {
    role: "general_overseer",
    tier: 0,
    displayName: "General Overseer",
    shortName: "Overseer",
    description: "Supreme authority with full governance control",
    isSupremeAuthority: true,
    isAdministrator: false, // NOT an administrator - HIGHER than administrator
    isManagement: false,
    isOperational: false,
    canOverrideGovernance: true,
    canRestructureOrganization: true,
    canDeleteUsers: true,
    canAssignAnyRole: true,
  },
};

/**
 * Get role hierarchy entry
 */
export function getRoleHierarchy(role: AppRole | null): RoleHierarchyEntry | null {
  if (!role) return null;
  return ROLE_HIERARCHY[role];
}

/**
 * Get authority tier for a role
 */
export function getAuthorityTier(role: AppRole | null): AuthorityTier {
  if (!role) return 3;
  return ROLE_HIERARCHY[role]?.tier ?? 3;
}

/**
 * Check if role A can modify role B
 * Based on tier hierarchy - can only modify lower tiers
 */
export function canModifyRole(actorRole: AppRole | null, targetRole: AppRole): boolean {
  if (!actorRole) return false;
  
  const actorTier = getAuthorityTier(actorRole);
  const targetTier = getAuthorityTier(targetRole);
  
  // Supreme authority can modify anyone
  if (actorTier === 0) return true;
  
  // Cannot modify same or higher tier
  return actorTier < targetTier;
}

/**
 * Check if role has supreme authority
 */
export function isSupremeAuthority(role: AppRole | null): boolean {
  if (!role) return false;
  return ROLE_HIERARCHY[role]?.isSupremeAuthority ?? false;
}

/**
 * Check if role is an administrator (NOT including General Overseer)
 */
export function isAdministrator(role: AppRole | null): boolean {
  if (!role) return false;
  return ROLE_HIERARCHY[role]?.isAdministrator ?? false;
}

/**
 * Get all roles in a specific tier
 */
export function getRolesByTier(tier: AuthorityTier): AppRole[] {
  return Object.entries(ROLE_HIERARCHY)
    .filter(([_, entry]) => entry.tier === tier)
    .map(([role]) => role as AppRole);
}

/**
 * Get display name for a role
 */
export function getRoleDisplayName(role: AppRole | null): string {
  if (!role) return "Unknown";
  return ROLE_HIERARCHY[role]?.displayName ?? role;
}

/**
 * Validate that terminology is correct
 * Returns true if the role name is being used correctly
 */
export function validateRoleTerminology(role: AppRole | null): {
  isValid: boolean;
  correctTerm: string;
  warning?: string;
} {
  if (!role) {
    return { isValid: false, correctTerm: "Unknown" };
  }
  
  const entry = ROLE_HIERARCHY[role];
  
  // Special check: General Overseer should never be called "Administrator"
  if (role === "general_overseer") {
    return {
      isValid: true,
      correctTerm: "General Overseer",
      warning: "Never conflate with 'Administrator' - General Overseer is Supreme Authority",
    };
  }
  
  // Administrators should be clearly distinguished from General Overseer
  if (entry.isAdministrator) {
    return {
      isValid: true,
      correctTerm: entry.displayName,
      warning: "Administrators have high access but cannot override governance constraints",
    };
  }
  
  return {
    isValid: true,
    correctTerm: entry.displayName,
  };
}
