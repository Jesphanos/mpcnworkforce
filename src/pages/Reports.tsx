import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { ReportSubmissionForm } from "@/components/reports/ReportSubmissionForm";
import { ReportsTable } from "@/components/reports/ReportsTable";
import { ReportsStats } from "@/components/reports/ReportsStats";
import { ReportsCharts } from "@/components/reports/ReportsCharts";
import { useWorkReports } from "@/hooks/useWorkReports";
import { useAuth } from "@/contexts/AuthContext";

export default function Reports() {
  const { data: reports, isLoading } = useWorkReports();
  const { hasRole, user } = useAuth();
  const isAdmin = hasRole("report_admin");

  const myReports = reports?.filter((r) => r.user_id === user?.id) || [];
  const pendingReports = reports?.filter((r) => r.status === "pending") || [];

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

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Reports Management</h1>
          <p className="text-muted-foreground">
            {isAdmin ? "View and approve employee reports" : "Submit and track your work reports"}
          </p>
        </div>

        <ReportsStats reports={myReports} />

        <ReportsCharts reports={myReports} />

        <Tabs defaultValue={isAdmin ? "review" : "my-reports"} className="space-y-4">
          <TabsList>
            <TabsTrigger value="my-reports">My Reports</TabsTrigger>
            {isAdmin && <TabsTrigger value="review">Review Reports ({pendingReports.length})</TabsTrigger>}
            {isAdmin && <TabsTrigger value="all">All Reports</TabsTrigger>}
          </TabsList>

          <TabsContent value="my-reports" className="space-y-4">
            <ReportSubmissionForm />
            <ReportsTable reports={myReports} />
          </TabsContent>

          {isAdmin && (
            <TabsContent value="review" className="space-y-4">
              <ReportsTable reports={pendingReports} showActions />
            </TabsContent>
          )}

          {isAdmin && (
            <TabsContent value="all" className="space-y-4">
              <ReportsTable reports={reports || []} showActions />
            </TabsContent>
          )}
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
