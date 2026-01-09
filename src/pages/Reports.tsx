import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { RoleAuthorityBanner } from "@/components/ui/RoleAuthorityBanner";
import { ReportSubmissionForm } from "@/components/reports/ReportSubmissionForm";
import { ReportsTable } from "@/components/reports/ReportsTable";
import { ReportsStats } from "@/components/reports/ReportsStats";
import { ReportsCharts } from "@/components/reports/ReportsCharts";
import { AuditLogsTable } from "@/components/audit/AuditLogsTable";
import { useWorkReports } from "@/hooks/useWorkReports";
import { useAuth } from "@/contexts/AuthContext";

export default function Reports() {
  const { data: reports, isLoading } = useWorkReports();
  const { hasRole, user } = useAuth();
  const isTeamLead = hasRole("team_lead");
  const isAdmin = hasRole("report_admin");

  const myReports = reports?.filter((r) => r.user_id === user?.id) || [];
  const pendingReports = reports?.filter((r) => r.final_status === "pending" && !r.team_lead_status) || [];
  const rejectedByTL = reports?.filter((r) => r.team_lead_status === "rejected" && r.final_status === "pending") || [];

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
            {isAdmin 
              ? "View and approve employee reports with admin override" 
              : isTeamLead 
              ? "Review and approve team reports (non-final rejections)"
              : "Submit and track your work reports"}
          </p>
        </div>

        {/* Role-specific authority banners */}
        {isAdmin && (
          <RoleAuthorityBanner
            variant="warning"
            title="Admin actions are logged and visible to the General Overseer"
            description="All approvals, rejections, and overrides require justification and are permanently recorded."
          />
        )}
        {isTeamLead && !isAdmin && (
          <RoleAuthorityBanner
            variant="constraint"
            title="Review Only — Final approval handled by Admin"
            description="Your approvals move reports to the admin queue. Revisions help team members improve."
          />
        )}

        <ReportsStats reports={myReports} />

        <ReportsCharts reports={myReports} />

        <Tabs defaultValue={isAdmin || isTeamLead ? "review" : "my-reports"} className="space-y-4">
          <TabsList>
            <TabsTrigger value="my-reports">My Reports</TabsTrigger>
            {(isTeamLead || isAdmin) && (
              <TabsTrigger value="review">
                Review ({pendingReports.length})
              </TabsTrigger>
            )}
            {isAdmin && (
              <TabsTrigger value="overrides">
                Needs Override ({rejectedByTL.length})
              </TabsTrigger>
            )}
            {isAdmin && <TabsTrigger value="all">All Reports</TabsTrigger>}
            {isAdmin && <TabsTrigger value="audit">Audit Logs</TabsTrigger>}
          </TabsList>

          <TabsContent value="my-reports" className="space-y-4">
            <ReportSubmissionForm />
            <ReportsTable reports={myReports} />
          </TabsContent>

          {(isTeamLead || isAdmin) && (
            <TabsContent value="review" className="space-y-4">
              <ReportsTable reports={pendingReports} showActions showRateEdit />
            </TabsContent>
          )}

          {isAdmin && (
            <TabsContent value="overrides" className="space-y-4">
              <div className="bg-warning/10 border border-warning/20 rounded-lg p-4 mb-4">
                <h3 className="font-medium text-warning">Reports Requiring Admin Override</h3>
                <p className="text-sm text-muted-foreground">
                  These reports were rejected by team leads but can be overridden by admins.
                </p>
              </div>
              <ReportsTable reports={rejectedByTL} showActions showRateEdit />
            </TabsContent>
          )}

          {isAdmin && (
            <TabsContent value="all" className="space-y-4">
              <ReportsTable reports={reports || []} showActions showRateEdit />
            </TabsContent>
          )}

          {isAdmin && (
            <TabsContent value="audit" className="space-y-4">
              <AuditLogsTable entityType="work_report" />
            </TabsContent>
          )}
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
