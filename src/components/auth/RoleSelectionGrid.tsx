/**
 * MPCN Role Selection Grid
 * 
 * Displays roles with visual authority hierarchy for login/signup context.
 * Each role shows its authority level through layout weight and framing.
 */

import { 
  Users, 
  TrendingUp, 
  ClipboardList, 
  Building2, 
  Shield, 
  Crown,
  Briefcase,
  Scale,
  Landmark,
  UserCog
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

export type LoginRoleType = 
  | "employee" 
  | "trader" 
  | "team_lead" 
  | "department_head" 
  | "administrator" 
  | "general_overseer" 
  | "investor";

interface RoleOption {
  id: LoginRoleType;
  label: string;
  description: string;
  icon: LucideIcon;
  authorityTier: 0 | 1 | 2 | 3; // 0 = highest (General Overseer), 3 = operational
  isParallel?: boolean; // For investor (parallel authority)
}

const ROLE_OPTIONS: RoleOption[] = [
  {
    id: "employee",
    label: "Worker",
    description: "Submit tasks and reports, track progress",
    icon: Briefcase,
    authorityTier: 3,
  },
  {
    id: "trader",
    label: "Trader",
    description: "Execute trades, manage positions",
    icon: TrendingUp,
    authorityTier: 3,
  },
  {
    id: "team_lead",
    label: "Team Lead",
    description: "Review team submissions, provide guidance",
    icon: Users,
    authorityTier: 2,
  },
  {
    id: "department_head",
    label: "Department Head",
    description: "Manage departments and team structures",
    icon: Building2,
    authorityTier: 2,
  },
  {
    id: "administrator",
    label: "Administrator",
    description: "System configuration and maintenance",
    icon: Shield,
    authorityTier: 1,
  },
  {
    id: "general_overseer",
    label: "General Overseer",
    description: "Supreme authority, full governance control",
    icon: Crown,
    authorityTier: 0,
  },
  {
    id: "investor",
    label: "Investor",
    description: "Capital authority, portfolio management",
    icon: Landmark,
    isParallel: true,
    authorityTier: 3,
  },
];

interface RoleSelectionGridProps {
  selectedRole: LoginRoleType | null;
  onRoleSelect: (role: LoginRoleType) => void;
  className?: string;
}

/**
 * Get tier-based styling for visual authority separation
 */
function getTierStyles(tier: number, isParallel?: boolean) {
  if (isParallel) {
    return {
      wrapper: "border-emerald-500/30 bg-emerald-500/5 hover:bg-emerald-500/10",
      selected: "border-emerald-500 bg-emerald-500/20 ring-2 ring-emerald-500/50",
      icon: "text-emerald-600",
      label: "text-foreground",
    };
  }
  
  switch (tier) {
    case 0: // Supreme Authority (General Overseer)
      return {
        wrapper: "border-amber-500/30 bg-amber-500/5 hover:bg-amber-500/10",
        selected: "border-amber-500 bg-amber-500/20 ring-2 ring-amber-500/50",
        icon: "text-amber-600",
        label: "text-amber-700 dark:text-amber-400 font-semibold",
      };
    case 1: // Administrator
      return {
        wrapper: "border-purple-500/30 bg-purple-500/5 hover:bg-purple-500/10",
        selected: "border-purple-500 bg-purple-500/20 ring-2 ring-purple-500/50",
        icon: "text-purple-600",
        label: "text-foreground",
      };
    case 2: // Management
      return {
        wrapper: "border-blue-500/30 bg-blue-500/5 hover:bg-blue-500/10",
        selected: "border-blue-500 bg-blue-500/20 ring-2 ring-blue-500/50",
        icon: "text-blue-600",
        label: "text-foreground",
      };
    default: // Operational
      return {
        wrapper: "border-border bg-muted/30 hover:bg-muted/50",
        selected: "border-primary bg-primary/10 ring-2 ring-primary/50",
        icon: "text-muted-foreground",
        label: "text-foreground",
      };
  }
}

export function RoleSelectionGrid({ 
  selectedRole, 
  onRoleSelect,
  className 
}: RoleSelectionGridProps) {
  // Sort roles by authority tier (highest first for visual hierarchy)
  const sortedRoles = [...ROLE_OPTIONS].sort((a, b) => {
    // Put parallel (investor) at end
    if (a.isParallel && !b.isParallel) return 1;
    if (!a.isParallel && b.isParallel) return -1;
    // Sort by tier (0 = highest authority)
    return a.authorityTier - b.authorityTier;
  });

  return (
    <div className={cn("space-y-4", className)}>
      <div className="space-y-1">
        <h3 className="text-sm font-medium text-foreground">Select Your Role</h3>
        <p className="text-xs text-muted-foreground">
          Choose the role that matches your MPCN position
        </p>
      </div>
      
      <div className="grid gap-2">
        {/* Supreme Authority - Full width */}
        {sortedRoles
          .filter(r => r.authorityTier === 0)
          .map((role) => {
            const styles = getTierStyles(role.authorityTier, role.isParallel);
            const isSelected = selectedRole === role.id;
            const Icon = role.icon;
            
            return (
              <button
                key={role.id}
                type="button"
                onClick={() => onRoleSelect(role.id)}
                className={cn(
                  "w-full p-4 rounded-lg border transition-all text-left",
                  isSelected ? styles.selected : styles.wrapper
                )}
              >
                <div className="flex items-center gap-3">
                  <div className={cn("p-2 rounded-lg bg-amber-500/20")}>
                    <Icon className={cn("h-6 w-6", styles.icon)} />
                  </div>
                  <div className="flex-1">
                    <div className={cn("font-semibold text-sm", styles.label)}>
                      {role.label}
                      <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-700 dark:text-amber-400">
                        Supreme Authority
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {role.description}
                    </p>
                  </div>
                </div>
              </button>
            );
          })}

        {/* Administrator tier */}
        {sortedRoles
          .filter(r => r.authorityTier === 1)
          .map((role) => {
            const styles = getTierStyles(role.authorityTier);
            const isSelected = selectedRole === role.id;
            const Icon = role.icon;
            
            return (
              <button
                key={role.id}
                type="button"
                onClick={() => onRoleSelect(role.id)}
                className={cn(
                  "w-full p-3 rounded-lg border transition-all text-left",
                  isSelected ? styles.selected : styles.wrapper
                )}
              >
                <div className="flex items-center gap-3">
                  <Icon className={cn("h-5 w-5", styles.icon)} />
                  <div className="flex-1">
                    <div className={cn("font-medium text-sm", styles.label)}>
                      {role.label}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {role.description}
                    </p>
                  </div>
                </div>
              </button>
            );
          })}

        {/* Management tier - 2 columns */}
        <div className="grid grid-cols-2 gap-2">
          {sortedRoles
            .filter(r => r.authorityTier === 2)
            .map((role) => {
              const styles = getTierStyles(role.authorityTier);
              const isSelected = selectedRole === role.id;
              const Icon = role.icon;
              
              return (
                <button
                  key={role.id}
                  type="button"
                  onClick={() => onRoleSelect(role.id)}
                  className={cn(
                    "p-3 rounded-lg border transition-all text-left",
                    isSelected ? styles.selected : styles.wrapper
                  )}
                >
                  <div className="flex items-center gap-2">
                    <Icon className={cn("h-4 w-4", styles.icon)} />
                    <span className={cn("font-medium text-sm", styles.label)}>
                      {role.label}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                    {role.description}
                  </p>
                </button>
              );
            })}
        </div>

        {/* Operational tier - 2 columns */}
        <div className="grid grid-cols-2 gap-2">
          {sortedRoles
            .filter(r => r.authorityTier === 3 && !r.isParallel)
            .map((role) => {
              const styles = getTierStyles(role.authorityTier);
              const isSelected = selectedRole === role.id;
              const Icon = role.icon;
              
              return (
                <button
                  key={role.id}
                  type="button"
                  onClick={() => onRoleSelect(role.id)}
                  className={cn(
                    "p-3 rounded-lg border transition-all text-left",
                    isSelected ? styles.selected : styles.wrapper
                  )}
                >
                  <div className="flex items-center gap-2">
                    <Icon className={cn("h-4 w-4", styles.icon)} />
                    <span className={cn("font-medium text-sm", styles.label)}>
                      {role.label}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                    {role.description}
                  </p>
                </button>
              );
            })}
        </div>

        {/* Parallel authority (Investor) - Separate section */}
        <div className="pt-2 border-t border-border/50">
          <p className="text-xs text-muted-foreground mb-2">Capital Authority (Parallel)</p>
          {sortedRoles
            .filter(r => r.isParallel)
            .map((role) => {
              const styles = getTierStyles(role.authorityTier, role.isParallel);
              const isSelected = selectedRole === role.id;
              const Icon = role.icon;
              
              return (
                <button
                  key={role.id}
                  type="button"
                  onClick={() => onRoleSelect(role.id)}
                  className={cn(
                    "w-full p-3 rounded-lg border transition-all text-left",
                    isSelected ? styles.selected : styles.wrapper
                  )}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={cn("h-5 w-5", styles.icon)} />
                    <div className="flex-1">
                      <div className={cn("font-medium text-sm", styles.label)}>
                        {role.label}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {role.description}
                      </p>
                    </div>
                  </div>
                </button>
              );
            })}
        </div>
      </div>
    </div>
  );
}

export { ROLE_OPTIONS };
export type { RoleOption };
