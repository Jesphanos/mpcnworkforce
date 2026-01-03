import { useTeamGroups, OverseerFilters } from "@/hooks/useOverseerData";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Users, ChevronDown, ChevronRight, DollarSign, TrendingUp } from "lucide-react";
import { useState } from "react";

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

interface TeamGroupsViewProps {
  filters: OverseerFilters;
}

export function TeamGroupsView({ filters }: TeamGroupsViewProps) {
  const { data: teamGroups, isLoading } = useTeamGroups(filters);
  const [expandedTeams, setExpandedTeams] = useState<Set<string>>(new Set());

  const toggleTeam = (role: string) => {
    const newExpanded = new Set(expandedTeams);
    if (newExpanded.has(role)) {
      newExpanded.delete(role);
    } else {
      newExpanded.add(role);
    }
    setExpandedTeams(newExpanded);
  };

  const getInitials = (name: string | null) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Teams Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-20 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Teams Overview
        </CardTitle>
        <CardDescription>
          All teams grouped by role with performance metrics
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {teamGroups?.map((team) => (
          <Collapsible
            key={team.role}
            open={expandedTeams.has(team.role)}
            onOpenChange={() => toggleTeam(team.role)}
          >
            <CollapsibleTrigger className="w-full">
              <div className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
                <div className="flex items-center gap-4">
                  {expandedTeams.has(team.role) ? (
                    <ChevronDown className="h-5 w-5 text-muted-foreground" />
                  ) : (
                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                  )}
                  <Badge className={roleColors[team.role] || roleColors.employee}>
                    {roleLabels[team.role] || team.role}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    {team.total_members} member{team.total_members !== 1 ? "s" : ""}
                  </span>
                </div>
                <div className="flex items-center gap-6 text-sm">
                  <div className="text-center">
                    <span className="font-medium">{team.total_tasks}</span>
                    <span className="text-muted-foreground ml-1">tasks</span>
                  </div>
                  <div className="text-center">
                    <span className="font-medium">{team.total_reports}</span>
                    <span className="text-muted-foreground ml-1">reports</span>
                  </div>
                  <div className="text-center">
                    <span className="font-medium">{team.total_hours.toFixed(1)}</span>
                    <span className="text-muted-foreground ml-1">hrs</span>
                  </div>
                  <div className="flex items-center gap-1 text-green-600 font-semibold">
                    <DollarSign className="h-4 w-4" />
                    {team.total_earnings.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </div>
                  <div className="flex items-center gap-1 min-w-[100px]">
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    <Progress value={team.approval_rate} className="h-2 w-16" />
                    <span className="text-xs text-muted-foreground">
                      {team.approval_rate.toFixed(0)}%
                    </span>
                  </div>
                </div>
              </div>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="mt-2 ml-9 border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Member</TableHead>
                      <TableHead>Platforms</TableHead>
                      <TableHead className="text-center">Tasks</TableHead>
                      <TableHead className="text-center">Reports</TableHead>
                      <TableHead>Approval Rate</TableHead>
                      <TableHead className="text-right">Hours</TableHead>
                      <TableHead className="text-right">Earnings</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {team.members.map((member) => {
                      const totalItems = member.total_tasks + member.total_reports;
                      const approvedItems = member.approved_tasks + member.approved_reports;
                      const pendingItems = member.pending_tasks + member.pending_reports;
                      const decidedItems = totalItems - pendingItems;
                      const approvalRate = decidedItems > 0 ? (approvedItems / decidedItems) * 100 : 0;

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
                            <div className="flex flex-wrap gap-1">
                              {member.platforms.slice(0, 3).map((platform) => (
                                <Badge key={platform} variant="outline" className="text-xs">
                                  {platform}
                                </Badge>
                              ))}
                              {member.platforms.length > 3 && (
                                <Badge variant="outline" className="text-xs">
                                  +{member.platforms.length - 3}
                                </Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="text-center">
                            <div className="flex flex-col items-center gap-0.5">
                              <span className="font-medium">{member.total_tasks}</span>
                              <span className="text-xs text-muted-foreground">
                                {member.approved_tasks} ✓
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="text-center">
                            <div className="flex flex-col items-center gap-0.5">
                              <span className="font-medium">{member.total_reports}</span>
                              <span className="text-xs text-muted-foreground">
                                {member.approved_reports} ✓
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col gap-1 min-w-[100px]">
                              <Progress value={approvalRate} className="h-2" />
                              <span className="text-xs text-muted-foreground">
                                {approvalRate.toFixed(0)}%
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
                  </TableBody>
                </Table>
              </div>
            </CollapsibleContent>
          </Collapsible>
        ))}
        {(!teamGroups || teamGroups.length === 0) && (
          <div className="text-center py-8 text-muted-foreground">
            No team data available for the selected filters
          </div>
        )}
      </CardContent>
    </Card>
  );
}
