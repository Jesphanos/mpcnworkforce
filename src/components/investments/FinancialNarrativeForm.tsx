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
import { useCreateFinancialNarrative, useUpdateFinancialNarrative, FinancialNarrative } from "@/hooks/useFinancialNarratives";
import { Plus, X } from "lucide-react";

interface FinancialNarrativeFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  periodId: string;
  existingNarrative?: FinancialNarrative | null;
}

/**
 * Financial Narrative Form
 * For admins to create/edit period explanations
 */
export function FinancialNarrativeForm({
  open,
  onOpenChange,
  periodId,
  existingNarrative,
}: FinancialNarrativeFormProps) {
  const [periodSummary, setPeriodSummary] = useState(existingNarrative?.period_summary || "");
  const [primaryDrivers, setPrimaryDrivers] = useState<string[]>(existingNarrative?.primary_drivers || []);
  const [negativeDrivers, setNegativeDrivers] = useState<string[]>(existingNarrative?.negative_drivers || []);
  const [adjustmentNotes, setAdjustmentNotes] = useState(existingNarrative?.adjustment_notes || "");
  const [workforceImpact, setWorkforceImpact] = useState(existingNarrative?.workforce_impact || "");
  const [nextPeriodOutlook, setNextPeriodOutlook] = useState(existingNarrative?.next_period_outlook || "");
  const [newPositiveDriver, setNewPositiveDriver] = useState("");
  const [newNegativeDriver, setNewNegativeDriver] = useState("");

  const createNarrative = useCreateFinancialNarrative();
  const updateNarrative = useUpdateFinancialNarrative();

  const isEditing = !!existingNarrative;

  const handleAddDriver = (type: "positive" | "negative") => {
    if (type === "positive" && newPositiveDriver.trim()) {
      setPrimaryDrivers([...primaryDrivers, newPositiveDriver.trim()]);
      setNewPositiveDriver("");
    } else if (type === "negative" && newNegativeDriver.trim()) {
      setNegativeDrivers([...negativeDrivers, newNegativeDriver.trim()]);
      setNewNegativeDriver("");
    }
  };

  const handleRemoveDriver = (type: "positive" | "negative", index: number) => {
    if (type === "positive") {
      setPrimaryDrivers(primaryDrivers.filter((_, i) => i !== index));
    } else {
      setNegativeDrivers(negativeDrivers.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = async () => {
    if (!periodSummary.trim()) return;

    if (isEditing) {
      await updateNarrative.mutateAsync({
        id: existingNarrative.id,
        period_summary: periodSummary,
        primary_drivers: primaryDrivers,
        negative_drivers: negativeDrivers,
        adjustment_notes: adjustmentNotes || null,
        workforce_impact: workforceImpact || null,
        next_period_outlook: nextPeriodOutlook || null,
      });
    } else {
      await createNarrative.mutateAsync({
        financial_period_id: periodId,
        period_summary: periodSummary,
        primary_drivers: primaryDrivers,
        negative_drivers: negativeDrivers,
        adjustment_notes: adjustmentNotes || undefined,
        workforce_impact: workforceImpact || undefined,
        next_period_outlook: nextPeriodOutlook || undefined,
      });
    }

    onOpenChange(false);
  };

  const isPending = createNarrative.isPending || updateNarrative.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit" : "Add"} Period Explanation</DialogTitle>
          <DialogDescription>
            Explain the financial changes in plain language so workers and investors understand.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Period Summary */}
          <div className="space-y-2">
            <Label>Period Summary *</Label>
            <Textarea
              placeholder="In simple terms, what happened this period..."
              value={periodSummary}
              onChange={(e) => setPeriodSummary(e.target.value)}
              className="min-h-[80px]"
            />
          </div>

          {/* Positive Drivers */}
          <div className="space-y-2">
            <Label className="text-success">What Helped (Positive Drivers)</Label>
            <div className="flex gap-2">
              <Input
                placeholder="e.g., High task completion rate"
                value={newPositiveDriver}
                onChange={(e) => setNewPositiveDriver(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddDriver("positive"))}
              />
              <Button type="button" variant="outline" size="icon" onClick={() => handleAddDriver("positive")}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            {primaryDrivers.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {primaryDrivers.map((driver, index) => (
                  <div key={index} className="flex items-center gap-1 px-2 py-1 bg-success/10 text-success rounded-md text-sm">
                    <span>{driver}</span>
                    <button type="button" onClick={() => handleRemoveDriver("positive", index)}>
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Negative Drivers */}
          <div className="space-y-2">
            <Label className="text-destructive">What Hurt (Negative Drivers)</Label>
            <div className="flex gap-2">
              <Input
                placeholder="e.g., Delayed client payments"
                value={newNegativeDriver}
                onChange={(e) => setNewNegativeDriver(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddDriver("negative"))}
              />
              <Button type="button" variant="outline" size="icon" onClick={() => handleAddDriver("negative")}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            {negativeDrivers.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {negativeDrivers.map((driver, index) => (
                  <div key={index} className="flex items-center gap-1 px-2 py-1 bg-destructive/10 text-destructive rounded-md text-sm">
                    <span>{driver}</span>
                    <button type="button" onClick={() => handleRemoveDriver("negative", index)}>
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Adjustment Notes */}
          <div className="space-y-2">
            <Label>Adjustments Made (Optional)</Label>
            <Textarea
              placeholder="Any corrections or adjustments applied..."
              value={adjustmentNotes}
              onChange={(e) => setAdjustmentNotes(e.target.value)}
            />
          </div>

          {/* Workforce Impact */}
          <div className="space-y-2">
            <Label>Impact on Workforce (Optional)</Label>
            <Textarea
              placeholder="How does this affect worker earnings..."
              value={workforceImpact}
              onChange={(e) => setWorkforceImpact(e.target.value)}
            />
          </div>

          {/* Next Period Outlook */}
          <div className="space-y-2">
            <Label>What We're Changing Next (Optional)</Label>
            <Textarea
              placeholder="Plans for improvement..."
              value={nextPeriodOutlook}
              onChange={(e) => setNextPeriodOutlook(e.target.value)}
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={isPending || !periodSummary.trim()}>
              {isPending ? "Saving..." : isEditing ? "Update" : "Publish"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
