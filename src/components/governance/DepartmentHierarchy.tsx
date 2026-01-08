import { useState } from "react";
import { Building2, Users, FolderTree, GripVertical } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useDepartments, useAssignTeamToDepartment, Department } from "@/hooks/useDepartments";
import { useTeams, Team } from "@/hooks/useTeams";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface DragData {
  teamId: string;
  teamName: string;
}

interface DepartmentNodeProps {
  department: Department;
  teams: Team[];
  allDepartments: Department[];
  level: number;
  onDropTeam: (teamId: string, departmentId: string) => void;
  draggedTeam: DragData | null;
}

function DepartmentNode({ 
  department, 
  teams, 
  allDepartments, 
  level, 
  onDropTeam,
  draggedTeam 
}: DepartmentNodeProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const departmentTeams = teams.filter(t => t.department_id === department.id);
  const childDepts = allDepartments.filter(d => d.parent_department_id === department.id);
  
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };
  
  const handleDragLeave = () => {
    setIsDragOver(false);
  };
  
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const teamId = e.dataTransfer.getData("teamId");
    if (teamId) {
      onDropTeam(teamId, department.id);
    }
  };
  
  return (
    <div className={cn("relative", level > 0 && "ml-6 pl-4 border-l-2 border-muted")}>
      <div className="py-2">
        <div 
          className={cn(
            "flex items-start gap-3 p-3 rounded-lg bg-card border transition-all",
            isDragOver && "ring-2 ring-primary bg-primary/5 border-primary",
            !isDragOver && "hover:bg-accent/50"
          )}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <div className={cn(
            "flex items-center justify-center w-8 h-8 rounded-lg shrink-0",
            level === 0 ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
          )}>
            <Building2 className="h-4 w-4" />
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h4 className="font-medium text-sm">{department.name}</h4>
              {department.skill_focus && (
                <Badge variant="secondary" className="text-xs">
                  {department.skill_focus}
                </Badge>
              )}
              {department.region && (
                <Badge variant="outline" className="text-xs">
                  {department.region}
                </Badge>
              )}
              {!department.is_active && (
                <Badge variant="destructive" className="text-xs">
                  Inactive
                </Badge>
              )}
            </div>
            
            {department.description && (
              <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                {department.description}
              </p>
            )}
            
            {departmentTeams.length > 0 && (
              <div className="flex items-center gap-2 mt-2 flex-wrap">
                <Users className="h-3 w-3 text-muted-foreground" />
                {departmentTeams.map(team => (
                  <DraggableTeamBadge 
                    key={team.id} 
                    team={team} 
                    inDepartment 
                  />
                ))}
              </div>
            )}
            
            {isDragOver && draggedTeam && (
              <div className="mt-2 p-2 rounded border-2 border-dashed border-primary bg-primary/5 text-xs text-primary">
                Drop "{draggedTeam.teamName}" here to assign
              </div>
            )}
          </div>
          
          <div className="text-xs text-muted-foreground shrink-0">
            {childDepts.length > 0 && (
              <span className="flex items-center gap-1">
                <FolderTree className="h-3 w-3" />
                {childDepts.length} sub
              </span>
            )}
          </div>
        </div>
      </div>
      
      {childDepts.length > 0 && (
        <div>
          {childDepts.map(child => (
            <DepartmentNode
              key={child.id}
              department={child}
              teams={teams}
              allDepartments={allDepartments}
              level={level + 1}
              onDropTeam={onDropTeam}
              draggedTeam={draggedTeam}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function DraggableTeamBadge({ team, inDepartment }: { team: Team; inDepartment?: boolean }) {
  const [isDragging, setIsDragging] = useState(false);
  
  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData("teamId", team.id);
    e.dataTransfer.setData("teamName", team.name);
    e.dataTransfer.effectAllowed = "move";
    setIsDragging(true);
  };
  
  const handleDragEnd = () => {
    setIsDragging(false);
  };
  
  return (
    <div
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      className={cn(
        "flex items-center gap-1.5 px-2 py-1 rounded-md text-xs cursor-grab active:cursor-grabbing transition-all",
        inDepartment 
          ? "bg-background border hover:border-primary" 
          : "bg-muted/50 border border-dashed hover:border-primary hover:bg-primary/5",
        isDragging && "opacity-50 ring-2 ring-primary"
      )}
    >
      <GripVertical className="h-3 w-3 text-muted-foreground" />
      <span>{team.name}</span>
      {team.skill_focus && (
        <Badge variant="outline" className="text-[10px] h-4 px-1">
          {team.skill_focus}
        </Badge>
      )}
    </div>
  );
}

function UnassignedTeams({ 
  teams, 
  onUnassign 
}: { 
  teams: Team[]; 
  onUnassign: (teamId: string) => void;
}) {
  const [isDragOver, setIsDragOver] = useState(false);
  const unassignedTeams = teams.filter(t => !t.department_id);
  
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };
  
  const handleDragLeave = () => {
    setIsDragOver(false);
  };
  
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const teamId = e.dataTransfer.getData("teamId");
    if (teamId) {
      onUnassign(teamId);
    }
  };
  
  return (
    <div 
      className={cn(
        "mt-6 pt-4 border-t transition-all rounded-lg",
        isDragOver && "bg-muted/50 ring-2 ring-dashed ring-muted-foreground p-4"
      )}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div className="flex items-center gap-2 mb-3 text-muted-foreground">
        <Users className="h-4 w-4" />
        <span className="text-sm font-medium">Unassigned Teams</span>
        {unassignedTeams.length > 0 && (
          <Badge variant="secondary" className="text-xs">{unassignedTeams.length}</Badge>
        )}
        <span className="text-xs ml-auto">Drag teams here to unassign</span>
      </div>
      
      {unassignedTeams.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {unassignedTeams.map(team => (
            <DraggableTeamBadge key={team.id} team={team} />
          ))}
        </div>
      ) : (
        <p className="text-xs text-muted-foreground text-center py-4">
          All teams are assigned to departments
        </p>
      )}
    </div>
  );
}

export function DepartmentHierarchy() {
  const { data: departments, isLoading: deptsLoading } = useDepartments({ includeInactive: true });
  const { teams, isLoading: teamsLoading } = useTeams();
  const assignTeam = useAssignTeamToDepartment();
  const [draggedTeam, setDraggedTeam] = useState<DragData | null>(null);
  
  const isLoading = deptsLoading || teamsLoading;
  
  // Get root departments (no parent)
  const rootDepartments = departments?.filter(d => !d.parent_department_id) || [];
  
  const handleDropTeam = (teamId: string, departmentId: string) => {
    const team = teams.find(t => t.id === teamId);
    const department = departments?.find(d => d.id === departmentId);
    
    if (team?.department_id === departmentId) {
      return; // Already in this department
    }
    
    assignTeam.mutate(
      { teamId, departmentId },
      {
        onSuccess: () => {
          toast.success(`Team "${team?.name}" assigned to ${department?.name}`);
        },
      }
    );
  };
  
  const handleUnassignTeam = (teamId: string) => {
    const team = teams.find(t => t.id === teamId);
    
    if (!team?.department_id) {
      return; // Already unassigned
    }
    
    assignTeam.mutate(
      { teamId, departmentId: null },
      {
        onSuccess: () => {
          toast.success(`Team "${team?.name}" unassigned from department`);
        },
      }
    );
  };
  
  // Track dragged team globally for visual feedback
  const handleGlobalDragStart = (e: DragEvent) => {
    const teamId = (e.target as HTMLElement)?.getAttribute?.("data-team-id");
    const teamName = (e.target as HTMLElement)?.getAttribute?.("data-team-name");
    if (teamId && teamName) {
      setDraggedTeam({ teamId, teamName });
    }
  };
  
  const handleGlobalDragEnd = () => {
    setDraggedTeam(null);
  };
  
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-72" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-48 w-full" />
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FolderTree className="h-5 w-5" />
          Organization Hierarchy
        </CardTitle>
        <CardDescription>
          Drag and drop teams to assign them to departments
        </CardDescription>
      </CardHeader>
      <CardContent>
        {rootDepartments.length > 0 ? (
          <div className="space-y-1">
            {rootDepartments.map(dept => (
              <DepartmentNode
                key={dept.id}
                department={dept}
                teams={teams}
                allDepartments={departments || []}
                level={0}
                onDropTeam={handleDropTeam}
                draggedTeam={draggedTeam}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <FolderTree className="h-10 w-10 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No departments created</p>
            <p className="text-xs">Create departments to see the hierarchy</p>
          </div>
        )}
        
        <UnassignedTeams teams={teams} onUnassign={handleUnassignTeam} />
      </CardContent>
    </Card>
  );
}
