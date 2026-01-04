import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useTeams } from "@/hooks/useTeams";
import { Plus, Pencil, Trash2, Users } from "lucide-react";

export function TeamManagement() {
  const { teams, isLoading, createTeam, updateTeam, deleteTeam } = useTeams();
  const [createOpen, setCreateOpen] = useState(false);
  const [editTeam, setEditTeam] = useState<{ id: string; name: string; description: string } | null>(null);
  const [newTeam, setNewTeam] = useState({ name: "", description: "" });

  const handleCreate = async () => {
    if (!newTeam.name.trim()) return;
    await createTeam.mutateAsync(newTeam);
    setNewTeam({ name: "", description: "" });
    setCreateOpen(false);
  };

  const handleUpdate = async () => {
    if (!editTeam || !editTeam.name.trim()) return;
    await updateTeam.mutateAsync(editTeam);
    setEditTeam(null);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this team?")) return;
    await deleteTeam.mutateAsync(id);
  };

  if (isLoading) {
    return <div className="text-muted-foreground">Loading teams...</div>;
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Team Management
        </CardTitle>
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Create Team
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Team</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label>Team Name</Label>
                <Input
                  value={newTeam.name}
                  onChange={(e) => setNewTeam({ ...newTeam, name: e.target.value })}
                  placeholder="e.g., Content Team A"
                />
              </div>
              <div className="space-y-2">
                <Label>Description (optional)</Label>
                <Textarea
                  value={newTeam.description}
                  onChange={(e) => setNewTeam({ ...newTeam, description: e.target.value })}
                  placeholder="Brief description of the team..."
                />
              </div>
              <Button onClick={handleCreate} disabled={createTeam.isPending} className="w-full">
                {createTeam.isPending ? "Creating..." : "Create Team"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {teams.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">No teams created yet.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {teams.map((team) => (
                <TableRow key={team.id}>
                  <TableCell className="font-medium">{team.name}</TableCell>
                  <TableCell className="text-muted-foreground">{team.description || "-"}</TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setEditTeam({ id: team.id, name: team.name, description: team.description || "" })}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(team.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}

        {/* Edit Dialog */}
        <Dialog open={!!editTeam} onOpenChange={(open) => !open && setEditTeam(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Team</DialogTitle>
            </DialogHeader>
            {editTeam && (
              <div className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label>Team Name</Label>
                  <Input
                    value={editTeam.name}
                    onChange={(e) => setEditTeam({ ...editTeam, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea
                    value={editTeam.description}
                    onChange={(e) => setEditTeam({ ...editTeam, description: e.target.value })}
                  />
                </div>
                <Button onClick={handleUpdate} disabled={updateTeam.isPending} className="w-full">
                  {updateTeam.isPending ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
