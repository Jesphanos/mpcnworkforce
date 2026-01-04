import { useState } from "react";
import { usePlatformSettings, useUpdatePlatform, useCreatePlatform, useDeletePlatform, PlatformSetting } from "@/hooks/useSettings";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { Plus, Pencil, Trash2, Save, X } from "lucide-react";

export function PlatformSettingsTable() {
  const { data: platforms, isLoading } = usePlatformSettings();
  const updatePlatform = useUpdatePlatform();
  const createPlatform = useCreatePlatform();
  const deletePlatform = useDeletePlatform();

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<PlatformSetting>>({});
  const [newPlatform, setNewPlatform] = useState({ name: "", base_rate: 10, color: "#3B82F6" });
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const handleEdit = (platform: PlatformSetting) => {
    setEditingId(platform.id);
    setEditForm(platform);
  };

  const handleSave = async () => {
    if (editingId && editForm) {
      await updatePlatform.mutateAsync({ id: editingId, ...editForm });
      setEditingId(null);
      setEditForm({});
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditForm({});
  };

  const handleToggleActive = async (platform: PlatformSetting) => {
    await updatePlatform.mutateAsync({ id: platform.id, is_active: !platform.is_active });
  };

  const handleCreate = async () => {
    if (newPlatform.name.trim()) {
      await createPlatform.mutateAsync(newPlatform);
      setNewPlatform({ name: "", base_rate: 10, color: "#3B82F6" });
      setIsAddDialogOpen(false);
    }
  };

  const handleDelete = async (id: string) => {
    await deletePlatform.mutateAsync(id);
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <p className="text-sm text-muted-foreground">
          Configure available platforms and their default base rates.
        </p>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Platform
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Platform</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Platform Name</Label>
                <Input
                  id="name"
                  value={newPlatform.name}
                  onChange={(e) => setNewPlatform({ ...newPlatform, name: e.target.value })}
                  placeholder="e.g., Toptal"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="rate">Base Rate ($/hr)</Label>
                <Input
                  id="rate"
                  type="number"
                  step="0.01"
                  value={newPlatform.base_rate}
                  onChange={(e) => setNewPlatform({ ...newPlatform, base_rate: parseFloat(e.target.value) || 0 })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="color">Color</Label>
                <div className="flex gap-2">
                  <Input
                    id="color"
                    type="color"
                    className="w-16 h-10 p-1"
                    value={newPlatform.color}
                    onChange={(e) => setNewPlatform({ ...newPlatform, color: e.target.value })}
                  />
                  <Input
                    value={newPlatform.color}
                    onChange={(e) => setNewPlatform({ ...newPlatform, color: e.target.value })}
                    placeholder="#3B82F6"
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Cancel</Button>
              </DialogClose>
              <Button onClick={handleCreate} disabled={!newPlatform.name.trim()}>
                Create Platform
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">Color</TableHead>
              <TableHead>Platform Name</TableHead>
              <TableHead>Base Rate ($/hr)</TableHead>
              <TableHead className="w-24">Active</TableHead>
              <TableHead className="w-24">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {platforms?.map((platform) => (
              <TableRow key={platform.id}>
                <TableCell>
                  {editingId === platform.id ? (
                    <Input
                      type="color"
                      className="w-10 h-8 p-1"
                      value={editForm.color || platform.color}
                      onChange={(e) => setEditForm({ ...editForm, color: e.target.value })}
                    />
                  ) : (
                    <div
                      className="w-6 h-6 rounded-full border"
                      style={{ backgroundColor: platform.color }}
                    />
                  )}
                </TableCell>
                <TableCell>
                  {editingId === platform.id ? (
                    <Input
                      value={editForm.name || ""}
                      onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    />
                  ) : (
                    <span className="font-medium">{platform.name}</span>
                  )}
                </TableCell>
                <TableCell>
                  {editingId === platform.id ? (
                    <Input
                      type="number"
                      step="0.01"
                      className="w-24"
                      value={editForm.base_rate ?? platform.base_rate}
                      onChange={(e) => setEditForm({ ...editForm, base_rate: parseFloat(e.target.value) || 0 })}
                    />
                  ) : (
                    <span>${platform.base_rate.toFixed(2)}</span>
                  )}
                </TableCell>
                <TableCell>
                  <Switch
                    checked={platform.is_active}
                    onCheckedChange={() => handleToggleActive(platform)}
                  />
                </TableCell>
                <TableCell>
                  {editingId === platform.id ? (
                    <div className="flex gap-1">
                      <Button size="icon" variant="ghost" onClick={handleSave}>
                        <Save className="h-4 w-4" />
                      </Button>
                      <Button size="icon" variant="ghost" onClick={handleCancel}>
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="flex gap-1">
                      <Button size="icon" variant="ghost" onClick={() => handleEdit(platform)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button size="icon" variant="ghost" className="text-destructive">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Platform</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete "{platform.name}"? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(platform.id)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
