import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Loader2, Save, RotateCcw, ChevronDown, GraduationCap, BookOpen } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { MODULE_GROUPS, MPCN_LEARN_CHARTER } from "@/config/mpcnLearnConfig";

interface LearnOverrides {
  charter?: {
    title?: string;
    subtitle?: string;
    mission?: string;
    faithStatement?: string;
  };
  moduleGroups?: Record<string, {
    title?: string;
    description?: string;
  }>;
}

export function MPCNLearnEditor() {
  const queryClient = useQueryClient();
  const [localOverrides, setLocalOverrides] = useState<LearnOverrides>({});
  const [hasChanges, setHasChanges] = useState(false);
  const [openGroups, setOpenGroups] = useState<string[]>([]);

  // Fetch existing overrides
  const { data: savedOverrides, isLoading } = useQuery({
    queryKey: ["mpcn-learn-overrides"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("system_settings")
        .select("value")
        .eq("key", "mpcn_learn_overrides")
        .single();

      if (error) {
        console.error("Error fetching learn overrides:", error);
        return {};
      }

      return (data?.value as unknown as LearnOverrides) || {};
    },
  });

  // Initialize local state when data loads
  useEffect(() => {
    if (savedOverrides) {
      setLocalOverrides(savedOverrides);
      setHasChanges(false);
    }
  }, [savedOverrides]);

  const saveMutation = useMutation({
    mutationFn: async (overrides: LearnOverrides) => {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { error } = await supabase
        .from("system_settings")
        .update({ 
          value: overrides as unknown as import("@/integrations/supabase/types").Json,
          updated_by: user?.id 
        })
        .eq("key", "mpcn_learn_overrides");

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["mpcn-learn-overrides"] });
      setHasChanges(false);
      toast.success("MPCN Learn content saved successfully");
    },
    onError: (error) => {
      toast.error("Failed to save content: " + error.message);
    },
  });

  const handleSave = () => {
    saveMutation.mutate(localOverrides);
  };

  const handleReset = () => {
    setLocalOverrides({});
    setHasChanges(true);
  };

  const updateCharterField = (field: keyof NonNullable<LearnOverrides["charter"]>, value: string) => {
    setLocalOverrides(prev => ({
      ...prev,
      charter: {
        ...prev.charter,
        [field]: value,
      },
    }));
    setHasChanges(true);
  };

  const updateModuleGroup = (groupId: string, field: "title" | "description", value: string) => {
    setLocalOverrides(prev => ({
      ...prev,
      moduleGroups: {
        ...prev.moduleGroups,
        [groupId]: {
          ...prev.moduleGroups?.[groupId],
          [field]: value,
        },
      },
    }));
    setHasChanges(true);
  };

  const toggleGroup = (groupId: string) => {
    setOpenGroups(prev => 
      prev.includes(groupId) 
        ? prev.filter(id => id !== groupId)
        : [...prev, groupId]
    );
  };

  // Get effective values
  const getCharterValue = (field: keyof typeof MPCN_LEARN_CHARTER) => {
    return localOverrides.charter?.[field as keyof NonNullable<LearnOverrides["charter"]>] || MPCN_LEARN_CHARTER[field];
  };

  const getGroupValue = (groupId: string, field: "title" | "description") => {
    const group = MODULE_GROUPS[groupId as keyof typeof MODULE_GROUPS];
    return localOverrides.moduleGroups?.[groupId]?.[field] || group?.[field] || "";
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <GraduationCap className="h-5 w-5 text-primary" />
          <span className="text-sm text-muted-foreground">
            Edit MPCN Learn content and module descriptions
          </span>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleReset}
            disabled={saveMutation.isPending}
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset to Defaults
          </Button>
          <Button 
            size="sm" 
            onClick={handleSave}
            disabled={!hasChanges || saveMutation.isPending}
          >
            {saveMutation.isPending ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            Save Changes
          </Button>
        </div>
      </div>

      {hasChanges && (
        <Badge variant="outline" className="text-warning border-warning">
          Unsaved changes
        </Badge>
      )}

      <Tabs defaultValue="charter" className="space-y-4">
        <TabsList>
          <TabsTrigger value="charter">Charter</TabsTrigger>
          <TabsTrigger value="groups">Module Groups</TabsTrigger>
        </TabsList>

        <TabsContent value="charter">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Learning Charter</CardTitle>
              <CardDescription>The main header and mission statement for MPCN Learn</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Title</Label>
                <Input
                  value={getCharterValue("title") as string}
                  onChange={(e) => updateCharterField("title", e.target.value)}
                  placeholder="MPCN Learn"
                />
              </div>
              <div className="space-y-2">
                <Label>Subtitle</Label>
                <Input
                  value={getCharterValue("subtitle") as string}
                  onChange={(e) => updateCharterField("subtitle", e.target.value)}
                  placeholder="Building knowledge, character, and competence..."
                />
              </div>
              <div className="space-y-2">
                <Label>Mission Statement</Label>
                <Textarea
                  value={getCharterValue("mission") as string}
                  onChange={(e) => updateCharterField("mission", e.target.value)}
                  rows={4}
                />
              </div>
              <div className="space-y-2">
                <Label>Faith Statement</Label>
                <Textarea
                  value={getCharterValue("faithStatement") as string}
                  onChange={(e) => updateCharterField("faithStatement", e.target.value)}
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="groups">
          <ScrollArea className="h-[500px]">
            <div className="space-y-4 pr-4">
              {Object.entries(MODULE_GROUPS).map(([groupId, group]) => (
                <Collapsible 
                  key={groupId} 
                  open={openGroups.includes(groupId)}
                  onOpenChange={() => toggleGroup(groupId)}
                >
                  <Card>
                    <CollapsibleTrigger asChild>
                      <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <BookOpen className="h-5 w-5 text-primary" />
                            <div>
                              <CardTitle className="text-base">{group.title}</CardTitle>
                              <CardDescription className="text-sm">{groupId}</CardDescription>
                            </div>
                          </div>
                          <ChevronDown className={`h-5 w-5 transition-transform ${openGroups.includes(groupId) ? "rotate-180" : ""}`} />
                        </div>
                      </CardHeader>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <CardContent className="space-y-4 pt-0">
                        <div className="space-y-2">
                          <Label>Group Title</Label>
                          <Input
                            value={getGroupValue(groupId, "title")}
                            onChange={(e) => updateModuleGroup(groupId, "title", e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Description</Label>
                          <Textarea
                            value={getGroupValue(groupId, "description")}
                            onChange={(e) => updateModuleGroup(groupId, "description", e.target.value)}
                            rows={3}
                          />
                        </div>
                      </CardContent>
                    </CollapsibleContent>
                  </Card>
                </Collapsible>
              ))}
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  );
}
