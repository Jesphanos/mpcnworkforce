import { useReportHistory } from "@/hooks/useReportHistory";
import { format } from "date-fns";
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  ArrowRight, 
  FileText, 
  AlertTriangle,
  Shield,
  Send,
  RotateCcw,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

interface ReportHistoryTimelineProps {
  reportId: string;
}

const actionConfig: Record<string, { 
  icon: typeof CheckCircle; 
  color: string;
  bgColor: string;
  label: string;
}> = {
  approval: {
    icon: CheckCircle,
    color: "text-green-600",
    bgColor: "bg-green-100",
    label: "Approved",
  },
  rejection: {
    icon: XCircle,
    color: "text-red-600",
    bgColor: "bg-red-100",
    label: "Rejected",
  },
  override: {
    icon: Shield,
    color: "text-purple-600",
    bgColor: "bg-purple-100",
    label: "Overridden",
  },
  status_change: {
    icon: ArrowRight,
    color: "text-blue-600",
    bgColor: "bg-blue-100",
    label: "Status Changed",
  },
  submission: {
    icon: Send,
    color: "text-sky-600",
    bgColor: "bg-sky-100",
    label: "Submitted",
  },
  resubmission: {
    icon: RotateCcw,
    color: "text-orange-600",
    bgColor: "bg-orange-100",
    label: "Resubmitted",
  },
};

export function ReportHistoryTimeline({ reportId }: ReportHistoryTimelineProps) {
  const { data: history, isLoading } = useReportHistory(reportId);

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex gap-3">
            <Skeleton className="h-8 w-8 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-48" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!history || history.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
        <p>No history recorded yet</p>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Timeline line */}
      <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-border" />

      <div className="space-y-6">
        {history.map((entry, index) => {
          const config = actionConfig[entry.action] || {
            icon: FileText,
            color: "text-muted-foreground",
            bgColor: "bg-muted",
            label: entry.action,
          };
          const Icon = config.icon;

          return (
            <div key={entry.id} className="relative flex gap-4 pl-0">
              {/* Icon */}
              <div
                className={cn(
                  "relative z-10 flex h-8 w-8 items-center justify-center rounded-full",
                  config.bgColor
                )}
              >
                <Icon className={cn("h-4 w-4", config.color)} />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0 pb-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={cn("font-medium", config.color)}>
                    {config.label}
                  </span>
                  {entry.previous_status && entry.new_status && (
                    <span className="text-xs text-muted-foreground">
                      {entry.previous_status} → {entry.new_status}
                    </span>
                  )}
                </div>

                <div className="text-sm text-muted-foreground mt-0.5">
                  by {entry.performer_name || "System"} •{" "}
                  {format(new Date(entry.created_at), "MMM d, yyyy 'at' h:mm a")}
                </div>

                {entry.comment && (
                  <div className="mt-2 p-2 rounded bg-muted/50 text-sm">
                    {entry.action === "override" && (
                      <AlertTriangle className="h-3.5 w-3.5 inline mr-1 text-amber-500" />
                    )}
                    {entry.comment}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
