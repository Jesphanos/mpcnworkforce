import { Building2, ChevronRight, Users, FolderTree } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useDepartments, Department } from "@/hooks/useDepartments";
import { useTeams, Team } from "@/hooks/useTeams";
import { cn } from "@/lib/utils";

interface DepartmentNodeProps {
  department: Department;
  children: Department[];
  teams: Team[];
  allDepartments: Department[];
  level: number;
}

function DepartmentNode({ department, children, teams, allDepartments, level }: DepartmentNodeProps) {
  const departmentTeams = teams.filter(t => t.department_id === department.id);
  const childDepts = allDepartments.filter(d => d.parent_department_id === department.id);
  
  return (
    <div className={cn("relative", level > 0 && "ml-6 pl-4 border-l-2 border-muted")}>
      <div className="py-2">
        <div className="flex items-start gap-3 p-3 rounded-lg bg-card border hover:bg-accent/50 transition-colors">
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
                  <Badge key={team.id} variant="outline" className="text-xs font-normal">
                    {team.name}
                  </Badge>
                ))}
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
              children={allDepartments.filter(d => d.parent_department_id === child.id)}
              teams={teams}
              allDepartments={allDepartments}
              level={level + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function UnassignedTeams({ teams }: { teams: Team[] }) {
  const unassignedTeams = teams.filter(t => !t.department_id);
  
  if (unassignedTeams.length === 0) return null;
  
  return (
    <div className="mt-6 pt-4 border-t">
      <div className="flex items-center gap-2 mb-3 text-muted-foreground">
        <Users className="h-4 w-4" />
        <span className="text-sm font-medium">Unassigned Teams</span>
        <Badge variant="secondary" className="text-xs">{unassignedTeams.length}</Badge>
      </div>
      <div className="flex flex-wrap gap-2">
        {unassignedTeams.map(team => (
          <div 
            key={team.id} 
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted/50 border border-dashed"
          >
            <Users className="h-3 w-3 text-muted-foreground" />
            <span className="text-sm">{team.name}</span>
            {team.skill_focus && (
              <Badge variant="outline" className="text-xs">{team.skill_focus}</Badge>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export function DepartmentHierarchy() {
  const { data: departments, isLoading: deptsLoading } = useDepartments({ includeInactive: true });
  const { teams, isLoading: teamsLoading } = useTeams();
  
  const isLoading = deptsLoading || teamsLoading;
  
  // Get root departments (no parent)
  const rootDepartments = departments?.filter(d => !d.parent_department_id) || [];
  
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
          Visual overview of department structure and team assignments
        </CardDescription>
      </CardHeader>
      <CardContent>
        {rootDepartments.length > 0 ? (
          <div className="space-y-1">
            {rootDepartments.map(dept => (
              <DepartmentNode
                key={dept.id}
                department={dept}
                children={(departments || []).filter(d => d.parent_department_id === dept.id)}
                teams={teams}
                allDepartments={departments || []}
                level={0}
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
        
        <UnassignedTeams teams={teams} />
      </CardContent>
    </Card>
  );
}
