import { format } from "date-fns";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useEntityAuditLogs } from "@/hooks/useAuditLogs";
import { Skeleton } from "@/components/ui/skeleton";
import { ReportHistoryTimeline } from "./ReportHistoryTimeline";

interface ReportAuditDialogProps {
  reportId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const actionColors: Record<string, string> = {
  created: "bg-primary/10 text-primary border-primary/20",
  status_change: "bg-warning/10 text-warning border-warning/20",
  rate_change: "bg-accent/10 text-accent-foreground border-accent/20",
};

export function ReportAuditDialog({ reportId, open, onOpenChange }: ReportAuditDialogProps) {
  const { data: logs, isLoading } = useEntityAuditLogs("work_report", reportId || "");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Report History</DialogTitle>
          <DialogDescription>
            Complete audit trail of all changes made to this report
          </DialogDescription>
        </DialogHeader>
        
        <Tabs defaultValue="timeline" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="timeline">Timeline</TabsTrigger>
            <TabsTrigger value="detailed">Detailed Logs</TabsTrigger>
          </TabsList>
          
          <TabsContent value="timeline" className="mt-4">
            <ScrollArea className="h-[350px] pr-4">
              {reportId && <ReportHistoryTimeline reportId={reportId} />}
            </ScrollArea>
          </TabsContent>
          
          <TabsContent value="detailed" className="mt-4">
            <ScrollArea className="h-[350px] pr-4">
              {isLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-20 w-full" />
                  ))}
                </div>
              ) : logs && logs.length > 0 ? (
                <div className="space-y-4">
                  {logs.map((log) => (
                    <div
                      key={log.id}
                      className="border rounded-lg p-4 space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <Badge variant="outline" className={actionColors[log.action] || ""}>
                          {log.action.replace("_", " ")}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {format(new Date(log.performed_at), "MMM d, yyyy 'at' h:mm a")}
                        </span>
                      </div>
                      
                      {log.previous_values && (
                        <div className="text-sm">
                          <span className="text-muted-foreground">Previous: </span>
                          <code className="text-xs bg-muted px-1 py-0.5 rounded">
                            {JSON.stringify(log.previous_values)}
                          </code>
                        </div>
                      )}
                      
                      {log.new_values && (
                        <div className="text-sm">
                          <span className="text-muted-foreground">New: </span>
                          <code className="text-xs bg-muted px-1 py-0.5 rounded">
                            {JSON.stringify(log.new_values)}
                          </code>
                        </div>
                      )}
                      
                      {log.notes && (
                        <div className="text-sm text-muted-foreground italic">
                          Note: {log.notes}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex items-center justify-center h-32 text-muted-foreground">
                  No history available
                </div>
              )}
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
