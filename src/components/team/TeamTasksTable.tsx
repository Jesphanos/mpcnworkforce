import { useState } from "react";
import { useTeamTasks, TeamTask } from "@/hooks/useTeamData";
import { useTeamLeadReview, useAdminOverride } from "@/hooks/useTasks";
import { useAuth } from "@/contexts/AuthContext";
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

export function TeamTasksTable() {
  const { data: tasks, isLoading } = useTeamTasks();
  const { hasRole, user } = useAuth();
  const teamLeadReview = useTeamLeadReview();
  const adminOverride = useAdminOverride();

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [rejectDialog, setRejectDialog] = useState<{
    open: boolean;
    taskId: string;
    isOverride: boolean;
  }>({ open: false, taskId: "", isOverride: false });
  const [rejectReason, setRejectReason] = useState("");

  const isTeamLead = hasRole("team_lead");
  const canOverride =
    hasRole("report_admin") ||
    hasRole("finance_hr_admin") ||
    hasRole("investment_admin") ||
    hasRole("user_admin") ||
    hasRole("general_overseer");

  const getStatusBadge = (task: TeamTask) => {
    if (task.final_status === "approved") {
      return <Badge className="bg-green-500/20 text-green-600 border-green-500/30">Approved</Badge>;
    }
    if (task.final_status === "rejected") {
      return <Badge variant="destructive">Rejected</Badge>;
    }
    if (task.team_lead_status === "rejected") {
      return <Badge variant="outline" className="text-orange-500 border-orange-500">TL Rejected</Badge>;
    }
    return <Badge variant="secondary">Pending</Badge>;
  };

  const handleApprove = (taskId: string) => {
    teamLeadReview.mutate({ taskId, status: "approved" });
  };

  const handleReject = () => {
    if (rejectDialog.isOverride) {
      adminOverride.mutate({
        taskId: rejectDialog.taskId,
        status: "rejected",
        overrideReason: rejectReason,
      });
    } else {
      teamLeadReview.mutate({
        taskId: rejectDialog.taskId,
        status: "rejected",
        rejectionReason: rejectReason,
      });
    }
    setRejectDialog({ open: false, taskId: "", isOverride: false });
    setRejectReason("");
  };

  const handleOverrideApprove = (taskId: string) => {
    adminOverride.mutate({ taskId, status: "approved", overrideReason: "Admin override approval" });
  };

  const filteredTasks = tasks?.filter((task) => {
    const matchesSearch =
      task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.user_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.platform.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" ||
      task.final_status === statusFilter ||
      (statusFilter === "tl_rejected" && task.team_lead_status === "rejected" && task.final_status === "pending");

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
            placeholder="Search by title, user, or platform..."
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
              <TableHead>Task</TableHead>
              <TableHead>Platform</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Hours</TableHead>
              <TableHead>Rate</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTasks?.map((task) => {
              const canReview =
                task.final_status === "pending" &&
                !task.team_lead_status &&
                task.user_id !== user?.id;
              const canOverrideTask =
                canOverride &&
                task.final_status === "pending" &&
                task.team_lead_status === "rejected";

              return (
                <TableRow key={task.id}>
                  <TableCell className="font-medium">{task.user_name}</TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">{task.title}</p>
                      {task.description && (
                        <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                          {task.description}
                        </p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{task.platform}</Badge>
                  </TableCell>
                  <TableCell>{format(new Date(task.work_date), "MMM d, yyyy")}</TableCell>
                  <TableCell>{task.hours_worked}h</TableCell>
                  <TableCell>${task.current_rate}/hr</TableCell>
                  <TableCell>{getStatusBadge(task)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      {canReview && isTeamLead && (
                        <>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-green-600 hover:text-green-700 hover:bg-green-50"
                            onClick={() => handleApprove(task.id)}
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            onClick={() =>
                              setRejectDialog({ open: true, taskId: task.id, isOverride: false })
                            }
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                      {canOverrideTask && (
                        <>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                            onClick={() => handleOverrideApprove(task.id)}
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
                              setRejectDialog({ open: true, taskId: task.id, isOverride: true })
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
            {(!filteredTasks || filteredTasks.length === 0) && (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                  No tasks found
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
              {rejectDialog.isOverride ? "Override: Reject Task" : "Reject Task"}
            </DialogTitle>
            <DialogDescription>
              Please provide a reason for {rejectDialog.isOverride ? "overriding and " : ""}rejecting this task.
            </DialogDescription>
          </DialogHeader>
          <Textarea
            placeholder="Enter rejection reason..."
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            className="min-h-[100px]"
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectDialog({ open: false, taskId: "", isOverride: false })}>
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
