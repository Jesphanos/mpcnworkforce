import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TraderOnboardingWizard } from "@/components/trading/TraderOnboardingWizard";
import { TraderDashboard } from "@/components/trading/TraderDashboard";
import { TradeExecutionForm } from "@/components/trading/TradeExecutionForm";
import { TradeJournal } from "@/components/trading/TradeJournal";
import { TradingRealtimeStatus } from "@/components/trading/TradingRealtimeStatus";
import { EquityCurveChart } from "@/components/trading/EquityCurveChart";
import { useTraderProfile, useTraderTrades } from "@/hooks/useTrading";
import { useRealtimeTrades } from "@/hooks/useRealtimeTrades";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  LayoutDashboard,
  TrendingUp,
  BookOpen,
  GraduationCap,
  BarChart3,
  Lock,
} from "lucide-react";

export default function Trading() {
  const { data: profile, isLoading, refetch } = useTraderProfile();
  const { data: trades } = useTraderTrades(profile?.id, "closed");
  
  // Real-time trade updates
  const { isConnected, lastUpdate, trades: realtimeTrades } = useRealtimeTrades({
    traderId: profile?.id,
    enabled: !!profile?.id,
  });

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-96 w-full" />
        </div>
      </DashboardLayout>
    );
  }

  // Show onboarding if no trader profile
  if (!profile || !profile.onboarding_completed) {
    return (
      <DashboardLayout>
        <div className="space-y-6 animate-fade-in">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Trading</h1>
            <p className="text-muted-foreground">
              Complete your trader onboarding to access the trading environment
            </p>
          </div>
          <TraderOnboardingWizard onComplete={() => refetch()} />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Trading</h1>
            <p className="text-muted-foreground">
              Manage your trades, track performance, and maintain discipline
            </p>
          </div>
          <TradingRealtimeStatus isConnected={isConnected} lastUpdate={lastUpdate} />
        </div>

        <Tabs defaultValue="dashboard" className="space-y-6">
          <TabsList>
            <TabsTrigger value="dashboard" className="gap-2">
              <LayoutDashboard className="h-4 w-4" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="execute" className="gap-2">
              <TrendingUp className="h-4 w-4" />
              Execute
            </TabsTrigger>
            <TabsTrigger value="journal" className="gap-2">
              <BookOpen className="h-4 w-4" />
              Journal
            </TabsTrigger>
            <TabsTrigger value="analytics" className="gap-2">
              <BarChart3 className="h-4 w-4" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="education" className="gap-2">
              <GraduationCap className="h-4 w-4" />
              Education
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard">
            <TraderDashboard />
          </TabsContent>

          <TabsContent value="execute">
            <TradeExecutionForm />
          </TabsContent>

          <TabsContent value="journal">
            <TradeJournal />
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            {trades && trades.length > 0 ? (
              <EquityCurveChart trades={trades} startingBalance={10000} />
            ) : (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                  <BarChart3 className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="font-medium mb-2">No Trade Data Yet</h3>
                  <p className="text-sm text-muted-foreground max-w-sm">
                    Complete some trades to see your equity curve and performance analytics.
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="education">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="h-5 w-5" />
                  Education Coming Soon
                </CardTitle>
                <CardDescription>
                  Trading school integration and learning modules will be available here.
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center py-8">
                <GraduationCap className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                <p className="text-muted-foreground">
                  This feature is on our roadmap and will include:
                </p>
                <ul className="text-sm text-muted-foreground mt-4 space-y-1">
                  <li>• Trading school certifications</li>
                  <li>• Strategy documentation</li>
                  <li>• Risk management courses</li>
                  <li>• Market analysis tutorials</li>
                </ul>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
