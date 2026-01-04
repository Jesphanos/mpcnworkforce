import { format, formatDistanceToNow } from "date-fns";
import { MessageCircle, Clock, CheckCircle2, AlertCircle, ArrowUpRight } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { useMyComplaints, Complaint } from "@/hooks/useComplaints";
import { ComplaintForm } from "./ComplaintForm";

const statusConfig = {
  pending: {
    label: "Pending",
    icon: Clock,
    className: "bg-warning/10 text-warning border-warning/20",
  },
  under_review: {
    label: "Under Review",
    icon: AlertCircle,
    className: "bg-info/10 text-info border-info/20",
  },
  resolved: {
    label: "Resolved",
    icon: CheckCircle2,
    className: "bg-success/10 text-success border-success/20",
  },
};

const categoryLabels: Record<string, string> = {
  technical: "Technical Issue",
  payment: "Payment / Earnings",
  schedule: "Schedule / Workload",
  team: "Team Communication",
  policy: "Policy Clarification",
  other: "Other",
};

function ComplaintItem({ complaint }: { complaint: Complaint }) {
  const status = statusConfig[complaint.status] || statusConfig.pending;
  const StatusIcon = status.icon;

  return (
    <div className="p-4 rounded-lg bg-muted/50 space-y-2">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="text-xs">
            {categoryLabels[complaint.category] || complaint.category}
          </Badge>
          {complaint.escalated && (
            <Badge variant="outline" className="text-xs gap-1">
              <ArrowUpRight className="h-3 w-3" />
              Escalated
            </Badge>
          )}
        </div>
        <Badge variant="outline" className={status.className}>
          <StatusIcon className="h-3 w-3 mr-1" />
          {status.label}
        </Badge>
      </div>
      <p className="text-sm text-foreground line-clamp-2">{complaint.description}</p>
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>{format(new Date(complaint.created_at), "MMM d, yyyy")}</span>
        <span>{formatDistanceToNow(new Date(complaint.created_at), { addSuffix: true })}</span>
      </div>
      {complaint.resolution_notes && (
        <div className="pt-2 border-t border-border mt-2">
          <p className="text-xs text-muted-foreground">
            <span className="font-medium">Resolution:</span> {complaint.resolution_notes}
          </p>
        </div>
      )}
    </div>
  );
}

export function ComplaintsPanel() {
  const { data: complaints, isLoading } = useMyComplaints();

  const activeCount = complaints?.filter((c) => c.status !== "resolved").length || 0;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            Feedback & Complaints
          </CardTitle>
          <CardDescription>
            {activeCount > 0
              ? `${activeCount} active ${activeCount === 1 ? "complaint" : "complaints"}`
              : "Submit feedback or raise concerns"}
          </CardDescription>
        </div>
        <ComplaintForm />
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
        ) : complaints && complaints.length > 0 ? (
          <ScrollArea className="max-h-[300px]">
            <div className="space-y-3">
              {complaints.slice(0, 5).map((complaint) => (
                <ComplaintItem key={complaint.id} complaint={complaint} />
              ))}
            </div>
          </ScrollArea>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <MessageCircle className="h-10 w-10 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No complaints submitted</p>
            <p className="text-xs">Use the button above to submit feedback</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
