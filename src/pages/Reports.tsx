import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { RoleAuthorityBanner } from "@/components/ui/RoleAuthorityBanner";
import { ReportSubmissionForm } from "@/components/reports/ReportSubmissionForm";
import { ReportsTable } from "@/components/reports/ReportsTable";
import { ReportsStats } from "@/components/reports/ReportsStats";
import { ReportsCharts } from "@/components/reports/ReportsCharts";
import { ReportBulkActions } from "@/components/reports/ReportBulkActions";
import { AuditLogsTable } from "@/components/audit/AuditLogsTable";
import { DataTablePagination } from "@/components/ui/data-table-pagination";
import { usePaginatedWorkReports } from "@/hooks/usePaginatedWorkReports";
import { useAuth } from "@/contexts/AuthContext";
import { useBulkSelection } from "@/components/ui/bulk-actions";
import { Search } from "lucide-react";

export default function Reports() {
  const { hasRole, user } = useAuth();
  const isTeamLead = hasRole("team_lead");
  const isAdmin = hasRole("report_admin");
  
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState(isAdmin || isTeamLead ? "review" : "my-reports");
  
  // Paginated data for different tabs
  const myReportsQuery = usePaginatedWorkReports({ 
    searchQuery,
    // For my-reports, the hook already filters by user
  });
  
  const pendingQuery = usePaginatedWorkReports({
    finalStatus: "pending",
    teamLeadStatus: undefined,
    searchQuery,
  });
  
  const overridesQuery = usePaginatedWorkReports({
    teamLeadStatus: "rejected",
    finalStatus: "pending",
    searchQuery,
  });
  
  const allReportsQuery = usePaginatedWorkReports({ searchQuery });

  // Bulk selection
  const myReportsBulk = useBulkSelection<string>((id) => id);
  const reviewBulk = useBulkSelection<string>((id) => id);

  const getActiveQuery = () => {
    switch (activeTab) {
      case "my-reports":
        return myReportsQuery;
      case "review":
        return pendingQuery;
      case "overrides":
        return overridesQuery;
      case "all":
        return allReportsQuery;
      default:
        return myReportsQuery;
    }
  };

  const { data: reports, pagination, isLoading } = getActiveQuery();
  
  // Filter my reports client-side (until the hook is enhanced)
  const myReports = activeTab === "my-reports" 
    ? reports.filter((r) => r.user_id === user?.id)
    : reports;

  if (isLoading && reports.length === 0) {
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

        {/* Search */}
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search reports..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        <Tabs 
          defaultValue={isAdmin || isTeamLead ? "review" : "my-reports"} 
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-4"
        >
          <TabsList>
            <TabsTrigger value="my-reports">My Reports</TabsTrigger>
            {(isTeamLead || isAdmin) && (
              <TabsTrigger value="review">
                Review ({pendingQuery.data.length})
              </TabsTrigger>
            )}
            {isAdmin && (
              <TabsTrigger value="overrides">
                Needs Override ({overridesQuery.data.length})
              </TabsTrigger>
            )}
            {isAdmin && <TabsTrigger value="all">All Reports</TabsTrigger>}
            {isAdmin && <TabsTrigger value="audit">Audit Logs</TabsTrigger>}
          </TabsList>

          <TabsContent value="my-reports" className="space-y-4">
            <ReportSubmissionForm />
            <ReportsTable reports={myReports} />
            <DataTablePagination pagination={pagination} />
          </TabsContent>

          {(isTeamLead || isAdmin) && (
            <TabsContent value="review" className="space-y-4">
              <ReportBulkActions
                selectedIds={reviewBulk.selectedItems}
                reports={pendingQuery.data}
                onClearSelection={reviewBulk.clearSelection}
              />
              <ReportsTable 
                reports={pendingQuery.data} 
                showActions 
                showRateEdit 
              />
              <DataTablePagination pagination={pendingQuery.pagination} />
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
              <ReportsTable reports={overridesQuery.data} showActions showRateEdit />
              <DataTablePagination pagination={overridesQuery.pagination} />
            </TabsContent>
          )}

          {isAdmin && (
            <TabsContent value="all" className="space-y-4">
              <ReportsTable reports={allReportsQuery.data} showActions showRateEdit />
              <DataTablePagination pagination={allReportsQuery.pagination} />
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
