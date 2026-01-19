import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import {
  LayoutDashboard,
  FileText,
  User,
  Users,
  Settings,
  DollarSign,
  TrendingUp,
  Scale,
  Activity,
  CandlestickChart,
  LogOut,
  Moon,
  Sun,
  Search,
  Plus,
  Bell,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useCapabilities } from "@/hooks/useCapabilities";

interface CommandPaletteProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function CommandPalette({ open: controlledOpen, onOpenChange }: CommandPaletteProps) {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const { signOut, role, profile } = useAuth();
  const { isAdmin, isOverseer, isTeamLead, isInvestor, can } = useCapabilities();

  const isOpen = controlledOpen ?? open;
  const setIsOpen = onOpenChange ?? setOpen;

  // Global keyboard shortcut
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setIsOpen(!isOpen);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [isOpen, setIsOpen]);

  const runCommand = useCallback((command: () => void) => {
    setIsOpen(false);
    command();
  }, [setIsOpen]);

  const navigationItems = [
    { label: "Dashboard", icon: LayoutDashboard, path: "/dashboard", always: true },
    { label: "My Profile", icon: User, path: "/profile", always: true },
    { label: "Reports", icon: FileText, path: "/reports", show: role === "employee" || isTeamLead() || can("canApproveReports") },
    { label: "Trading", icon: CandlestickChart, path: "/trading", always: true },
    { label: "Activity History", icon: Activity, path: "/activity", always: true },
  ];

  const adminItems = [
    { label: "Governance", icon: Scale, path: "/governance", show: can("canViewAuditLogs") },
    { label: "User Management", icon: Users, path: "/users", show: can("canManageUsers") },
    { label: "Finance & HR", icon: DollarSign, path: "/finance-hr", show: can("canViewPayroll") },
    { label: "Investments", icon: TrendingUp, path: "/investments", show: can("canManageInvestments") || isInvestor() },
    { label: "Settings", icon: Settings, path: "/settings", show: isOverseer() },
  ];

  const quickActions = [
    { label: "Submit New Report", icon: Plus, action: () => navigate("/reports?action=new"), show: role === "employee" || isTeamLead() },
    { label: "View Notifications", icon: Bell, action: () => navigate("/activity"), always: true },
  ];

  return (
    <CommandDialog open={isOpen} onOpenChange={setIsOpen}>
      <CommandInput placeholder="Type a command or search..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        
        <CommandGroup heading="Navigation">
          {navigationItems
            .filter(item => item.always || item.show)
            .map(item => (
              <CommandItem
                key={item.path}
                onSelect={() => runCommand(() => navigate(item.path))}
              >
                <item.icon className="mr-2 h-4 w-4" />
                {item.label}
              </CommandItem>
            ))}
        </CommandGroup>

        {adminItems.some(item => item.show) && (
          <>
            <CommandSeparator />
            <CommandGroup heading="Administration">
              {adminItems
                .filter(item => item.show)
                .map(item => (
                  <CommandItem
                    key={item.path}
                    onSelect={() => runCommand(() => navigate(item.path))}
                  >
                    <item.icon className="mr-2 h-4 w-4" />
                    {item.label}
                  </CommandItem>
                ))}
            </CommandGroup>
          </>
        )}

        {quickActions.some(item => item.always || item.show) && (
          <>
            <CommandSeparator />
            <CommandGroup heading="Quick Actions">
              {quickActions
                .filter(item => item.always || item.show)
                .map(item => (
                  <CommandItem
                    key={item.label}
                    onSelect={() => runCommand(item.action)}
                  >
                    <item.icon className="mr-2 h-4 w-4" />
                    {item.label}
                  </CommandItem>
                ))}
            </CommandGroup>
          </>
        )}

        <CommandSeparator />
        <CommandGroup heading="Account">
          <CommandItem onSelect={() => runCommand(signOut)}>
            <LogOut className="mr-2 h-4 w-4" />
            Sign Out
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}

// Hook to use command palette anywhere
export function useCommandPalette() {
  const [open, setOpen] = useState(false);
  
  const toggle = useCallback(() => setOpen(prev => !prev), []);
  
  return { open, setOpen, toggle };
}
