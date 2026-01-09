/**
 * Report Status Timeline
 * 
 * Displays the full history of a report's lifecycle for workers.
 * Shows submissions, revisions, approvals in a growth-oriented format.
 */

import { format, formatDistanceToNow } from "date-fns";
import { 
  CheckCircle2, 
  Clock, 
  RotateCcw, 
  Send, 
  Shield, 
  MessageCircle,
  User,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useReportHistory } from "@/hooks/useReportHistory";
import { cn } from "@/lib/utils";
import { getHumaneStatusLabel, getStatusConfig } from "@/lib/statusDefinitions";

interface ReportStatusTimelineProps {
  reportId: string;
  showCard?: boolean;
}

/**
 * Action configuration for timeline display
 */
const ACTION_CONFIG: Record<string, {
  label: string;
  icon: typeof CheckCircle2;
  color: string;
  bgColor: string;
  message: string;
}> = {
  submission: {
    label: "Submitted",
    icon: Send,
    color: "text-info",
    bgColor: "bg-info/10",
    message: "Report submitted for review",
  },
  resubmission: {
    label: "Resubmitted",
    icon: Send,
    color: "text-info",
    bgColor: "bg-info/10",
    message: "Revised report submitted for review",
  },
  approval: {
    label: "Approved",
    icon: CheckCircle2,
    color: "text-success",
    bgColor: "bg-success/10",
    message: "Great work! Your report has been approved",
  },
  rejection: {
    label: "Revision Requested",
    icon: RotateCcw,
    color: "text-amber-600",
    bgColor: "bg-amber-50",
    message: "Some adjustments are needed",
  },
  team_lead_approval: {
    label: "Team Lead Approved",
    icon: CheckCircle2,
    color: "text-success",
    bgColor: "bg-success/10",
    message: "Passed team lead review, awaiting final approval",
  },
  team_lead_rejection: {
    label: "Revision Requested",
    icon: RotateCcw,
    color: "text-amber-600",
    bgColor: "bg-amber-50",
    message: "Your team lead has requested some changes",
  },
  admin_approval: {
    label: "Final Approval",
    icon: CheckCircle2,
    color: "text-success",
    bgColor: "bg-success/10",
    message: "Report fully approved and processed",
  },
  admin_override: {
    label: "Decision Adjusted",
    icon: Shield,
    color: "text-primary",
    bgColor: "bg-primary/10",
    message: "An administrator has adjusted this decision",
  },
  rate_change: {
    label: "Rate Updated",
    icon: Shield,
    color: "text-primary",
    bgColor: "bg-primary/10",
    message: "The rate for this report was adjusted",
  },
  status_change: {
    label: "Status Updated",
    icon: Clock,
    color: "text-muted-foreground",
    bgColor: "bg-muted",
    message: "Report status was updated",
  },
};

function TimelineItem({ 
  entry, 
  isLast 
}: { 
  entry: { 
    id: string; 
    action: string; 
    previous_status: string | null; 
    new_status: string | null; 
    comment: string | null; 
    created_at: string;
    performed_by: string;
  }; 
  isLast: boolean;
}) {
  const config = ACTION_CONFIG[entry.action] || ACTION_CONFIG.status_change;
  const Icon = config.icon;
  
  return (
    <div className="flex gap-4">
      {/* Timeline connector */}
      <div className="flex flex-col items-center">
        <div className={cn(
          "h-8 w-8 rounded-full flex items-center justify-center shrink-0",
          config.bgColor
        )}>
          <Icon className={cn("h-4 w-4", config.color)} />
        </div>
        {!isLast && (
          <div className="w-0.5 flex-1 bg-border min-h-[24px]" />
        )}
      </div>
      
      {/* Content */}
      <div className="pb-6 flex-1">
        <div className="flex items-start justify-between gap-2 mb-1">
          <div>
            <p className="font-medium text-sm">{config.label}</p>
            <p className="text-xs text-muted-foreground">{config.message}</p>
          </div>
          <span className="text-xs text-muted-foreground whitespace-nowrap">
            {formatDistanceToNow(new Date(entry.created_at), { addSuffix: true })}
          </span>
        </div>
        
        {/* Status change badge */}
        {entry.new_status && (
          <Badge variant="outline" className="text-xs mt-1">
            {getHumaneStatusLabel(entry.new_status)}
          </Badge>
        )}
        
        {/* Feedback/Comment - styled supportively */}
        {entry.comment && (
          <div className="mt-2 p-3 rounded-lg bg-muted/50 border border-border/50">
            <div className="flex items-start gap-2">
              <MessageCircle className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-1">
                  Feedback
                </p>
                <p className="text-sm">{entry.comment}</p>
              </div>
            </div>
          </div>
        )}
        
        {/* Timestamp detail */}
        <p className="text-xs text-muted-foreground mt-2">
          {format(new Date(entry.created_at), "MMM d, yyyy 'at' h:mm a")}
        </p>
      </div>
    </div>
  );
}

export function ReportStatusTimeline({ reportId, showCard = true }: ReportStatusTimelineProps) {
  const { data: history, isLoading } = useReportHistory(reportId);
  const [isExpanded, setIsExpanded] = useState(false);
  
  const visibleHistory = isExpanded ? history : history?.slice(0, 3);
  const hasMore = (history?.length || 0) > 3;
  
  const content = (
    <>
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex gap-4">
              <Skeleton className="h-8 w-8 rounded-full shrink-0" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-48" />
              </div>
            </div>
          ))}
        </div>
      ) : history && history.length > 0 ? (
        <div>
          <ScrollArea className={isExpanded ? "max-h-[400px]" : undefined}>
            {visibleHistory?.map((entry, index) => (
              <TimelineItem 
                key={entry.id} 
                entry={entry} 
                isLast={index === (visibleHistory?.length || 0) - 1}
              />
            ))}
          </ScrollArea>
          
          {hasMore && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="w-full mt-2"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? (
                <>
                  <ChevronUp className="h-4 w-4 mr-1" />
                  Show Less
                </>
              ) : (
                <>
                  <ChevronDown className="h-4 w-4 mr-1" />
                  Show Full History ({history.length} events)
                </>
              )}
            </Button>
          )}
        </div>
      ) : (
        <div className="text-center py-6 text-muted-foreground">
          <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">No history recorded yet</p>
          <p className="text-xs">Timeline will appear as your report progresses</p>
        </div>
      )}
    </>
  );
  
  if (!showCard) {
    return content;
  }
  
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Clock className="h-4 w-4" />
          Report Timeline
        </CardTitle>
        <CardDescription>
          Track the progress of your submission
        </CardDescription>
      </CardHeader>
      <CardContent>
        {content}
      </CardContent>
    </Card>
  );
}
