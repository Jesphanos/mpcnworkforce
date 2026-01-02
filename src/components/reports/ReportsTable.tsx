import { format } from "date-fns";
import { Check, X, Clock, Eye } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { WorkReport, useUpdateReportStatus } from "@/hooks/useWorkReports";
import { useAuth } from "@/contexts/AuthContext";

interface ReportsTableProps {
  reports: WorkReport[];
  showActions?: boolean;
}

const statusColors = {
  pending: "bg-warning/10 text-warning border-warning/20",
  approved: "bg-success/10 text-success border-success/20",
  rejected: "bg-destructive/10 text-destructive border-destructive/20",
};

const statusIcons = {
  pending: Clock,
  approved: Check,
  rejected: X,
};

export function ReportsTable({ reports, showActions = false }: ReportsTableProps) {
  const { hasRole } = useAuth();
  const canReview = hasRole("report_admin");
  const [rejectionReason, setRejectionReason] = useState("");
  const [selectedReport, setSelectedReport] = useState<string | null>(null);
  const updateStatus = useUpdateReportStatus();

  const handleApprove = async (reportId: string) => {
    await updateStatus.mutateAsync({ reportId, status: "approved" });
  };

  const handleReject = async () => {
    if (selectedReport) {
      await updateStatus.mutateAsync({
        reportId: selectedReport,
        status: "rejected",
        rejectionReason,
      });
      setSelectedReport(null);
      setRejectionReason("");
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
              <TableHead>Status</TableHead>
              <TableHead>Description</TableHead>
              {showActions && canReview && <TableHead>Actions</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {reports.map((report) => {
              const StatusIcon = statusIcons[report.status];
              return (
                <TableRow key={report.id}>
                  <TableCell className="font-medium">
                    {format(new Date(report.work_date), "MMM d, yyyy")}
                  </TableCell>
                  <TableCell>{report.platform}</TableCell>
                  <TableCell>{report.hours_worked}h</TableCell>
                  <TableCell>${Number(report.earnings).toFixed(2)}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={statusColors[report.status]}>
                      <StatusIcon className="h-3 w-3 mr-1" />
                      {report.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="max-w-[200px] truncate">
                    {report.description || "-"}
                  </TableCell>
                  {showActions && canReview && (
                    <TableCell>
                      {report.status === "pending" && (
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-success hover:bg-success/10"
                            onClick={() => handleApprove(report.id)}
                            disabled={updateStatus.isPending}
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-destructive hover:bg-destructive/10"
                                onClick={() => setSelectedReport(report.id)}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Reject Report</DialogTitle>
                                <DialogDescription>
                                  Please provide a reason for rejecting this report.
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
                                  disabled={!rejectionReason || updateStatus.isPending}
                                >
                                  Reject
                                </Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>
                        </div>
                      )}
                      {report.status === "rejected" && report.rejection_reason && (
                        <span className="text-xs text-muted-foreground">
                          {report.rejection_reason}
                        </span>
                      )}
                    </TableCell>
                  )}
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
