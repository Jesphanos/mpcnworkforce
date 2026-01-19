import { Wifi, WifiOff, RefreshCw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface TradingRealtimeStatusProps {
  isConnected: boolean;
  lastUpdate: Date | null;
}

export function TradingRealtimeStatus({
  isConnected,
  lastUpdate,
}: TradingRealtimeStatusProps) {
  return (
    <div className="flex items-center gap-2">
      <Badge
        variant="outline"
        className={cn(
          "gap-1.5 transition-colors",
          isConnected
            ? "border-success/50 text-success bg-success/10"
            : "border-warning/50 text-warning bg-warning/10"
        )}
      >
        {isConnected ? (
          <>
            <Wifi className="h-3 w-3" />
            Live
          </>
        ) : (
          <>
            <WifiOff className="h-3 w-3" />
            Connecting...
          </>
        )}
      </Badge>
      {lastUpdate && (
        <span className="text-xs text-muted-foreground flex items-center gap-1">
          <RefreshCw className="h-3 w-3" />
          {lastUpdate.toLocaleTimeString()}
        </span>
      )}
    </div>
  );
}
