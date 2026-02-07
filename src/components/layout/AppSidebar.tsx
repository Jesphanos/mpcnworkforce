import { useAuth } from "@/contexts/AuthContext";
import { NavLink } from "@/components/NavLink";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar";
import {
  LayoutDashboard,
  User,
  FileText,
  DollarSign,
  TrendingUp,
  Users,
  Settings,
  Building2,
  LogOut,
  ClipboardList,
  UsersRound,
  Activity,
  Shield,
  PieChart,
  Wallet,
  Scale,
  CandlestickChart,
  Landmark,
  GraduationCap,
  Download,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useCapabilities } from "@/hooks/useCapabilities";
import { InstallButton } from "@/components/pwa/InstallButton";

type AppRole = 
  | "employee" 
  | "trader"
  | "team_lead" 
  | "department_head"
  | "report_admin" 
  | "finance_hr_admin" 
  | "investment_admin" 
  | "user_admin" 
  | "general_overseer";

interface MenuItem {
  title: string;
  url: string;
  icon: React.ElementType;
}

interface MenuSection {
  label: string;
  items: MenuItem[];
}

/**
 * MPCN Role-based navigation structure
 * 
 * Authority Tiers:
 * - Tier 0: General Overseer (Supreme Authority)
 * - Tier 1: Administrators (System managers - NOT General Overseer)
 * - Tier 2: Management (Team Leads, Department Heads)
 * - Tier 3: Operational (Workers, Traders)
 */
const roleMenus: Record<AppRole, { main: MenuItem[]; admin?: MenuItem[]; adminLabel?: string }> = {
  // Tier 3: Worker - Execution layer - own work only
  employee: {
    main: [
      { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
      { title: "My Tasks", url: "/tasks", icon: ClipboardList },
      { title: "My Reports", url: "/reports", icon: FileText },
      { title: "My Profile", url: "/profile", icon: User },
    ],
  },

  // Tier 3: Trader - Trading execution
  trader: {
    main: [
      { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
      { title: "Trading", url: "/trading", icon: CandlestickChart },
      { title: "My Reports", url: "/reports", icon: FileText },
      { title: "My Profile", url: "/profile", icon: User },
    ],
  },

  // Tier 2: Team Lead - First-level review
  team_lead: {
    main: [
      { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
      { title: "My Tasks", url: "/tasks", icon: ClipboardList },
      { title: "My Reports", url: "/reports", icon: FileText },
      { title: "My Profile", url: "/profile", icon: User },
    ],
    adminLabel: "Team Management",
    admin: [
      { title: "Team Overview", url: "/team", icon: UsersRound },
      { title: "Pending Reviews", url: "/reports?tab=review", icon: FileText },
    ],
  },

  // Tier 2: Department Head - Department oversight
  department_head: {
    main: [
      { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
      { title: "My Profile", url: "/profile", icon: User },
    ],
    adminLabel: "Department Management",
    admin: [
      { title: "Department View", url: "/department", icon: Building2 },
      { title: "Teams Overview", url: "/team", icon: UsersRound },
      { title: "Department Reports", url: "/reports", icon: FileText },
      { title: "Activity Logs", url: "/activity", icon: Activity },
    ],
  },

  // Tier 1: Report Admin - Quality & governance
  report_admin: {
    main: [
      { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
      { title: "My Profile", url: "/profile", icon: User },
    ],
    adminLabel: "Administration",
    admin: [
      { title: "Governance", url: "/governance", icon: Scale },
      { title: "System Inbox", url: "/reports?tab=review", icon: FileText },
      { title: "All Reports", url: "/reports?tab=all", icon: FileText },
      { title: "Teams View", url: "/team", icon: UsersRound },
      { title: "Activity Logs", url: "/activity", icon: Activity },
    ],
  },

  // Tier 1: Finance/HR Admin - Payroll & HR
  finance_hr_admin: {
    main: [
      { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
      { title: "My Profile", url: "/profile", icon: User },
    ],
    adminLabel: "Finance & HR",
    admin: [
      { title: "Finance & HR", url: "/finance-hr", icon: DollarSign },
      { title: "Employee Directory", url: "/users", icon: Users },
      { title: "Teams View", url: "/team", icon: UsersRound },
      { title: "Activity Logs", url: "/activity", icon: Activity },
    ],
  },

  // Tier 1: Investment Admin - Investments & financials
  investment_admin: {
    main: [
      { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
      { title: "My Profile", url: "/profile", icon: User },
    ],
    adminLabel: "Investments",
    admin: [
      { title: "Investments", url: "/investments", icon: TrendingUp },
      { title: "MPCN Financials", url: "/investments?tab=financials", icon: PieChart },
    ],
  },

  // Tier 1: User Admin - User management
  user_admin: {
    main: [
      { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
      { title: "My Profile", url: "/profile", icon: User },
    ],
    adminLabel: "User Management",
    admin: [
      { title: "Governance", url: "/governance", icon: Scale },
      { title: "Users", url: "/users", icon: Users },
      { title: "Teams", url: "/team", icon: UsersRound },
      { title: "Activity Logs", url: "/activity", icon: Activity },
    ],
  },

  // Tier 0: General Overseer - SUPREME AUTHORITY (NOT Administrator)
  // Uses grouped sections instead of flat list
  general_overseer: {
    main: [
      { title: "Command Center", url: "/dashboard", icon: LayoutDashboard },
      { title: "My Profile", url: "/profile", icon: User },
    ],
    adminLabel: "", // We'll use custom sections instead
    admin: [], // Empty - we use overseerSections below
  },
};

// Grouped sections specifically for General Overseer
const overseerSections: MenuSection[] = [
  {
    label: "Governance",
    items: [
      { title: "Governance Hub", url: "/governance", icon: Scale },
      { title: "System Settings", url: "/settings", icon: Settings },
      { title: "Audit Trail", url: "/activity", icon: Activity },
    ],
  },
  {
    label: "Organization",
    items: [
      { title: "User Management", url: "/users", icon: Users },
      { title: "Departments", url: "/department", icon: Building2 },
      { title: "Teams", url: "/team", icon: UsersRound },
    ],
  },
  {
    label: "Operations",
    items: [
      { title: "System Inbox", url: "/reports", icon: FileText },
      { title: "Overrides", url: "/reports?tab=overrides", icon: Shield },
    ],
  },
  {
    label: "Trading & Investments",
    items: [
      { title: "Trading Desk", url: "/trading", icon: CandlestickChart },
      { title: "Investments", url: "/investments", icon: TrendingUp },
      { title: "MPCN Financials", url: "/investments?tab=financials", icon: PieChart },
    ],
  },
  {
    label: "Finance & HR",
    items: [
      { title: "Payroll & HR", url: "/finance-hr", icon: DollarSign },
    ],
  },
];

// Investor-specific menu (appended for is_investor flag)
const investorMenu: MenuItem[] = [
  { title: "Investor Profile", url: "/investor-profile", icon: User },
  { title: "My Investments", url: "/investments", icon: Wallet },
];

// Trader-specific menu (for non-trader roles who also have trading access)
const traderMenu: MenuItem[] = [
  { title: "Trading Terminal", url: "/trading", icon: CandlestickChart },
];

// Development menu (available for all roles)
const developmentMenu: MenuItem[] = [
  { title: "MPCN Learn", url: "/learn", icon: GraduationCap },
];

export function AppSidebar() {
  const { profile, role, signOut } = useAuth();
  const { isInvestor, isOverseer, isTrader } = useCapabilities();

  const getInitials = (name: string | null) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getRoleLabel = (role: string | null) => {
    if (!role) return "Team Member";
    const labels: Record<string, string> = {
      employee: "Team Member",
      trader: "Trader",
      team_lead: "Team Lead",
      department_head: "Dept Head",
      report_admin: "Report Admin",
      finance_hr_admin: "Finance & HR",
      investment_admin: "Investment Admin",
      user_admin: "User Admin",
      general_overseer: "General Overseer",
    };
    return labels[role] || role.split("_").map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join(" ");
  };

  const getRoleBadgeVariant = (role: string | null): "default" | "secondary" | "outline" => {
    if (role === "general_overseer") return "default";
    if (role?.includes("admin") || role === "team_lead" || role === "department_head") return "secondary";
    return "outline";
  };

  const currentRole = (role as AppRole) || "employee";
  const menu = roleMenus[currentRole] || roleMenus.employee;
  const isGeneralOverseer = currentRole === "general_overseer";

  return (
    <Sidebar className="border-r-0">
      <SidebarHeader className="border-b border-sidebar-border p-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-card/10 flex items-center justify-center p-1 overflow-hidden">
            <img 
              src="/favicon.png" 
              alt="MPCN" 
              className="h-full w-full object-contain"
            />
          </div>
          <div>
            <h2 className="font-semibold text-sidebar-foreground">MPCN</h2>
            <p className="text-xs text-sidebar-foreground/60">Collaborative Network</p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="p-2">
        {/* Main Navigation */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-foreground/50 text-xs uppercase tracking-wider">
            Main
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menu.main.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      className="flex items-center gap-3 px-3 py-2 rounded-lg text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-foreground transition-colors"
                      activeClassName="bg-sidebar-accent text-sidebar-foreground font-medium"
                    >
                      <item.icon className="h-5 w-5" />
                      <span>{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Investor Section (if is_investor and not already in investment role) */}
        {isInvestor() && currentRole !== "investment_admin" && !isGeneralOverseer && (
          <SidebarGroup className="mt-4">
            <SidebarGroupLabel className="text-sidebar-foreground/50 text-xs uppercase tracking-wider">
              Investments
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {investorMenu.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <NavLink
                        to={item.url}
                        className="flex items-center gap-3 px-3 py-2 rounded-lg text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-foreground transition-colors"
                        activeClassName="bg-sidebar-accent text-sidebar-foreground font-medium"
                      >
                        <item.icon className="h-5 w-5" />
                        <span>{item.title}</span>
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {/* Trading Section (for traders) */}
        {isTrader() && !isGeneralOverseer && (
          <SidebarGroup className="mt-4">
            <SidebarGroupLabel className="text-sidebar-foreground/50 text-xs uppercase tracking-wider">
              Trading
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {traderMenu.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <NavLink
                        to={item.url}
                        className="flex items-center gap-3 px-3 py-2 rounded-lg text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-foreground transition-colors"
                        activeClassName="bg-sidebar-accent text-sidebar-foreground font-medium"
                      >
                        <item.icon className="h-5 w-5" />
                        <span>{item.title}</span>
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {/* General Overseer: Grouped Sections */}
        {isGeneralOverseer && overseerSections.map((section) => (
          <SidebarGroup key={section.label} className="mt-4">
            <SidebarGroupLabel className="text-sidebar-foreground/50 text-xs uppercase tracking-wider">
              {section.label}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {section.items.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <NavLink
                        to={item.url}
                        className="flex items-center gap-3 px-3 py-2 rounded-lg text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-foreground transition-colors"
                        activeClassName="bg-sidebar-accent text-sidebar-foreground font-medium"
                      >
                        <item.icon className="h-5 w-5" />
                        <span>{item.title}</span>
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}

        {/* Non-Overseer Administration Section */}
        {!isGeneralOverseer && menu.admin && menu.admin.length > 0 && (
          <SidebarGroup className="mt-4">
            <SidebarGroupLabel className="text-sidebar-foreground/50 text-xs uppercase tracking-wider">
              {menu.adminLabel || "Administration"}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {menu.admin.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <NavLink
                        to={item.url}
                        className="flex items-center gap-3 px-3 py-2 rounded-lg text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-foreground transition-colors"
                        activeClassName="bg-sidebar-accent text-sidebar-foreground font-medium"
                      >
                        <item.icon className="h-5 w-5" />
                        <span>{item.title}</span>
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {/* Development Section (Available for all roles) */}
        <SidebarGroup className="mt-4">
          <SidebarGroupLabel className="text-sidebar-foreground/50 text-xs uppercase tracking-wider">
            Development
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {developmentMenu.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      className="flex items-center gap-3 px-3 py-2 rounded-lg text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-foreground transition-colors"
                      activeClassName="bg-sidebar-accent text-sidebar-foreground font-medium"
                    >
                      <item.icon className="h-5 w-5" />
                      <span>{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border p-4">
        <div className="flex items-center gap-3 mb-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={profile?.avatar_url || undefined} />
            <AvatarFallback className="bg-sidebar-accent text-sidebar-foreground">
              {getInitials(profile?.full_name)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-sidebar-foreground truncate">
              {profile?.full_name || "User"}
            </p>
            <Badge variant={getRoleBadgeVariant(role)} className="text-[10px] h-5">
              {getRoleLabel(role)}
            </Badge>
          </div>
        </div>
        
        {/* Install App Button */}
        <div className="mb-2 text-sidebar-foreground/80">
          <InstallButton variant="sidebar" />
        </div>

        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent"
          onClick={signOut}
        >
          <LogOut className="h-4 w-4 mr-2" />
          Sign Out
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
