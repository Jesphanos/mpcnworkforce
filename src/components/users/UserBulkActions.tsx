import { useState } from "react";
import { Users, Shield, Loader2, X } from "lucide-react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { Database } from "@/integrations/supabase/types";

type AppRole = Database["public"]["Enums"]["app_role"];

interface UserBulkActionsProps {
  selectedIds: string[];
  onClearSelection: () => void;
  onRefresh: () => void;
  teams: { id: string; name: string }[];
}

const ALL_ROLES: AppRole[] = [
  "employee",
  "team_lead",
  "report_admin",
  "finance_hr_admin",
  "investment_admin",
  "user_admin",
];

export function UserBulkActions({
  selectedIds,
  onClearSelection,
  onRefresh,
  teams,
}: UserBulkActionsProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [showRoleDialog, setShowRoleDialog] = useState(false);
  const [showTeamDialog, setShowTeamDialog] = useState(false);
  const [selectedRole, setSelectedRole] = useState<AppRole>("employee");
  const [selectedTeam, setSelectedTeam] = useState<string>("");

  const getRoleLabel = (role: string) => {
    return role
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const handleBulkRoleChange = async () => {
    if (selectedRole === "general_overseer") {
      toast.error("General Overseer role requires individual approval");
      return;
    }

    setIsProcessing(true);
    let successCount = 0;
    let errorCount = 0;

    for (const userId of selectedIds) {
      try {
        // Check if user already has a role entry
        const { data: existingRole } = await supabase
          .from("user_roles")
          .select("id")
          .eq("user_id", userId)
          .maybeSingle();

        if (existingRole) {
          await supabase
            .from("user_roles")
            .update({ role: selectedRole })
            .eq("user_id", userId);
        } else {
          await supabase
            .from("user_roles")
            .insert({ user_id: userId, role: selectedRole });
        }
        successCount++;
      } catch (error) {
        errorCount++;
      }
    }

    setIsProcessing(false);
    setShowRoleDialog(false);
    onClearSelection();
    onRefresh();

    if (successCount > 0) {
      toast.success(
        `${successCount} user${successCount > 1 ? "s" : ""} updated to ${getRoleLabel(
          selectedRole
        )}`
      );
    }
    if (errorCount > 0) {
      toast.error(`Failed to update ${errorCount} user${errorCount > 1 ? "s" : ""}`);
    }
  };

  const handleBulkTeamAssignment = async () => {
    if (!selectedTeam) {
      toast.error("Please select a team");
      return;
    }

    setIsProcessing(true);
    let successCount = 0;
    let errorCount = 0;

    for (const userId of selectedIds) {
      try {
        // Deactivate existing memberships
        await supabase
          .from("team_members")
          .update({ is_active: false })
          .eq("user_id", userId)
          .eq("is_active", true);

        // Create new membership
        await supabase.from("team_members").insert({
          team_id: selectedTeam,
          user_id: userId,
          role: "member",
          is_active: true,
        });

        successCount++;
      } catch (error) {
        errorCount++;
      }
    }

    setIsProcessing(false);
    setShowTeamDialog(false);
    setSelectedTeam("");
    onClearSelection();
    onRefresh();

    if (successCount > 0) {
      toast.success(
        `${successCount} user${successCount > 1 ? "s" : ""} assigned to team`
      );
    }
    if (errorCount > 0) {
      toast.error(`Failed to assign ${errorCount} user${errorCount > 1 ? "s" : ""}`);
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
            onClick={() => setShowRoleDialog(true)}
            disabled={isProcessing}
          >
            <Shield className="mr-2 h-4 w-4" />
            Change Role
          </Button>
          <Button
            size="sm"
            variant="secondary"
            onClick={() => setShowTeamDialog(true)}
            disabled={isProcessing}
          >
            <Users className="mr-2 h-4 w-4" />
            Assign Team
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

      {/* Role Change Dialog */}
      <Dialog open={showRoleDialog} onOpenChange={setShowRoleDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change Role</DialogTitle>
            <DialogDescription>
              Assign a new role to {selectedIds.length} selected user
              {selectedIds.length > 1 ? "s" : ""}.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>New Role</Label>
              <Select
                value={selectedRole}
                onValueChange={(v) => setSelectedRole(v as AppRole)}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ALL_ROLES.map((role) => (
                    <SelectItem key={role} value={role}>
                      {getRoleLabel(role)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRoleDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleBulkRoleChange} disabled={isProcessing}>
              {isProcessing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Apply Role
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Team Assignment Dialog */}
      <Dialog open={showTeamDialog} onOpenChange={setShowTeamDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign to Team</DialogTitle>
            <DialogDescription>
              Move {selectedIds.length} selected user{selectedIds.length > 1 ? "s" : ""}{" "}
              to a team.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Team</Label>
              <Select value={selectedTeam} onValueChange={setSelectedTeam}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select a team" />
                </SelectTrigger>
                <SelectContent>
                  {teams.map((team) => (
                    <SelectItem key={team.id} value={team.id}>
                      {team.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowTeamDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleBulkTeamAssignment}
              disabled={!selectedTeam || isProcessing}
            >
              {isProcessing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Assign Team
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
