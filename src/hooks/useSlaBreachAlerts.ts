import { useEffect, useRef } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useCapabilities } from "@/hooks/useCapabilities";

interface SlaBreachRequest {
  id: string;
  title: string;
  priority: string;
  sla_due_at: string;
  status: string;
}

export function useSlaBreachAlerts() {
  const { can, isOverseer } = useCapabilities();
  const queryClient = useQueryClient();
  const lastCheckedRef = useRef<string[]>([]);
  const isAdmin = can("canApproveReports") || can("canOverrideReports") || isOverseer();

  // Query for requests approaching or past SLA
  const { data: atRiskRequests } = useQuery({
    queryKey: ["sla-breach-alerts"],
    queryFn: async () => {
      const now = new Date();
      const warningThreshold = new Date(now.getTime() + 4 * 60 * 60 * 1000); // 4 hours from now

      const { data, error } = await supabase
        .from("resolution_requests")
        .select("id, title, priority, sla_due_at, status")
        .neq("status", "resolved")
        .not("sla_due_at", "is", null)
        .lte("sla_due_at", warningThreshold.toISOString())
        .order("sla_due_at", { ascending: true });

      if (error) throw error;
      return (data || []) as SlaBreachRequest[];
    },
    enabled: isAdmin,
    refetchInterval: 5 * 60 * 1000, // Check every 5 minutes
  });

  // Show toast for new breaches or approaching deadlines
  useEffect(() => {
    if (!atRiskRequests || !isAdmin) return;

    const now = new Date();
    const newBreaches = atRiskRequests.filter(
      (req) => !lastCheckedRef.current.includes(req.id)
    );

    newBreaches.forEach((req) => {
      const dueDate = new Date(req.sla_due_at);
      const isPastDue = dueDate < now;
      const hoursUntilDue = (dueDate.getTime() - now.getTime()) / (1000 * 60 * 60);

      if (isPastDue) {
        toast.error(`SLA Breach: "${req.title}"`, {
          description: `This ${req.priority} priority request is overdue`,
          duration: 10000,
          action: {
            label: "View",
            onClick: () => {
              queryClient.invalidateQueries({ queryKey: ["resolution-requests"] });
            },
          },
        });
      } else if (hoursUntilDue <= 4) {
        toast.warning(`SLA Warning: "${req.title}"`, {
          description: `Due in ${Math.round(hoursUntilDue * 60)} minutes`,
          duration: 8000,
        });
      }
    });

    lastCheckedRef.current = atRiskRequests.map((r) => r.id);
  }, [atRiskRequests, isAdmin, queryClient]);

  // Subscribe to realtime updates on resolution_requests
  useEffect(() => {
    if (!isAdmin) return;

    const channel = supabase
      .channel("sla-breach-monitor")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "resolution_requests",
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ["sla-breach-alerts"] });
          queryClient.invalidateQueries({ queryKey: ["resolution-requests"] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [isAdmin, queryClient]);

  return {
    atRiskRequests: atRiskRequests || [],
    breachedCount: atRiskRequests?.filter(
      (r) => new Date(r.sla_due_at) < new Date()
    ).length || 0,
    approachingCount: atRiskRequests?.filter(
      (r) => new Date(r.sla_due_at) >= new Date()
    ).length || 0,
  };
}
