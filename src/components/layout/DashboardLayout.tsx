import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import { AppHeader } from "./AppHeader";
import { SlaAlertBanner } from "@/components/notifications/SlaAlertBanner";
import { useReportNotifications } from "@/hooks/useReportNotifications";
import { useSlaBreachAlerts } from "@/hooks/useSlaBreachAlerts";
import { useCapabilities } from "@/hooks/useCapabilities";

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
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <div className="flex-1 flex flex-col">
          <AppHeader />
          {showSlaBanner && (
            <div className="px-6 pt-4">
              <SlaAlertBanner />
            </div>
          )}
          <main className="flex-1 p-6 bg-background overflow-auto">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}