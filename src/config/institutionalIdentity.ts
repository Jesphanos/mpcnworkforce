/**
 * MPCN Institutional Identity System
 * 
 * This configuration defines MPCN's core positioning, messaging, and brand voice.
 * All user-facing text should align with these principles.
 * 
 * CORE PHILOSOPHY:
 * - Structured, not casual
 * - Institutional, not community
 * - Disciplined, not motivational
 * - Credible, not aspirational
 */

// ═══════════════════════════════════════════════════════════════════════════
// PLATFORM POSITIONING
// ═══════════════════════════════════════════════════════════════════════════

export const PLATFORM_IDENTITY = {
  /** Official platform name */
  name: "MPCN",
  
  /** Full institutional name */
  fullName: "MPCN Coordinated Network",
  
  /** One-line institutional description */
  tagline: "Structured collaboration. Accountable growth.",
  
  /** Extended description for landing/about pages */
  description: "MPCN is a coordinated economic organization where skilled professionals collaborate under unified governance. We combine structured workflows, disciplined capital management, and transparent accountability to create sustainable value for all participants.",
  
  /** What MPCN is (for clarity) */
  definition: [
    "A structured professional network with clear governance",
    "An organization where every role has defined responsibilities",
    "A system where accountability protects all participants",
    "A framework for coordinated value creation",
  ],
  
  /** What MPCN is NOT (for differentiation) */
  notDefinition: [
    "Not a casual community or social network",
    "Not a get-rich-quick scheme or trading group",
    "Not a loose network without structure",
    "Not an organization where anyone can do anything",
  ],
} as const;

// ═══════════════════════════════════════════════════════════════════════════
// CORE VALUE ENGINE: COLLABORATION
// ═══════════════════════════════════════════════════════════════════════════

export const CORE_VALUE = {
  /** The single most important action users should take */
  primaryAction: "Collaborate as a coordinated team",
  
  /** Why this action matters */
  rationale: "Individual excellence multiplies through structured coordination. Every task, report, and decision strengthens the collective.",
  
  /** How every feature supports this */
  supportingPrinciples: [
    {
      principle: "Tasks connect people",
      description: "Work assignments link individuals to teams, teams to departments, departments to the organization.",
    },
    {
      principle: "Reports create accountability",
      description: "Documented work creates trust. Trust enables delegation. Delegation scales impact.",
    },
    {
      principle: "Reviews develop skills",
      description: "Feedback from leads improves quality. Quality builds reputation. Reputation attracts opportunity.",
    },
    {
      principle: "Governance protects everyone",
      description: "Clear rules prevent abuse. Audit trails ensure fairness. Structure serves the whole.",
    },
  ],
} as const;

// ═══════════════════════════════════════════════════════════════════════════
// INSTITUTIONAL VOICE & LANGUAGE
// ═══════════════════════════════════════════════════════════════════════════

export const VOICE_GUIDELINES = {
  /** How we sound */
  tone: "Calm, confident, and clear. Never hype, never casual.",
  
  /** Words we use */
  preferredTerms: {
    // Instead of casual → use institutional
    "hey": "Welcome",
    "cool": "effective",
    "awesome": "well-executed",
    "guys": "team members",
    "check out": "review",
    "get started": "begin",
    "super easy": "straightforward",
    "quick win": "immediate result",
    
    // Instead of vague → use precise
    "stuff": "work",
    "things": "tasks",
    "do well": "meet standards",
    "bad": "below standard",
    "good job": "work approved",
  },
  
  /** Words we avoid */
  avoidTerms: [
    "hustle", "grind", "crushing it", "killing it",
    "rockstar", "ninja", "guru", "wizard",
    "game-changer", "revolutionary", "disrupting",
    "synergy", "leverage", "paradigm shift",
    "exciting", "amazing", "incredible",
  ],
} as const;

// ═══════════════════════════════════════════════════════════════════════════
// INSTITUTIONAL MESSAGING BY CONTEXT
// ═══════════════════════════════════════════════════════════════════════════

export const INSTITUTIONAL_MESSAGES = {
  auth: {
    welcomeTitle: "MPCN Access",
    welcomeSubtitle: "Secure role-based entry to the organization",
    loginHeading: "Sign In",
    signupHeading: "Request Access",
    signupDescription: "Complete your details to join the organization",
    roleSelectionHeading: "Select Your Role",
    roleSelectionDescription: "Choose the role that matches your assigned position",
  },
  
  onboarding: {
    welcomeTitle: "Welcome to MPCN",
    welcomeMessage: "You are now part of a structured organization. This brief orientation will help you understand your place within it.",
    completionTitle: "Orientation Complete",
    completionMessage: "You are ready to begin. Your work contributes to something larger.",
  },
  
  dashboard: {
    workerTitle: "Your Workspace",
    workerSubtitle: "Tasks, reports, and your progress within the organization",
    leadTitle: "Team Oversight",
    leadSubtitle: "Review submissions and support your team's development",
    adminTitle: "Operations Management",
    adminSubtitle: "Quality assurance and system administration",
    overseerTitle: "Organizational Governance",
    overseerSubtitle: "Strategic oversight and institutional integrity",
  },
  
  empty: {
    noTasks: "No assigned tasks. Check with your team lead for new assignments.",
    noReports: "No reports submitted yet. Document your completed work here.",
    noActivity: "No recent activity to display.",
    noTeam: "You have not been assigned to a team yet. Contact your administrator.",
  },
  
  success: {
    reportSubmitted: "Report submitted for review.",
    taskCompleted: "Task marked complete. Awaiting verification.",
    profileUpdated: "Profile updated successfully.",
    settingsSaved: "Settings saved.",
  },
  
  guidance: {
    pendingReview: "Your submission is under review. This is standard process.",
    revisionRequested: "Revision requested. Review the feedback and resubmit.",
    approved: "Approved. This work has been accepted.",
    escalated: "This matter has been escalated for additional review.",
  },
} as const;

// ═══════════════════════════════════════════════════════════════════════════
// RETENTION & TRUST BUILDING
// ═══════════════════════════════════════════════════════════════════════════

export const RETENTION_SYSTEMS = {
  /** What accumulates over time */
  accumulators: [
    {
      name: "Trust Score",
      description: "Built through consistent, quality work",
      mechanism: "Approved reports and positive reviews increase trust",
    },
    {
      name: "Skill Recognition",
      description: "Documented competencies from completed modules",
      mechanism: "Learning completion and practical application",
    },
    {
      name: "Responsibility Level",
      description: "Access to higher-impact work over time",
      mechanism: "Demonstrated reliability unlocks more significant tasks",
    },
    {
      name: "Contribution History",
      description: "Permanent record of organizational contribution",
      mechanism: "Every approved task adds to your legacy",
    },
  ],
  
  /** Why staying matters */
  stayingBenefits: [
    "Your history compounds into trust",
    "Your reputation grows with the organization",
    "Your skills are documented and recognized",
    "Your contributions are permanently recorded",
  ],
} as const;

// ═══════════════════════════════════════════════════════════════════════════
// FAITH INTEGRATION (PRINCIPLED, NOT DECORATIVE)
// ═══════════════════════════════════════════════════════════════════════════

export const FAITH_INTEGRATION = {
  /** How faith is integrated */
  approach: "Faith provides the ethical foundation, not the marketing language. Biblical principles inform governance, not decoration.",
  
  /** Core faith principles in governance */
  governancePrinciples: [
    {
      principle: "Stewardship over ownership",
      application: "Resources are managed responsibly, not exploited",
      scripture: "Luke 16:10 — Faithful in little, faithful in much",
    },
    {
      principle: "Integrity in all dealings",
      application: "Honest reporting, transparent decisions, fair treatment",
      scripture: "Proverbs 11:3 — Integrity guides the upright",
    },
    {
      principle: "Patient building over quick gains",
      application: "Long-term value creation, not speculation",
      scripture: "Proverbs 21:5 — Diligence leads to abundance",
    },
    {
      principle: "Servant leadership",
      application: "Authority serves the whole, not personal gain",
      scripture: "Mark 10:43 — The greatest serves all",
    },
  ],
  
  /** Where faith appears */
  visibility: {
    explicit: ["MPCN Learn modules", "Governance Charter", "Stewardship Compendium"],
    implicit: ["Decision-making frameworks", "Conflict resolution", "Financial ethics"],
    absent: ["Login screens", "Task interfaces", "Daily operations"],
  },
} as const;

// ═══════════════════════════════════════════════════════════════════════════
// QUALITY STANDARDS
// ═══════════════════════════════════════════════════════════════════════════

export const QUALITY_STANDARDS = {
  /** What "elite" means for MPCN */
  eliteDefinition: [
    "Every interaction feels intentional, not accidental",
    "Every decision is traceable, not arbitrary",
    "Every role has clear boundaries, not confusion",
    "Every process serves the organization, not bureaucracy",
  ],
  
  /** What we will not compromise on */
  nonNegotiables: [
    "Audit trails for all significant actions",
    "Clear role boundaries and permissions",
    "Constructive feedback with every rejection",
    "Transparent governance decisions",
    "Protected investor visibility without control",
  ],
  
  /** What we will simplify */
  simplificationTargets: [
    "Features that add complexity without value",
    "Steps that create friction without purpose",
    "Options that confuse without empowering",
    "Metrics that distract without informing",
  ],
} as const;

// ═══════════════════════════════════════════════════════════════════════════
// DIFFERENTIATION MATRIX
// ═══════════════════════════════════════════════════════════════════════════

export const DIFFERENTIATION = {
  /** How MPCN differs from similar platforms */
  competitiveEdges: [
    {
      category: "Governance",
      mpcn: "Explicit authority hierarchy with audit trails",
      others: "Informal power structures, unclear accountability",
    },
    {
      category: "Faith Integration",
      mpcn: "Principled ethics integrated into governance",
      others: "Decorative spirituality or absent entirely",
    },
    {
      category: "Worker Protection",
      mpcn: "Revisions, not rejections; growth, not punishment",
      others: "Binary pass/fail with no learning pathway",
    },
    {
      category: "Investor Relations",
      mpcn: "Transparency without control; informed, not empowered to meddle",
      others: "Either full control or complete opacity",
    },
    {
      category: "Role Clarity",
      mpcn: "Every role has explicit capabilities and constraints",
      others: "Ambiguous permissions, role creep",
    },
  ],
  
  /** Hard to imitate */
  moats: [
    "Integrated learning system that develops institutional knowledge",
    "Multi-tier approval workflows with humane terminology",
    "Financial segregation model (freelance, trading, investment)",
    "Leadership accountability signals that reward mentorship",
  ],
} as const;
