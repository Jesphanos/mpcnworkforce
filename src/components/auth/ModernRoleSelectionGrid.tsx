/**
 * MPCN Modern Role Selection Grid
 * Mobile-first 2-column grid with modern card styling
 */

import { motion } from "framer-motion";
import {
  Crown,
  Shield,
  Users,
  Building2,
  Briefcase,
  TrendingUp,
  Landmark,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { RoleCard } from "./RoleCard";
import type { LucideIcon } from "lucide-react";

export type LoginRoleType =
  | "employee"
  | "trader"
  | "team_lead"
  | "department_head"
  | "administrator"
  | "general_overseer"
  | "investor";

interface RoleConfig {
  id: LoginRoleType;
  label: string;
  description: string;
  icon: LucideIcon;
  gradient: string;
  iconBg: string;
  tier: "supreme" | "admin" | "management" | "operational" | "capital";
}

const ROLE_CONFIGS: RoleConfig[] = [
  {
    id: "general_overseer",
    label: "General Overseer",
    description: "Supreme authority, full governance control",
    icon: Crown,
    gradient: "bg-gradient-to-br from-amber-500 to-amber-600",
    iconBg: "bg-amber-100 dark:bg-amber-500/20",
    tier: "supreme",
  },
  {
    id: "administrator",
    label: "Administrator",
    description: "System configuration and maintenance",
    icon: Shield,
    gradient: "bg-gradient-to-br from-purple-500 to-purple-600",
    iconBg: "bg-purple-100 dark:bg-purple-500/20",
    tier: "admin",
  },
  {
    id: "team_lead",
    label: "Team Lead",
    description: "Review submissions, guide team",
    icon: Users,
    gradient: "bg-gradient-to-br from-blue-500 to-blue-600",
    iconBg: "bg-blue-100 dark:bg-blue-500/20",
    tier: "management",
  },
  {
    id: "department_head",
    label: "Department Head",
    description: "Manage departments and structures",
    icon: Building2,
    gradient: "bg-gradient-to-br from-teal-500 to-teal-600",
    iconBg: "bg-teal-100 dark:bg-teal-500/20",
    tier: "management",
  },
  {
    id: "employee",
    label: "Worker",
    description: "Submit tasks and reports",
    icon: Briefcase,
    gradient: "bg-gradient-to-br from-slate-500 to-slate-600",
    iconBg: "bg-slate-100 dark:bg-slate-500/20",
    tier: "operational",
  },
  {
    id: "trader",
    label: "Trader",
    description: "Execute trades, manage positions",
    icon: TrendingUp,
    gradient: "bg-gradient-to-br from-orange-500 to-orange-600",
    iconBg: "bg-orange-100 dark:bg-orange-500/20",
    tier: "operational",
  },
  {
    id: "investor",
    label: "Investor",
    description: "Capital authority, portfolio management",
    icon: Landmark,
    gradient: "bg-gradient-to-br from-emerald-500 to-emerald-600",
    iconBg: "bg-emerald-100 dark:bg-emerald-500/20",
    tier: "capital",
  },
];

interface ModernRoleSelectionGridProps {
  selectedRole: LoginRoleType | null;
  onRoleSelect: (role: LoginRoleType) => void;
  className?: string;
}

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

export function ModernRoleSelectionGrid({
  selectedRole,
  onRoleSelect,
  className,
}: ModernRoleSelectionGridProps) {
  // Group roles by tier for visual hierarchy
  const supremeRoles = ROLE_CONFIGS.filter((r) => r.tier === "supreme");
  const adminRoles = ROLE_CONFIGS.filter((r) => r.tier === "admin");
  const managementRoles = ROLE_CONFIGS.filter((r) => r.tier === "management");
  const operationalRoles = ROLE_CONFIGS.filter((r) => r.tier === "operational");
  const capitalRoles = ROLE_CONFIGS.filter((r) => r.tier === "capital");

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className={cn("space-y-4", className)}
    >
      {/* Supreme Authority - Full width */}
      {supremeRoles.map((role) => (
        <motion.div key={role.id} variants={itemVariants}>
          <RoleCard
            {...role}
            isSelected={selectedRole === role.id}
            onSelect={() => onRoleSelect(role.id)}
          />
        </motion.div>
      ))}

      {/* Admin tier */}
      {adminRoles.map((role) => (
        <motion.div key={role.id} variants={itemVariants}>
          <RoleCard
            {...role}
            isSelected={selectedRole === role.id}
            onSelect={() => onRoleSelect(role.id)}
          />
        </motion.div>
      ))}

      {/* Management tier - 2 columns */}
      <motion.div variants={itemVariants} className="grid grid-cols-2 gap-3">
        {managementRoles.map((role) => (
          <RoleCard
            key={role.id}
            {...role}
            isSelected={selectedRole === role.id}
            onSelect={() => onRoleSelect(role.id)}
          />
        ))}
      </motion.div>

      {/* Operational tier - 2 columns */}
      <motion.div variants={itemVariants} className="grid grid-cols-2 gap-3">
        {operationalRoles.map((role) => (
          <RoleCard
            key={role.id}
            {...role}
            isSelected={selectedRole === role.id}
            onSelect={() => onRoleSelect(role.id)}
          />
        ))}
      </motion.div>

      {/* Capital Authority - Separated */}
      <motion.div variants={itemVariants} className="pt-2">
        <p className="text-xs text-muted-foreground mb-2 font-medium uppercase tracking-wider">
          Capital Authority
        </p>
        {capitalRoles.map((role) => (
          <RoleCard
            key={role.id}
            {...role}
            isSelected={selectedRole === role.id}
            onSelect={() => onRoleSelect(role.id)}
          />
        ))}
      </motion.div>
    </motion.div>
  );
}

export { ROLE_CONFIGS };
