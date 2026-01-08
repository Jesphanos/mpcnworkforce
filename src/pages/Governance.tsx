import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AttentionSignalsList } from "@/components/governance/AttentionSignalsList";
import { AdminResolutionPanel } from "@/components/governance/AdminResolutionPanel";
import { DepartmentManagement } from "@/components/governance/DepartmentManagement";
import { Shield, MessageCircle, Building2, AlertTriangle } from "lucide-react";
import { useAttentionSignals } from "@/hooks/useAttentionSignals";
import { useResolutionRequests } from "@/hooks/useResolutionRequests";
import { Badge } from "@/components/ui/badge";

export default function Governance() {
  const { data: signals } = useAttentionSignals({ unresolvedOnly: true });
  const { data: requests } = useResolutionRequests();

  const unresolvedSignals = signals?.filter(s => !s.resolved_at).length || 0;
  const openRequests = requests?.filter(r => r.status !== "resolved").length || 0;
  const overdueRequests = requests?.filter(
    r => r.sla_due_at && new Date(r.sla_due_at) < new Date() && r.status !== "resolved"
  ).length || 0;

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Governance</h1>
            <p className="text-muted-foreground">
              Manage attention signals, resolution requests, and organizational structure
            </p>
          </div>
          {overdueRequests > 0 && (
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-destructive/10 text-destructive">
              <AlertTriangle className="h-4 w-4" />
              <span className="text-sm font-medium">
                {overdueRequests} SLA {overdueRequests === 1 ? "breach" : "breaches"}
              </span>
            </div>
          )}
        </div>

        <Tabs defaultValue="signals" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 lg:w-auto lg:grid-cols-none lg:flex">
            <TabsTrigger value="signals" className="gap-2">
              <Shield className="h-4 w-4" />
              Attention Signals
              {unresolvedSignals > 0 && (
                <Badge variant="destructive" className="ml-1 h-5 px-1.5">
                  {unresolvedSignals}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="requests" className="gap-2">
              <MessageCircle className="h-4 w-4" />
              Resolution Requests
              {openRequests > 0 && (
                <Badge variant="secondary" className="ml-1 h-5 px-1.5">
                  {openRequests}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="departments" className="gap-2">
              <Building2 className="h-4 w-4" />
              Departments
            </TabsTrigger>
          </TabsList>

          <TabsContent value="signals" className="space-y-6">
            <AttentionSignalsList showResolved />
          </TabsContent>

          <TabsContent value="requests" className="space-y-6">
            <AdminResolutionPanel />
          </TabsContent>

          <TabsContent value="departments" className="space-y-6">
            <DepartmentManagement />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
