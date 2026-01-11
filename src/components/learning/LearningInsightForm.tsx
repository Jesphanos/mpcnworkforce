import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useCreateLearningInsight } from "@/hooks/useLearningInsights";
import { useAuth } from "@/contexts/AuthContext";
import { TrendingUp, AlertCircle, Sparkles, Plus, X } from "lucide-react";

interface LearningInsightFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  entityType: "task" | "report";
  entityId: string;
  userId: string;
  resolutionStatus: string;
}

/**
 * Learning Insight Form
 * For reviewers to add post-resolution feedback
 */
export function LearningInsightForm({
  open,
  onOpenChange,
  entityType,
  entityId,
  userId,
  resolutionStatus,
}: LearningInsightFormProps) {
  const [whatWentWell, setWhatWentWell] = useState("");
  const [whatToImprove, setWhatToImprove] = useState("");
  const [skillSignal, setSkillSignal] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [newSuggestion, setNewSuggestion] = useState("");

  const { hasRole } = useAuth();
  const createInsight = useCreateLearningInsight();

  const isOverseer = hasRole("general_overseer");
  const generatedBy = isOverseer ? "overseer" : "reviewer";

  const handleAddSuggestion = () => {
    if (newSuggestion.trim()) {
      setSuggestions([...suggestions, newSuggestion.trim()]);
      setNewSuggestion("");
    }
  };

  const handleRemoveSuggestion = (index: number) => {
    setSuggestions(suggestions.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    await createInsight.mutateAsync({
      user_id: userId,
      entity_type: entityType,
      entity_id: entityId,
      what_went_well: whatWentWell || undefined,
      what_to_improve: whatToImprove || undefined,
      skill_signal: skillSignal || undefined,
      suggestions: suggestions.length > 0 ? suggestions : undefined,
      generated_by: generatedBy,
      resolution_status: resolutionStatus,
    });

    // Reset form
    setWhatWentWell("");
    setWhatToImprove("");
    setSkillSignal("");
    setSuggestions([]);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Learning Insight</DialogTitle>
          <DialogDescription>
            Provide constructive feedback to help the worker grow. This is not punitive — it's developmental.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* What Went Well */}
          <div className="space-y-2">
            <Label className="flex items-center gap-1.5 text-success">
              <TrendingUp className="h-4 w-4" />
              What Went Well
            </Label>
            <Textarea
              placeholder="Acknowledge positive aspects of the work..."
              value={whatWentWell}
              onChange={(e) => setWhatWentWell(e.target.value)}
            />
          </div>

          {/* What to Improve */}
          <div className="space-y-2">
            <Label className="flex items-center gap-1.5 text-warning">
              <AlertCircle className="h-4 w-4" />
              What to Improve
            </Label>
            <Textarea
              placeholder="Suggest areas for growth (supportive, not critical)..."
              value={whatToImprove}
              onChange={(e) => setWhatToImprove(e.target.value)}
            />
          </div>

          {/* Skill Signal */}
          <div className="space-y-2">
            <Label className="flex items-center gap-1.5">
              <Sparkles className="h-4 w-4" />
              Skill Demonstrated
            </Label>
            <Input
              placeholder="e.g., Research, Attention to Detail, Communication"
              value={skillSignal}
              onChange={(e) => setSkillSignal(e.target.value)}
            />
          </div>

          {/* Suggestions */}
          <div className="space-y-2">
            <Label>Suggestions for Next Time</Label>
            <div className="flex gap-2">
              <Input
                placeholder="Add a suggestion..."
                value={newSuggestion}
                onChange={(e) => setNewSuggestion(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddSuggestion())}
              />
              <Button type="button" variant="outline" size="icon" onClick={handleAddSuggestion}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            {suggestions.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {suggestions.map((suggestion, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-1 px-2 py-1 bg-muted rounded-md text-sm"
                  >
                    <span>{suggestion}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveSuggestion(index)}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={createInsight.isPending}>
              {createInsight.isPending ? "Saving..." : "Add Insight"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
