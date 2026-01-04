import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { TaskForm } from "@/components/tasks/TaskForm";
import { TasksTable } from "@/components/tasks/TasksTable";
import { AuditLogsTable } from "@/components/audit/AuditLogsTable";
import { useTasks } from "@/hooks/useTasks";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ClipboardList, Clock, CheckCircle, XCircle, DollarSign } from "lucide-react";

export default function Tasks() {
  const { data: tasks, isLoading } = useTasks();
  const { hasRole, user } = useAuth();
  const isTeamLead = hasRole("team_lead");
  const isAdmin = hasRole("report_admin");

  const myTasks = tasks?.filter((t) => t.user_id === user?.id) || [];
  const pendingTasks = tasks?.filter((t) => 
    t.final_status === "pending" && 
    (!t.team_lead_status || t.team_lead_status === "revision_requested")
  ) || [];
  const rejectedByTL = tasks?.filter((t) => t.team_lead_status === "rejected" && t.final_status === "pending") || [];

  // Stats
  const totalEarnings = myTasks.reduce((sum, t) => sum + Number(t.calculated_earnings), 0);
  const approvedTasks = myTasks.filter((t) => t.final_status === "approved").length;
  const pendingCount = myTasks.filter((t) => t.final_status === "pending").length;

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <Skeleton className="h-8 w-48" />
          <div className="grid gap-4 md:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
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
          <h1 className="text-2xl font-bold text-foreground">Tasks Management</h1>
          <p className="text-muted-foreground">
            {isAdmin
              ? "Review tasks with admin override capabilities"
              : isTeamLead
              ? "Review and approve team tasks"
              : "Submit and track your tasks with mutable rates"}
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
              <ClipboardList className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{myTasks.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
              <Clock className="h-4 w-4 text-warning" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pendingCount}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Approved</CardTitle>
              <CheckCircle className="h-4 w-4 text-success" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{approvedTasks}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
              <DollarSign className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${totalEarnings.toFixed(2)}</div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue={isTeamLead || isAdmin ? "review" : "my-tasks"} className="space-y-4">
          <TabsList>
            <TabsTrigger value="my-tasks">My Tasks</TabsTrigger>
            {(isTeamLead || isAdmin) && (
              <TabsTrigger value="review">
                Review ({pendingTasks.length})
              </TabsTrigger>
            )}
            {isAdmin && (
              <TabsTrigger value="overrides">
                Needs Override ({rejectedByTL.length})
              </TabsTrigger>
            )}
            {isAdmin && <TabsTrigger value="audit">Audit Logs</TabsTrigger>}
          </TabsList>

          <TabsContent value="my-tasks" className="space-y-4">
            <TaskForm />
            <TasksTable tasks={myTasks} showRateEdit />
          </TabsContent>

          {(isTeamLead || isAdmin) && (
            <TabsContent value="review" className="space-y-4">
              <TasksTable tasks={pendingTasks} showActions showRateEdit />
            </TabsContent>
          )}

          {isAdmin && (
            <TabsContent value="overrides" className="space-y-4">
              <div className="bg-warning/10 border border-warning/20 rounded-lg p-4 mb-4">
                <h3 className="font-medium text-warning">Tasks Requiring Admin Override</h3>
                <p className="text-sm text-muted-foreground">
                  These tasks were rejected by team leads but can be overridden by admins.
                </p>
              </div>
              <TasksTable tasks={rejectedByTL} showActions showRateEdit />
            </TabsContent>
          )}

          {isAdmin && (
            <TabsContent value="audit" className="space-y-4">
              <AuditLogsTable entityType="task" />
            </TabsContent>
          )}
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
