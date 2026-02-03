import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Loader2, Lock, Unlock, AlertTriangle } from "lucide-react";
import { useFeatureAccessAdmin } from "@/hooks/useFeatureAccess";
import { Alert, AlertDescription } from "@/components/ui/alert";

type AppRole = "employee" | "trader" | "team_lead" | "department_head" | "report_admin" | "finance_hr_admin" | "investment_admin" | "user_admin" | "general_overseer";

const ROUTES = [
  { id: "trading", label: "Trading", description: "Trading terminal and positions" },
  { id: "investments", label: "Investments", description: "Investment management and financials" },
  { id: "reports", label: "Reports", description: "Work reports and submissions" },
  { id: "tasks", label: "Tasks", description: "Task management and assignments" },
  { id: "team", label: "Team Dashboard", description: "Team overview and management" },
  { id: "finance_hr", label: "Finance & HR", description: "Payroll and HR functions" },
  { id: "governance", label: "Governance", description: "Governance hub and resolution" },
  { id: "users", label: "User Management", description: "User accounts and roles" },
  { id: "activity", label: "Activity Logs", description: "Audit trail and history" },
  { id: "learn", label: "MPCN Learn", description: "Learning modules and certifications" },
];

const CONTROLLABLE_ROLES: { id: AppRole; label: string }[] = [
  { id: "employee", label: "Worker" },
  { id: "trader", label: "Trader" },
  { id: "team_lead", label: "Team Lead" },
  { id: "department_head", label: "Dept Head" },
  { id: "report_admin", label: "Report Admin" },
  { id: "finance_hr_admin", label: "Finance/HR" },
  { id: "investment_admin", label: "Investment" },
  { id: "user_admin", label: "User Admin" },
];

export function FeatureAccessManager() {
  const { config, isLoading, toggleRouteForRole, updateFeatureAccess } = useFeatureAccessAdmin();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const isRouteDisabledForRole = (route: string, role: AppRole): boolean => {
    return config.disabled_routes?.[route]?.includes(role) || false;
  };

  const handleToggle = (route: string, role: AppRole, currentlyEnabled: boolean) => {
    toggleRouteForRole(route, role, !currentlyEnabled);
  };

  return (
    <div className="space-y-6">
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          Feature access controls restrict which pages are available to each role. 
          Disabled features will redirect users to the access denied page.
          The General Overseer always has full access.
        </AlertDescription>
      </Alert>

      <div className="space-y-4">
        {ROUTES.map((route) => {
          const disabledRolesCount = config.disabled_routes?.[route.id]?.length || 0;
          
          return (
            <Card key={route.id}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-base flex items-center gap-2">
                      {disabledRolesCount > 0 ? (
                        <Lock className="h-4 w-4 text-warning" />
                      ) : (
                        <Unlock className="h-4 w-4 text-success" />
                      )}
                      {route.label}
                    </CardTitle>
                    <CardDescription>{route.description}</CardDescription>
                  </div>
                  {disabledRolesCount > 0 && (
                    <Badge variant="outline" className="text-warning border-warning">
                      {disabledRolesCount} role{disabledRolesCount > 1 ? "s" : ""} restricted
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {CONTROLLABLE_ROLES.map((role) => {
                    const isDisabled = isRouteDisabledForRole(route.id, role.id);
                    
                    return (
                      <div 
                        key={role.id} 
                        className="flex items-center justify-between p-2 rounded-lg border bg-muted/30"
                      >
                        <span className="text-sm font-medium">{role.label}</span>
                        <Switch
                          checked={!isDisabled}
                          onCheckedChange={() => handleToggle(route.id, role.id, !isDisabled)}
                          disabled={updateFeatureAccess.isPending}
                        />
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
