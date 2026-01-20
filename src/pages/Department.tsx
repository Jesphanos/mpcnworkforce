import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/contexts/AuthContext";
import { useDepartments } from "@/hooks/useDepartments";
import { useTeams, Team } from "@/hooks/useTeams";
import { DepartmentManagement } from "@/components/governance/DepartmentManagement";
import { DepartmentHierarchy } from "@/components/governance/DepartmentHierarchy";
import { 
  Building2, 
  Users, 
  TrendingUp, 
  AlertTriangle,
  Clock,
  BarChart3,
} from "lucide-react";

export default function Department() {
  const { hasRole, role } = useAuth();
  const { data: departments, isLoading: deptLoading } = useDepartments();
  const { teams, isLoading: teamsLoading } = useTeams();

  const isOverseer = hasRole("general_overseer");
  const isDepartmentHead = role === "department_head";
  const isAdmin = hasRole("user_admin") || isOverseer;

  const isLoading = deptLoading || teamsLoading;

  // Calculate department stats
  const totalDepartments = departments?.length || 0;
  const activeDepartments = departments?.filter(d => d.is_active).length || 0;
  const totalTeams = teams?.length || 0;

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <Skeleton className="h-8 w-64" />
          <div className="grid gap-4 md:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <Building2 className="h-6 w-6" />
              {isDepartmentHead ? "My Department" : "Departments"}
            </h1>
            <p className="text-muted-foreground">
              {isDepartmentHead 
                ? "Manage your department teams and monitor performance"
                : "Organizational structure and department management"}
            </p>
          </div>
          {isAdmin && (
            <Badge variant="secondary" className="gap-1">
              <Building2 className="h-3 w-3" />
              {totalDepartments} Departments
            </Badge>
          )}
        </div>

        {/* Department Head Quick Stats */}
        {isDepartmentHead && (
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Teams Under Me</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalTeams}</div>
                <p className="text-xs text-muted-foreground">Active teams in your department</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Pending Reviews</CardTitle>
                <Clock className="h-4 w-4 text-warning" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-warning">—</div>
                <p className="text-xs text-muted-foreground">Reports awaiting your review</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">This Week's Output</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">—</div>
                <p className="text-xs text-muted-foreground">Total approved hours</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Performance</CardTitle>
                <TrendingUp className="h-4 w-4 text-success" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-success">—</div>
                <p className="text-xs text-muted-foreground">Approval rate this month</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Admin View Tabs */}
        {isAdmin && (
          <Tabs defaultValue="overview" className="space-y-4">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="hierarchy">Hierarchy</TabsTrigger>
              <TabsTrigger value="manage">Manage</TabsTrigger>
            </TabsList>

            <TabsContent value="overview">
              <div className="grid gap-4 md:grid-cols-3">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">Total Departments</CardTitle>
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{totalDepartments}</div>
                    <p className="text-xs text-muted-foreground">
                      {activeDepartments} active
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">Total Teams</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{totalTeams}</div>
                    <p className="text-xs text-muted-foreground">Across all departments</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">Unassigned Teams</CardTitle>
                    <AlertTriangle className="h-4 w-4 text-warning" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-warning">
                      {teams?.filter(t => !t.department_id).length || 0}
                    </div>
                    <p className="text-xs text-muted-foreground">Teams without a department</p>
                  </CardContent>
                </Card>
              </div>

              {/* Departments List */}
              <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {departments?.map((dept) => {
                  const deptTeams = teams?.filter(t => t.department_id === dept.id) || [];
                  return (
                    <Card key={dept.id} className="hover:shadow-md transition-shadow">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg">{dept.name}</CardTitle>
                          <Badge variant={dept.is_active ? "default" : "secondary"}>
                            {dept.is_active ? "Active" : "Inactive"}
                          </Badge>
                        </div>
                        <CardDescription>{dept.description || "No description"}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Users className="h-4 w-4" />
                            {deptTeams.length} teams
                          </div>
                          {dept.skill_focus && (
                            <Badge variant="outline" className="text-xs">
                              {dept.skill_focus}
                            </Badge>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </TabsContent>

            <TabsContent value="hierarchy">
              <DepartmentHierarchy />
            </TabsContent>

            <TabsContent value="manage">
              <DepartmentManagement />
            </TabsContent>
          </Tabs>
        )}

        {/* Department Head View */}
        {isDepartmentHead && !isAdmin && (
          <Card>
            <CardHeader>
              <CardTitle>Your Department Teams</CardTitle>
              <CardDescription>
                Teams under your management and their current status
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {teams?.map((team) => (
                  <Card key={team.id} className="border">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">{team.name}</CardTitle>
                      <CardDescription className="text-xs">
                        {team.description || "No description"}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-2 text-sm">
                        {team.skill_focus && (
                          <Badge variant="outline" className="text-xs">
                            {team.skill_focus}
                          </Badge>
                        )}
                        {team.region && (
                          <Badge variant="secondary" className="text-xs">
                            {team.region}
                          </Badge>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
                {teams?.length === 0 && (
                  <p className="text-muted-foreground col-span-full text-center py-8">
                    No teams assigned to your department yet.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
