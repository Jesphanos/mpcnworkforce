/**
 * General Overseer Command Layer
 * 
 * Dedicated command interface for supreme authority with:
 * - System-wide override controls
 * - Governance restructuring tools
 * - Emergency actions
 * - Full audit visibility
 */

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Crown, 
  Shield, 
  AlertTriangle, 
  Activity, 
  Users, 
  FileText,
  Settings,
  Lock,
  History,
  TrendingUp,
  Building2,
  Scale,
  Zap,
  Eye,
  RefreshCcw
} from "lucide-react";
import { cn } from "@/lib/utils";
import { AuthorityConfirmDialog } from "@/components/ui/AuthorityConfirmDialog";

interface SystemStatus {
  id: string;
  name: string;
  status: "operational" | "warning" | "critical";
  lastCheck: string;
}

const SYSTEM_STATUSES: SystemStatus[] = [
  { id: "auth", name: "Authentication", status: "operational", lastCheck: "2m ago" },
  { id: "database", name: "Database", status: "operational", lastCheck: "1m ago" },
  { id: "reports", name: "Report Processing", status: "operational", lastCheck: "3m ago" },
  { id: "trading", name: "Trading Engine", status: "warning", lastCheck: "5m ago" },
  { id: "payroll", name: "Payroll System", status: "operational", lastCheck: "2m ago" },
  { id: "investments", name: "Investment Module", status: "operational", lastCheck: "1m ago" },
];

interface EmergencyAction {
  id: string;
  name: string;
  description: string;
  severity: "medium" | "high" | "critical";
  icon: React.ElementType;
}

const EMERGENCY_ACTIONS: EmergencyAction[] = [
  {
    id: "freeze_trading",
    name: "Freeze All Trading",
    description: "Immediately halt all trading operations system-wide",
    severity: "critical",
    icon: Lock,
  },
  {
    id: "lock_payroll",
    name: "Lock Payroll Processing",
    description: "Prevent any payroll calculations or disbursements",
    severity: "high",
    icon: Lock,
  },
  {
    id: "suspend_signups",
    name: "Suspend New Signups",
    description: "Temporarily disable new user registrations",
    severity: "medium",
    icon: Users,
  },
  {
    id: "force_logout",
    name: "Force Global Logout",
    description: "Sign out all users and invalidate sessions",
    severity: "high",
    icon: RefreshCcw,
  },
];

export function OverseerCommandLayer() {
  const [selectedAction, setSelectedAction] = useState<EmergencyAction | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const handleEmergencyAction = (action: EmergencyAction) => {
    setSelectedAction(action);
    setConfirmOpen(true);
  };

  const executeAction = async (reason?: string) => {
    // In real implementation, this would call the appropriate edge function
    console.log("Executing action:", selectedAction?.id, "Reason:", reason);
    setConfirmOpen(false);
    setSelectedAction(null);
  };

  return (
    <div className="space-y-6">
      {/* Supreme Authority Header */}
      <div className="bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/20 rounded-xl p-6">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-xl bg-amber-500/20">
            <Crown className="h-8 w-8 text-amber-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
              Command Center
              <Badge variant="outline" className="border-amber-500/50 text-amber-600">
                Supreme Authority
              </Badge>
            </h2>
            <p className="text-sm text-muted-foreground">
              Full governance control. All actions are permanently logged.
            </p>
          </div>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid grid-cols-5 w-full max-w-2xl">
          <TabsTrigger value="overview" className="gap-2">
            <Activity className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="governance" className="gap-2">
            <Scale className="h-4 w-4" />
            Governance
          </TabsTrigger>
          <TabsTrigger value="emergency" className="gap-2">
            <AlertTriangle className="h-4 w-4" />
            Emergency
          </TabsTrigger>
          <TabsTrigger value="overrides" className="gap-2">
            <Shield className="h-4 w-4" />
            Overrides
          </TabsTrigger>
          <TabsTrigger value="audit" className="gap-2">
            <History className="h-4 w-4" />
            Audit
          </TabsTrigger>
        </TabsList>

        {/* System Overview */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {SYSTEM_STATUSES.map((system) => (
              <Card key={system.id} className="relative overflow-hidden">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">{system.name}</p>
                      <p className="text-xs text-muted-foreground">
                        Last check: {system.lastCheck}
                      </p>
                    </div>
                    <Badge
                      variant="outline"
                      className={cn(
                        system.status === "operational" && "border-green-500/50 text-green-600 bg-green-500/10",
                        system.status === "warning" && "border-amber-500/50 text-amber-600 bg-amber-500/10",
                        system.status === "critical" && "border-red-500/50 text-red-600 bg-red-500/10"
                      )}
                    >
                      {system.status}
                    </Badge>
                  </div>
                </CardContent>
                <div 
                  className={cn(
                    "absolute bottom-0 left-0 right-0 h-1",
                    system.status === "operational" && "bg-green-500",
                    system.status === "warning" && "bg-amber-500",
                    system.status === "critical" && "bg-red-500"
                  )}
                />
              </Card>
            ))}
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <Users className="h-6 w-6 mx-auto text-muted-foreground mb-2" />
                <p className="text-2xl font-bold">1,234</p>
                <p className="text-xs text-muted-foreground">Active Users</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <FileText className="h-6 w-6 mx-auto text-muted-foreground mb-2" />
                <p className="text-2xl font-bold">456</p>
                <p className="text-xs text-muted-foreground">Pending Reports</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <TrendingUp className="h-6 w-6 mx-auto text-muted-foreground mb-2" />
                <p className="text-2xl font-bold">$2.4M</p>
                <p className="text-xs text-muted-foreground">Total Investments</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <Building2 className="h-6 w-6 mx-auto text-muted-foreground mb-2" />
                <p className="text-2xl font-bold">12</p>
                <p className="text-xs text-muted-foreground">Departments</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Governance Controls */}
        <TabsContent value="governance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Scale className="h-5 w-5" />
                Governance Structure
              </CardTitle>
              <CardDescription>
                Manage organizational hierarchy and role assignments
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button variant="outline" className="justify-start h-auto p-4">
                  <div className="flex items-center gap-3">
                    <Users className="h-5 w-5 text-blue-600" />
                    <div className="text-left">
                      <p className="font-medium">Department Management</p>
                      <p className="text-xs text-muted-foreground">
                        Restructure departments and assign heads
                      </p>
                    </div>
                  </div>
                </Button>
                
                <Button variant="outline" className="justify-start h-auto p-4">
                  <div className="flex items-center gap-3">
                    <Shield className="h-5 w-5 text-purple-600" />
                    <div className="text-left">
                      <p className="font-medium">Role Assignments</p>
                      <p className="text-xs text-muted-foreground">
                        Manage administrator and lead roles
                      </p>
                    </div>
                  </div>
                </Button>
                
                <Button variant="outline" className="justify-start h-auto p-4">
                  <div className="flex items-center gap-3">
                    <Settings className="h-5 w-5 text-gray-600" />
                    <div className="text-left">
                      <p className="font-medium">Platform Settings</p>
                      <p className="text-xs text-muted-foreground">
                        Configure system-wide policies
                      </p>
                    </div>
                  </div>
                </Button>
                
                <Button variant="outline" className="justify-start h-auto p-4">
                  <div className="flex items-center gap-3">
                    <Eye className="h-5 w-5 text-green-600" />
                    <div className="text-left">
                      <p className="font-medium">Transparency Controls</p>
                      <p className="text-xs text-muted-foreground">
                        Set disclosure and visibility rules
                      </p>
                    </div>
                  </div>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Emergency Actions */}
        <TabsContent value="emergency" className="space-y-6">
          <Card className="border-red-500/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-600">
                <AlertTriangle className="h-5 w-5" />
                Emergency Actions
              </CardTitle>
              <CardDescription>
                Critical system controls. Use with extreme caution.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {EMERGENCY_ACTIONS.map((action) => {
                const Icon = action.icon;
                return (
                  <div
                    key={action.id}
                    className={cn(
                      "flex items-center justify-between p-4 rounded-lg border",
                      action.severity === "critical" && "border-red-500/30 bg-red-500/5",
                      action.severity === "high" && "border-amber-500/30 bg-amber-500/5",
                      action.severity === "medium" && "border-yellow-500/30 bg-yellow-500/5"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className={cn(
                        "h-5 w-5",
                        action.severity === "critical" && "text-red-600",
                        action.severity === "high" && "text-amber-600",
                        action.severity === "medium" && "text-yellow-600"
                      )} />
                      <div>
                        <p className="font-medium text-sm">{action.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {action.description}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant={action.severity === "critical" ? "destructive" : "outline"}
                      size="sm"
                      onClick={() => handleEmergencyAction(action)}
                    >
                      <Zap className="h-4 w-4 mr-1" />
                      Execute
                    </Button>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Override Controls */}
        <TabsContent value="overrides" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Override Authority
              </CardTitle>
              <CardDescription>
                Override administrative decisions with mandatory justification
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Use the module-specific pages to perform overrides. All override actions
                will require multi-step confirmation and justification.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Audit Trail */}
        <TabsContent value="audit" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="h-5 w-5" />
                Global Audit Trail
              </CardTitle>
              <CardDescription>
                Complete visibility across all system actions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Access the Activity History page for comprehensive audit logs across
                all modules and user actions.
              </p>
              <Button variant="outline" className="mt-4">
                View Full Audit Trail
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Emergency Action Confirmation */}
      {selectedAction && (
        <AuthorityConfirmDialog
          open={confirmOpen}
          onOpenChange={setConfirmOpen}
          role="general_overseer"
          title={selectedAction.name}
          description={selectedAction.description}
          actionLabel="Execute Action"
          variant={selectedAction.severity === "critical" ? "destructive" : "warning"}
          impactSummary={[
            "This action will take effect immediately",
            "All affected users will be notified",
            "This action is logged in the permanent audit trail",
          ]}
          requiresReason
          onConfirm={executeAction}
        />
      )}
    </div>
  );
}
