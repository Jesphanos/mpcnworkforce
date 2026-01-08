import { AlertTriangle, Clock, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSlaBreachAlerts } from "@/hooks/useSlaBreachAlerts";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

export function SlaAlertBanner() {
  const { breachedCount, approachingCount, atRiskRequests } = useSlaBreachAlerts();
  const navigate = useNavigate();

  if (atRiskRequests.length === 0) return null;

  const hasBreach = breachedCount > 0;

  return (
    <div
      className={cn(
        "flex items-center justify-between gap-4 px-4 py-2 rounded-lg",
        hasBreach
          ? "bg-destructive/10 border border-destructive/20"
          : "bg-warning/10 border border-warning/20"
      )}
    >
      <div className="flex items-center gap-3">
        {hasBreach ? (
          <AlertTriangle className="h-4 w-4 text-destructive shrink-0" />
        ) : (
          <Clock className="h-4 w-4 text-warning shrink-0" />
        )}
        <div className="text-sm">
          {hasBreach ? (
            <span className="text-destructive font-medium">
              {breachedCount} SLA {breachedCount === 1 ? "breach" : "breaches"}
            </span>
          ) : null}
          {hasBreach && approachingCount > 0 && (
            <span className="text-muted-foreground"> and </span>
          )}
          {approachingCount > 0 && (
            <span className={cn("font-medium", hasBreach ? "text-warning" : "text-warning-foreground")}>
              {approachingCount} approaching deadline{approachingCount !== 1 ? "s" : ""}
            </span>
          )}
          <span className="text-muted-foreground ml-1">
            — resolution requests need attention
          </span>
        </div>
      </div>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => navigate("/governance?tab=requests")}
        className={cn(
          "shrink-0",
          hasBreach
            ? "text-destructive hover:text-destructive hover:bg-destructive/10"
            : "text-warning-foreground hover:bg-warning/10"
        )}
      >
        View requests
        <ArrowRight className="h-3 w-3 ml-1" />
      </Button>
    </div>
  );
}
