import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PlatformSettingsTable } from "@/components/settings/PlatformSettingsTable";
import { SystemPreferences } from "@/components/settings/SystemPreferences";
import { GovernanceCharter } from "@/components/settings/GovernanceCharter";
import { ThemeToggle } from "@/components/settings/ThemeToggle";
import { CharterEditor } from "@/components/settings/CharterEditor";
import { MPCNLearnEditor } from "@/components/settings/MPCNLearnEditor";
import { FeatureAccessManager } from "@/components/settings/FeatureAccessManager";
import { Layers, Sliders, Heart, Palette, Shield, GraduationCap, Lock } from "lucide-react";

export default function Settings() {
  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        <div>
          <h1 className="text-2xl font-bold text-foreground">System Settings</h1>
          <p className="text-muted-foreground">
            Configure platform options, content, and access controls
          </p>
        </div>

        <Tabs defaultValue="platforms" className="space-y-4">
          <TabsList className="flex-wrap h-auto gap-1">
            <TabsTrigger value="platforms" className="flex items-center gap-2">
              <Layers className="h-4 w-4" />
              Platforms
            </TabsTrigger>
            <TabsTrigger value="preferences" className="flex items-center gap-2">
              <Sliders className="h-4 w-4" />
              Preferences
            </TabsTrigger>
            <TabsTrigger value="appearance" className="flex items-center gap-2">
              <Palette className="h-4 w-4" />
              Appearance
            </TabsTrigger>
            <TabsTrigger value="charter" className="flex items-center gap-2">
              <Heart className="h-4 w-4" />
              Charter
            </TabsTrigger>
            <TabsTrigger value="charter-editor" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Edit Charter
            </TabsTrigger>
            <TabsTrigger value="learn-editor" className="flex items-center gap-2">
              <GraduationCap className="h-4 w-4" />
              Edit Learn
            </TabsTrigger>
            <TabsTrigger value="access" className="flex items-center gap-2">
              <Lock className="h-4 w-4" />
              Access Control
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

          <TabsContent value="appearance">
            <ThemeToggle />
          </TabsContent>

          <TabsContent value="charter">
            <GovernanceCharter />
          </TabsContent>

          <TabsContent value="charter-editor">
            <Card>
              <CardHeader>
                <CardTitle>Charter Content Editor</CardTitle>
                <CardDescription>
                  Edit the governance charter content. Changes will be reflected across the platform.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <CharterEditor />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="learn-editor">
            <Card>
              <CardHeader>
                <CardTitle>MPCN Learn Content Editor</CardTitle>
                <CardDescription>
                  Edit learning module descriptions and charter content. Module content itself is defined in the codebase.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <MPCNLearnEditor />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="access">
            <Card>
              <CardHeader>
                <CardTitle>Feature Access Control</CardTitle>
                <CardDescription>
                  Control which pages and features are accessible to each role. Disabled routes will redirect users to the access denied page.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <FeatureAccessManager />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
