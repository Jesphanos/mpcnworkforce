/**
 * MPCN Learn Charter Configuration
 * 
 * This is the authoritative configuration for the MPCN Learn system.
 * All learning content, access rules, and module structures are defined here.
 * 
 * GOVERNANCE RULES:
 * - Learning does not grant authority
 * - Progressive disclosure is enforced
 * - Faith integration is voluntary but official
 * - Role-based access is server-enforced
 */

import { AppRole } from "./roleCapabilities";

export type ModuleGroup = "foundations" | "mpcn_context" | "risk_protection" | "role_specific" | "faith_stewardship";
export type ModuleStatus = "locked" | "available" | "in_progress" | "completed";
export type DisclosureLevel = "public" | "member" | "restricted" | "confidential";

export interface LearningModule {
  id: string;
  groupId: ModuleGroup;
  code: string;
  title: string;
  objective: string;
  estimatedMinutes: number;
  disclosureLevel: DisclosureLevel;
  allowedRoles: AppRole[];
  blockedRoles?: AppRole[];
  content: ModuleContent[];
  keyTakeaway: string;
  scriptures?: Scripture[];
  isOptional?: boolean;
}

export interface ModuleContent {
  type: "text" | "scripture" | "reflection" | "callout" | "list";
  content: string;
  items?: string[];
  variant?: "info" | "warning" | "faith" | "governance";
}

export interface Scripture {
  reference: string;
  text: string;
  application?: string;
}

export interface ModuleGroupConfig {
  id: ModuleGroup;
  title: string;
  description: string;
  icon: string;
  color: string;
}

// Module Group Definitions
export const MODULE_GROUPS: Record<ModuleGroup, ModuleGroupConfig> = {
  foundations: {
    id: "foundations",
    title: "Foundations",
    description: "Core principles of investment, trading, freelancing, and stewardship for all members.",
    icon: "BookOpen",
    color: "blue",
  },
  mpcn_context: {
    id: "mpcn_context",
    title: "MPCN Context",
    description: "Understanding MPCN's structure, value creation, and governance philosophy.",
    icon: "Building",
    color: "purple",
  },
  risk_protection: {
    id: "risk_protection",
    title: "Risk & Protection",
    description: "Understanding risk, controls, and why structure protects members.",
    icon: "Shield",
    color: "orange",
  },
  role_specific: {
    id: "role_specific",
    title: "Role-Specific Training",
    description: "Specialized knowledge for your current role and responsibilities.",
    icon: "UserCheck",
    color: "green",
  },
  faith_stewardship: {
    id: "faith_stewardship",
    title: "Faith & Stewardship",
    description: "Biblical principles of wealth, work, and stewardship anchored in our Lord Jesus Christ.",
    icon: "Heart",
    color: "rose",
  },
};

// Learning Modules - Complete Content
export const LEARNING_MODULES: LearningModule[] = [
  // GROUP A - FOUNDATIONS (All Members)
  {
    id: "a1-foundations-investment",
    groupId: "foundations",
    code: "A1",
    title: "Foundations of Investment",
    objective: "Build correct understanding of capital, patience, and stewardship.",
    estimatedMinutes: 25,
    disclosureLevel: "member",
    allowedRoles: ["employee", "trader", "team_lead", "department_head", "report_admin", "finance_hr_admin", "investment_admin", "user_admin", "general_overseer"],
    content: [
      {
        type: "text",
        content: "Investment is the act of allocating resources—whether time, money, or effort—with the expectation of generating future benefit or return. However, true investment goes beyond mere financial gain. It is an act of stewardship, where we manage what has been entrusted to us with wisdom, patience, and responsibility."
      },
      {
        type: "list",
        content: "Core principles of investment:",
        items: [
          "Time: Compound growth requires patience. Quick returns often carry hidden risks.",
          "Discipline: Consistent, measured decisions outperform emotional reactions.",
          "Risk: Every investment carries risk. Understanding it is the first step to managing it.",
          "Stewardship: We manage resources entrusted to us, not owned by us."
        ]
      },
      {
        type: "callout",
        content: "The difference between investing and speculation: Investing is anchored in understanding, research, and long-term thinking. Speculation is anchored in hope, timing, and short-term gains.",
        variant: "info"
      },
      {
        type: "scripture",
        content: "\"The plans of the diligent lead surely to abundance, but everyone who is hasty comes only to poverty.\" — Proverbs 21:5"
      },
      {
        type: "reflection",
        content: "Reflection: Consider how you currently allocate your resources. Are your decisions driven by patience and understanding, or by urgency and emotion?"
      }
    ],
    keyTakeaway: "Investment is responsibility before reward.",
    scriptures: [
      {
        reference: "Proverbs 21:5",
        text: "The plans of the diligent lead surely to abundance, but everyone who is hasty comes only to poverty.",
        application: "Patience and planning are foundational to wise investment."
      },
      {
        reference: "Ecclesiastes 11:2",
        text: "Invest in seven ventures, yes, in eight; you do not know what disaster may come upon the land.",
        application: "Diversification is biblical wisdom for managing uncertainty."
      }
    ]
  },
  {
    id: "a2-foundations-trading",
    groupId: "foundations",
    code: "A2",
    title: "Foundations of Trading",
    objective: "Remove gambling mentality and build discipline.",
    estimatedMinutes: 30,
    disclosureLevel: "member",
    allowedRoles: ["employee", "trader", "team_lead", "department_head", "report_admin", "finance_hr_admin", "investment_admin", "user_admin", "general_overseer"],
    content: [
      {
        type: "text",
        content: "Trading is the active management of financial positions to capture value from market movements. Unlike investing, trading operates on shorter timeframes and requires active decision-making. However, trading is NOT gambling. The distinction is critical."
      },
      {
        type: "callout",
        content: "Trading vs Gambling: Trading is based on analysis, risk management, and disciplined execution. Gambling relies on chance, emotion, and hope. If you cannot explain why you entered a trade, you are gambling.",
        variant: "warning"
      },
      {
        type: "list",
        content: "The psychology of trading:",
        items: [
          "Fear: The emotion that causes premature exits and missed opportunities.",
          "Greed: The emotion that causes overexposure and ignored warnings.",
          "Discipline: The practice that keeps both emotions in check.",
          "Humility: The acknowledgment that markets are bigger than any individual."
        ]
      },
      {
        type: "text",
        content: "Risk management is survival. Before you can profit, you must survive. Every trader who lasted long enough to succeed did so because they protected their capital when they were wrong. Losses are information, not failure. They tell you where your analysis was incomplete or where your discipline faltered."
      },
      {
        type: "scripture",
        content: "\"Wealth gained hastily will dwindle, but whoever gathers little by little will increase it.\" — Proverbs 13:11"
      }
    ],
    keyTakeaway: "A trader survives before they profit.",
    scriptures: [
      {
        reference: "Proverbs 13:11",
        text: "Wealth gained hastily will dwindle, but whoever gathers little by little will increase it.",
        application: "Sustainable trading is built on patience, not quick wins."
      }
    ]
  },
  {
    id: "a3-foundations-freelancing",
    groupId: "foundations",
    code: "A3",
    title: "Foundations of Freelancing",
    objective: "Professionalize service delivery.",
    estimatedMinutes: 20,
    disclosureLevel: "member",
    allowedRoles: ["employee", "trader", "team_lead", "department_head", "report_admin", "finance_hr_admin", "investment_admin", "user_admin", "general_overseer"],
    content: [
      {
        type: "text",
        content: "Freelancing is the exchange of skill for compensation. But at its best, freelancing is not transactional—it is relational. The freelancer who builds lasting client relationships understands that they are not just completing tasks; they are creating value and building trust."
      },
      {
        type: "list",
        content: "Principles of professional freelancing:",
        items: [
          "Value Creation: Deliver more than expected. Solve problems, don't just complete tasks.",
          "Client Trust: Your word is your bond. Reliability builds reputation.",
          "Communication: Proactive updates prevent misunderstandings and build confidence.",
          "Long-term Identity: Your reputation is your capital. Protect it fiercely."
        ]
      },
      {
        type: "callout",
        content: "Your reputation is your capital. It takes years to build and moments to destroy. Every delivery, every communication, every deadline shapes how clients perceive you.",
        variant: "info"
      },
      {
        type: "scripture",
        content: "\"Whatever you do, work heartily, as for the Lord and not for men.\" — Colossians 3:23"
      },
      {
        type: "reflection",
        content: "Reflection: How do you currently approach client work? Are you focused on task completion or value creation?"
      }
    ],
    keyTakeaway: "Your reputation is your capital.",
    scriptures: [
      {
        reference: "Colossians 3:23",
        text: "Whatever you do, work heartily, as for the Lord and not for men.",
        application: "Excellence in work is a form of worship and service."
      }
    ]
  },
  {
    id: "a4-ethics-responsibility",
    groupId: "foundations",
    code: "A4",
    title: "Ethics, Responsibility & Stewardship",
    objective: "Anchor character in integrity and accountability.",
    estimatedMinutes: 25,
    disclosureLevel: "member",
    allowedRoles: ["employee", "trader", "team_lead", "department_head", "report_admin", "finance_hr_admin", "investment_admin", "user_admin", "general_overseer"],
    content: [
      {
        type: "text",
        content: "Ethics are not constraints—they are foundations. In a world where shortcuts are tempting and accountability is often delayed, character becomes your most reliable asset. MPCN is built on the understanding that integrity is not optional; it is the bedrock of sustainable success."
      },
      {
        type: "list",
        content: "Core ethical principles:",
        items: [
          "Integrity: Do what is right, even when no one is watching.",
          "Accountability: Own your decisions, including their consequences.",
          "Stewardship: Manage resources as if you will answer for them—because you will.",
          "Long-term Thinking: Short-term gains that compromise integrity always cost more in the end."
        ]
      },
      {
        type: "scripture",
        content: "\"The integrity of the upright guides them, but the crookedness of the treacherous destroys them.\" — Proverbs 11:3"
      },
      {
        type: "callout",
        content: "Stewardship over exploitation: You are not the owner of your skills, capital, or opportunities. You are their steward. Manage them as one who will give an account.",
        variant: "faith"
      }
    ],
    keyTakeaway: "Character is the foundation of sustainable success.",
    scriptures: [
      {
        reference: "Proverbs 11:3",
        text: "The integrity of the upright guides them, but the crookedness of the treacherous destroys them.",
        application: "Integrity is both a compass and a shield."
      },
      {
        reference: "Luke 16:10",
        text: "One who is faithful in a very little is also faithful in much.",
        application: "Small decisions shape large outcomes."
      }
    ]
  },

  // GROUP B - MPCN CONTEXT (Restricted)
  {
    id: "b1-what-mpcn-is",
    groupId: "mpcn_context",
    code: "B1",
    title: "What MPCN Is",
    objective: "Orientation to MPCN's structure and purpose.",
    estimatedMinutes: 15,
    disclosureLevel: "restricted",
    allowedRoles: ["employee", "trader", "team_lead", "department_head", "report_admin", "finance_hr_admin", "investment_admin", "user_admin", "general_overseer"],
    content: [
      {
        type: "text",
        content: "MPCN is a coordinated economic community where multiple roles, services, and forms of capital work together under unified governance. It is not a loose network of individuals; it is a structured organization where each member contributes to collective value creation."
      },
      {
        type: "list",
        content: "MPCN's structure includes:",
        items: [
          "Skilled Workers: Contributing professional services and expertise.",
          "Traders: Managing capital with discipline and accountability.",
          "Team Leads: Overseeing delivery and team development.",
          "Administrators: Managing specific operational domains.",
          "Investors: Providing capital with transparency and protection.",
          "General Overseer: Supreme authority ensuring governance integrity."
        ]
      },
      {
        type: "callout",
        content: "MPCN's strength lies in coordination, not isolation. Each role depends on others, and governance ensures that this interdependence remains fair and productive.",
        variant: "governance"
      }
    ],
    keyTakeaway: "MPCN is a coordinated community, not a loose network.",
  },
  {
    id: "b2-mpcn-value-creation",
    groupId: "mpcn_context",
    code: "B2",
    title: "How MPCN Creates Value",
    objective: "Understanding MPCN's value creation model (abstracted).",
    estimatedMinutes: 20,
    disclosureLevel: "restricted",
    allowedRoles: ["team_lead", "department_head", "report_admin", "finance_hr_admin", "investment_admin", "user_admin", "general_overseer"],
    content: [
      {
        type: "text",
        content: "MPCN creates value through the disciplined coordination of four elements: Skills, Capital, Discipline, and Coordination. Each element reinforces the others, creating a system that is greater than the sum of its parts."
      },
      {
        type: "list",
        content: "Value creation pillars:",
        items: [
          "Skills: Professional expertise that delivers tangible results.",
          "Capital: Resources deployed with wisdom and accountability.",
          "Discipline: Consistent execution of principles and processes.",
          "Coordination: Structured collaboration that multiplies individual efforts."
        ]
      },
      {
        type: "callout",
        content: "This module provides an abstracted view of value creation. Specific workflows, financial formulas, and decision chains are not disclosed here.",
        variant: "governance"
      }
    ],
    keyTakeaway: "Coordinated discipline creates compounding value.",
  },
  {
    id: "b3-governance-philosophy",
    groupId: "mpcn_context",
    code: "B3",
    title: "Governance & Authority Philosophy",
    objective: "Understanding why structure protects members.",
    estimatedMinutes: 20,
    disclosureLevel: "restricted",
    allowedRoles: ["team_lead", "department_head", "report_admin", "finance_hr_admin", "investment_admin", "user_admin", "general_overseer"],
    content: [
      {
        type: "text",
        content: "Authority in MPCN is separated by design. This is not bureaucracy—it is protection. When authority is concentrated without accountability, abuse becomes inevitable. When authority is distributed with clear boundaries, trust becomes possible."
      },
      {
        type: "list",
        content: "Governance principles:",
        items: [
          "Separation: No single role holds unchecked authority (except the General Overseer, who is accountable to the charter).",
          "Transparency: Decisions are auditable. Authority is visible.",
          "Fairness: Process protects against favoritism and bias.",
          "Accountability: Authority without accountability is dangerous."
        ]
      },
      {
        type: "scripture",
        content: "\"Where there is no guidance, a people falls, but in an abundance of counselors there is safety.\" — Proverbs 11:14"
      },
      {
        type: "callout",
        content: "Controls exist to protect, not to punish. Audit exists to verify, not to suspect. Structure exists to serve, not to dominate.",
        variant: "governance"
      }
    ],
    keyTakeaway: "Structure protects; chaos endangers.",
    scriptures: [
      {
        reference: "Proverbs 11:14",
        text: "Where there is no guidance, a people falls, but in an abundance of counselors there is safety.",
        application: "Governance is wisdom applied to community."
      }
    ]
  },

  // GROUP C - RISK & PROTECTION (All Members)
  {
    id: "c1-understanding-risk",
    groupId: "risk_protection",
    code: "C1",
    title: "Understanding Risk",
    objective: "Comprehensive understanding of financial, reputational, and moral risk.",
    estimatedMinutes: 20,
    disclosureLevel: "member",
    allowedRoles: ["employee", "trader", "team_lead", "department_head", "report_admin", "finance_hr_admin", "investment_admin", "user_admin", "general_overseer"],
    content: [
      {
        type: "text",
        content: "Risk is the possibility of loss or harm. In any economic activity, risk is unavoidable. The question is not whether risk exists, but whether it is understood, measured, and managed. MPCN recognizes three primary categories of risk."
      },
      {
        type: "list",
        content: "Categories of risk:",
        items: [
          "Financial Risk: The possibility of monetary loss from investments, trades, or business decisions.",
          "Reputational Risk: The possibility of damage to personal or organizational standing.",
          "Moral Risk: The possibility of compromising integrity or ethical standards."
        ]
      },
      {
        type: "callout",
        content: "All three risks are interconnected. Financial shortcuts often create reputational damage. Reputational damage often stems from moral compromise. Managing one requires awareness of all.",
        variant: "warning"
      },
      {
        type: "scripture",
        content: "\"A prudent person foresees danger and takes precautions. The simpleton goes blindly on and suffers the consequences.\" — Proverbs 27:12"
      }
    ],
    keyTakeaway: "Risk understood is risk manageable.",
    scriptures: [
      {
        reference: "Proverbs 27:12",
        text: "A prudent person foresees danger and takes precautions.",
        application: "Foresight is the first step in risk management."
      }
    ]
  },
  {
    id: "c2-why-controls-exist",
    groupId: "risk_protection",
    code: "C2",
    title: "Why Controls Exist",
    objective: "Understanding controls as protection, not punishment.",
    estimatedMinutes: 15,
    disclosureLevel: "member",
    allowedRoles: ["employee", "trader", "team_lead", "department_head", "report_admin", "finance_hr_admin", "investment_admin", "user_admin", "general_overseer"],
    content: [
      {
        type: "text",
        content: "Controls are often misunderstood as restrictions or expressions of distrust. In MPCN, controls serve a different purpose: they exist to protect members, ensure fairness, and maintain the integrity of the community."
      },
      {
        type: "list",
        content: "Understanding MPCN's control philosophy:",
        items: [
          "Learning vs Punishment: Controls identify areas for growth, not targets for blame.",
          "Audit vs Suspicion: Audit verifies integrity; it does not assume guilt.",
          "Authority vs Ego: Authority serves the community; it does not dominate individuals.",
          "Structure vs Chaos: Structure creates predictability; chaos creates anxiety."
        ]
      },
      {
        type: "callout",
        content: "If you ever feel that a control is punitive rather than protective, you are encouraged to raise this through appropriate channels. Controls should serve, not suppress.",
        variant: "info"
      }
    ],
    keyTakeaway: "Controls protect; they do not punish.",
  },

  // GROUP D - ROLE-SPECIFIC (Controlled Access)
  {
    id: "d-sw-skilled-worker",
    groupId: "role_specific",
    code: "D-SW",
    title: "Skilled Worker Track",
    objective: "Professional development for skilled workers and freelancers.",
    estimatedMinutes: 30,
    disclosureLevel: "restricted",
    allowedRoles: ["employee", "team_lead", "department_head", "report_admin", "general_overseer"],
    blockedRoles: ["trader"],
    content: [
      {
        type: "text",
        content: "As a Skilled Worker in MPCN, you are the engine of value delivery. Your expertise, professionalism, and reliability directly impact the community's success and reputation."
      },
      {
        type: "list",
        content: "Key responsibilities and expectations:",
        items: [
          "Quality Standards: Deliver work that meets or exceeds expectations.",
          "Communication: Provide timely updates and flag issues early.",
          "Professional Conduct: Represent MPCN with integrity in all interactions.",
          "Continuous Learning: Invest in skill development and adaptation."
        ]
      },
      {
        type: "callout",
        content: "Revision is learning, not failure. When feedback requests changes, it is an opportunity for growth, not a judgment of worth.",
        variant: "info"
      },
      {
        type: "scripture",
        content: "\"Do you see a man skillful in his work? He will stand before kings.\" — Proverbs 22:29"
      }
    ],
    keyTakeaway: "Excellence in delivery builds lasting value.",
    scriptures: [
      {
        reference: "Proverbs 22:29",
        text: "Do you see a man skillful in his work? He will stand before kings.",
        application: "Skill excellence opens doors of opportunity."
      }
    ]
  },
  {
    id: "d-tr-trader",
    groupId: "role_specific",
    code: "D-TR",
    title: "Trader Track",
    objective: "Capital responsibility and trading ethics for traders.",
    estimatedMinutes: 35,
    disclosureLevel: "restricted",
    allowedRoles: ["trader", "team_lead", "department_head", "finance_hr_admin", "investment_admin", "general_overseer"],
    content: [
      {
        type: "text",
        content: "As a Trader in MPCN, you carry a unique responsibility: managing capital that may belong to others. This is not a license; it is a trust. Your discipline, risk management, and ethical conduct directly impact the financial security of the community."
      },
      {
        type: "list",
        content: "Core trading responsibilities:",
        items: [
          "Capital Responsibility: Treat every dollar as if it belongs to someone who trusted you with their future.",
          "Risk Limits: Never exceed defined risk parameters, regardless of confidence.",
          "Performance Ethics: Report accurately. Never manipulate or misrepresent results.",
          "Continuous Discipline: Markets change; your discipline must remain constant."
        ]
      },
      {
        type: "callout",
        content: "Losses are inevitable. How you handle them defines your character. Hiding losses, averaging down recklessly, or revenge trading are violations of trust.",
        variant: "warning"
      },
      {
        type: "scripture",
        content: "\"Whoever can be trusted with very little can also be trusted with much.\" — Luke 16:10"
      }
    ],
    keyTakeaway: "Capital trust is sacred responsibility.",
    scriptures: [
      {
        reference: "Luke 16:10",
        text: "Whoever can be trusted with very little can also be trusted with much.",
        application: "Faithfulness in small amounts proves readiness for larger responsibility."
      }
    ]
  },
  {
    id: "d-tl-team-lead",
    groupId: "role_specific",
    code: "D-TL",
    title: "Team Lead Track",
    objective: "Review responsibility and feedback discipline for team leads.",
    estimatedMinutes: 30,
    disclosureLevel: "restricted",
    allowedRoles: ["team_lead", "department_head", "report_admin", "user_admin", "general_overseer"],
    content: [
      {
        type: "text",
        content: "As a Team Lead, you stand between individual contributors and organizational governance. Your role is not to dominate but to develop. You are a mentor, not a manager; a guide, not a gatekeeper."
      },
      {
        type: "list",
        content: "Team Lead responsibilities:",
        items: [
          "Review Responsibility: Evaluate work fairly, consistently, and constructively.",
          "Feedback Discipline: Deliver feedback that builds up, not tears down.",
          "Escalation Ethics: Know when to escalate and when to resolve locally.",
          "Development Focus: Your success is measured by your team's growth."
        ]
      },
      {
        type: "callout",
        content: "You have influence, not final authority. Complex decisions and disciplinary matters escalate to appropriate authority levels.",
        variant: "governance"
      },
      {
        type: "scripture",
        content: "\"And the Lord's servant must not be quarrelsome but kind to everyone, able to teach, patiently enduring evil.\" — 2 Timothy 2:24"
      }
    ],
    keyTakeaway: "Lead by developing, not dominating.",
    scriptures: [
      {
        reference: "2 Timothy 2:24",
        text: "And the Lord's servant must not be quarrelsome but kind to everyone, able to teach, patiently enduring evil.",
        application: "Leadership is patient service, not aggressive control."
      }
    ]
  },
  {
    id: "d-ad-admin",
    groupId: "role_specific",
    code: "D-AD",
    title: "Admin Track",
    objective: "Audit responsibility and override accountability for administrators.",
    estimatedMinutes: 35,
    disclosureLevel: "restricted",
    allowedRoles: ["report_admin", "finance_hr_admin", "investment_admin", "user_admin", "general_overseer"],
    content: [
      {
        type: "text",
        content: "As an Administrator, you hold significant operational authority within your domain. This authority is granted for service, not status. Every action you take is auditable, and every override requires justification."
      },
      {
        type: "list",
        content: "Administrator responsibilities:",
        items: [
          "Audit Discipline: Verify before acting. Assume good faith until evidence suggests otherwise.",
          "Override Accountability: Every override is logged and must be justified.",
          "Pattern Detection: Identify systemic issues, not just individual incidents.",
          "Fairness First: Apply rules consistently. Favoritism destroys trust."
        ]
      },
      {
        type: "callout",
        content: "You are not the General Overseer. Your authority is bounded by your domain. Cross-domain issues escalate to appropriate authority.",
        variant: "governance"
      },
      {
        type: "scripture",
        content: "\"Moreover, it is required of stewards that they be found faithful.\" — 1 Corinthians 4:2"
      }
    ],
    keyTakeaway: "Authority without accountability is dangerous.",
    scriptures: [
      {
        reference: "1 Corinthians 4:2",
        text: "Moreover, it is required of stewards that they be found faithful.",
        application: "Administrative authority is stewardship, not ownership."
      }
    ]
  },
  {
    id: "d-in-investor",
    groupId: "role_specific",
    code: "D-IN",
    title: "Investor Track",
    objective: "Financial transparency and risk understanding for investors.",
    estimatedMinutes: 25,
    disclosureLevel: "restricted",
    allowedRoles: ["investment_admin", "general_overseer"],
    content: [
      {
        type: "text",
        content: "As an Investor in MPCN, you provide capital that enables operations and growth. In return, you receive transparency, protection, and fair treatment. Your role is capital provision, not operational control."
      },
      {
        type: "list",
        content: "Investor rights and responsibilities:",
        items: [
          "Transparency: You have the right to clear, honest reporting on your investments.",
          "Risk Understanding: All investments carry risk. Returns are not guaranteed.",
          "Patience: Long-term thinking produces better outcomes than reactive decisions.",
          "Trust: You trust MPCN's governance; MPCN respects your capital."
        ]
      },
      {
        type: "callout",
        content: "Investors do not have access to task-level operations or personnel management. Your visibility is focused on financial performance and governance assurance.",
        variant: "governance"
      }
    ],
    keyTakeaway: "Capital provision requires trust and patience.",
  },

  // GROUP E - FAITH & STEWARDSHIP (Official, Voluntary)
  {
    id: "e1-biblical-wealth",
    groupId: "faith_stewardship",
    code: "E1",
    title: "Biblical View of Wealth",
    objective: "Understanding wealth through Scripture and the teachings of our Lord Jesus Christ.",
    estimatedMinutes: 30,
    disclosureLevel: "member",
    allowedRoles: ["employee", "trader", "team_lead", "department_head", "report_admin", "finance_hr_admin", "investment_admin", "user_admin", "general_overseer"],
    isOptional: true,
    content: [
      {
        type: "text",
        content: "The Bible presents a consistent view of wealth: God is the ultimate owner of all things, and humans are stewards entrusted with resources for a season. This perspective transforms how we view money, possessions, and financial success."
      },
      {
        type: "scripture",
        content: "\"The earth is the Lord's, and everything in it, the world, and all who live in it.\" — Psalm 24:1"
      },
      {
        type: "list",
        content: "Biblical principles of wealth:",
        items: [
          "God as Owner: Everything belongs to God. We manage; we do not own.",
          "Stewardship: We will give an account for how we managed what was entrusted to us.",
          "Provision: God provides, but provision requires our faithful participation.",
          "Generosity: Wealth is meant to bless others, not merely accumulate."
        ]
      },
      {
        type: "scripture",
        content: "\"Remember the Lord your God, for it is He who gives you the ability to produce wealth.\" — Deuteronomy 8:18"
      },
      {
        type: "callout",
        content: "Our Lord Jesus Christ taught that we cannot serve both God and money (Matthew 6:24). This does not mean wealth is evil, but that our hearts must remain anchored in God, not in financial gain.",
        variant: "faith"
      },
      {
        type: "reflection",
        content: "Reflection: How do you currently view your financial resources? As yours to control, or as God's to steward?"
      }
    ],
    keyTakeaway: "We are stewards, not owners.",
    scriptures: [
      {
        reference: "Psalm 24:1",
        text: "The earth is the Lord's, and everything in it.",
        application: "God is the ultimate owner of all creation."
      },
      {
        reference: "Deuteronomy 8:18",
        text: "Remember the Lord your God, for it is He who gives you the ability to produce wealth.",
        application: "Our ability to create wealth is a gift from God."
      },
      {
        reference: "Matthew 6:24",
        text: "No one can serve two masters. Either you will hate the one and love the other, or you will be devoted to the one and despise the other. You cannot serve both God and money.",
        application: "Our Lord Jesus Christ calls us to prioritize God over wealth."
      },
      {
        reference: "Proverbs 3:9-10",
        text: "Honor the Lord with your wealth, with the firstfruits of all your crops; then your barns will be filled to overflowing.",
        application: "Honoring God with our resources invites His blessing."
      }
    ]
  },
  {
    id: "e2-prayer-reflection",
    groupId: "faith_stewardship",
    code: "E2",
    title: "Prayer, Reflection & Alignment",
    objective: "Spiritual disciplines for personal and professional alignment with God's will.",
    estimatedMinutes: 25,
    disclosureLevel: "member",
    allowedRoles: ["employee", "trader", "team_lead", "department_head", "report_admin", "finance_hr_admin", "investment_admin", "user_admin", "general_overseer"],
    isOptional: true,
    content: [
      {
        type: "text",
        content: "MPCN acknowledges its foundation in faith and the lordship of Jesus Christ. While participation in faith-related content is voluntary, we encourage members to consider how spiritual disciplines can strengthen their character and professional conduct."
      },
      {
        type: "list",
        content: "Spiritual disciplines for alignment:",
        items: [
          "Prayer: Regular conversation with God, seeking guidance and expressing gratitude.",
          "Meditation: Quiet reflection on Scripture and God's character.",
          "Confession: Honest acknowledgment of failures and commitment to growth.",
          "Worship: Recognizing God's greatness and submitting our work to Him."
        ]
      },
      {
        type: "scripture",
        content: "\"Trust in the Lord with all your heart and lean not on your own understanding; in all your ways submit to Him, and He will make your paths straight.\" — Proverbs 3:5-6"
      },
      {
        type: "callout",
        content: "This section is voluntary. MPCN respects individual conscience while maintaining its Christian foundation. Participation in faith content does not affect role progression or authority.",
        variant: "info"
      },
      {
        type: "reflection",
        content: "Reflection: Consider setting aside time for prayer before major decisions. Ask the Lord Jesus Christ for wisdom, patience, and integrity in your work."
      }
    ],
    keyTakeaway: "Spiritual alignment strengthens professional integrity.",
    scriptures: [
      {
        reference: "Proverbs 3:5-6",
        text: "Trust in the Lord with all your heart and lean not on your own understanding.",
        application: "Seeking God's guidance leads to clearer paths."
      },
      {
        reference: "Philippians 4:6-7",
        text: "Do not be anxious about anything, but in every situation, by prayer and petition, with thanksgiving, present your requests to God.",
        application: "Prayer brings peace and clarity in uncertain situations."
      }
    ]
  },
  {
    id: "e3-faith-work",
    groupId: "faith_stewardship",
    code: "E3",
    title: "Faith & Work",
    objective: "Integrating faith with professional excellence.",
    estimatedMinutes: 20,
    disclosureLevel: "member",
    allowedRoles: ["employee", "trader", "team_lead", "department_head", "report_admin", "finance_hr_admin", "investment_admin", "user_admin", "general_overseer"],
    isOptional: true,
    content: [
      {
        type: "text",
        content: "Work is not separate from worship. When we pursue excellence in our professional lives, we honor God through our diligence, integrity, and service to others. Our Lord Jesus Christ modeled a life of purpose, service, and excellence—and we are called to follow His example."
      },
      {
        type: "list",
        content: "Faith-work integration principles:",
        items: [
          "Excellence as Service: High-quality work serves clients, colleagues, and ultimately God.",
          "Humility in Success: When we succeed, we recognize God's provision and guidance.",
          "Integrity in Difficulty: When challenges arise, our character is tested and refined.",
          "Obedience and Discipline: Following God's principles leads to sustainable success."
        ]
      },
      {
        type: "scripture",
        content: "\"Whatever you do, work at it with all your heart, as working for the Lord, not for human masters.\" — Colossians 3:23"
      },
      {
        type: "callout",
        content: "Faith does not replace competence. God calls us to both spiritual devotion AND professional excellence. One without the other is incomplete.",
        variant: "faith"
      },
      {
        type: "reflection",
        content: "Reflection: How might your work change if you approached every task as an offering to the Lord Jesus Christ?"
      }
    ],
    keyTakeaway: "Excellence in work is an expression of faith.",
    scriptures: [
      {
        reference: "Colossians 3:23",
        text: "Whatever you do, work at it with all your heart, as working for the Lord.",
        application: "Work becomes worship when done for God's glory."
      },
      {
        reference: "1 Corinthians 10:31",
        text: "So whether you eat or drink or whatever you do, do it all for the glory of God.",
        application: "Every action, including work, can glorify God."
      }
    ]
  },
];

// Charter Principles
export const MPCN_LEARN_CHARTER = {
  title: "MPCN Learn Charter",
  subtitle: "Institutional Learning & Governance Framework",
  mission: "To build knowledge, character, and competence within MPCN through structured, role-appropriate learning that honors God, protects governance, and develops stewardship.",
  principles: [
    {
      id: "progressive-disclosure",
      title: "Progressive Disclosure",
      description: "Knowledge is released according to role and responsibility. Not everyone sees everything, and this is by design—for protection and focus.",
    },
    {
      id: "learning-not-authority",
      title: "Learning Does Not Grant Authority",
      description: "Completing modules demonstrates competence but does not automatically grant roles or permissions. Authority flows through governance, not certificates.",
    },
    {
      id: "faith-integration",
      title: "Faith Integration",
      description: "MPCN Learn acknowledges God and the lordship of Jesus Christ as foundational. Faith content is official but voluntary, respectful but non-coercive.",
    },
    {
      id: "governance-first",
      title: "Governance Over Learning",
      description: "Learning serves governance, not the other way around. If conflict exists between learning content and governance rules, governance prevails.",
    },
    {
      id: "protection-not-punishment",
      title: "Protection, Not Punishment",
      description: "Learning assessments exist to identify growth opportunities, not to punish or shame. Every member is on a journey of development.",
    },
  ],
  faithStatement: "MPCN is founded on Christian principles, acknowledging God as the source of all wisdom and Jesus Christ as Lord. Our approach to wealth, work, and governance is informed by Scripture while remaining professionally rigorous and legally sound.",
  governanceNote: "This charter is approved by the General Overseer and serves as the authoritative document for all MPCN Learn operations.",
};

// Helper Functions
export function getModulesForRole(role: AppRole | null): LearningModule[] {
  if (!role) return [];
  return LEARNING_MODULES.filter(module => 
    module.allowedRoles.includes(role) && 
    (!module.blockedRoles || !module.blockedRoles.includes(role))
  );
}

export function getModulesByGroup(modules: LearningModule[]): Record<ModuleGroup, LearningModule[]> {
  const grouped: Record<ModuleGroup, LearningModule[]> = {
    foundations: [],
    mpcn_context: [],
    risk_protection: [],
    role_specific: [],
    faith_stewardship: [],
  };
  
  modules.forEach(module => {
    grouped[module.groupId].push(module);
  });
  
  return grouped;
}

export function getModuleById(id: string): LearningModule | undefined {
  return LEARNING_MODULES.find(module => module.id === id);
}
