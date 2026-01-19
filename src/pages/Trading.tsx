import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TraderOnboardingWizard } from "@/components/trading/TraderOnboardingWizard";
import { TraderDashboard } from "@/components/trading/TraderDashboard";
import { TradeExecutionForm } from "@/components/trading/TradeExecutionForm";
import { TradeJournal } from "@/components/trading/TradeJournal";
import { useTraderProfile } from "@/hooks/useTrading";
import { Skeleton } from "@/components/ui/skeleton";
import {
  LayoutDashboard,
  TrendingUp,
  BookOpen,
  GraduationCap,
  BarChart3,
} from "lucide-react";

export default function Trading() {
  const { data: profile, isLoading, refetch } = useTraderProfile();

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
        <div>
          <h1 className="text-2xl font-bold text-foreground">Trading</h1>
          <p className="text-muted-foreground">
            Manage your trades, track performance, and maintain discipline
          </p>
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
            <TabsTrigger value="education" className="gap-2">
              <GraduationCap className="h-4 w-4" />
              Education
            </TabsTrigger>
            <TabsTrigger value="reports" className="gap-2">
              <BarChart3 className="h-4 w-4" />
              Reports
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

          <TabsContent value="education">
            <div className="text-center py-12 text-muted-foreground">
              <GraduationCap className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">Education Coming Soon</p>
              <p>Trading school integration and learning modules will be available here.</p>
            </div>
          </TabsContent>

          <TabsContent value="reports">
            <div className="text-center py-12 text-muted-foreground">
              <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">Reports Coming Soon</p>
              <p>Daily, weekly, and monthly performance reports will be available here.</p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
