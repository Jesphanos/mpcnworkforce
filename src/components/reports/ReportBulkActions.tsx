import { useState } from "react";
import { Check, RotateCcw, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useUpdateReportStatus, useTeamLeadReportReview, WorkReport } from "@/hooks/useWorkReports";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface ReportBulkActionsProps {
  selectedIds: string[];
  reports: WorkReport[];
  onClearSelection: () => void;
}

export function ReportBulkActions({
  selectedIds,
  reports,
  onClearSelection,
}: ReportBulkActionsProps) {
  const { hasRole } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");

  const updateStatus = useUpdateReportStatus();
  const teamLeadReview = useTeamLeadReportReview();

  const isAdmin = hasRole("report_admin") || hasRole("general_overseer");
  const isTeamLead = hasRole("team_lead");

  const selectedReports = reports.filter((r) => selectedIds.includes(r.id));

  const handleBulkApprove = async () => {
    setIsProcessing(true);
    let successCount = 0;
    let errorCount = 0;

    for (const report of selectedReports) {
      try {
        if (isAdmin) {
          await updateStatus.mutateAsync({ reportId: report.id, status: "approved" });
        } else if (isTeamLead) {
          await teamLeadReview.mutateAsync({
            reportId: report.id,
            status: "approved",
            userId: report.user_id,
            platform: report.platform,
            taskType: report.task_type || null,
          });
        }
        successCount++;
      } catch (error) {
        errorCount++;
      }
    }

    setIsProcessing(false);
    onClearSelection();

    if (successCount > 0) {
      toast.success(`${successCount} report${successCount > 1 ? "s" : ""} approved`);
    }
    if (errorCount > 0) {
      toast.error(`Failed to approve ${errorCount} report${errorCount > 1 ? "s" : ""}`);
    }
  };

  const handleBulkReject = async () => {
    if (!rejectionReason.trim()) {
      toast.error("Please provide a reason for rejection");
      return;
    }

    setIsProcessing(true);
    let successCount = 0;
    let errorCount = 0;

    for (const report of selectedReports) {
      try {
        if (isAdmin) {
          await updateStatus.mutateAsync({
            reportId: report.id,
            status: "rejected",
            rejectionReason,
          });
        } else if (isTeamLead) {
          await teamLeadReview.mutateAsync({
            reportId: report.id,
            status: "rejected",
            rejectionReason,
            userId: report.user_id,
            platform: report.platform,
            taskType: report.task_type || null,
          });
        }
        successCount++;
      } catch (error) {
        errorCount++;
      }
    }

    setIsProcessing(false);
    setShowRejectDialog(false);
    setRejectionReason("");
    onClearSelection();

    if (successCount > 0) {
      toast.success(`${successCount} report${successCount > 1 ? "s" : ""} sent for revision`);
    }
    if (errorCount > 0) {
      toast.error(`Failed to process ${errorCount} report${errorCount > 1 ? "s" : ""}`);
    }
  };

  if (selectedIds.length === 0) return null;

  return (
    <>
      <div className="flex items-center gap-3 p-3 bg-primary/5 border border-primary/20 rounded-lg animate-in slide-in-from-top-2">
        <Badge variant="secondary" className="gap-1">
          {selectedIds.length} selected
        </Badge>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            onClick={handleBulkApprove}
            disabled={isProcessing}
          >
            {isProcessing ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Check className="mr-2 h-4 w-4" />
            )}
            Approve All
          </Button>
          <Button
            size="sm"
            variant="secondary"
            onClick={() => setShowRejectDialog(true)}
            disabled={isProcessing}
          >
            <RotateCcw className="mr-2 h-4 w-4" />
            Request Revision
          </Button>
        </div>

        <div className="flex-1" />

        <Button
          size="sm"
          variant="ghost"
          onClick={onClearSelection}
          className="text-muted-foreground"
        >
          <X className="h-4 w-4 mr-1" />
          Clear
        </Button>
      </div>

      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Request Revisions</DialogTitle>
            <DialogDescription>
              Provide feedback for {selectedIds.length} selected report
              {selectedIds.length > 1 ? "s" : ""}. This feedback will be applied to all
              selected reports.
            </DialogDescription>
          </DialogHeader>
          <Textarea
            placeholder="What needs to be improved..."
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            className="min-h-[100px]"
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRejectDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleBulkReject}
              disabled={!rejectionReason.trim() || isProcessing}
            >
              {isProcessing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Request Revision
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
