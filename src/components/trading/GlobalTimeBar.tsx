import { useState, useEffect, useMemo, memo } from "react";
import { motion } from "framer-motion";
import { Clock, Globe, Sun, Moon, Sunrise, Sunset } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface MarketSession {
  name: string;
  city: string;
  timezone: string;
  openHour: number;
  closeHour: number;
  color: string;
}

const MAJOR_MARKETS: MarketSession[] = [
  { name: "Sydney", city: "Sydney", timezone: "Australia/Sydney", openHour: 10, closeHour: 17, color: "text-blue-400" },
  { name: "Tokyo", city: "Tokyo", timezone: "Asia/Tokyo", openHour: 9, closeHour: 15, color: "text-pink-400" },
  { name: "Hong Kong", city: "Hong Kong", timezone: "Asia/Hong_Kong", openHour: 9, closeHour: 16, color: "text-red-400" },
  { name: "Singapore", city: "Singapore", timezone: "Asia/Singapore", openHour: 9, closeHour: 17, color: "text-teal-400" },
  { name: "London", city: "London", timezone: "Europe/London", openHour: 8, closeHour: 16, color: "text-amber-400" },
  { name: "Frankfurt", city: "Frankfurt", timezone: "Europe/Berlin", openHour: 9, closeHour: 17, color: "text-yellow-400" },
  { name: "NYSE", city: "New York", timezone: "America/New_York", openHour: 9, closeHour: 16, color: "text-green-400" },
  { name: "NASDAQ", city: "New York", timezone: "America/New_York", openHour: 9, closeHour: 16, color: "text-cyan-400" },
];

const FOREX_SESSIONS = [
  { name: "Sydney", start: 22, end: 7, color: "bg-blue-500" },
  { name: "Tokyo", start: 0, end: 9, color: "bg-pink-500" },
  { name: "London", start: 8, end: 17, color: "bg-amber-500" },
  { name: "New York", start: 13, end: 22, color: "bg-green-500" },
];

function getMarketStatus(market: MarketSession, now: Date): "open" | "closed" | "pre-market" | "after-hours" {
  try {
    const localTime = new Date(now.toLocaleString("en-US", { timeZone: market.timezone }));
    const hours = localTime.getHours();
    const day = localTime.getDay();
    
    // Weekend check
    if (day === 0 || day === 6) return "closed";
    
    // Pre-market (30 min before)
    if (hours === market.openHour - 1 && localTime.getMinutes() >= 30) return "pre-market";
    
    // Open hours
    if (hours >= market.openHour && hours < market.closeHour) return "open";
    
    // After-hours (1 hour after close)
    if (hours >= market.closeHour && hours < market.closeHour + 1) return "after-hours";
    
    return "closed";
  } catch {
    return "closed";
  }
}

function getTimeInTimezone(timezone: string): string {
  try {
    return new Date().toLocaleTimeString("en-US", {
      timeZone: timezone,
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  } catch {
    return "--:--";
  }
}

function getActiveForexSessions(utcHour: number): string[] {
  return FOREX_SESSIONS.filter(session => {
    if (session.start < session.end) {
      return utcHour >= session.start && utcHour < session.end;
    } else {
      return utcHour >= session.start || utcHour < session.end;
    }
  }).map(s => s.name);
}

function getDayIcon(hour: number) {
  if (hour >= 6 && hour < 8) return Sunrise;
  if (hour >= 8 && hour < 18) return Sun;
  if (hour >= 18 && hour < 20) return Sunset;
  return Moon;
}

// Memoized market item to prevent re-renders
const MarketItem = memo(function MarketItem({ 
  market, 
  now 
}: { 
  market: MarketSession; 
  now: Date;
}) {
  const status = getMarketStatus(market, now);
  const time = getTimeInTimezone(market.timezone);
  
  return (
    <Tooltip key={market.name}>
      <TooltipTrigger asChild>
        <div className="flex items-center gap-1.5 shrink-0 cursor-help">
          <motion.div
            animate={status === "open" ? { scale: [1, 1.2, 1] } : {}}
            transition={{ repeat: Infinity, duration: 2 }}
            className={cn(
              "w-1.5 h-1.5 rounded-full",
              status === "open" && "bg-trading-positive",
              status === "pre-market" && "bg-warning",
              status === "after-hours" && "bg-info",
              status === "closed" && "bg-muted-foreground/50"
            )}
          />
          <span className={cn("text-xs font-medium", market.color)}>
            {market.name}
          </span>
          <span className="text-xs font-mono text-muted-foreground">
            {time}
          </span>
        </div>
      </TooltipTrigger>
      <TooltipContent side="bottom">
        <div className="text-xs space-y-1">
          <p className="font-medium">{market.city} Stock Exchange</p>
          <p>Hours: {market.openHour}:00 - {market.closeHour}:00 local</p>
          <Badge 
            variant={status === "open" ? "default" : "secondary"} 
            className="capitalize text-[10px]"
          >
            {status}
          </Badge>
        </div>
      </TooltipContent>
    </Tooltip>
  );
});

export const GlobalTimeBar = memo(function GlobalTimeBar() {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    // Update every 5 seconds instead of 1 second to reduce re-renders
    const interval = setInterval(() => setNow(new Date()), 5000);
    return () => clearInterval(interval);
  }, []);

  const utcHour = now.getUTCHours();
  const localHour = now.getHours();
  const DayIcon = useMemo(() => getDayIcon(localHour), [localHour]);
  const activeForexSessions = useMemo(() => getActiveForexSessions(utcHour), [utcHour]);
  const isWeekend = now.getDay() === 0 || now.getDay() === 6;

  const openMarkets = useMemo(
    () => MAJOR_MARKETS.filter(m => getMarketStatus(m, now) === "open"),
    [now]
  );

  return (
    <div className="w-full bg-trading-bg/95 backdrop-blur-sm border-b border-border/50 py-2 px-4">
      <div className="flex items-center justify-between gap-4 overflow-x-auto">
        {/* Local Time */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="flex items-center gap-2">
            <DayIcon className="h-4 w-4 text-trading-accent" />
            <div className="text-sm">
              <span className="font-mono font-bold text-foreground">
                {now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
              </span>
            </div>
          </div>
          <div className="text-xs text-muted-foreground hidden sm:block">
            {now.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
          </div>
        </div>

        {/* Separator */}
        <div className="h-6 w-px bg-border hidden md:block" />

        {/* UTC Time */}
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex items-center gap-2 shrink-0 cursor-help">
              <Globe className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-xs font-mono text-muted-foreground">
                UTC {now.toISOString().slice(11, 19)}
              </span>
            </div>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            <p className="text-xs">Coordinated Universal Time</p>
          </TooltipContent>
        </Tooltip>

        {/* Separator */}
        <div className="h-6 w-px bg-border hidden lg:block" />

        {/* Major Market Clocks - Now using memoized components */}
        <div className="flex items-center gap-3 overflow-x-auto py-1 hidden lg:flex">
          {MAJOR_MARKETS.slice(0, 5).map((market) => (
            <MarketItem key={market.name} market={market} now={now} />
          ))}
        </div>

        {/* Separator */}
        <div className="h-6 w-px bg-border hidden xl:block" />

        {/* Forex Sessions */}
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xs text-muted-foreground hidden xl:inline">Forex:</span>
          {isWeekend ? (
            <Badge variant="outline" className="text-[10px]">Weekend - Closed</Badge>
          ) : activeForexSessions.length > 0 ? (
            <div className="flex items-center gap-1">
              {activeForexSessions.map((session) => (
                <Badge 
                  key={session} 
                  variant="default" 
                  className="text-[10px] bg-trading-positive/20 text-trading-positive border-trading-positive/30"
                >
                  {session}
                </Badge>
              ))}
            </div>
          ) : (
            <Badge variant="secondary" className="text-[10px]">Between Sessions</Badge>
          )}
        </div>

        {/* Separator */}
        <div className="h-6 w-px bg-border hidden md:block" />

        {/* Summary */}
        <div className="flex items-center gap-2 shrink-0">
          <Clock className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="text-xs text-muted-foreground">
            <span className="font-medium text-trading-positive">{openMarkets.length}</span> markets open
          </span>
        </div>
      </div>
    </div>
  );
});