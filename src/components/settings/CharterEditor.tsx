import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Loader2, Save, RotateCcw, Plus, Trash2, Shield } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { MPCN_PRINCIPLES } from "@/config/humaneTerminology";

interface CharterOverrides {
  title?: string;
  tagline?: string;
  principles?: Array<{
    id: string;
    title: string;
    description: string;
  }>;
  commitments?: string[];
}

export function CharterEditor() {
  const queryClient = useQueryClient();
  const [localOverrides, setLocalOverrides] = useState<CharterOverrides>({});
  const [hasChanges, setHasChanges] = useState(false);

  // Fetch existing overrides
  const { data: savedOverrides, isLoading } = useQuery({
    queryKey: ["charter-overrides"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("system_settings")
        .select("value")
        .eq("key", "governance_charter")
        .single();

      if (error) {
        console.error("Error fetching charter overrides:", error);
        return {};
      }

      return (data?.value as unknown as CharterOverrides) || {};
    },
  });

  // Initialize local state when data loads
  useEffect(() => {
    if (savedOverrides) {
      setLocalOverrides(savedOverrides);
      setHasChanges(false);
    }
  }, [savedOverrides]);

  // Get effective values (override or default)
  const effectiveTitle = localOverrides.title || MPCN_PRINCIPLES.title;
  const effectiveTagline = localOverrides.tagline || MPCN_PRINCIPLES.tagline;
  const effectivePrinciples = localOverrides.principles?.length 
    ? localOverrides.principles 
    : MPCN_PRINCIPLES.principles.map(p => ({ id: p.id, title: p.title, description: p.description }));
  const effectiveCommitments = localOverrides.commitments?.length 
    ? localOverrides.commitments 
    : [...MPCN_PRINCIPLES.commitments];

  const saveMutation = useMutation({
    mutationFn: async (overrides: CharterOverrides) => {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { error } = await supabase
        .from("system_settings")
        .update({ 
          value: overrides as unknown as import("@/integrations/supabase/types").Json,
          updated_by: user?.id 
        })
        .eq("key", "governance_charter");

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["charter-overrides"] });
      setHasChanges(false);
      toast.success("Charter saved successfully");
    },
    onError: (error) => {
      toast.error("Failed to save charter: " + error.message);
    },
  });

  const handleSave = () => {
    saveMutation.mutate(localOverrides);
  };

  const handleReset = () => {
    setLocalOverrides({});
    setHasChanges(true);
  };

  const updateField = <K extends keyof CharterOverrides>(key: K, value: CharterOverrides[K]) => {
    setLocalOverrides(prev => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  const updatePrinciple = (index: number, field: "title" | "description", value: string) => {
    const newPrinciples = [...effectivePrinciples];
    newPrinciples[index] = { ...newPrinciples[index], [field]: value };
    updateField("principles", newPrinciples);
  };

  const updateCommitment = (index: number, value: string) => {
    const newCommitments = [...effectiveCommitments];
    newCommitments[index] = value;
    updateField("commitments", newCommitments);
  };

  const addCommitment = () => {
    updateField("commitments", [...effectiveCommitments, "New commitment"]);
  };

  const removeCommitment = (index: number) => {
    updateField("commitments", effectiveCommitments.filter((_, i) => i !== index));
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
          <Shield className="h-5 w-5 text-primary" />
          <span className="text-sm text-muted-foreground">
            Edit the governance charter displayed across the platform
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

      {/* Title & Tagline */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Charter Header</CardTitle>
          <CardDescription>The main title and tagline of the governance charter</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Title</Label>
            <Input
              value={effectiveTitle}
              onChange={(e) => updateField("title", e.target.value)}
              placeholder="MPCN Culture & Governance Charter"
            />
          </div>
          <div className="space-y-2">
            <Label>Tagline</Label>
            <Input
              value={effectiveTagline}
              onChange={(e) => updateField("tagline", e.target.value)}
              placeholder="Firm in structure, human in execution."
            />
          </div>
        </CardContent>
      </Card>

      {/* Principles */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Principles</CardTitle>
          <CardDescription>Core principles that guide MPCN governance</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {effectivePrinciples.map((principle, index) => (
            <div key={principle.id} className="space-y-3 p-4 border rounded-lg">
              <div className="flex items-center gap-2">
                <Badge variant="outline">{principle.id}</Badge>
              </div>
              <div className="space-y-2">
                <Label>Title</Label>
                <Input
                  value={principle.title}
                  onChange={(e) => updatePrinciple(index, "title", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  value={principle.description}
                  onChange={(e) => updatePrinciple(index, "description", e.target.value)}
                  rows={3}
                />
              </div>
              {index < effectivePrinciples.length - 1 && <Separator className="mt-4" />}
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Commitments */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">Commitments</CardTitle>
              <CardDescription>Specific commitments the organization upholds</CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={addCommitment}>
              <Plus className="h-4 w-4 mr-2" />
              Add Commitment
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {effectiveCommitments.map((commitment, index) => (
            <div key={index} className="flex gap-2">
              <Input
                value={commitment}
                onChange={(e) => updateCommitment(index, e.target.value)}
                className="flex-1"
              />
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => removeCommitment(index)}
                disabled={effectiveCommitments.length <= 1}
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
