/**
 * MPCN Humane Terminology System
 * 
 * This configuration transforms system-oriented language into human-centered,
 * growth-focused terminology that maintains accountability without humiliation.
 * 
 * Core Principle: "Accountability without humiliation. Structure without rigidity."
 */

// Status Labels - Employee-facing, softened language
export const STATUS_LABELS = {
  // Report/Task statuses
  pending: "Pending Review",
  approved: "Approved",
  rejected: "Needs Revision",
  revision_requested: "Revision Requested",
  resubmitted: "Resubmitted",
  finalized: "Finalized",
  overridden: "Decision Adjusted",
  
  // Complaint/Request statuses
  under_review: "Under Review",
  resolved: "Resolved",
  
  // Draft states
  draft: "Draft",
  submitted: "Submitted",
  reviewed: "Reviewed",
} as const;

// Action Labels - Humane terminology for system actions
export const ACTION_LABELS = {
  // Override actions
  override: "Decision Adjustment",
  admin_override: "Quality Adjustment",
  
  // Review actions
  approval: "Approved",
  rejection: "Revision Requested",
  
  // Escalation
  escalation: "Support Review",
  flag: "Attention Signal",
  
  // Status changes
  status_change: "Status Updated",
  submission: "Submitted",
  resubmission: "Resubmitted",
} as const;

// System Terms to Humane Terms mapping
export const HUMANE_TERMS = {
  // Core terminology changes
  flag: "attention signal",
  flagged: "flagged for review",
  override: "adjustment",
  overridden: "adjusted",
  rejection: "revision request",
  rejected: "needs revision",
  escalation: "support review",
  escalated: "sent for support review",
  audit: "activity record",
  audit_log: "activity record",
  
  // Role-related
  admin_action: "quality assurance action",
  overseer_action: "governance decision",
  
  // Process terminology
  dispute: "resolution request",
  incident: "support case",
  warning: "guidance notice",
  
  // Financial terminology
  correction: "adjustment",
  financial_correction: "financial adjustment",
} as const;

// Status descriptions - Provide context and reduce anxiety
export const STATUS_DESCRIPTIONS = {
  pending: "Your submission is awaiting review. This is a normal part of the quality process.",
  approved: "Your submission has been approved and processed. Great work!",
  rejected: "Your submission needs some adjustments. Please review the feedback below.",
  revision_requested: "A few updates are needed. Revisions are a normal part of MPCN's quality process.",
  resubmitted: "Your revised submission is being reviewed.",
  finalized: "This record is complete and archived.",
  overridden: "This decision was adjusted to maintain quality standards.",
} as const;

// Override messaging - Emphasizes intent, not authority
export const OVERRIDE_MESSAGES = {
  reason_label: "Adjustment Reason",
  reason_placeholder: "Explain how this decision maintains quality or fairness...",
  visibility_warning: "This action is logged in the activity record.",
  intent_options: [
    { value: "quality", label: "Quality Improvement" },
    { value: "fairness", label: "Fairness Consideration" },
    { value: "urgency", label: "Urgency Resolution" },
    { value: "correction", label: "Process Correction" },
  ],
} as const;

// Rejection/Revision messaging - Emphasizes learning
export const REVISION_MESSAGES = {
  title: "Request Revision",
  description: "Revisions are part of MPCN's learning and quality process.",
  reason_label: "What needs improvement",
  reason_placeholder: "Provide constructive guidance for improvement...",
  success_toast: "Revision requested. The team member will be notified.",
  worker_message: "Revisions help maintain quality and support your growth.",
} as const;

// Flag/Escalation messaging - Private and supportive
export const FLAG_MESSAGES = {
  levels: {
    informational: {
      label: "For Awareness",
      color: "text-info",
      bgColor: "bg-info/10",
    },
    support_needed: {
      label: "Support Recommended",
      color: "text-warning",
      bgColor: "bg-warning/10",
    },
    review_required: {
      label: "Review Required",
      color: "text-destructive",
      bgColor: "bg-destructive/10",
    },
  },
  private_notice: "This is a private review signal, not visible to other team members.",
} as const;

// Helper function to get humane label for status
export function getHumaneStatus(status: string): string {
  return STATUS_LABELS[status as keyof typeof STATUS_LABELS] || status;
}

// Helper function to get status description
export function getStatusDescription(status: string): string {
  return STATUS_DESCRIPTIONS[status as keyof typeof STATUS_DESCRIPTIONS] || "";
}

// Helper function to convert system term to humane term
export function toHumaneTerm(term: string): string {
  const lowerTerm = term.toLowerCase();
  return HUMANE_TERMS[lowerTerm as keyof typeof HUMANE_TERMS] || term;
}

// Helper to get action label
export function getActionLabel(action: string): string {
  return ACTION_LABELS[action as keyof typeof ACTION_LABELS] || action;
}

// Culture & Governance principles for the charter
export const MPCN_PRINCIPLES = {
  title: "MPCN Governance Charter",
  tagline: "Structured collaboration. Accountable growth.",
  
  principles: [
    {
      id: "accountability",
      title: "Accountability Without Humiliation",
      description: "Every action is traceable and documented. Feedback is delivered with respect. Mistakes are learning opportunities, not grounds for shame.",
      icon: "Shield",
    },
    {
      id: "transparency",
      title: "Transparent Decision Making",
      description: "All governance decisions include clear reasoning. When decisions are adjusted, the intent and rationale are always visible to those affected.",
      icon: "Eye",
    },
    {
      id: "growth",
      title: "Growth-Oriented Standards",
      description: "Revisions are a normal part of quality work. Improvement is tracked and recognized alongside performance.",
      icon: "TrendingUp",
    },
    {
      id: "privacy",
      title: "Private First, Escalate Last",
      description: "Concerns are addressed privately with the individual before involving others. Escalation is a support mechanism, not a public process.",
      icon: "Lock",
    },
    {
      id: "fairness",
      title: "Consistent Standards",
      description: "The same rules apply to everyone. Authority comes with greater accountability, not fewer obligations.",
      icon: "Scale",
    },
    {
      id: "recognition",
      title: "Recognition Through Contribution",
      description: "Consistent quality and stewardship are documented and valued. We reward reliability and sustained excellence.",
      icon: "Award",
    },
  ],
  
  commitments: [
    "All revision requests include constructive feedback",
    "Adjustment decisions include documented reasoning",
    "Performance metrics include improvement trajectory",
    "Private guidance precedes any escalation",
    "Financial adjustments include clear explanations",
  ],
} as const;
