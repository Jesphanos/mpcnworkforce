import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

export function useReportNotifications() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel("report-status-changes")
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "work_reports",
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          const newRecord = payload.new as {
            status: string;
            platform: string;
            work_date: string;
            rejection_reason?: string;
          };
          const oldRecord = payload.old as { status: string };

          // Only notify if status changed to approved or rejected
          if (oldRecord.status === "pending" && newRecord.status !== "pending") {
            const workDate = new Date(newRecord.work_date).toLocaleDateString();

            if (newRecord.status === "approved") {
              toast.success(`Report Approved! 🎉`, {
                description: `Your ${newRecord.platform} report for ${workDate} has been approved.`,
                duration: 5000,
              });
            } else if (newRecord.status === "rejected") {
              toast.error(`Report Rejected`, {
                description: newRecord.rejection_reason
                  ? `${newRecord.platform} report for ${workDate}: ${newRecord.rejection_reason}`
                  : `Your ${newRecord.platform} report for ${workDate} was rejected.`,
                duration: 8000,
              });
            }

            // Invalidate queries to refresh data
            queryClient.invalidateQueries({ queryKey: ["work-reports"] });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, queryClient]);
}
