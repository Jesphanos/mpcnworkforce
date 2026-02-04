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
  CommandShortcut,
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
  Search,
  Plus,
  Bell,
  BookOpen,
  Target,
  BarChart3,
  Keyboard,
  AlertTriangle,
  Clock,
  Loader2,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useCapabilities } from "@/hooks/useCapabilities";
import { useGlobalSearch, useRecentSearches } from "@/hooks/useGlobalSearch";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

interface CommandPaletteProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function CommandPalette({ open: controlledOpen, onOpenChange }: CommandPaletteProps) {
  const [open, setOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const navigate = useNavigate();
  const { signOut, role, profile } = useAuth();
  const { isAdmin, isOverseer, isTeamLead, isInvestor, isTrader, can } = useCapabilities();
  
  // Global search integration
  const { search, results, isSearching, hasResults } = useGlobalSearch();
  const { recentSearches, addRecentSearch } = useRecentSearches();

  const isOpen = controlledOpen ?? open;
  const setIsOpen = onOpenChange ?? setOpen;
  
  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (inputValue.length >= 2) {
        search(inputValue);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [inputValue, search]);

  // Global keyboard shortcuts
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      // Command palette: Cmd/Ctrl + K
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setIsOpen(!isOpen);
      }

      // Trading shortcuts (only when not in input/textarea)
      const target = e.target as HTMLElement;
      const isInput = target.tagName === "INPUT" || target.tagName === "TEXTAREA";
      
      if (!isInput && isTrader()) {
        // T: Open trading page
        if (e.key === "t" && !e.metaKey && !e.ctrlKey) {
          navigate("/trading");
          toast.info("Navigated to Trading Terminal");
        }
        // J: Open trade journal
        if (e.key === "j" && !e.metaKey && !e.ctrlKey) {
          navigate("/trading?tab=journal");
          toast.info("Opened Trade Journal");
        }
        // N: New trade
        if (e.key === "n" && !e.metaKey && !e.ctrlKey) {
          navigate("/trading?tab=execute");
          toast.info("Ready to log new trade");
        }
      }

      // General shortcuts
      if (!isInput) {
        // D: Dashboard
        if (e.key === "d" && !e.metaKey && !e.ctrlKey) {
          navigate("/dashboard");
        }
        // P: Profile
        if (e.key === "p" && !e.metaKey && !e.ctrlKey) {
          navigate("/profile");
        }
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [isOpen, setIsOpen, navigate, isTrader]);

  const runCommand = useCallback((command: () => void, searchTerm?: string) => {
    setIsOpen(false);
    setInputValue("");
    if (searchTerm) {
      addRecentSearch(searchTerm);
    }
    command();
  }, [setIsOpen, addRecentSearch]);
  
  const typeIcons: Record<string, typeof FileText> = {
    user: User,
    task: FileText,
    report: FileText,
    investment: TrendingUp,
  };

  const navigationItems = [
    { label: "Dashboard", icon: LayoutDashboard, path: "/dashboard", always: true, shortcut: "D" },
    { label: "My Profile", icon: User, path: "/profile", always: true, shortcut: "P" },
    { label: "Reports", icon: FileText, path: "/reports", show: role === "employee" || isTeamLead() || can("canApproveReports") },
    { label: "Trading Terminal", icon: CandlestickChart, path: "/trading", show: isTrader() || isOverseer(), shortcut: "T" },
    { label: "Activity History", icon: Activity, path: "/activity", always: true },
  ];

  const tradingItems = [
    { label: "Log New Trade", icon: Plus, action: () => navigate("/trading?tab=execute"), show: isTrader() || isOverseer(), shortcut: "N" },
    { label: "Trade Journal", icon: BookOpen, action: () => navigate("/trading?tab=journal"), show: isTrader() || isOverseer(), shortcut: "J" },
    { label: "Analytics", icon: BarChart3, action: () => navigate("/trading?tab=analytics"), show: isTrader() || isOverseer() },
    { label: "View Open Positions", icon: Target, action: () => { navigate("/trading"); toast.info("Viewing open positions"); }, show: isTrader() || isOverseer() },
    { label: "Check Risk Limits", icon: AlertTriangle, action: () => { navigate("/trading"); toast.info("Risk control panel visible"); }, show: isTrader() || isOverseer() },
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
    { label: "Keyboard Shortcuts", icon: Keyboard, action: () => toast.info("Shortcuts: T=Trading, J=Journal, N=New Trade, D=Dashboard, P=Profile"), always: true },
  ];

  // Reset input when dialog closes
  useEffect(() => {
    if (!isOpen) {
      setInputValue("");
    }
  }, [isOpen]);

  return (
    <CommandDialog open={isOpen} onOpenChange={setIsOpen}>
      <CommandInput 
        placeholder="Search or type a command..." 
        value={inputValue}
        onValueChange={setInputValue}
      />
      <CommandList>
        <CommandEmpty>
          {isSearching ? (
            <div className="flex items-center justify-center gap-2 py-4">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Searching...</span>
            </div>
          ) : (
            "No results found."
          )}
        </CommandEmpty>
        
        {/* Search Results */}
        {hasResults && inputValue.length >= 2 && (
          <CommandGroup heading="Search Results">
            {results.map((result) => {
              const Icon = typeIcons[result.type] || FileText;
              return (
                <CommandItem
                  key={`${result.type}-${result.id}`}
                  onSelect={() => runCommand(() => navigate(result.path), inputValue)}
                >
                  <Icon className="mr-2 h-4 w-4" />
                  <div className="flex flex-col">
                    <span>{result.title}</span>
                    {result.subtitle && (
                      <span className="text-xs text-muted-foreground">{result.subtitle}</span>
                    )}
                  </div>
                  <Badge variant="outline" className="ml-auto text-xs">
                    {result.type}
                  </Badge>
                </CommandItem>
              );
            })}
          </CommandGroup>
        )}
        
        {/* Recent Searches */}
        {recentSearches.length > 0 && inputValue.length < 2 && (
          <>
            <CommandGroup heading="Recent Searches">
              {recentSearches.slice(0, 3).map((term, i) => (
                <CommandItem
                  key={`recent-${i}`}
                  onSelect={() => {
                    setInputValue(term);
                    search(term);
                  }}
                >
                  <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                  {term}
                </CommandItem>
              ))}
            </CommandGroup>
            <CommandSeparator />
          </>
        )}
        
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
                {item.shortcut && <CommandShortcut>{item.shortcut}</CommandShortcut>}
              </CommandItem>
            ))}
        </CommandGroup>

        {/* Trading Quick Actions */}
        {tradingItems.some(item => item.show) && (
          <>
            <CommandSeparator />
            <CommandGroup heading="Trading">
              {tradingItems
                .filter(item => item.show)
                .map(item => (
                  <CommandItem
                    key={item.label}
                    onSelect={() => runCommand(item.action)}
                  >
                    <item.icon className="mr-2 h-4 w-4" />
                    {item.label}
                    {item.shortcut && <CommandShortcut>{item.shortcut}</CommandShortcut>}
                  </CommandItem>
                ))}
            </CommandGroup>
          </>
        )}

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
