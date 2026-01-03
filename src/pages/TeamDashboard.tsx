import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { TeamStats } from "@/components/team/TeamStats";
import { TeamMembersCard } from "@/components/team/TeamMembersCard";
import { TeamTasksTable } from "@/components/team/TeamTasksTable";
import { TeamReportsTable } from "@/components/team/TeamReportsTable";
import { OverseerStats } from "@/components/team/OverseerStats";
import { MemberPerformanceTable } from "@/components/team/MemberPerformanceTable";
import { PeriodEarningsTable } from "@/components/team/PeriodEarningsTable";
import { TeamPerformanceCharts } from "@/components/team/TeamPerformanceCharts";
import { TeamGroupsView } from "@/components/team/TeamGroupsView";
import { OverseerFilters } from "@/components/team/OverseerFilters";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ClipboardList, FileText, Users, BarChart3, DollarSign, Building2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { OverseerFilters as FilterType } from "@/hooks/useOverseerData";

export default function TeamDashboard() {
  const { role } = useAuth();
  const isOverseer = role === "general_overseer";
  const [filters, setFilters] = useState<FilterType>({});

  if (isOverseer) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Organization Overview</h1>
            <p className="text-muted-foreground">
              Complete view of all teams, members, performance, and financials
            </p>
          </div>

          <OverseerFilters filters={filters} onFiltersChange={setFilters} />

          <OverseerStats filters={filters} />

          <Tabs defaultValue="teams" className="space-y-4">
            <TabsList className="flex-wrap">
              <TabsTrigger value="teams" className="flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                Teams
              </TabsTrigger>
              <TabsTrigger value="performance" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Individual Performance
              </TabsTrigger>
              <TabsTrigger value="analytics" className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                Analytics
              </TabsTrigger>
              <TabsTrigger value="salary" className="flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Salary Periods
              </TabsTrigger>
              <TabsTrigger value="tasks" className="flex items-center gap-2">
                <ClipboardList className="h-4 w-4" />
                All Tasks
              </TabsTrigger>
              <TabsTrigger value="reports" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                All Reports
              </TabsTrigger>
            </TabsList>

            <TabsContent value="teams">
              <TeamGroupsView filters={filters} />
            </TabsContent>

            <TabsContent value="performance">
              <MemberPerformanceTable filters={filters} />
            </TabsContent>

            <TabsContent value="analytics">
              <TeamPerformanceCharts filters={filters} />
            </TabsContent>

            <TabsContent value="salary">
              <PeriodEarningsTable />
            </TabsContent>

            <TabsContent value="tasks">
              <Card>
                <CardHeader>
                  <CardTitle>All Team Tasks</CardTitle>
                  <CardDescription>
                    Review and manage all tasks across the organization
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <TeamTasksTable />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="reports">
              <Card>
                <CardHeader>
                  <CardTitle>All Team Reports</CardTitle>
                  <CardDescription>
                    Review and manage all work reports across the organization
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <TeamReportsTable />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </DashboardLayout>
    );
  }

  // Team Lead view (original)
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Team Dashboard</h1>
          <p className="text-muted-foreground">
            Overview of your team's tasks and reports
          </p>
        </div>

        <TeamStats />

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <Tabs defaultValue="tasks" className="space-y-4">
              <TabsList>
                <TabsTrigger value="tasks" className="flex items-center gap-2">
                  <ClipboardList className="h-4 w-4" />
                  Tasks
                </TabsTrigger>
                <TabsTrigger value="reports" className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Reports
                </TabsTrigger>
              </TabsList>
              <TabsContent value="tasks">
                <Card>
                  <CardHeader>
                    <CardTitle>Team Tasks</CardTitle>
                    <CardDescription>
                      Review and manage all team member tasks
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <TeamTasksTable />
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="reports">
                <Card>
                  <CardHeader>
                    <CardTitle>Team Reports</CardTitle>
                    <CardDescription>
                      Review and manage all team member work reports
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <TeamReportsTable />
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          <div>
            <TeamMembersCard />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
