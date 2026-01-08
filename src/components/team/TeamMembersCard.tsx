import { useState, useEffect } from "react";
import { useTeamMembers } from "@/hooks/useTeamData";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Users, ClipboardList, FileText, Clock, Globe } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

function formatLocalTime(timezone: string | null): string {
  if (!timezone) return "";
  try {
    return new Date().toLocaleTimeString("en-US", {
      timeZone: timezone,
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  } catch {
    return "";
  }
}

function getTimezoneOffset(timezone: string | null): string {
  if (!timezone) return "";
  try {
    const now = new Date();
    const formatter = new Intl.DateTimeFormat("en-US", {
      timeZone: timezone,
      timeZoneName: "shortOffset",
    });
    const parts = formatter.formatToParts(now);
    const offsetPart = parts.find((p) => p.type === "timeZoneName");
    return offsetPart?.value || "";
  } catch {
    return "";
  }
}

export function TeamMembersCard() {
  const { data: members, isLoading } = useTeamMembers();
  const [, setTick] = useState(0);

  // Update times every minute
  useEffect(() => {
    const interval = setInterval(() => setTick((t) => t + 1), 60000);
    return () => clearInterval(interval);
  }, []);

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
            Team Members
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-muted rounded-lg" />
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
          Team Members ({members?.length || 0})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-3">
            {members?.map((member) => {
              const localTime = formatLocalTime(member.timezone);
              const tzOffset = getTimezoneOffset(member.timezone);
              
              return (
                <div
                  key={member.id}
                  className="flex items-center gap-4 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                >
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={member.avatar_url || undefined} />
                    <AvatarFallback>{getInitials(member.full_name)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">
                      {member.full_name || "Unknown User"}
                    </p>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                      <span className="flex items-center gap-1">
                        <ClipboardList className="h-3 w-3" />
                        {member.task_count} tasks
                      </span>
                      <span className="flex items-center gap-1">
                        <FileText className="h-3 w-3" />
                        {member.report_count} reports
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {localTime && (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Badge variant="outline" className="flex items-center gap-1 text-xs font-normal">
                              <Globe className="h-3 w-3" />
                              {localTime}
                            </Badge>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="text-xs">
                              {member.timezone?.replace(/_/g, " ")} ({tzOffset})
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )}
                    {member.pending_count > 0 && (
                      <Badge variant="secondary" className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {member.pending_count} pending
                      </Badge>
                    )}
                  </div>
                </div>
              );
            })}
            {(!members || members.length === 0) && (
              <p className="text-center text-muted-foreground py-8">
                No team members with activity yet
              </p>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
