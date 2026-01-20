import { memo } from "react";
import { format } from "date-fns";
import { Check, Clock, DollarSign, History, Shield, X } from "lucide-react";
import { RotateCcw } from "lucide-react";
import { TableCell, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PlatformIcon } from "@/components/ui/PlatformIcon";
import { getHumaneStatus } from "@/config/humaneTerminology";
import { WorkReport } from "@/hooks/useWorkReports";

const statusColors: Record<string, string> = {
  pending: "bg-warning/10 text-warning border-warning/20",
  approved: "bg-success/10 text-success border-success/20",
  rejected: "bg-secondary/50 text-secondary-foreground border-secondary",
};

const statusIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  pending: Clock,
  approved: Check,
  rejected: RotateCcw,
};

interface ReportRowProps {
  report: WorkReport;
  showActions: boolean;
  showRateEdit: boolean;
  isTeamLead: boolean;
  canReview: boolean;
  canOverride: boolean;
  isOverseer: boolean;
  onApprove: (report: WorkReport) => void;
  onRejectClick: (report: WorkReport) => void;
  onOverrideClick: (report: WorkReport) => void;
  onRateEdit: (reportId: string, rate: number) => void;
  onAuditClick: (reportId: string) => void;
  isPending: boolean;
}

export const ReportRow = memo(function ReportRow({
  report,
  showActions,
  showRateEdit,
  isTeamLead,
  canReview,
  canOverride,
  isOverseer,
  onApprove,
  onRejectClick,
  onOverrideClick,
  onRateEdit,
  onAuditClick,
  isPending,
}: ReportRowProps) {
  const FinalStatusIcon = statusIcons[report.final_status] || Clock;
  const TLStatusIcon = report.team_lead_status ? statusIcons[report.team_lead_status] : Clock;
  const needsTeamLeadReview = !report.team_lead_status && report.final_status === "pending";
  const canBeOverridden = report.team_lead_status === "rejected" && report.final_status === "pending";
  const reportIsPending = report.status === "pending" && report.final_status === "pending";

  return (
    <TableRow>
      <TableCell className="font-medium">
        {format(new Date(report.work_date), "MMM d, yyyy")}
      </TableCell>
      <TableCell>
        <PlatformIcon platform={report.platform} size="sm" showLabel />
      </TableCell>
      <TableCell>{report.hours_worked}h</TableCell>
      <TableCell>${Number(report.earnings).toFixed(2)}</TableCell>
      {showRateEdit && (
        <TableCell>
          {report.final_status === "pending" ? (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-xs"
              onClick={() => onRateEdit(report.id, report.current_rate || 0)}
            >
              <DollarSign className="h-3 w-3 mr-1" />
              {Number(report.current_rate || 0).toFixed(2)}
            </Button>
          ) : (
            <span>${Number(report.current_rate || 0).toFixed(2)}</span>
          )}
        </TableCell>
      )}
      <TableCell>
        <Badge variant="outline" className={statusColors[report.team_lead_status || "pending"]}>
          <TLStatusIcon className="h-3 w-3 mr-1" />
          {getHumaneStatus(report.team_lead_status || "pending")}
        </Badge>
      </TableCell>
      <TableCell>
        <Badge variant="outline" className={statusColors[report.final_status]}>
          <FinalStatusIcon className="h-3 w-3 mr-1" />
          {getHumaneStatus(report.final_status)}
        </Badge>
      </TableCell>
      <TableCell className="max-w-[200px] truncate">
        {report.description || "-"}
      </TableCell>
      {(showActions || showRateEdit) && (
        <TableCell>
          <div className="flex gap-1">
            {/* Team Lead / Admin Review Actions */}
            {showActions && (isTeamLead || canReview) && reportIsPending && needsTeamLeadReview && (
              <>
                <Button
                  size="sm"
                  variant="outline"
                  className="text-success hover:bg-success/10 h-7 w-7 p-0"
                  onClick={() => onApprove(report)}
                  disabled={isPending}
                  title="Approve"
                  aria-label="Approve report"
                >
                  <Check className="h-3 w-3" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="text-destructive hover:bg-destructive/10 h-7 w-7 p-0"
                  onClick={() => onRejectClick(report)}
                  title={isTeamLead && !canReview ? "Reject (non-final)" : "Reject"}
                  aria-label="Reject report"
                >
                  <X className="h-3 w-3" />
                </Button>
              </>
            )}

            {/* Admin Override Actions */}
            {showActions && canOverride && canBeOverridden && (
              <Button
                size="sm"
                variant="outline"
                className="text-primary hover:bg-primary/10 h-7 px-2"
                onClick={() => onOverrideClick(report)}
                title="Adjust Decision"
                aria-label="Override decision"
              >
                <Shield className="h-3 w-3 mr-1" />
                Adjust
              </Button>
            )}

            {/* Show rejection reason for rejected reports */}
            {report.status === "rejected" && report.rejection_reason && !canBeOverridden && (
              <span className="text-xs text-muted-foreground max-w-[100px] truncate">
                {report.rejection_reason}
              </span>
            )}

            {/* Audit Log Button */}
            <Button
              size="sm"
              variant="ghost"
              className="h-7 w-7 p-0"
              onClick={() => onAuditClick(report.id)}
              title="View History"
              aria-label="View report history"
            >
              <History className="h-3 w-3" />
            </Button>
          </div>
        </TableCell>
      )}
    </TableRow>
  );
});
