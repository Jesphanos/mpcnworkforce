import { format } from "date-fns";
import { Check, X, Clock, Eye, Shield, DollarSign, History, RotateCcw, Users } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Task, useTeamLeadReview, useAdminOverride, useUpdateTaskRate, useRequestRevision } from "@/hooks/useTasks";
import { useAuth } from "@/contexts/AuthContext";
import { TaskAuditDialog } from "./TaskAuditDialog";
import { supabase } from "@/integrations/supabase/client";

interface TasksTableProps {
  tasks: Task[];
  showActions?: boolean;
  showRateEdit?: boolean;
}

const statusColors: Record<string, string> = {
  pending: "bg-warning/10 text-warning border-warning/20",
  approved: "bg-success/10 text-success border-success/20",
  rejected: "bg-amber-500/10 text-amber-600 border-amber-500/20",
  revision_requested: "bg-blue-500/10 text-blue-600 border-blue-500/20",
};

const statusIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  pending: Clock,
  approved: Check,
  rejected: X,
  revision_requested: RotateCcw,
};

// Employee-friendly labels (softened rejection language)
const statusLabels: Record<string, string> = {
  pending: "Pending",
  approved: "Approved",
  rejected: "Needs Revision",
  revision_requested: "Revision Requested",
};

export function TasksTable({ tasks, showActions = false, showRateEdit = false }: TasksTableProps) {
  const { hasRole, role } = useAuth();
  const isTeamLead = hasRole("team_lead");
  const canOverride = hasRole("report_admin");
  const isOverseer = hasRole("general_overseer");
  
  const [rejectionReason, setRejectionReason] = useState("");
  const [overrideReason, setOverrideReason] = useState("");
  const [revisionNotes, setRevisionNotes] = useState("");
  const [selectedTask, setSelectedTask] = useState<string | null>(null);
  const [editingRate, setEditingRate] = useState<{ taskId: string; rate: string; originalRate: number } | null>(null);
  const [rateChangeReason, setRateChangeReason] = useState("");
  const [auditTaskId, setAuditTaskId] = useState<string | null>(null);
  const [collaboratorNames, setCollaboratorNames] = useState<Record<string, string>>({});
  
  const teamLeadReview = useTeamLeadReview();
  const adminOverride = useAdminOverride();
  const updateRate = useUpdateTaskRate();
  const requestRevision = useRequestRevision();

  // Fetch collaborator names
  useEffect(() => {
    const allCollaboratorIds = new Set<string>();
    tasks.forEach(task => {
      task.collaborators?.forEach(id => allCollaboratorIds.add(id));
    });

    if (allCollaboratorIds.size > 0) {
      const fetchNames = async () => {
        const { data } = await supabase
          .from("profiles")
          .select("id, full_name")
          .in("id", Array.from(allCollaboratorIds));
        
        if (data) {
          const names: Record<string, string> = {};
          data.forEach(p => {
            names[p.id] = p.full_name || p.id.slice(0, 8);
          });
          setCollaboratorNames(names);
        }
      };
      fetchNames();
    }
  }, [tasks]);

  const handleTeamLeadApprove = async (task: Task) => {
    await teamLeadReview.mutateAsync({ taskId: task.id, status: "approved", task });
  };

  const handleTeamLeadReject = async (task: Task) => {
    await teamLeadReview.mutateAsync({
      taskId: task.id,
      status: "rejected",
      rejectionReason,
      task,
    });
    setSelectedTask(null);
    setRejectionReason("");
  };

  const handleAdminOverride = async (task: Task, status: "approved" | "rejected") => {
    // Mandatory reason for overseer
    if (isOverseer && !overrideReason.trim()) {
      toast.error("Override reason is required");
      return;
    }
    await adminOverride.mutateAsync({
      taskId: task.id,
      status,
      overrideReason,
      task,
    });
    setOverrideReason("");
  };

  const handleRequestRevision = async (task: Task) => {
    await requestRevision.mutateAsync({
      taskId: task.id,
      notes: revisionNotes,
    });
    setRevisionNotes("");
  };

  const handleRateSave = async (task: Task) => {
    if (editingRate) {
      // Overseer requires reason for rate changes
      if (isOverseer && !rateChangeReason.trim()) {
        toast.error("Reason is required for rate changes");
        return;
      }
      await updateRate.mutateAsync({
        taskId: editingRate.taskId,
        newRate: parseFloat(editingRate.rate),
      });
      setEditingRate(null);
      setRateChangeReason("");
    }
  };

  if (tasks.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-10">
          <Eye className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground">No tasks found</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Tasks</CardTitle>
          <CardDescription>
            {showActions ? "Review and manage tasks with approval workflow" : "Your submitted tasks"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Platform</TableHead>
                <TableHead>Hours</TableHead>
                <TableHead>Rate</TableHead>
                <TableHead>Earnings</TableHead>
                <TableHead>Revisions</TableHead>
                <TableHead>Collaborators</TableHead>
                <TableHead>TL Status</TableHead>
                <TableHead>Final Status</TableHead>
                {(showActions || showRateEdit) && <TableHead>Actions</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {tasks.map((task) => {
                const FinalStatusIcon = statusIcons[task.final_status] || Clock;
                const TLStatusIcon = task.team_lead_status ? statusIcons[task.team_lead_status] : Clock;
                const needsTeamLeadReview = !task.team_lead_status && task.final_status === "pending";
                const canBeOverridden = task.team_lead_status === "rejected" && task.final_status === "pending";
                
                return (
                  <TableRow key={task.id}>
                    <TableCell className="font-medium">
                      {format(new Date(task.work_date), "MMM d, yyyy")}
                    </TableCell>
                    <TableCell>{task.title}</TableCell>
                    <TableCell>{task.platform}</TableCell>
                    <TableCell>{task.hours_worked}h</TableCell>
                    <TableCell>
                      {showRateEdit && task.final_status === "pending" ? (
                        editingRate?.taskId === task.id ? (
                          <Dialog open={true} onOpenChange={(open) => !open && setEditingRate(null)}>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Update Rate</DialogTitle>
                                <DialogDescription>
                                  {isOverseer 
                                    ? "A reason is required for all overseer rate changes."
                                    : "Update the rate for this task."}
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
                                  onClick={() => handleRateSave(task)}
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
                              taskId: task.id, 
                              rate: String(task.current_rate),
                              originalRate: task.current_rate 
                            })}
                          >
                            <DollarSign className="h-3 w-3 mr-1" />
                            {Number(task.current_rate).toFixed(2)}
                          </Button>
                        )
                      ) : (
                        <span>${Number(task.current_rate).toFixed(2)}</span>
                      )}
                    </TableCell>
                    <TableCell>${Number(task.calculated_earnings).toFixed(2)}</TableCell>
                    <TableCell>
                      {task.revisions_count > 0 ? (
                        <Badge variant="secondary" className="gap-1">
                          <RotateCcw className="h-3 w-3" />
                          {task.revisions_count}
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground text-sm">0</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <TooltipProvider>
                        {task.collaborators && task.collaborators.length > 0 ? (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Badge variant="outline" className="gap-1 cursor-help">
                                <Users className="h-3 w-3" />
                                {task.collaborators.length}
                              </Badge>
                            </TooltipTrigger>
                            <TooltipContent>
                              <div className="text-sm">
                                {task.collaborators.map(id => (
                                  <div key={id}>{collaboratorNames[id] || id.slice(0, 8)}</div>
                                ))}
                              </div>
                            </TooltipContent>
                          </Tooltip>
                        ) : (
                          <span className="text-muted-foreground text-sm">—</span>
                        )}
                      </TooltipProvider>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={statusColors[task.team_lead_status || "pending"]}>
                        <TLStatusIcon className="h-3 w-3 mr-1" />
                        {statusLabels[task.team_lead_status || "pending"] || task.team_lead_status || "pending"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={statusColors[task.final_status]}>
                        <FinalStatusIcon className="h-3 w-3 mr-1" />
                        {statusLabels[task.final_status] || task.final_status}
                      </Badge>
                    </TableCell>
                    {(showActions || showRateEdit) && (
                      <TableCell>
                        <div className="flex gap-1">
                          {/* Team Lead Actions */}
                          {showActions && isTeamLead && needsTeamLeadReview && (
                            <>
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-success hover:bg-success/10 h-7 w-7 p-0"
                                onClick={() => handleTeamLeadApprove(task)}
                                disabled={teamLeadReview.isPending}
                                title="Approve"
                              >
                                <Check className="h-3 w-3" />
                              </Button>
                              
                              {/* Request Revision Button */}
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="text-blue-600 hover:bg-blue-500/10 h-7 w-7 p-0"
                                    title="Request Revision"
                                  >
                                    <RotateCcw className="h-3 w-3" />
                                  </Button>
                                </DialogTrigger>
                                <DialogContent>
                                  <DialogHeader>
                                    <DialogTitle>Request Revision</DialogTitle>
                                    <DialogDescription>
                                      Ask the employee to revise this task. Revision count: {task.revisions_count}
                                    </DialogDescription>
                                  </DialogHeader>
                                  <Textarea
                                    placeholder="Enter revision notes (what needs to be changed)..."
                                    value={revisionNotes}
                                    onChange={(e) => setRevisionNotes(e.target.value)}
                                  />
                                  <DialogFooter>
                                    <Button variant="outline" onClick={() => setRevisionNotes("")}>
                                      Cancel
                                    </Button>
                                    <Button
                                      onClick={() => handleRequestRevision(task)}
                                      disabled={requestRevision.isPending}
                                    >
                                      <RotateCcw className="h-4 w-4 mr-2" />
                                      Request Revision
                                    </Button>
                                  </DialogFooter>
                                </DialogContent>
                              </Dialog>
                              
                              {/* Reject Button */}
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="text-destructive hover:bg-destructive/10 h-7 w-7 p-0"
                                    onClick={() => setSelectedTask(task.id)}
                                    title="Reject (non-final)"
                                  >
                                    <X className="h-3 w-3" />
                                  </Button>
                                </DialogTrigger>
                                <DialogContent>
                                  <DialogHeader>
                                    <DialogTitle>Reject Task (Non-Final)</DialogTitle>
                                    <DialogDescription>
                                      This rejection can be overridden by a higher-level admin.
                                    </DialogDescription>
                                  </DialogHeader>
                                  <Textarea
                                    placeholder="Enter rejection reason..."
                                    value={rejectionReason}
                                    onChange={(e) => setRejectionReason(e.target.value)}
                                  />
                                  <DialogFooter>
                                    <Button variant="outline" onClick={() => setSelectedTask(null)}>
                                      Cancel
                                    </Button>
                                    <Button
                                      variant="destructive"
                                      onClick={() => handleTeamLeadReject(task)}
                                      disabled={!rejectionReason || teamLeadReview.isPending}
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
                                      {task.team_lead_rejection_reason || "No reason provided"}
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
                                    onClick={() => handleAdminOverride(task, "rejected")}
                                    disabled={adminOverride.isPending || (isOverseer && !overrideReason.trim())}
                                  >
                                    Confirm Rejection
                                  </Button>
                                  <Button
                                    variant="default"
                                    onClick={() => handleAdminOverride(task, "approved")}
                                    disabled={adminOverride.isPending || (isOverseer && !overrideReason.trim())}
                                  >
                                    Override & Approve
                                  </Button>
                                </DialogFooter>
                              </DialogContent>
                            </Dialog>
                          )}

                          {/* Audit Log Button */}
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 w-7 p-0"
                            onClick={() => setAuditTaskId(task.id)}
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

      <TaskAuditDialog
        taskId={auditTaskId}
        open={!!auditTaskId}
        onOpenChange={(open) => !open && setAuditTaskId(null)}
      />
    </>
  );
}
