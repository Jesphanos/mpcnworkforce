import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useTeams } from "@/hooks/useTeams";
import { Plus, Pencil, Trash2, Users, MapPin, Briefcase } from "lucide-react";

const SKILL_OPTIONS = [
  "Content Writing",
  "Data Entry",
  "Research",
  "Design",
  "Development",
  "Quality Assurance",
  "Project Management",
  "Customer Support",
  "Marketing",
  "Other",
];

const REGION_OPTIONS = [
  "Africa",
  "Asia",
  "Europe",
  "North America",
  "South America",
  "Oceania",
  "Remote/Global",
];

interface TeamFormData {
  name: string;
  description: string;
  skill_focus: string;
  region: string;
}

const emptyForm: TeamFormData = { name: "", description: "", skill_focus: "", region: "" };

export function TeamManagement() {
  const { teams, isLoading, createTeam, updateTeam, deleteTeam } = useTeams();
  const [createOpen, setCreateOpen] = useState(false);
  const [editTeam, setEditTeam] = useState<(TeamFormData & { id: string }) | null>(null);
  const [newTeam, setNewTeam] = useState<TeamFormData>(emptyForm);

  const handleCreate = async () => {
    if (!newTeam.name.trim()) return;
    await createTeam.mutateAsync({
      name: newTeam.name,
      description: newTeam.description || undefined,
      skill_focus: newTeam.skill_focus || undefined,
      region: newTeam.region || undefined,
    });
    setNewTeam(emptyForm);
    setCreateOpen(false);
  };

  const handleUpdate = async () => {
    if (!editTeam || !editTeam.name.trim()) return;
    await updateTeam.mutateAsync({
      id: editTeam.id,
      name: editTeam.name,
      description: editTeam.description || undefined,
      skill_focus: editTeam.skill_focus || undefined,
      region: editTeam.region || undefined,
    });
    setEditTeam(null);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this team?")) return;
    await deleteTeam.mutateAsync(id);
  };

  if (isLoading) {
    return <div className="text-muted-foreground">Loading teams...</div>;
  }

  const TeamFormFields = ({ 
    data, 
    onChange 
  }: { 
    data: TeamFormData; 
    onChange: (data: TeamFormData) => void;
  }) => (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Team Name *</Label>
        <Input
          value={data.name}
          onChange={(e) => onChange({ ...data, name: e.target.value })}
          placeholder="e.g., Content Team A"
        />
      </div>
      <div className="space-y-2">
        <Label>Description</Label>
        <Textarea
          value={data.description}
          onChange={(e) => onChange({ ...data, description: e.target.value })}
          placeholder="Brief description of the team..."
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="flex items-center gap-1.5">
            <Briefcase className="h-3.5 w-3.5" />
            Skill Focus
          </Label>
          <Select
            value={data.skill_focus}
            onValueChange={(value) => onChange({ ...data, skill_focus: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select skill..." />
            </SelectTrigger>
            <SelectContent>
              {SKILL_OPTIONS.map((skill) => (
                <SelectItem key={skill} value={skill}>
                  {skill}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label className="flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5" />
            Region
          </Label>
          <Select
            value={data.region}
            onValueChange={(value) => onChange({ ...data, region: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select region..." />
            </SelectTrigger>
            <SelectContent>
              {REGION_OPTIONS.map((region) => (
                <SelectItem key={region} value={region}>
                  {region}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );

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
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Create New Team</DialogTitle>
            </DialogHeader>
            <div className="pt-4">
              <TeamFormFields data={newTeam} onChange={setNewTeam} />
              <Button 
                onClick={handleCreate} 
                disabled={createTeam.isPending} 
                className="w-full mt-6"
              >
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
                <TableHead>Skill Focus</TableHead>
                <TableHead>Region</TableHead>
                <TableHead className="hidden md:table-cell">Description</TableHead>
                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {teams.map((team) => (
                <TableRow key={team.id}>
                  <TableCell className="font-medium">{team.name}</TableCell>
                  <TableCell>
                    {team.skill_focus ? (
                      <Badge variant="secondary" className="flex items-center gap-1 w-fit">
                        <Briefcase className="h-3 w-3" />
                        {team.skill_focus}
                      </Badge>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {team.region ? (
                      <Badge variant="outline" className="flex items-center gap-1 w-fit">
                        <MapPin className="h-3 w-3" />
                        {team.region}
                      </Badge>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell className="text-muted-foreground hidden md:table-cell">
                    {team.description || "-"}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setEditTeam({ 
                          id: team.id, 
                          name: team.name, 
                          description: team.description || "",
                          skill_focus: team.skill_focus || "",
                          region: team.region || "",
                        })}
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
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Edit Team</DialogTitle>
            </DialogHeader>
            {editTeam && (
              <div className="pt-4">
                <TeamFormFields 
                  data={editTeam} 
                  onChange={(data) => setEditTeam({ ...editTeam, ...data })} 
                />
                <Button 
                  onClick={handleUpdate} 
                  disabled={updateTeam.isPending} 
                  className="w-full mt-6"
                >
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
