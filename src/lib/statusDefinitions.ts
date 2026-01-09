/**
 * MPCN Centralized Status Definitions
 * 
 * Single source of truth for all status logic across the platform.
 * All dashboards and components consume statuses from this module.
 */

import { 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  RotateCcw, 
  FileEdit, 
  Send, 
  Eye, 
  Lock,
  Shield,
  LucideIcon
} from "lucide-react";

// ============================================
// STATUS TYPES
// ============================================

export type ReportStatus = 
  | "draft" 
  | "pending" 
  | "submitted" 
  | "under_review" 
  | "approved" 
  | "rejected" 
  | "revision_requested"
  | "resubmitted" 
  | "finalized" 
  | "overridden";

export type TaskStatus = ReportStatus;

export type ComplaintStatus = 
  | "pending" 
  | "under_review" 
  | "resolved";

export type ResolutionStatus = 
  | "open" 
  | "under_review" 
  | "mediation" 
  | "resolved" 
  | "escalated";

// ============================================
// STATUS CONFIGURATION
// ============================================

export interface StatusConfig {
  /** Technical status key */
  key: string;
  /** Humane display label (employee-facing) */
  label: string;
  /** Administrative label (admin-facing) */
  adminLabel: string;
  /** Description for context */
  description: string;
  /** Tone: supportive, neutral, action, success */
  tone: "supportive" | "neutral" | "action" | "success" | "warning";
  /** Icon component */
  icon: LucideIcon;
  /** Tailwind color classes */
  color: string;
  bgColor: string;
  borderColor: string;
  /** Is this visible to workers? */
  visibleToWorker: boolean;
  /** Allowed transitions from this status */
  allowedTransitions: string[];
}

/**
 * Central status registry
 * Contains humane terminology for all statuses
 */
export const STATUS_REGISTRY: Record<string, StatusConfig> = {
  // Draft/Pending states
  draft: {
    key: "draft",
    label: "Draft",
    adminLabel: "Draft",
    description: "Not yet submitted for review",
    tone: "neutral",
    icon: FileEdit,
    color: "text-muted-foreground",
    bgColor: "bg-muted/50",
    borderColor: "border-muted",
    visibleToWorker: true,
    allowedTransitions: ["submitted", "pending"],
  },
  
  pending: {
    key: "pending",
    label: "Pending Review",
    adminLabel: "Pending",
    description: "Your submission is awaiting review. This is a normal part of the quality process.",
    tone: "neutral",
    icon: Clock,
    color: "text-warning",
    bgColor: "bg-warning/10",
    borderColor: "border-warning/30",
    visibleToWorker: true,
    allowedTransitions: ["under_review", "approved", "rejected"],
  },
  
  submitted: {
    key: "submitted",
    label: "Submitted",
    adminLabel: "Submitted",
    description: "Successfully submitted for review",
    tone: "neutral",
    icon: Send,
    color: "text-info",
    bgColor: "bg-info/10",
    borderColor: "border-info/30",
    visibleToWorker: true,
    allowedTransitions: ["under_review"],
  },
  
  under_review: {
    key: "under_review",
    label: "Under Review",
    adminLabel: "Under Review",
    description: "Currently being reviewed by your team lead",
    tone: "neutral",
    icon: Eye,
    color: "text-info",
    bgColor: "bg-info/10",
    borderColor: "border-info/30",
    visibleToWorker: true,
    allowedTransitions: ["approved", "rejected", "revision_requested"],
  },
  
  // Positive outcomes
  approved: {
    key: "approved",
    label: "Approved",
    adminLabel: "Approved",
    description: "Your submission has been approved and processed. Great work!",
    tone: "success",
    icon: CheckCircle2,
    color: "text-success",
    bgColor: "bg-success/10",
    borderColor: "border-success/30",
    visibleToWorker: true,
    allowedTransitions: ["finalized"],
  },
  
  finalized: {
    key: "finalized",
    label: "Finalized",
    adminLabel: "Finalized",
    description: "This record is complete and archived",
    tone: "success",
    icon: Lock,
    color: "text-success",
    bgColor: "bg-success/10",
    borderColor: "border-success/30",
    visibleToWorker: true,
    allowedTransitions: ["overridden"],
  },
  
  // Revision states (HUMANE - not rejection)
  rejected: {
    key: "rejected",
    label: "Needs Revision", // Humane label
    adminLabel: "Rejected",
    description: "Your submission needs some adjustments. Please review the feedback below.",
    tone: "supportive",
    icon: RotateCcw,
    color: "text-amber-600",
    bgColor: "bg-amber-50",
    borderColor: "border-amber-200",
    visibleToWorker: true,
    allowedTransitions: ["resubmitted"],
  },
  
  revision_requested: {
    key: "revision_requested",
    label: "Revision Requested",
    adminLabel: "Revision Requested",
    description: "A few updates are needed. Revisions are a normal part of MPCN's quality process.",
    tone: "supportive",
    icon: RotateCcw,
    color: "text-amber-600",
    bgColor: "bg-amber-50",
    borderColor: "border-amber-200",
    visibleToWorker: true,
    allowedTransitions: ["resubmitted"],
  },
  
  resubmitted: {
    key: "resubmitted",
    label: "Resubmitted",
    adminLabel: "Resubmitted",
    description: "Your revised submission is being reviewed",
    tone: "neutral",
    icon: Send,
    color: "text-info",
    bgColor: "bg-info/10",
    borderColor: "border-info/30",
    visibleToWorker: true,
    allowedTransitions: ["under_review", "approved", "rejected"],
  },
  
  // Admin actions (HUMANE)
  overridden: {
    key: "overridden",
    label: "Decision Adjusted", // Humane label
    adminLabel: "Overridden",
    description: "This decision was adjusted to maintain quality standards",
    tone: "neutral",
    icon: Shield,
    color: "text-primary",
    bgColor: "bg-primary/10",
    borderColor: "border-primary/30",
    visibleToWorker: true,
    allowedTransitions: [],
  },
};

/**
 * Resolution request status configuration
 */
export const RESOLUTION_STATUS_REGISTRY: Record<ResolutionStatus, StatusConfig> = {
  open: {
    key: "open",
    label: "Open",
    adminLabel: "Open",
    description: "Request submitted and awaiting assignment",
    tone: "neutral",
    icon: Clock,
    color: "text-warning",
    bgColor: "bg-warning/10",
    borderColor: "border-warning/30",
    visibleToWorker: true,
    allowedTransitions: ["under_review"],
  },
  under_review: {
    key: "under_review",
    label: "Under Review",
    adminLabel: "Under Review",
    description: "Being reviewed by an administrator",
    tone: "neutral",
    icon: Eye,
    color: "text-info",
    bgColor: "bg-info/10",
    borderColor: "border-info/30",
    visibleToWorker: true,
    allowedTransitions: ["mediation", "resolved", "escalated"],
  },
  mediation: {
    key: "mediation",
    label: "In Mediation",
    adminLabel: "Mediation",
    description: "Active discussion to find a resolution",
    tone: "neutral",
    icon: AlertCircle,
    color: "text-amber-600",
    bgColor: "bg-amber-50",
    borderColor: "border-amber-200",
    visibleToWorker: true,
    allowedTransitions: ["resolved", "escalated"],
  },
  resolved: {
    key: "resolved",
    label: "Resolved",
    adminLabel: "Resolved",
    description: "Request has been addressed",
    tone: "success",
    icon: CheckCircle2,
    color: "text-success",
    bgColor: "bg-success/10",
    borderColor: "border-success/30",
    visibleToWorker: true,
    allowedTransitions: [],
  },
  escalated: {
    key: "escalated",
    label: "Escalated for Support",
    adminLabel: "Escalated",
    description: "Forwarded to senior leadership for review",
    tone: "warning",
    icon: Shield,
    color: "text-destructive",
    bgColor: "bg-destructive/10",
    borderColor: "border-destructive/30",
    visibleToWorker: true,
    allowedTransitions: ["resolved"],
  },
};

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Get status configuration by key
 */
export function getStatusConfig(status: string): StatusConfig {
  return STATUS_REGISTRY[status] || STATUS_REGISTRY.pending;
}

/**
 * Get humane label for a status (worker-facing)
 */
export function getHumaneStatusLabel(status: string): string {
  return getStatusConfig(status).label;
}

/**
 * Get admin label for a status
 */
export function getAdminStatusLabel(status: string): string {
  return getStatusConfig(status).adminLabel;
}

/**
 * Get status description
 */
export function getStatusDescription(status: string): string {
  return getStatusConfig(status).description;
}

/**
 * Get status badge classes
 */
export function getStatusBadgeClasses(status: string): string {
  const config = getStatusConfig(status);
  return `${config.color} ${config.bgColor} ${config.borderColor}`;
}

/**
 * Check if transition is allowed
 */
export function canTransition(fromStatus: string, toStatus: string): boolean {
  const config = getStatusConfig(fromStatus);
  return config.allowedTransitions.includes(toStatus);
}

/**
 * Get status icon component
 */
export function getStatusIcon(status: string): LucideIcon {
  return getStatusConfig(status).icon;
}
