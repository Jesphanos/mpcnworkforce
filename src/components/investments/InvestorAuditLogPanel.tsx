import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  History, 
  ArrowRightLeft, 
  ArrowDownToLine, 
  RotateCcw, 
  DollarSign,
  ShieldCheck,
  FileText,
} from "lucide-react";
import { format } from "date-fns";
import { useInvestorAuditLog } from "@/hooks/useInvestorProfile";
import { cn } from "@/lib/utils";

const actionTypeConfig: Record<string, { icon: typeof History; color: string; label: string }> = {
  investment: { icon: ArrowRightLeft, color: "text-primary", label: "Investment" },
  withdrawal_request: { icon: ArrowDownToLine, color: "text-warning", label: "Withdrawal Request" },
  withdrawal_approved: { icon: ShieldCheck, color: "text-info", label: "Withdrawal Approved" },
  withdrawal_paid: { icon: DollarSign, color: "text-success", label: "Withdrawal Paid" },
  withdrawal_rejected: { icon: FileText, color: "text-destructive", label: "Withdrawal Rejected" },
  reinvestment: { icon: RotateCcw, color: "text-primary", label: "Reinvestment" },
  return_distribution: { icon: DollarSign, color: "text-success", label: "Return Distributed" },
  verification: { icon: ShieldCheck, color: "text-info", label: "Verification" },
};

export function InvestorAuditLogPanel() {
  const { data: logs, isLoading } = useInvestorAuditLog();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-40" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-60 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <History className="h-5 w-5" />
          Activity History
        </CardTitle>
        <CardDescription>
          Timestamped log of all investment-related actions
        </CardDescription>
      </CardHeader>
      <CardContent>
        {logs && logs.length > 0 ? (
          <ScrollArea className="h-[400px] pr-4">
            <div className="space-y-4">
              {logs.map((log) => {
                const config = actionTypeConfig[log.action_type] || {
                  icon: History,
                  color: "text-muted-foreground",
                  label: log.action_type,
                };
                const ActionIcon = config.icon;

                return (
                  <div 
                    key={log.id}
                    className="flex items-start gap-3 p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                  >
                    <div className={cn(
                      "h-8 w-8 rounded-full flex items-center justify-center shrink-0",
                      "bg-muted"
                    )}>
                      <ActionIcon className={cn("h-4 w-4", config.color)} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {config.label}
                        </Badge>
                        {log.amount && log.amount > 0 && (
                          <span className="text-sm font-medium">
                            ${Number(log.amount).toLocaleString()}
                          </span>
                        )}
                      </div>
                      {log.description && (
                        <p className="text-sm text-muted-foreground mt-1">
                          {log.description}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground mt-1">
                        {format(new Date(log.created_at), "MMM d, yyyy 'at' h:mm a")}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <History className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>No activity recorded yet</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
