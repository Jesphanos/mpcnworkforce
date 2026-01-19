import { useEffect, useState, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Trade } from "./useTrading";
import { toast } from "sonner";

interface UseRealtimeTradesOptions {
  traderId?: string;
  enabled?: boolean;
}

interface RealtimeTradesResult {
  trades: Trade[];
  isConnected: boolean;
  lastUpdate: Date | null;
}

export function useRealtimeTrades({
  traderId,
  enabled = true,
}: UseRealtimeTradesOptions): RealtimeTradesResult {
  const queryClient = useQueryClient();
  const [isConnected, setIsConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [trades, setTrades] = useState<Trade[]>([]);

  const handleTradeUpdate = useCallback(
    (payload: { eventType: string; new: Trade; old: Trade }) => {
      setLastUpdate(new Date());

      if (payload.eventType === "INSERT") {
        setTrades((prev) => [payload.new as Trade, ...prev]);
        toast.info("New trade logged", {
          description: `${payload.new.instrument} ${payload.new.direction}`,
        });
      } else if (payload.eventType === "UPDATE") {
        setTrades((prev) =>
          prev.map((t) => (t.id === payload.new.id ? (payload.new as Trade) : t))
        );

        // Notify if trade closed
        if (payload.old.status === "open" && payload.new.status === "closed") {
          const pnl = payload.new.pnl_amount || 0;
          toast[pnl >= 0 ? "success" : "warning"](
            `Trade closed: ${payload.new.instrument}`,
            {
              description: `P/L: ${pnl >= 0 ? "+" : ""}$${pnl.toFixed(2)}`,
            }
          );
        }
      } else if (payload.eventType === "DELETE") {
        setTrades((prev) => prev.filter((t) => t.id !== payload.old.id));
      }

      // Invalidate queries to sync with server
      queryClient.invalidateQueries({ queryKey: ["trader-trades", traderId] });
      queryClient.invalidateQueries({ queryKey: ["trader-session-stats", traderId] });
    },
    [queryClient, traderId]
  );

  useEffect(() => {
    if (!enabled || !traderId) return;

    // Initial fetch
    const fetchTrades = async () => {
      const { data, error } = await supabase
        .from("trades")
        .select("*")
        .eq("trader_id", traderId)
        .order("entry_time", { ascending: false })
        .limit(50);

      if (!error && data) {
        setTrades(data as Trade[]);
      }
    };

    fetchTrades();

    // Subscribe to realtime changes
    const channel = supabase
      .channel(`trades-${traderId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "trades",
          filter: `trader_id=eq.${traderId}`,
        },
        (payload) => {
          handleTradeUpdate({
            eventType: payload.eventType,
            new: payload.new as Trade,
            old: payload.old as Trade,
          });
        }
      )
      .subscribe((status) => {
        setIsConnected(status === "SUBSCRIBED");
      });

    return () => {
      supabase.removeChannel(channel);
      setIsConnected(false);
    };
  }, [traderId, enabled, handleTradeUpdate]);

  return {
    trades,
    isConnected,
    lastUpdate,
  };
}
