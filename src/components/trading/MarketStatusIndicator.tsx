import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Activity, Moon, Sun, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface MarketSession {
  name: string;
  timezone: string;
  openHour: number;
  closeHour: number;
  status: "open" | "closed" | "pre-market" | "after-hours";
  icon: React.ElementType;
}

function getMarketSessions(): MarketSession[] {
  const now = new Date();
  const dayOfWeek = now.getUTCDay();
  const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
  
  const sessions: MarketSession[] = [];
  
  // Forex - Check if weekend
  sessions.push({
    name: "Forex",
    timezone: "UTC",
    openHour: 0,
    closeHour: 24,
    status: isWeekend ? "closed" : "open",
    icon: Activity,
  });
  
  // NYSE - 9:30 AM - 4:00 PM EST (14:30 - 21:00 UTC)
  // Adjusting for DST would require more complex logic
  const nyTime = new Date(now.toLocaleString("en-US", { timeZone: "America/New_York" }));
  const nyHour = nyTime.getHours();
  const nyMinute = nyTime.getMinutes();
  const nyDay = nyTime.getDay();
  
  let nyseStatus: "open" | "closed" | "pre-market" | "after-hours" = "closed";
  if (nyDay >= 1 && nyDay <= 5) {
    if ((nyHour === 9 && nyMinute >= 30) || (nyHour > 9 && nyHour < 16)) {
      nyseStatus = "open";
    } else if (nyHour >= 4 && (nyHour < 9 || (nyHour === 9 && nyMinute < 30))) {
      nyseStatus = "pre-market";
    } else if (nyHour >= 16 && nyHour < 20) {
      nyseStatus = "after-hours";
    }
  }
  
  sessions.push({
    name: "NYSE",
    timezone: "America/New_York",
    openHour: 9,
    closeHour: 16,
    status: nyseStatus,
    icon: nyseStatus === "open" ? Sun : Moon,
  });
  
  // LSE - 8:00 AM - 4:30 PM GMT (adjust for BST)
  const londonTime = new Date(now.toLocaleString("en-US", { timeZone: "Europe/London" }));
  const londonHour = londonTime.getHours();
  const londonMinute = londonTime.getMinutes();
  const londonDay = londonTime.getDay();
  
  let lseStatus: "open" | "closed" | "pre-market" | "after-hours" = "closed";
  if (londonDay >= 1 && londonDay <= 5) {
    if (londonHour >= 8 && (londonHour < 16 || (londonHour === 16 && londonMinute < 30))) {
      lseStatus = "open";
    } else if (londonHour >= 7 && londonHour < 8) {
      lseStatus = "pre-market";
    }
  }
  
  sessions.push({
    name: "LSE",
    timezone: "Europe/London",
    openHour: 8,
    closeHour: 16,
    status: lseStatus,
    icon: lseStatus === "open" ? Sun : Moon,
  });
  
  // Crypto is 24/7
  sessions.push({
    name: "Crypto",
    timezone: "UTC",
    openHour: 0,
    closeHour: 24,
    status: "open",
    icon: TrendingUp,
  });
  
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
    }, 30000); // Update every 30 seconds for accuracy

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
                hasOpenMarkets ? "bg-trading-positive" : "bg-muted-foreground"
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
                  className={cn(
                    "text-[10px] capitalize",
                    session.status === "open" && "bg-trading-positive/20 text-trading-positive",
                    session.status === "pre-market" && "bg-warning/20 text-warning",
                    session.status === "after-hours" && "bg-info/20 text-info"
                  )}
                >
                  {session.status}
                </Badge>
              </div>
            ))}
            <p className="text-[10px] text-muted-foreground pt-2 border-t">
              Your time: {currentTime.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
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
                <motion.div
                  animate={session.status === "open" ? { scale: [1, 1.15, 1] } : {}}
                  transition={{ repeat: Infinity, duration: 2 }}
                  className={cn(
                    "w-2 h-2 rounded-full",
                    session.status === "open" && "bg-trading-positive",
                    session.status === "closed" && "bg-muted-foreground/50",
                    session.status === "pre-market" && "bg-warning",
                    session.status === "after-hours" && "bg-info"
                  )}
                />
                <span className="text-xs text-muted-foreground">{session.name}</span>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <div className="text-xs space-y-1">
                <p className="font-medium">{session.name}</p>
                <p className="capitalize">{session.status}</p>
              </div>
            </TooltipContent>
          </Tooltip>
        );
      })}
    </div>
  );
}
