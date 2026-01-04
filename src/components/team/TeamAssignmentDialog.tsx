import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useTeams, useTeamMembers } from "@/hooks/useTeams";
import { Users } from "lucide-react";

interface TeamAssignmentDialogProps {
  userId: string;
  userName: string;
  currentTeamId?: string;
  trigger?: React.ReactNode;
}

export function TeamAssignmentDialog({ userId, userName, currentTeamId, trigger }: TeamAssignmentDialogProps) {
  const [open, setOpen] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState(currentTeamId || "");
  const { teams, isLoading: teamsLoading } = useTeams();
  const { assignMember, removeMember } = useTeamMembers();

  const handleAssign = async () => {
    if (!selectedTeam) return;

    // Remove from current team if exists
    if (currentTeamId && currentTeamId !== selectedTeam) {
      await removeMember.mutateAsync({ teamId: currentTeamId, userId });
    }

    // Assign to new team
    await assignMember.mutateAsync({ teamId: selectedTeam, userId });
    setOpen(false);
  };

  const handleRemove = async () => {
    if (!currentTeamId) return;
    await removeMember.mutateAsync({ teamId: currentTeamId, userId });
    setSelectedTeam("");
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm">
            <Users className="h-4 w-4 mr-2" />
            Assign Team
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Assign {userName} to Team</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label>Select Team</Label>
            <Select value={selectedTeam} onValueChange={setSelectedTeam} disabled={teamsLoading}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a team..." />
              </SelectTrigger>
              <SelectContent>
                {teams.map((team) => (
                  <SelectItem key={team.id} value={team.id}>
                    {team.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {teams.length === 0 && !teamsLoading && (
              <p className="text-sm text-muted-foreground">No teams available. Create a team first.</p>
            )}
          </div>

          <div className="flex gap-2 justify-end">
            {currentTeamId && (
              <Button
                variant="outline"
                onClick={handleRemove}
                disabled={removeMember.isPending}
              >
                Remove from Team
              </Button>
            )}
            <Button
              onClick={handleAssign}
              disabled={!selectedTeam || assignMember.isPending}
            >
              {assignMember.isPending ? "Assigning..." : "Assign"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
