import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PlatformSettingsTable } from "@/components/settings/PlatformSettingsTable";
import { SystemPreferences } from "@/components/settings/SystemPreferences";
import { Layers, Sliders } from "lucide-react";

export default function Settings() {
  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        <div>
          <h1 className="text-2xl font-bold text-foreground">System Settings</h1>
          <p className="text-muted-foreground">
            Configure platform options, base rates, and system preferences
          </p>
        </div>

        <Tabs defaultValue="platforms" className="space-y-4">
          <TabsList>
            <TabsTrigger value="platforms" className="flex items-center gap-2">
              <Layers className="h-4 w-4" />
              Platforms
            </TabsTrigger>
            <TabsTrigger value="preferences" className="flex items-center gap-2">
              <Sliders className="h-4 w-4" />
              Preferences
            </TabsTrigger>
          </TabsList>

          <TabsContent value="platforms">
            <Card>
              <CardHeader>
                <CardTitle>Platform Configuration</CardTitle>
                <CardDescription>
                  Manage the platforms available for work reports and tasks, including their default base rates.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <PlatformSettingsTable />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="preferences">
            <div className="space-y-4">
              <div>
                <h2 className="text-lg font-semibold">System Preferences</h2>
                <p className="text-sm text-muted-foreground">
                  Configure global settings that affect how the system operates.
                </p>
              </div>
              <SystemPreferences />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
