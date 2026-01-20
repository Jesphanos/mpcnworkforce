import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { memo } from "react";

interface PreTradeChecklistProps {
  checklistComplete: {
    strategy: boolean;
    risk: boolean;
    stopLoss: boolean;
  };
  maxRisk: number;
  onChecklistChange: (key: keyof PreTradeChecklistProps["checklistComplete"], checked: boolean) => void;
}

export const PreTradeChecklist = memo(function PreTradeChecklist({
  checklistComplete,
  maxRisk,
  onChecklistChange,
}: PreTradeChecklistProps) {
  return (
    <div className="mb-6 p-4 rounded-lg bg-muted/50 border">
      <h4 className="font-medium mb-3">Pre-Trade Checklist</h4>
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Checkbox
            id="check-strategy"
            checked={checklistComplete.strategy}
            onCheckedChange={(checked) => onChecklistChange("strategy", !!checked)}
          />
          <Label htmlFor="check-strategy" className="text-sm">
            I have selected an approved strategy
          </Label>
        </div>
        <div className="flex items-center gap-2">
          <Checkbox
            id="check-risk"
            checked={checklistComplete.risk}
            onCheckedChange={(checked) => onChecklistChange("risk", !!checked)}
          />
          <Label htmlFor="check-risk" className="text-sm">
            My risk is within the {maxRisk}% limit
          </Label>
        </div>
        <div className="flex items-center gap-2">
          <Checkbox
            id="check-stoploss"
            checked={checklistComplete.stopLoss}
            onCheckedChange={(checked) => onChecklistChange("stopLoss", !!checked)}
          />
          <Label htmlFor="check-stoploss" className="text-sm">
            I have set a stop-loss
          </Label>
        </div>
      </div>
    </div>
  );
});
