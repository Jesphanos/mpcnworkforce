import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RoleAuthorityBanner } from "@/components/ui/RoleAuthorityBanner";
import { useAuth } from "@/contexts/AuthContext";
import { useCapabilities } from "@/hooks/useCapabilities";
import { useInvestments } from "@/hooks/useInvestments";

// Investor Components
import { InvestorProfileCard } from "./InvestorProfileCard";
import { InvestorSummaryCards } from "./InvestorSummaryCards";
import { InvestorInvestmentsTable } from "./InvestorInvestmentsTable";
import { InvestorWithdrawalsPanel } from "./InvestorWithdrawalsPanel";
import { InvestorAuditLogPanel } from "./InvestorAuditLogPanel";
import { InvestorNoticesPanel } from "./InvestorNoticesPanel";
import { InvestorDisclaimerBanner, InvestorLegalCard } from "./InvestorLegalDisclaimers";

// MPCN Performance (read-only)
import { InvestmentStats } from "./InvestmentStats";
import { InvestmentCharts } from "./InvestmentCharts";

import { 
  Wallet, 
  BarChart3, 
  ArrowDownToLine,
  History,
  Scale,
  Landmark,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

/**
 * Comprehensive Investor Dashboard
 * 
 * This is a dedicated, first-class dashboard for investors that:
 * - Clearly separates investment data from workforce data
 * - Shows honest profit AND loss information
 * - Provides withdrawal and reinvestment tracking
 * - Displays MPCN performance (read-only)
 * - Includes legal disclaimers and governance notices
 * 
 * GOVERNANCE RULE: Investment ≠ Operational Control
 */
export function ComprehensiveInvestorDashboard() {
  const { profile } = useAuth();
  const { isInvestor } = useCapabilities();
  const { data: investments } = useInvestments();
  if (!isInvestor()) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16">
          <Landmark className="h-16 w-16 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Not an Investor</h3>
          <p className="text-muted-foreground text-center max-w-md">
            You don't have investor status. Contact an administrator if you believe this is an error.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Read-Only Governance Banner */}
      <RoleAuthorityBanner
        variant="readonly"
        title="Investor Dashboard — Read-Only Access"
        description="This dashboard shows your investment performance. Investment does not grant operational control over employees, teams, or daily operations."
      />

      {/* Compact Disclaimer Banner */}
      <InvestorDisclaimerBanner />

      {/* Investor Profile Card */}
      <InvestorProfileCard />

      {/* Summary Stats */}
      <InvestorSummaryCards />

      {/* Main Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <Wallet className="h-4 w-4" />
            <span className="hidden sm:inline">Overview</span>
          </TabsTrigger>
          <TabsTrigger value="investments" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            <span className="hidden sm:inline">Investments</span>
          </TabsTrigger>
          <TabsTrigger value="withdrawals" className="flex items-center gap-2">
            <ArrowDownToLine className="h-4 w-4" />
            <span className="hidden sm:inline">Withdrawals</span>
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-2">
            <History className="h-4 w-4" />
            <span className="hidden sm:inline">History</span>
          </TabsTrigger>
          <TabsTrigger value="legal" className="flex items-center gap-2">
            <Scale className="h-4 w-4" />
            <span className="hidden sm:inline">Legal</span>
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <InvestorNoticesPanel />
            <InvestorAuditLogPanel />
          </div>

          {/* MPCN Performance - Read Only */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              MPCN Global Performance (Read-Only)
            </h3>
            <p className="text-sm text-muted-foreground">
              Aggregated platform performance. Individual employee data is not accessible.
            </p>
            <InvestmentStats investments={investments || []} />
            <InvestmentCharts investments={investments || []} />
          </div>
        </TabsContent>

        {/* Investments Tab */}
        <TabsContent value="investments" className="space-y-6">
          <InvestorInvestmentsTable />
        </TabsContent>

        {/* Withdrawals Tab */}
        <TabsContent value="withdrawals" className="space-y-6">
          <InvestorWithdrawalsPanel />
        </TabsContent>

        {/* History Tab */}
        <TabsContent value="history" className="space-y-6">
          <InvestorAuditLogPanel />
        </TabsContent>

        {/* Legal Tab */}
        <TabsContent value="legal" className="space-y-6">
          <InvestorLegalCard />
        </TabsContent>
      </Tabs>
    </div>
  );
}
