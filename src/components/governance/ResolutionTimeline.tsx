import { motion } from "framer-motion";
import { format } from "date-fns";
import { 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  MessageCircle, 
  User,
  ArrowUp,
  FileText
} from "lucide-react";
import { cn } from "@/lib/utils";

interface TimelineEvent {
  id: string;
  action: string;
  timestamp: string;
  performedBy?: string;
  details?: string;
}

interface ResolutionTimelineProps {
  events: TimelineEvent[];
  currentStatus: string;
}

const getEventIcon = (action: string) => {
  switch (action.toLowerCase()) {
    case "created":
    case "submitted":
      return FileText;
    case "assigned":
      return User;
    case "escalated":
      return ArrowUp;
    case "in_mediation":
      return MessageCircle;
    case "resolved":
      return CheckCircle2;
    case "sla_warning":
    case "sla_breach":
      return AlertTriangle;
    default:
      return Clock;
  }
};

const getEventColor = (action: string) => {
  switch (action.toLowerCase()) {
    case "resolved":
      return "text-green-600 bg-green-100 dark:bg-green-900/30";
    case "escalated":
    case "sla_warning":
    case "sla_breach":
      return "text-destructive bg-destructive/10";
    case "in_mediation":
      return "text-blue-600 bg-blue-100 dark:bg-blue-900/30";
    default:
      return "text-muted-foreground bg-muted";
  }
};

export function ResolutionTimeline({ events, currentStatus }: ResolutionTimelineProps) {
  return (
    <div className="relative">
      {/* Vertical line */}
      <div className="absolute left-5 top-0 bottom-0 w-px bg-border" />

      <div className="space-y-4">
        {events.map((event, index) => {
          const Icon = getEventIcon(event.action);
          const colorClass = getEventColor(event.action);
          const isLast = index === events.length - 1;

          return (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="relative flex gap-4"
            >
              {/* Icon */}
              <div className={cn(
                "relative z-10 h-10 w-10 rounded-full flex items-center justify-center shrink-0",
                colorClass,
                isLast && "ring-2 ring-offset-2 ring-offset-background ring-current"
              )}>
                <Icon className="h-5 w-5" />
              </div>

              {/* Content */}
              <div className="flex-1 pb-4">
                <div className="flex items-center justify-between">
                  <p className="font-medium text-foreground capitalize">
                    {event.action.replace(/_/g, " ")}
                  </p>
                  <time className="text-xs text-muted-foreground">
                    {format(new Date(event.timestamp), "MMM d, yyyy 'at' h:mm a")}
                  </time>
                </div>
                {event.performedBy && (
                  <p className="text-sm text-muted-foreground mt-0.5">
                    by {event.performedBy}
                  </p>
                )}
                {event.details && (
                  <p className="text-sm text-muted-foreground mt-1 bg-muted/50 rounded p-2">
                    {event.details}
                  </p>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
