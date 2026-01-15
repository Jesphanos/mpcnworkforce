import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useTeams, useTeamMembers } from "@/hooks/useTeams";
import { Users, ArrowRightLeft, AlertTriangle } from "lucide-react";

interface TeamAssignmentDialogProps {
  userId: string;
  userName: string;
  currentTeamId?: string;
  trigger?: React.ReactNode;
}

/**
 * Team Assignment/Transfer Dialog
 * 
 * Enforces governance rules:
 * - Single active team membership
 * - Mandatory transfer reason when moving between teams
 * - Audit logging for all changes
 */
export function TeamAssignmentDialog({ userId, userName, currentTeamId, trigger }: TeamAssignmentDialogProps) {
  const [open, setOpen] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState(currentTeamId || "");
  const [transferReason, setTransferReason] = useState("");
  const { teams, isLoading: teamsLoading } = useTeams();
  const { assignMember, transferMember, removeMember } = useTeamMembers();

  const isTransfer = !!currentTeamId && selectedTeam !== currentTeamId;
  const currentTeam = teams.find(t => t.id === currentTeamId);
  const selectedTeamData = teams.find(t => t.id === selectedTeam);

  const handleAssign = async () => {
    if (!selectedTeam) return;

    if (isTransfer) {
      // Transfer requires reason
      if (!transferReason.trim()) {
        return;
      }
      await transferMember.mutateAsync({
        userId,
        newTeamId: selectedTeam,
        transferReason: transferReason.trim(),
      });
    } else if (!currentTeamId) {
      // New assignment (no previous team)
      await assignMember.mutateAsync({ teamId: selectedTeam, userId });
    }
    
    setTransferReason("");
    setOpen(false);
  };

  const handleRemove = async () => {
    if (!currentTeamId) return;
    
    const reason = transferReason.trim() || "Removed from team by admin";
    await removeMember.mutateAsync({ 
      teamId: currentTeamId, 
      userId,
      reason,
    });
    setSelectedTeam("");
    setTransferReason("");
    setOpen(false);
  };

  const canSubmit = selectedTeam && (
    (!isTransfer && !currentTeamId) || 
    (isTransfer && transferReason.trim().length >= 10)
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm">
            <Users className="h-4 w-4 mr-2" />
            {currentTeamId ? "Transfer Team" : "Assign Team"}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {isTransfer ? (
              <>
                <ArrowRightLeft className="h-5 w-5" />
                Initiate Team Transfer
              </>
            ) : (
              <>
                <Users className="h-5 w-5" />
                Assign to Team
              </>
            )}
          </DialogTitle>
          <DialogDescription>
            {isTransfer 
              ? `Transfer ${userName} to a different team. A reason is required for all transfers.`
              : `Assign ${userName} to a team.`
            }
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 pt-4">
          {/* Current Team Display */}
          {currentTeam && (
            <div className="space-y-2">
              <Label className="text-muted-foreground">Current Team</Label>
              <div className="flex items-center gap-2">
                <Badge variant="secondary">{currentTeam.name}</Badge>
                {currentTeam.skill_focus && (
                  <Badge variant="outline">{currentTeam.skill_focus}</Badge>
                )}
              </div>
            </div>
          )}

          {/* Team Selection */}
          <div className="space-y-2">
            <Label>{currentTeamId ? "Transfer to Team" : "Select Team"}</Label>
            <Select value={selectedTeam} onValueChange={setSelectedTeam} disabled={teamsLoading}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a team..." />
              </SelectTrigger>
              <SelectContent>
                {teams.map((team) => (
                  <SelectItem 
                    key={team.id} 
                    value={team.id}
                    disabled={team.id === currentTeamId}
                  >
                    {team.name}
                    {team.skill_focus && ` (${team.skill_focus})`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {teams.length === 0 && !teamsLoading && (
              <p className="text-sm text-muted-foreground">No teams available. Create a team first.</p>
            )}
          </div>

          {/* Transfer Reason (required for transfers) */}
          {isTransfer && (
            <div className="space-y-2">
              <Label>
                Transfer Reason <span className="text-destructive">*</span>
              </Label>
              <Textarea
                placeholder="Explain why this transfer is being made (minimum 10 characters)..."
                value={transferReason}
                onChange={(e) => setTransferReason(e.target.value)}
                rows={3}
              />
              <p className="text-xs text-muted-foreground">
                This reason will be recorded in the audit log.
              </p>
            </div>
          )}

          {/* Transfer Warning */}
          {isTransfer && selectedTeamData && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                This will transfer <strong>{userName}</strong> from{" "}
                <strong>{currentTeam?.name}</strong> to{" "}
                <strong>{selectedTeamData.name}</strong>. Previous membership will be preserved in history.
              </AlertDescription>
            </Alert>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2 justify-end pt-2">
            {currentTeamId && (
              <Button
                variant="outline"
                onClick={handleRemove}
                disabled={removeMember.isPending}
                className="text-destructive hover:text-destructive"
              >
                Remove from Team
              </Button>
            )}
            <Button
              onClick={handleAssign}
              disabled={!canSubmit || assignMember.isPending || transferMember.isPending}
            >
              {assignMember.isPending || transferMember.isPending 
                ? "Processing..." 
                : isTransfer 
                  ? "Complete Transfer" 
                  : "Assign"
              }
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
