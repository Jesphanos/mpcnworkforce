import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { DateRangeFilter } from "@/components/dashboard/DateRangeFilter";
import { resolveDashboard, getRoleLabel } from "@/components/dashboard/DashboardRegistry";
import { useCapabilities } from "@/hooks/useCapabilities";
import { Button } from "@/components/ui/button";
import { DateRange } from "react-day-picker";
import { Download } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { exportDashboardToCSV, exportDashboardToPDF } from "@/lib/dashboardExport";
import { useDashboardStats } from "@/hooks/useDashboardStats";
import { useDashboardTrends } from "@/hooks/useDashboardTrends";
import { usePlatformDistribution } from "@/hooks/usePlatformDistribution";

export default function Dashboard() {
  const { role, profile } = useAuth();
  const { isInvestor, isOverseer, isTeamLead, isAdmin } = useCapabilities();
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const { data: stats, isLoading: statsLoading } = useDashboardStats(dateRange);
  const { data: trends } = useDashboardTrends(dateRange);
  const { data: platforms } = usePlatformDistribution(dateRange);

  const handleExportCSV = () => {
    if (!stats) return;
    exportDashboardToCSV({ stats, trends: trends || [], platforms: platforms || [], dateRange });
  };

  const handleExportPDF = () => {
    if (!stats) return;
    exportDashboardToPDF({ stats, trends: trends || [], platforms: platforms || [], dateRange });
  };

  // Determine if user is investor-only (has investor flag but default employee role with no workforce activity)
  const isInvestorOnly = isInvestor() && role === "employee" && !profile?.full_name;

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
            <p className="text-muted-foreground">{getRoleLabel(role)} Overview</p>
          </div>
          <div className="flex items-center gap-2">
            <DateRangeFilter dateRange={dateRange} onDateRangeChange={setDateRange} />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" disabled={statsLoading}>
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleExportCSV}>Export as CSV</DropdownMenuItem>
                <DropdownMenuItem onClick={handleExportPDF}>Export as PDF</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Role-specific Dashboard - using registry pattern */}
        {resolveDashboard({ role, isInvestorOnly, dateRange })}
      </div>
    </DashboardLayout>
  );
}
