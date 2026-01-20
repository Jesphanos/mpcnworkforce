import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Activity, Moon, Sun } from "lucide-react";
import { cn } from "@/lib/utils";

interface MarketSession {
  name: string;
  status: "open" | "closed" | "pre-market" | "after-hours";
  icon: React.ElementType;
}

function getMarketSessions(): MarketSession[] {
  const now = new Date();
  const utcHours = now.getUTCHours();
  
  // Simplified market session logic
  const sessions: MarketSession[] = [];
  
  // Forex is 24/5
  const dayOfWeek = now.getUTCDay();
  const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
  
  sessions.push({
    name: "Forex",
    status: isWeekend ? "closed" : "open",
    icon: Activity,
  });
  
  // US Stock Market (9:30 AM - 4:00 PM EST = 14:30 - 21:00 UTC)
  if (utcHours >= 14 && utcHours < 21) {
    sessions.push({ name: "NYSE", status: "open", icon: Sun });
  } else if (utcHours >= 13 && utcHours < 14) {
    sessions.push({ name: "NYSE", status: "pre-market", icon: Sun });
  } else if (utcHours >= 21 && utcHours < 24) {
    sessions.push({ name: "NYSE", status: "after-hours", icon: Moon });
  } else {
    sessions.push({ name: "NYSE", status: "closed", icon: Moon });
  }
  
  // Crypto is 24/7
  sessions.push({ name: "Crypto", status: "open", icon: Activity });
  
  return sessions;
}

export function MarketStatusIndicator({ compact = false }: { compact?: boolean }) {
  const [sessions, setSessions] = useState<MarketSession[]>([]);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    setSessions(getMarketSessions());
    
    const interval = setInterval(() => {
      setCurrentTime(new Date());
      setSessions(getMarketSessions());
    }, 60000); // Update every minute

    return () => clearInterval(interval);
  }, []);

  const openSessions = sessions.filter(s => s.status === "open");
  const hasOpenMarkets = openSessions.length > 0;

  if (compact) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center gap-1.5 cursor-help">
            <motion.div
              animate={{ scale: hasOpenMarkets ? [1, 1.2, 1] : 1 }}
              transition={{ repeat: Infinity, duration: 2 }}
              className={cn(
                "w-2 h-2 rounded-full",
                hasOpenMarkets ? "bg-success" : "bg-muted-foreground"
              )}
            />
            <span className="text-xs text-muted-foreground hidden sm:inline">
              {openSessions.length} Market{openSessions.length !== 1 ? "s" : ""} Open
            </span>
          </div>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="p-3">
          <div className="space-y-2">
            <p className="text-xs font-medium mb-2">Market Sessions</p>
            {sessions.map((session) => (
              <div key={session.name} className="flex items-center justify-between gap-4">
                <span className="text-xs">{session.name}</span>
                <Badge
                  variant={session.status === "open" ? "default" : "secondary"}
                  className="text-[10px] capitalize"
                >
                  {session.status}
                </Badge>
              </div>
            ))}
            <p className="text-[10px] text-muted-foreground pt-2 border-t">
              UTC: {currentTime.toUTCString().slice(17, 22)}
            </p>
          </div>
        </TooltipContent>
      </Tooltip>
    );
  }

  return (
    <div className="flex items-center gap-2">
      {sessions.map((session) => {
        const Icon = session.icon;
        return (
          <Tooltip key={session.name}>
            <TooltipTrigger asChild>
              <div className="flex items-center gap-1.5 cursor-help">
                <div
                  className={cn(
                    "w-2 h-2 rounded-full",
                    session.status === "open" && "bg-success",
                    session.status === "closed" && "bg-muted-foreground",
                    session.status === "pre-market" && "bg-warning",
                    session.status === "after-hours" && "bg-info"
                  )}
                />
                <span className="text-xs text-muted-foreground">{session.name}</span>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              {session.name}: {session.status}
            </TooltipContent>
          </Tooltip>
        );
      })}
    </div>
  );
}
