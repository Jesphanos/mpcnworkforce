/**
 * Support Requests Panel (renamed from ComplaintsPanel)
 * 
 * Displays user's support requests with humane, growth-oriented framing.
 */

import { format, formatDistanceToNow } from "date-fns";
import { 
  HelpCircle, 
  Clock, 
  CheckCircle2, 
  Eye, 
  MessageCircle,
  ArrowUpRight,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { useMyComplaints, Complaint } from "@/hooks/useComplaints";
import { SupportRequestForm } from "./SupportRequestForm";
import { cn } from "@/lib/utils";

/**
 * Status configuration with humane labels
 */
const STATUS_CONFIG = {
  pending: {
    label: "Awaiting Review",
    icon: Clock,
    color: "text-warning",
    bgColor: "bg-warning/10",
    borderColor: "border-warning/20",
    description: "Your request has been received",
  },
  under_review: {
    label: "Being Reviewed",
    icon: Eye,
    color: "text-info",
    bgColor: "bg-info/10",
    borderColor: "border-info/20",
    description: "Someone is looking into this",
  },
  resolved: {
    label: "Resolved",
    icon: CheckCircle2,
    color: "text-success",
    bgColor: "bg-success/10",
    borderColor: "border-success/20",
    description: "This has been addressed",
  },
};

/**
 * Category labels with supportive framing
 */
const CATEGORY_LABELS: Record<string, string> = {
  guidance: "Need Guidance",
  technical: "Technical Support",
  payment: "Payment Clarification",
  schedule: "Workload Discussion",
  team: "Team Coordination",
  policy: "Policy Question",
  feedback: "General Feedback",
  other: "Other",
};

function SupportRequestItem({ request }: { request: Complaint }) {
  const status = STATUS_CONFIG[request.status] || STATUS_CONFIG.pending;
  const StatusIcon = status.icon;
  const categoryLabel = CATEGORY_LABELS[request.category] || request.category;

  return (
    <div className="p-4 rounded-lg bg-muted/50 space-y-3 hover:bg-muted/70 transition-colors">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant="secondary" className="text-xs">
            {categoryLabel}
          </Badge>
          {request.escalated && (
            <Badge variant="outline" className="text-xs gap-1 text-primary">
              <ArrowUpRight className="h-3 w-3" />
              Escalated for Support
            </Badge>
          )}
        </div>
        <Badge 
          variant="outline" 
          className={cn("text-xs", status.color, status.bgColor, status.borderColor)}
        >
          <StatusIcon className="h-3 w-3 mr-1" />
          {status.label}
        </Badge>
      </div>
      
      <p className="text-sm text-foreground line-clamp-2">{request.description}</p>
      
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>{format(new Date(request.created_at), "MMM d, yyyy")}</span>
        <span>{formatDistanceToNow(new Date(request.created_at), { addSuffix: true })}</span>
      </div>
      
      {request.resolution_notes && (
        <div className="pt-3 border-t border-border/50">
          <div className="flex items-start gap-2">
            <MessageCircle className="h-4 w-4 text-success mt-0.5 shrink-0" />
            <div>
              <p className="text-xs font-medium text-success mb-1">Resolution</p>
              <p className="text-sm text-muted-foreground">{request.resolution_notes}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export function SupportRequestsPanel() {
  const { data: requests, isLoading } = useMyComplaints();

  const activeCount = requests?.filter((r) => r.status !== "resolved").length || 0;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="flex items-center gap-2">
            <HelpCircle className="h-5 w-5" />
            Support Requests
          </CardTitle>
          <CardDescription>
            {activeCount > 0
              ? `${activeCount} active ${activeCount === 1 ? "request" : "requests"}`
              : "Request help or raise concerns privately"}
          </CardDescription>
        </div>
        <SupportRequestForm />
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="p-4 rounded-lg bg-muted/50 space-y-2">
                <Skeleton className="h-5 w-24" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-3 w-32" />
              </div>
            ))}
          </div>
        ) : requests && requests.length > 0 ? (
          <ScrollArea className="max-h-[300px]">
            <div className="space-y-3">
              {requests.slice(0, 5).map((request) => (
                <SupportRequestItem key={request.id} request={request} />
              ))}
            </div>
          </ScrollArea>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <HelpCircle className="h-10 w-10 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No support requests</p>
            <p className="text-xs">Use the button above if you need help</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
