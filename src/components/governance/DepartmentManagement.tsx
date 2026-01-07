import { useState } from "react";
import { Building2, Plus, Users, ChevronRight, Edit2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { useDepartments, useCreateDepartment, useUpdateDepartment, Department } from "@/hooks/useDepartments";
import { useTeams } from "@/hooks/useTeams";

const SKILL_FOCUS_OPTIONS = [
  "Engineering",
  "Research",
  "Design",
  "Data",
  "Operations",
  "Marketing",
  "Support",
  "Finance",
  "Other",
];

const REGION_OPTIONS = [
  "Global",
  "Americas",
  "Europe",
  "Asia Pacific",
  "Middle East & Africa",
];

function DepartmentFormDialog({ 
  department, 
  onClose 
}: { 
  department?: Department; 
  onClose: () => void;
}) {
  const [form, setForm] = useState({
    name: department?.name || "",
    description: department?.description || "",
    skill_focus: department?.skill_focus || "",
    region: department?.region || "",
  });
  
  const createDepartment = useCreateDepartment();
  const updateDepartment = useUpdateDepartment();
  
  const handleSubmit = () => {
    if (department) {
      updateDepartment.mutate(
        { departmentId: department.id, updates: form },
        { onSuccess: onClose }
      );
    } else {
      createDepartment.mutate(form, { onSuccess: onClose });
    }
  };
  
  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>{department ? "Edit Department" : "Create Department"}</DialogTitle>
        <DialogDescription>
          Departments organize teams under a unified structure with shared focus areas.
        </DialogDescription>
      </DialogHeader>
      
      <div className="space-y-4">
        <div>
          <Label>Name</Label>
          <Input
            placeholder="e.g., Product Development"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="mt-1"
          />
        </div>
        
        <div>
          <Label>Description</Label>
          <Textarea
            placeholder="Describe the department's purpose and responsibilities..."
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="mt-1"
          />
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Skill Focus</Label>
            <Select
              value={form.skill_focus}
              onValueChange={(value) => setForm({ ...form, skill_focus: value })}
            >
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Select focus" />
              </SelectTrigger>
              <SelectContent>
                {SKILL_FOCUS_OPTIONS.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label>Region</Label>
            <Select
              value={form.region}
              onValueChange={(value) => setForm({ ...form, region: value })}
            >
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Select region" />
              </SelectTrigger>
              <SelectContent>
                {REGION_OPTIONS.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
      
      <DialogFooter>
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={!form.name || createDepartment.isPending || updateDepartment.isPending}
        >
          {department ? "Update" : "Create"} Department
        </Button>
      </DialogFooter>
    </DialogContent>
  );
}

export function DepartmentManagement() {
  const { data: departments, isLoading } = useDepartments({ includeInactive: true });
  const { teams } = useTeams();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState<Department | null>(null);
  
  // Count teams per department
  const teamCounts: Record<string, number> = {};
  teams?.forEach(team => {
    if (team.department_id) {
      teamCounts[team.department_id] = (teamCounts[team.department_id] || 0) + 1;
    }
  });
  
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-64 w-full" />
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Departments
          </CardTitle>
          <CardDescription>
            Organize teams into departments with shared focus areas
          </CardDescription>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-1" />
              New Department
            </Button>
          </DialogTrigger>
          <DepartmentFormDialog onClose={() => setIsCreateOpen(false)} />
        </Dialog>
      </CardHeader>
      <CardContent>
        {departments && departments.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Focus</TableHead>
                <TableHead>Region</TableHead>
                <TableHead>Teams</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[80px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {departments.map((dept) => (
                <TableRow key={dept.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{dept.name}</p>
                      {dept.description && (
                        <p className="text-xs text-muted-foreground line-clamp-1">
                          {dept.description}
                        </p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {dept.skill_focus && (
                      <Badge variant="secondary">{dept.skill_focus}</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    {dept.region && (
                      <Badge variant="outline">{dept.region}</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Users className="h-3 w-3 text-muted-foreground" />
                      <span>{teamCounts[dept.id] || 0}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={dept.is_active ? "default" : "secondary"}>
                      {dept.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Dialog 
                      open={editingDepartment?.id === dept.id} 
                      onOpenChange={(open) => !open && setEditingDepartment(null)}
                    >
                      <DialogTrigger asChild>
                        <Button 
                          size="sm" 
                          variant="ghost"
                          onClick={() => setEditingDepartment(dept)}
                        >
                          <Edit2 className="h-3 w-3" />
                        </Button>
                      </DialogTrigger>
                      {editingDepartment && (
                        <DepartmentFormDialog 
                          department={editingDepartment} 
                          onClose={() => setEditingDepartment(null)} 
                        />
                      )}
                    </Dialog>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <Building2 className="h-10 w-10 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No departments created</p>
            <p className="text-xs">Create departments to organize your teams</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
