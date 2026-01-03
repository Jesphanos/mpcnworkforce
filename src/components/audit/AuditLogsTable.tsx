import { format } from "date-fns";
import { FileText, User, Clock } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuditLogs, AuditLog } from "@/hooks/useAuditLogs";
import { Skeleton } from "@/components/ui/skeleton";

interface AuditLogsTableProps {
  entityType?: string;
}

const actionColors: Record<string, string> = {
  created: "bg-primary/10 text-primary border-primary/20",
  status_change: "bg-warning/10 text-warning border-warning/20",
  rate_change: "bg-accent/10 text-accent-foreground border-accent/20",
};

const entityIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  task: FileText,
  work_report: FileText,
};

export function AuditLogsTable({ entityType }: AuditLogsTableProps) {
  const { data: logs, isLoading } = useAuditLogs(entityType);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-4 w-48" />
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
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Audit Logs
        </CardTitle>
        <CardDescription>
          Complete history of all changes and actions
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[500px]">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Time</TableHead>
                <TableHead>Entity</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Changes</TableHead>
                <TableHead>Notes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs && logs.length > 0 ? (
                logs.map((log) => {
                  const EntityIcon = entityIcons[log.entity_type] || FileText;
                  return (
                    <TableRow key={log.id}>
                      <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                        {format(new Date(log.performed_at), "MMM d, h:mm a")}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <EntityIcon className="h-4 w-4 text-muted-foreground" />
                          <span className="text-xs font-mono">
                            {log.entity_type}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={actionColors[log.action] || ""}>
                          {log.action.replace("_", " ")}
                        </Badge>
                      </TableCell>
                      <TableCell className="max-w-[200px]">
                        {log.new_values && (
                          <code className="text-xs bg-muted px-1 py-0.5 rounded block truncate">
                            {JSON.stringify(log.new_values)}
                          </code>
                        )}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground max-w-[150px] truncate">
                        {log.notes || "-"}
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                    No audit logs found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
