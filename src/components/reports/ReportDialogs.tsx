import { memo } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { WorkReport } from "@/hooks/useWorkReports";

interface RejectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  report: WorkReport | null;
  reason: string;
  onReasonChange: (reason: string) => void;
  onConfirm: () => void;
  isTeamLead: boolean;
  canReview: boolean;
  isPending: boolean;
}

export const RejectionDialog = memo(function RejectionDialog({
  open,
  onOpenChange,
  report,
  reason,
  onReasonChange,
  onConfirm,
  isTeamLead,
  canReview,
  isPending,
}: RejectionDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isTeamLead && !canReview ? "Request Revision" : "Request Revision"}
          </DialogTitle>
          <DialogDescription>
            {isTeamLead && !canReview
              ? "This decision can be adjusted by an admin if needed. Revisions are a normal part of the quality process."
              : "Please provide constructive feedback to help improve this submission."}
          </DialogDescription>
        </DialogHeader>
        <Textarea
          placeholder="What needs to be improved..."
          value={reason}
          onChange={(e) => onReasonChange(e.target.value)}
        />
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            variant="secondary"
            onClick={onConfirm}
            disabled={!reason || isPending}
          >
            Request Revision
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
});

interface OverrideDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  report: WorkReport | null;
  reason: string;
  onReasonChange: (reason: string) => void;
  onApprove: () => void;
  onReject: () => void;
  isOverseer: boolean;
  isPending: boolean;
}

export const OverrideDialog = memo(function OverrideDialog({
  open,
  onOpenChange,
  report,
  reason,
  onReasonChange,
  onApprove,
  onReject,
  isOverseer,
  isPending,
}: OverrideDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Adjust Decision</DialogTitle>
          <DialogDescription>
            Review and adjust the previous decision to maintain quality or fairness. This action is logged in the activity record.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Previous Feedback:</Label>
            <p className="text-sm text-muted-foreground mt-1">
              {report?.team_lead_rejection_reason || "No feedback provided"}
            </p>
          </div>
          <div>
            <Label>Adjustment Reason {isOverseer ? "(Required)" : "(Recommended)"}</Label>
            <Textarea
              placeholder="Explain how this adjustment maintains quality or fairness..."
              value={reason}
              onChange={(e) => onReasonChange(e.target.value)}
              className="mt-1"
            />
            {isOverseer && !reason.trim() && (
              <p className="text-xs text-muted-foreground mt-1">
                A reason is required for governance decisions
              </p>
            )}
          </div>
        </div>
        <DialogFooter className="gap-2">
          <Button
            variant="secondary"
            onClick={onReject}
            disabled={isPending || (isOverseer && !reason.trim())}
          >
            Confirm Revision Needed
          </Button>
          <Button
            variant="default"
            onClick={onApprove}
            disabled={isPending || (isOverseer && !reason.trim())}
          >
            Approve Submission
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
});

interface RateEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  rate: string;
  onRateChange: (rate: string) => void;
  reason: string;
  onReasonChange: (reason: string) => void;
  onSave: () => void;
  isOverseer: boolean;
}

export const RateEditDialog = memo(function RateEditDialog({
  open,
  onOpenChange,
  rate,
  onRateChange,
  reason,
  onReasonChange,
  onSave,
  isOverseer,
}: RateEditDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Update Rate</DialogTitle>
          <DialogDescription>
            {isOverseer
              ? "A reason is required for all overseer rate changes."
              : "Update the rate for this report."}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>New Rate</Label>
            <Input
              type="number"
              value={rate}
              onChange={(e) => onRateChange(e.target.value)}
              step="0.01"
              className="mt-1"
            />
          </div>
          {isOverseer && (
            <div>
              <Label>Reason (Required)</Label>
              <Textarea
                placeholder="Enter reason for rate change..."
                value={reason}
                onChange={(e) => onReasonChange(e.target.value)}
                className="mt-1"
              />
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={onSave}
            disabled={isOverseer && !reason.trim()}
          >
            Save Rate
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
});
