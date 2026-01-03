import { useMemberPerformance, OverseerFilters } from "@/hooks/useOverseerData";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Users, Download } from "lucide-react";
import { exportMembersToCSV, exportMembersToPDF } from "@/lib/teamExport";

const roleLabels: Record<string, string> = {
  employee: "Employee",
  team_lead: "Team Lead",
  report_admin: "Report Admin",
  finance_hr_admin: "Finance/HR Admin",
  investment_admin: "Investment Admin",
  user_admin: "User Admin",
  general_overseer: "General Overseer",
};

const roleColors: Record<string, string> = {
  employee: "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200",
  team_lead: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  report_admin: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
  finance_hr_admin: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200",
  investment_admin: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200",
  user_admin: "bg-rose-100 text-rose-800 dark:bg-rose-900 dark:text-rose-200",
  general_overseer: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200",
};

interface MemberPerformanceTableProps {
  filters?: OverseerFilters;
}

export function MemberPerformanceTable({ filters }: MemberPerformanceTableProps) {
  const { data: members, isLoading } = useMemberPerformance(filters);

  const getInitials = (name: string | null) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getApprovalRate = (approved: number, total: number) => {
    if (total === 0) return 0;
    return (approved / total) * 100;
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Team Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Individual Performance
          </CardTitle>
          <CardDescription>
            Individual member performance and earnings overview
          </CardDescription>
        </div>
        {members && members.length > 0 && (
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => exportMembersToCSV(members, filters || {})}>
              <Download className="h-4 w-4 mr-2" />
              CSV
            </Button>
            <Button variant="outline" size="sm" onClick={() => exportMembersToPDF(members, filters || {})}>
              <Download className="h-4 w-4 mr-2" />
              PDF
            </Button>
          </div>
        )}
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Member</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Platforms</TableHead>
                <TableHead className="text-center">Tasks</TableHead>
                <TableHead className="text-center">Reports</TableHead>
                <TableHead>Task Approval</TableHead>
                <TableHead className="text-right">Hours</TableHead>
                <TableHead className="text-right">Earnings</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {members?.map((member) => {
                const taskApprovalRate = getApprovalRate(
                  member.approved_tasks,
                  member.total_tasks - member.pending_tasks
                );

                return (
                  <TableRow key={member.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={member.avatar_url || undefined} />
                          <AvatarFallback className="text-xs">
                            {getInitials(member.full_name)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-medium">
                          {member.full_name || "Unknown User"}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="secondary"
                        className={roleColors[member.role] || roleColors.employee}
                      >
                        {roleLabels[member.role] || member.role}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {member.platforms.slice(0, 2).map((platform) => (
                          <Badge key={platform} variant="outline" className="text-xs">
                            {platform}
                          </Badge>
                        ))}
                        {member.platforms.length > 2 && (
                          <Badge variant="outline" className="text-xs">
                            +{member.platforms.length - 2}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex flex-col items-center gap-1">
                        <span className="font-medium">{member.total_tasks}</span>
                        <span className="text-xs text-muted-foreground">
                          {member.approved_tasks} approved
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex flex-col items-center gap-1">
                        <span className="font-medium">{member.total_reports}</span>
                        <span className="text-xs text-muted-foreground">
                          {member.approved_reports} approved
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1 min-w-[120px]">
                        <Progress value={taskApprovalRate} className="h-2" />
                        <span className="text-xs text-muted-foreground">
                          {taskApprovalRate.toFixed(0)}% approval
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {member.total_hours.toFixed(1)}h
                    </TableCell>
                    <TableCell className="text-right">
                      <span className="font-semibold text-green-600">
                        ${member.total_earnings.toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </span>
                    </TableCell>
                  </TableRow>
                );
              })}
              {(!members || members.length === 0) && (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                    No member activity data available
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
