import { useState } from "react";
import { useTeamReports, TeamReport } from "@/hooks/useTeamData";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { format } from "date-fns";
import { Check, X, Shield, Search } from "lucide-react";

export function TeamReportsTable() {
  const { data: reports, isLoading } = useTeamReports();
  const { hasRole, user } = useAuth();
  const queryClient = useQueryClient();

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [rejectDialog, setRejectDialog] = useState<{
    open: boolean;
    reportId: string;
    isOverride: boolean;
  }>({ open: false, reportId: "", isOverride: false });
  const [rejectReason, setRejectReason] = useState("");

  const isTeamLead = hasRole("team_lead");
  const canOverride =
    hasRole("report_admin") ||
    hasRole("finance_hr_admin") ||
    hasRole("investment_admin") ||
    hasRole("user_admin") ||
    hasRole("general_overseer");

  const getStatusBadge = (report: TeamReport) => {
    if (report.final_status === "approved") {
      return <Badge className="bg-green-500/20 text-green-600 border-green-500/30">Approved</Badge>;
    }
    if (report.final_status === "rejected") {
      return <Badge variant="destructive">Rejected</Badge>;
    }
    if (report.team_lead_status === "rejected") {
      return <Badge variant="outline" className="text-orange-500 border-orange-500">TL Rejected</Badge>;
    }
    return <Badge variant="secondary">Pending</Badge>;
  };

  const handleApprove = async (reportId: string) => {
    const { error } = await supabase
      .from("work_reports")
      .update({
        team_lead_status: "approved",
        team_lead_reviewed_by: user?.id,
        team_lead_reviewed_at: new Date().toISOString(),
        final_status: "approved",
      })
      .eq("id", reportId);

    if (error) {
      toast.error("Failed to approve report");
    } else {
      toast.success("Report approved");
      queryClient.invalidateQueries({ queryKey: ["team-reports"] });
    }
  };

  const handleReject = async () => {
    if (rejectDialog.isOverride) {
      const { error } = await supabase
        .from("work_reports")
        .update({
          admin_status: "rejected",
          admin_override_reason: rejectReason,
          reviewed_by: user?.id,
          reviewed_at: new Date().toISOString(),
          final_status: "rejected",
        })
        .eq("id", rejectDialog.reportId);

      if (error) {
        toast.error("Failed to reject report");
      } else {
        toast.success("Report rejected (override)");
        queryClient.invalidateQueries({ queryKey: ["team-reports"] });
      }
    } else {
      const { error } = await supabase
        .from("work_reports")
        .update({
          team_lead_status: "rejected",
          team_lead_rejection_reason: rejectReason,
          team_lead_reviewed_by: user?.id,
          team_lead_reviewed_at: new Date().toISOString(),
        })
        .eq("id", rejectDialog.reportId);

      if (error) {
        toast.error("Failed to reject report");
      } else {
        toast.success("Report rejected by team lead");
        queryClient.invalidateQueries({ queryKey: ["team-reports"] });
      }
    }
    setRejectDialog({ open: false, reportId: "", isOverride: false });
    setRejectReason("");
  };

  const handleOverrideApprove = async (reportId: string) => {
    const { error } = await supabase
      .from("work_reports")
      .update({
        admin_status: "approved",
        admin_override_reason: "Admin override approval",
        reviewed_by: user?.id,
        reviewed_at: new Date().toISOString(),
        final_status: "approved",
      })
      .eq("id", reportId);

    if (error) {
      toast.error("Failed to override report");
    } else {
      toast.success("Report approved (override)");
      queryClient.invalidateQueries({ queryKey: ["team-reports"] });
    }
  };

  const filteredReports = reports?.filter((report) => {
    const matchesSearch =
      report.platform.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.user_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.description?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" ||
      report.final_status === statusFilter ||
      (statusFilter === "tl_rejected" && report.team_lead_status === "rejected" && report.final_status === "pending");

    return matchesSearch && matchesStatus;
  });

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-3">
        <div className="h-10 bg-muted rounded" />
        <div className="h-64 bg-muted rounded" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by platform, user, or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
            <SelectItem value="tl_rejected">TL Rejected</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Platform</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Hours</TableHead>
              <TableHead>Earnings</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredReports?.map((report) => {
              const canReview =
                report.final_status === "pending" &&
                !report.team_lead_status &&
                report.user_id !== user?.id;
              const canOverrideReport =
                canOverride &&
                report.final_status === "pending" &&
                report.team_lead_status === "rejected";

              return (
                <TableRow key={report.id}>
                  <TableCell className="font-medium">{report.user_name}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{report.platform}</Badge>
                  </TableCell>
                  <TableCell>
                    <p className="text-sm text-muted-foreground truncate max-w-[200px]">
                      {report.description || "No description"}
                    </p>
                  </TableCell>
                  <TableCell>{format(new Date(report.work_date), "MMM d, yyyy")}</TableCell>
                  <TableCell>{report.hours_worked}h</TableCell>
                  <TableCell>${report.earnings.toFixed(2)}</TableCell>
                  <TableCell>{getStatusBadge(report)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      {canReview && isTeamLead && (
                        <>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-green-600 hover:text-green-700 hover:bg-green-50"
                            onClick={() => handleApprove(report.id)}
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            onClick={() =>
                              setRejectDialog({ open: true, reportId: report.id, isOverride: false })
                            }
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                      {canOverrideReport && (
                        <>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                            onClick={() => handleOverrideApprove(report.id)}
                            title="Override: Approve"
                          >
                            <Shield className="h-4 w-4" />
                            <Check className="h-3 w-3 -ml-1" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            onClick={() =>
                              setRejectDialog({ open: true, reportId: report.id, isOverride: true })
                            }
                            title="Override: Reject"
                          >
                            <Shield className="h-4 w-4" />
                            <X className="h-3 w-3 -ml-1" />
                          </Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
            {(!filteredReports || filteredReports.length === 0) && (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                  No reports found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={rejectDialog.open} onOpenChange={(open) => setRejectDialog((prev) => ({ ...prev, open }))}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {rejectDialog.isOverride ? "Override: Reject Report" : "Reject Report"}
            </DialogTitle>
            <DialogDescription>
              Please provide a reason for {rejectDialog.isOverride ? "overriding and " : ""}rejecting this report.
            </DialogDescription>
          </DialogHeader>
          <Textarea
            placeholder="Enter rejection reason..."
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            className="min-h-[100px]"
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectDialog({ open: false, reportId: "", isOverride: false })}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleReject} disabled={!rejectReason.trim()}>
              Reject
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
