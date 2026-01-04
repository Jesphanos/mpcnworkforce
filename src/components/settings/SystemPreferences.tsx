import { useSystemSettings, useUpdateSystemSetting } from "@/hooks/useSettings";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Clock, DollarSign, GitBranch, Bell } from "lucide-react";

export function SystemPreferences() {
  const { data: settings, isLoading } = useSystemSettings();
  const updateSetting = useUpdateSystemSetting();

  const getSetting = (key: string) => {
    return settings?.find((s) => s.key === key);
  };

  const handleUpdate = async (key: string, value: Record<string, unknown>) => {
    await updateSetting.mutateAsync({ key, value });
  };

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-32" />
        ))}
      </div>
    );
  }

  const hoursPerDay = getSetting("default_hours_per_day");
  const currency = getSetting("currency");
  const workflow = getSetting("approval_workflow");
  const notifications = getSetting("notifications");

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {/* Working Hours */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary" />
            <CardTitle className="text-base">Working Hours</CardTitle>
          </div>
          <CardDescription>Default working hours per day</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <Label htmlFor="hours" className="whitespace-nowrap">Hours per day</Label>
            <Input
              id="hours"
              type="number"
              min="1"
              max="24"
              className="w-24"
              value={(hoursPerDay?.value as { value?: number })?.value || 8}
              onChange={(e) => handleUpdate("default_hours_per_day", { value: parseInt(e.target.value) || 8 })}
            />
          </div>
        </CardContent>
      </Card>

      {/* Currency */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-success" />
            <CardTitle className="text-base">Currency</CardTitle>
          </div>
          <CardDescription>System currency for earnings</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <Label htmlFor="currency" className="whitespace-nowrap">Currency</Label>
            <Select
              value={(currency?.value as { code?: string })?.code || "USD"}
              onValueChange={(value) => {
                const symbols: Record<string, string> = { USD: "$", EUR: "€", GBP: "£", NGN: "₦" };
                handleUpdate("currency", { code: value, symbol: symbols[value] || "$" });
              }}
            >
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="USD">USD ($)</SelectItem>
                <SelectItem value="EUR">EUR (€)</SelectItem>
                <SelectItem value="GBP">GBP (£)</SelectItem>
                <SelectItem value="NGN">NGN (₦)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Approval Workflow */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <GitBranch className="h-5 w-5 text-warning" />
            <CardTitle className="text-base">Approval Workflow</CardTitle>
          </div>
          <CardDescription>Configure approval requirements</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="team-lead" className="flex-1">Require Team Lead approval</Label>
            <Switch
              id="team-lead"
              checked={(workflow?.value as { require_team_lead?: boolean })?.require_team_lead ?? true}
              onCheckedChange={(checked) =>
                handleUpdate("approval_workflow", {
                  ...(workflow?.value as object),
                  require_team_lead: checked,
                })
              }
            />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="admin" className="flex-1">Require Admin approval</Label>
            <Switch
              id="admin"
              checked={(workflow?.value as { require_admin?: boolean })?.require_admin ?? true}
              onCheckedChange={(checked) =>
                handleUpdate("approval_workflow", {
                  ...(workflow?.value as object),
                  require_admin: checked,
                })
              }
            />
          </div>
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-info" />
            <CardTitle className="text-base">Notifications</CardTitle>
          </div>
          <CardDescription>Configure notification preferences</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="email-notif" className="flex-1">Email notifications</Label>
            <Switch
              id="email-notif"
              checked={(notifications?.value as { email_enabled?: boolean })?.email_enabled ?? true}
              onCheckedChange={(checked) =>
                handleUpdate("notifications", {
                  ...(notifications?.value as object),
                  email_enabled: checked,
                })
              }
            />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="inapp-notif" className="flex-1">In-app notifications</Label>
            <Switch
              id="inapp-notif"
              checked={(notifications?.value as { in_app_enabled?: boolean })?.in_app_enabled ?? true}
              onCheckedChange={(checked) =>
                handleUpdate("notifications", {
                  ...(notifications?.value as object),
                  in_app_enabled: checked,
                })
              }
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
