import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { TeamStats } from "@/components/team/TeamStats";
import { TeamMembersCard } from "@/components/team/TeamMembersCard";
import { TeamTasksTable } from "@/components/team/TeamTasksTable";
import { TeamReportsTable } from "@/components/team/TeamReportsTable";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ClipboardList, FileText } from "lucide-react";

export default function TeamDashboard() {
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
