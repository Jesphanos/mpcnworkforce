import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { InvestmentForm } from "@/components/investments/InvestmentForm";
import { InvestmentsTable } from "@/components/investments/InvestmentsTable";
import { InvestmentStats } from "@/components/investments/InvestmentStats";
import { InvestmentCharts } from "@/components/investments/InvestmentCharts";
import { InvestorDashboard } from "@/components/investments/InvestorDashboard";
import { FinancialManagement } from "@/components/investments/FinancialManagement";
import { useInvestments } from "@/hooks/useInvestments";
import { useAuth } from "@/contexts/AuthContext";
import { useCapabilities } from "@/hooks/useCapabilities";
import { TrendingUp, Landmark, FileText } from "lucide-react";

export default function Investments() {
  const { data: investments, isLoading } = useInvestments();
  const { profile } = useAuth();
  const { can, isInvestor } = useCapabilities();
  
  const canManage = can("canManageInvestments");
  const showInvestorTab = isInvestor();

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <Skeleton className="h-8 w-48" />
          <div className="grid gap-4 md:grid-cols-5">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-24" />
            ))}
          </div>
          <Skeleton className="h-96" />
        </div>
      </DashboardLayout>
    );
  }

  // If user is only an investor (no admin access), show just their dashboard
  if (showInvestorTab && !canManage) {
    return (
      <DashboardLayout>
        <div className="space-y-6 animate-fade-in">
          <div>
            <h1 className="text-2xl font-bold text-foreground">My Investments</h1>
            <p className="text-muted-foreground">
              Track your investment portfolio and returns
            </p>
          </div>
          <InvestorDashboard />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Investments</h1>
          <p className="text-muted-foreground">
            {canManage ? "Track and manage organization investments" : "View organization investment portfolio"}
          </p>
        </div>

        {showInvestorTab && canManage ? (
          <Tabs defaultValue="portfolio" className="space-y-6">
            <TabsList>
              <TabsTrigger value="portfolio" className="gap-2">
                <Landmark className="h-4 w-4" />
                Portfolio
              </TabsTrigger>
              {canManage && (
                <TabsTrigger value="financials" className="gap-2">
                  <FileText className="h-4 w-4" />
                  Financials
                </TabsTrigger>
              )}
              <TabsTrigger value="my-investments" className="gap-2">
                <TrendingUp className="h-4 w-4" />
                My Investments
              </TabsTrigger>
            </TabsList>

            <TabsContent value="portfolio" className="space-y-6">
              <InvestmentStats investments={investments || []} />
              <InvestmentCharts investments={investments || []} />
              {canManage && <InvestmentForm />}
              <InvestmentsTable investments={investments || []} />
            </TabsContent>

            {canManage && (
              <TabsContent value="financials" className="space-y-6">
                <FinancialManagement />
              </TabsContent>
            )}

            <TabsContent value="my-investments">
              <InvestorDashboard />
            </TabsContent>
          </Tabs>
        ) : (
          <>
            <InvestmentStats investments={investments || []} />
            <InvestmentCharts investments={investments || []} />
            {canManage && <InvestmentForm />}
            <InvestmentsTable investments={investments || []} />
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
