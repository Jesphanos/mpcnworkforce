import { TrendingUp, TrendingDown, Minus, Users, ClipboardList, FileText } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";
import { useState } from "react";
import { useTeamSnapshot } from "@/hooks/useTeamSnapshot";

const trendConfig = {
  improving: {
    label: "Improving",
    icon: TrendingUp,
    className: "text-success",
  },
  steady: {
    label: "Steady",
    icon: Minus,
    className: "text-muted-foreground",
  },
  declining: {
    label: "Needs Attention",
    icon: TrendingDown,
    className: "text-warning",
  },
};

export function TeamSnapshotCard() {
  const [isOpen, setIsOpen] = useState(true);
  const { data: snapshot, isLoading } = useTeamSnapshot();

  if (isLoading) {
    return (
      <Card className="bg-muted/30">
        <CardHeader className="pb-3">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-4 w-32" />
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-16" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!snapshot) return null;

  const trend = trendConfig[snapshot.trend];
  const TrendIcon = trend.icon;

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <Card className="bg-muted/30 border-muted">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-muted-foreground" />
              <CardTitle className="text-base">Team Snapshot</CardTitle>
            </div>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <ChevronDown
                  className={`h-4 w-4 transition-transform ${isOpen ? "" : "-rotate-90"}`}
                />
              </Button>
            </CollapsibleTrigger>
          </div>
          <CardDescription className="flex items-center gap-2">
            <Badge variant="outline" className={`gap-1 ${trend.className}`}>
              <TrendIcon className="h-3 w-3" />
              {trend.label}
            </Badge>
            <span className="text-xs">{snapshot.teamName}</span>
          </CardDescription>
        </CardHeader>
        <CollapsibleContent>
          <CardContent className="pt-0 space-y-4">
            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-lg bg-background/50 flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <ClipboardList className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-lg font-semibold">{snapshot.activeTasksCount}</p>
                  <p className="text-xs text-muted-foreground">Active Tasks</p>
                </div>
              </div>
              <div className="p-3 rounded-lg bg-background/50 flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-warning/10 flex items-center justify-center">
                  <FileText className="h-4 w-4 text-warning" />
                </div>
                <div>
                  <p className="text-lg font-semibold">{snapshot.pendingReportsCount}</p>
                  <p className="text-xs text-muted-foreground">Pending Reviews</p>
                </div>
              </div>
            </div>

            {/* Commentary */}
            <div className="p-3 rounded-lg bg-background/50 border border-border/50">
              <p className="text-sm text-muted-foreground leading-relaxed">
                {snapshot.commentary}
              </p>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}
