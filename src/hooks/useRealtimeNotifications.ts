import { useEffect, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import type { RealtimePostgresChangesPayload } from "@supabase/supabase-js";

interface NotificationPayload {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: string;
  read: boolean;
  created_at: string;
}

export function useRealtimeNotifications() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const handleNotificationChange = useCallback(
    (payload: RealtimePostgresChangesPayload<NotificationPayload>) => {
      if (payload.eventType === "INSERT") {
        const newNotification = payload.new;
        
        // Show toast for new notifications
        toast(newNotification.title, {
          description: newNotification.message,
          duration: 5000,
        });

        // Invalidate notifications query to refresh the list
        queryClient.invalidateQueries({ queryKey: ["notifications"] });
      }
    },
    [queryClient]
  );

  const handleReportChange = useCallback(
    (payload: RealtimePostgresChangesPayload<{ id: string; status: string; final_status: string; user_id: string }>) => {
      if (payload.eventType === "UPDATE") {
        const report = payload.new;
        
        // Notify user if their report status changed
        if (report.user_id === user?.id) {
          const status = report.final_status || report.status;
          const statusMessages: Record<string, string> = {
            approved: "Your work report has been approved! 🎉",
            rejected: "Your work report needs revision. Please check the feedback.",
          };

          if (statusMessages[status]) {
            toast.info("Report Update", {
              description: statusMessages[status],
            });
          }
        }

        // Invalidate queries
        queryClient.invalidateQueries({ queryKey: ["work-reports"] });
        queryClient.invalidateQueries({ queryKey: ["paginated-work-reports"] });
      }
    },
    [queryClient, user?.id]
  );

  const handleTradeChange = useCallback(
    (payload: RealtimePostgresChangesPayload<{ id: string; status: string; pnl_amount: number }>) => {
      if (payload.eventType === "UPDATE") {
        const trade = payload.new;
        
        if (trade.status === "closed" && trade.pnl_amount !== null) {
          const isProfit = trade.pnl_amount > 0;
          toast(isProfit ? "Trade Closed (Profit)" : "Trade Closed (Loss)", {
            description: `P&L: ${isProfit ? "+" : ""}$${trade.pnl_amount.toFixed(2)}`,
          });
        }

        queryClient.invalidateQueries({ queryKey: ["trades"] });
        queryClient.invalidateQueries({ queryKey: ["realtime-trades"] });
      }
    },
    [queryClient]
  );

  const handleTaskChange = useCallback(
    (payload: RealtimePostgresChangesPayload<{ id: string; status: string; title: string; user_id: string }>) => {
      if (payload.eventType === "UPDATE") {
        const task = payload.new;
        
        if (task.user_id === user?.id && task.status === "completed") {
          toast.success("Task Completed", {
            description: `"${task.title}" has been marked as completed.`,
          });
        }

        queryClient.invalidateQueries({ queryKey: ["tasks"] });
      }
    },
    [queryClient, user?.id]
  );

  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel("realtime-notifications")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${user.id}`,
        },
        handleNotificationChange
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "work_reports",
        },
        handleReportChange
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "trades",
        },
        handleTradeChange
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "tasks",
        },
        handleTaskChange
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, handleNotificationChange, handleReportChange, handleTradeChange, handleTaskChange]);
}
