import { format } from "date-fns";
import { Check, X, Clock, Eye, Shield, DollarSign, History } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { toast } from "sonner";
import { WorkReport, useUpdateReportStatus, useTeamLeadReportReview, useAdminReportOverride, useUpdateReportRate } from "@/hooks/useWorkReports";
import { useAuth } from "@/contexts/AuthContext";
import { ReportAuditDialog } from "./ReportAuditDialog";

interface ReportsTableProps {
  reports: WorkReport[];
  showActions?: boolean;
  showRateEdit?: boolean;
}

const statusColors: Record<string, string> = {
  pending: "bg-warning/10 text-warning border-warning/20",
  approved: "bg-success/10 text-success border-success/20",
  rejected: "bg-destructive/10 text-destructive border-destructive/20",
};

const statusIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  pending: Clock,
  approved: Check,
  rejected: X,
};

export function ReportsTable({ reports, showActions = false, showRateEdit = false }: ReportsTableProps) {
  const { hasRole, role } = useAuth();
  const isTeamLead = hasRole("team_lead");
  const canOverride = hasRole("report_admin");
  const canReview = hasRole("report_admin");
  const isOverseer = hasRole("general_overseer");
  
  const [rejectionReason, setRejectionReason] = useState("");
  const [overrideReason, setOverrideReason] = useState("");
  const [selectedReport, setSelectedReport] = useState<string | null>(null);
  const [editingRate, setEditingRate] = useState<{ reportId: string; rate: string; originalRate: number } | null>(null);
  const [rateChangeReason, setRateChangeReason] = useState("");
  const [auditReportId, setAuditReportId] = useState<string | null>(null);
  
  const updateStatus = useUpdateReportStatus();
  const teamLeadReview = useTeamLeadReportReview();
  const adminOverride = useAdminReportOverride();
  const updateRate = useUpdateReportRate();

  const handleApprove = async (reportId: string) => {
    if (isTeamLead && !canReview) {
      await teamLeadReview.mutateAsync({ reportId, status: "approved" });
    } else {
      await updateStatus.mutateAsync({ reportId, status: "approved" });
    }
  };

  const handleReject = async () => {
    if (selectedReport) {
      if (isTeamLead && !canReview) {
        await teamLeadReview.mutateAsync({
          reportId: selectedReport,
          status: "rejected",
          rejectionReason,
        });
      } else {
        await updateStatus.mutateAsync({
          reportId: selectedReport,
          status: "rejected",
          rejectionReason,
        });
      }
      setSelectedReport(null);
      setRejectionReason("");
    }
  };

  const handleAdminOverride = async (reportId: string, status: "approved" | "rejected") => {
    // Mandatory reason for overseer
    if (isOverseer && !overrideReason.trim()) {
      toast.error("Override reason is required");
      return;
    }
    await adminOverride.mutateAsync({
      reportId,
      status,
      overrideReason,
    });
    setOverrideReason("");
  };

  const handleRateSave = async () => {
    if (editingRate) {
      // Overseer requires reason for rate changes
      if (isOverseer && !rateChangeReason.trim()) {
        toast.error("Reason is required for rate changes");
        return;
      }
      await updateRate.mutateAsync({
        reportId: editingRate.reportId,
        newRate: parseFloat(editingRate.rate),
      });
      setEditingRate(null);
      setRateChangeReason("");
    }
  };

  if (reports.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-10">
          <Eye className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground">No reports found</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Work Reports</CardTitle>
          <CardDescription>
            {showActions ? "Review and approve employee reports" : "Your submitted work reports"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Platform</TableHead>
                <TableHead>Hours</TableHead>
                <TableHead>Earnings</TableHead>
                {showRateEdit && <TableHead>Rate</TableHead>}
                <TableHead>TL Status</TableHead>
                <TableHead>Final Status</TableHead>
                <TableHead>Description</TableHead>
                {(showActions || showRateEdit) && <TableHead>Actions</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {reports.map((report) => {
                const FinalStatusIcon = statusIcons[report.final_status] || Clock;
                const TLStatusIcon = report.team_lead_status ? statusIcons[report.team_lead_status] : Clock;
                const needsTeamLeadReview = !report.team_lead_status && report.final_status === "pending";
                const canBeOverridden = report.team_lead_status === "rejected" && report.final_status === "pending";
                const isPending = report.status === "pending" && report.final_status === "pending";
                
                return (
                  <TableRow key={report.id}>
                    <TableCell className="font-medium">
                      {format(new Date(report.work_date), "MMM d, yyyy")}
                    </TableCell>
                    <TableCell>{report.platform}</TableCell>
                    <TableCell>{report.hours_worked}h</TableCell>
                    <TableCell>${Number(report.earnings).toFixed(2)}</TableCell>
                    {showRateEdit && (
                      <TableCell>
                        {report.final_status === "pending" ? (
                          editingRate?.reportId === report.id ? (
                            <Dialog open={true} onOpenChange={(open) => !open && setEditingRate(null)}>
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
                                      value={editingRate.rate}
                                      onChange={(e) => setEditingRate({ ...editingRate, rate: e.target.value })}
                                      step="0.01"
                                      className="mt-1"
                                    />
                                  </div>
                                  {isOverseer && (
                                    <div>
                                      <Label>Reason (Required)</Label>
                                      <Textarea
                                        placeholder="Enter reason for rate change..."
                                        value={rateChangeReason}
                                        onChange={(e) => setRateChangeReason(e.target.value)}
                                        className="mt-1"
                                      />
                                    </div>
                                  )}
                                </div>
                                <DialogFooter>
                                  <Button variant="outline" onClick={() => { setEditingRate(null); setRateChangeReason(""); }}>
                                    Cancel
                                  </Button>
                                  <Button 
                                    onClick={handleRateSave}
                                    disabled={isOverseer && !rateChangeReason.trim()}
                                  >
                                    Save Rate
                                  </Button>
                                </DialogFooter>
                              </DialogContent>
                            </Dialog>
                          ) : (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 px-2 text-xs"
                              onClick={() => setEditingRate({ 
                                reportId: report.id, 
                                rate: String(report.current_rate || 0),
                                originalRate: report.current_rate || 0
                              })}
                            >
                              <DollarSign className="h-3 w-3 mr-1" />
                              {Number(report.current_rate || 0).toFixed(2)}
                            </Button>
                          )
                        ) : (
                          <span>${Number(report.current_rate || 0).toFixed(2)}</span>
                        )}
                      </TableCell>
                    )}
                    <TableCell>
                      <Badge variant="outline" className={statusColors[report.team_lead_status || "pending"]}>
                        <TLStatusIcon className="h-3 w-3 mr-1" />
                        {report.team_lead_status || "pending"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={statusColors[report.final_status]}>
                        <FinalStatusIcon className="h-3 w-3 mr-1" />
                        {report.final_status}
                      </Badge>
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate">
                      {report.description || "-"}
                    </TableCell>
                    {(showActions || showRateEdit) && (
                      <TableCell>
                        <div className="flex gap-1">
                          {/* Team Lead / Admin Review Actions */}
                          {showActions && (isTeamLead || canReview) && isPending && needsTeamLeadReview && (
                            <>
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-success hover:bg-success/10 h-7 w-7 p-0"
                                onClick={() => handleApprove(report.id)}
                                disabled={updateStatus.isPending || teamLeadReview.isPending}
                                title="Approve"
                              >
                                <Check className="h-3 w-3" />
                              </Button>
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="text-destructive hover:bg-destructive/10 h-7 w-7 p-0"
                                    onClick={() => setSelectedReport(report.id)}
                                    title={isTeamLead && !canReview ? "Reject (non-final)" : "Reject"}
                                  >
                                    <X className="h-3 w-3" />
                                  </Button>
                                </DialogTrigger>
                                <DialogContent>
                                  <DialogHeader>
                                    <DialogTitle>
                                      {isTeamLead && !canReview ? "Reject Report (Non-Final)" : "Reject Report"}
                                    </DialogTitle>
                                    <DialogDescription>
                                      {isTeamLead && !canReview
                                        ? "This rejection can be overridden by a higher-level admin."
                                        : "Please provide a reason for rejecting this report."}
                                    </DialogDescription>
                                  </DialogHeader>
                                  <Textarea
                                    placeholder="Enter rejection reason..."
                                    value={rejectionReason}
                                    onChange={(e) => setRejectionReason(e.target.value)}
                                  />
                                  <DialogFooter>
                                    <Button variant="outline" onClick={() => setSelectedReport(null)}>
                                      Cancel
                                    </Button>
                                    <Button
                                      variant="destructive"
                                      onClick={handleReject}
                                      disabled={!rejectionReason || updateStatus.isPending || teamLeadReview.isPending}
                                    >
                                      Reject
                                    </Button>
                                  </DialogFooter>
                                </DialogContent>
                              </Dialog>
                            </>
                          )}

                          {/* Admin Override Actions */}
                          {showActions && canOverride && canBeOverridden && (
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="text-primary hover:bg-primary/10 h-7 px-2"
                                  title="Admin Override"
                                >
                                  <Shield className="h-3 w-3 mr-1" />
                                  Override
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Admin Override</DialogTitle>
                                  <DialogDescription>
                                    Override the team lead rejection. This decision is final.
                                  </DialogDescription>
                                </DialogHeader>
                                <div className="space-y-4">
                                  <div>
                                    <Label>Team Lead Rejection Reason:</Label>
                                    <p className="text-sm text-muted-foreground mt-1">
                                      {report.team_lead_rejection_reason || "No reason provided"}
                                    </p>
                                  </div>
                                  <div>
                                    <Label>Override Reason {isOverseer ? "(Required)" : "(Optional)"}</Label>
                                    <Textarea
                                      placeholder="Enter reason for override..."
                                      value={overrideReason}
                                      onChange={(e) => setOverrideReason(e.target.value)}
                                      className="mt-1"
                                    />
                                    {isOverseer && !overrideReason.trim() && (
                                      <p className="text-xs text-destructive mt-1">
                                        Overseer overrides require a mandatory reason
                                      </p>
                                    )}
                                  </div>
                                </div>
                                <DialogFooter className="gap-2">
                                  <Button
                                    variant="destructive"
                                    onClick={() => handleAdminOverride(report.id, "rejected")}
                                    disabled={adminOverride.isPending || (isOverseer && !overrideReason.trim())}
                                  >
                                    Confirm Rejection
                                  </Button>
                                  <Button
                                    variant="default"
                                    onClick={() => handleAdminOverride(report.id, "approved")}
                                    disabled={adminOverride.isPending || (isOverseer && !overrideReason.trim())}
                                  >
                                    Override & Approve
                                  </Button>
                                </DialogFooter>
                              </DialogContent>
                            </Dialog>
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
                            onClick={() => setAuditReportId(report.id)}
                            title="View History"
                          >
                            <History className="h-3 w-3" />
                          </Button>
                        </div>
                      </TableCell>
                    )}
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <ReportAuditDialog
        reportId={auditReportId}
        open={!!auditReportId}
        onOpenChange={(open) => !open && setAuditReportId(null)}
      />
    </>
  );
}
