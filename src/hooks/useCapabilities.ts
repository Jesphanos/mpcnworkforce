import { useAuth } from "@/contexts/AuthContext";
import { 
  roleCapabilities, 
  RoleCapabilities, 
  hasCapability as checkCapability,
  canTransitionTo,
  ReportStatus,
  AppRole,
} from "@/config/roleCapabilities";

/**
 * Hook to access role-based capabilities
 * 
 * Usage:
 * const { can, capabilities } = useCapabilities();
 * if (can("canApproveReports")) { ... }
 */
export function useCapabilities() {
  const { role, profile } = useAuth();

  const capabilities = role ? roleCapabilities[role] : null;

  /**
   * Check if current user has a specific capability
   */
  const can = (capability: keyof RoleCapabilities): boolean => {
    // Special case: investors can view investments regardless of role
    if (capability === "canViewInvestments" && profile?.is_investor) {
      return true;
    }
    return checkCapability(role, capability);
  };

  /**
   * Check if current user can transition a report to a target status
   */
  const canTransition = (
    currentStatus: ReportStatus,
    targetStatus: ReportStatus
  ): boolean => {
    return canTransitionTo(role, currentStatus, targetStatus);
  };

  /**
   * Check if user is any type of admin
   */
  const isAdmin = (): boolean => {
    if (!role) return false;
    return [
      "report_admin",
      "finance_hr_admin",
      "investment_admin",
      "user_admin",
      "general_overseer",
    ].includes(role);
  };

  /**
   * Check if user is the general overseer
   */
  const isOverseer = (): boolean => {
    return role === "general_overseer";
  };

  /**
   * Check if user is a team lead
   */
  const isTeamLead = (): boolean => {
    return role === "team_lead";
  };

  /**
   * Check if user is an investor (based on profile flag, not role)
   */
  const isInvestor = (): boolean => {
    return profile?.is_investor ?? false;
  };

  /**
   * Check if user is a trader (based on role)
   */
  const isTrader = (): boolean => {
    return role === "trader";
  };

  /**
   * Get the current user's role
   */
  const currentRole = role;

  return {
    can,
    canTransition,
    capabilities,
    currentRole,
    isAdmin,
    isOverseer,
    isTeamLead,
    isInvestor,
    isTrader,
  };
}
