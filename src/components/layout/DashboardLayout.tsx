import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import { AppHeader } from "./AppHeader";
import { AppBreadcrumb } from "./AppBreadcrumb";
import { SlaAlertBanner } from "@/components/notifications/SlaAlertBanner";
import { useReportNotifications } from "@/hooks/useReportNotifications";
import { useSlaBreachAlerts } from "@/hooks/useSlaBreachAlerts";
import { useCapabilities } from "@/hooks/useCapabilities";
import { CommandPalette } from "@/components/ui/command-palette";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { Button } from "@/components/ui/button";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  // Subscribe to real-time report status notifications
  useReportNotifications();
  
  // Subscribe to SLA breach alerts
  useSlaBreachAlerts();
  
  const { can, isOverseer } = useCapabilities();
  const showSlaBanner = can("canApproveReports") || can("canOverrideReports") || isOverseer();

  return (
    <SidebarProvider>
      <CommandPalette />
      {/* Skip to main content link for accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
      >
        Skip to main content
      </a>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <div className="flex-1 flex flex-col">
          <AppHeader />
          {showSlaBanner && (
            <div className="px-6 pt-4">
              <SlaAlertBanner />
            </div>
          )}
          <main 
            id="main-content" 
            className="flex-1 p-6 bg-background overflow-auto"
            tabIndex={-1}
          >
            <AppBreadcrumb />
            <ErrorBoundary>
              {children}
            </ErrorBoundary>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
