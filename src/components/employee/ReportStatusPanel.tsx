import { format, formatDistanceToNow } from "date-fns";
import { Clock, CheckCircle2, AlertCircle, User, Shield, MessageCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface ReportStatusPanelProps {
  status: string;
  teamLeadStatus: string | null;
  finalStatus: string;
  teamLeadReviewedBy: string | null;
  reviewedBy: string | null;
  teamLeadReviewedAt: string | null;
  reviewedAt: string | null;
  rejectionReason: string | null;
  teamLeadRejectionReason: string | null;
  adminOverrideReason: string | null;
}

const statusLabels: Record<string, { label: string; description: string }> = {
  pending: {
    label: "Pending Review",
    description: "Your submission is awaiting team lead review.",
  },
  approved: {
    label: "Approved",
    description: "Your submission has been approved and processed.",
  },
  rejected: {
    label: "Needs Revision",
    description: "Please review the feedback and resubmit.",
  },
};

export function ReportStatusPanel({
  status,
  teamLeadStatus,
  finalStatus,
  teamLeadReviewedBy,
  reviewedBy,
  teamLeadReviewedAt,
  reviewedAt,
  rejectionReason,
  teamLeadRejectionReason,
  adminOverrideReason,
}: ReportStatusPanelProps) {
  const currentStatus = statusLabels[finalStatus] || statusLabels.pending;
  
  const StatusIcon =
    finalStatus === "approved"
      ? CheckCircle2
      : finalStatus === "rejected"
      ? AlertCircle
      : Clock;

  const statusColor =
    finalStatus === "approved"
      ? "text-success"
      : finalStatus === "rejected"
      ? "text-warning"
      : "text-muted-foreground";

  const lastActedBy = reviewedBy || teamLeadReviewedBy;
  const lastActedAt = reviewedAt || teamLeadReviewedAt;
  const isAdminAction = !!reviewedBy;

  const feedbackMessage =
    adminOverrideReason ||
    rejectionReason ||
    teamLeadRejectionReason;

  return (
    <div className="p-4 rounded-lg bg-muted/50 space-y-3">
      {/* Status Header */}
      <div className="flex items-center gap-2">
        <StatusIcon className={`h-5 w-5 ${statusColor}`} />
        <div>
          <p className={`font-medium ${statusColor}`}>{currentStatus.label}</p>
          <p className="text-xs text-muted-foreground">{currentStatus.description}</p>
        </div>
      </div>

      {/* Last Action */}
      {lastActedBy && lastActedAt && (
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          {isAdminAction ? (
            <Shield className="h-3 w-3" />
          ) : (
            <User className="h-3 w-3" />
          )}
          <span>
            {isAdminAction ? "Admin" : "Team Lead"} action •{" "}
            {formatDistanceToNow(new Date(lastActedAt), { addSuffix: true })}
          </span>
        </div>
      )}

      {/* Feedback Message */}
      {feedbackMessage && (
        <div className="p-3 rounded bg-background/50 border border-border/50">
          <div className="flex items-start gap-2">
            <MessageCircle className="h-4 w-4 text-muted-foreground mt-0.5" />
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-1">
                {adminOverrideReason ? "Admin Override Note" : "Feedback"}
              </p>
              <p className="text-sm">{feedbackMessage}</p>
            </div>
          </div>
        </div>
      )}

      {/* Review Timeline */}
      {teamLeadStatus && (
        <div className="pt-2 border-t border-border/50">
          <p className="text-xs text-muted-foreground mb-2">Review Timeline</p>
          <div className="space-y-1 text-xs">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1">
                <User className="h-3 w-3" />
                Team Lead
              </span>
              <Badge
                variant="outline"
                className={
                  teamLeadStatus === "approved"
                    ? "text-success"
                    : teamLeadStatus === "rejected"
                    ? "text-warning"
                    : ""
                }
              >
                {teamLeadStatus === "rejected" ? "Needs Revision" : teamLeadStatus}
              </Badge>
            </div>
            {reviewedBy && (
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1">
                  <Shield className="h-3 w-3" />
                  Admin Override
                </span>
                <Badge
                  variant="outline"
                  className={
                    finalStatus === "approved"
                      ? "text-success"
                      : "text-warning"
                  }
                >
                  {finalStatus === "rejected" ? "Needs Revision" : finalStatus}
                </Badge>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
