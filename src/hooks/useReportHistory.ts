import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface ReportHistoryEntry {
  id: string;
  report_id: string;
  action: string;
  previous_status: string | null;
  new_status: string | null;
  performed_by: string;
  performer_name?: string;
  comment: string | null;
  created_at: string;
}

export function useReportHistory(reportId: string | null) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["report-history", reportId],
    queryFn: async (): Promise<ReportHistoryEntry[]> => {
      if (!reportId) return [];

      const { data, error } = await supabase
        .from("report_history")
        .select("*")
        .eq("report_id", reportId)
        .order("created_at", { ascending: true });

      if (error) throw error;

      // Fetch performer names
      const performerIds = [...new Set((data || []).map((h) => h.performed_by))];
      
      if (performerIds.length > 0) {
        const { data: profiles } = await supabase
          .from("profiles")
          .select("id, full_name")
          .in("id", performerIds);

        const nameMap = new Map(
          (profiles || []).map((p) => [p.id, p.full_name || "Unknown"])
        );

        return (data || []).map((entry) => ({
          ...entry,
          performer_name: nameMap.get(entry.performed_by) || "System",
        }));
      }

      return data || [];
    },
    enabled: !!user && !!reportId,
  });
}

export function useAllReportHistory(limit = 50) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["all-report-history", limit],
    queryFn: async (): Promise<ReportHistoryEntry[]> => {
      const { data, error } = await supabase
        .from("report_history")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(limit);

      if (error) throw error;

      // Fetch performer names
      const performerIds = [...new Set((data || []).map((h) => h.performed_by))];
      
      if (performerIds.length > 0) {
        const { data: profiles } = await supabase
          .from("profiles")
          .select("id, full_name")
          .in("id", performerIds);

        const nameMap = new Map(
          (profiles || []).map((p) => [p.id, p.full_name || "Unknown"])
        );

        return (data || []).map((entry) => ({
          ...entry,
          performer_name: nameMap.get(entry.performed_by) || "System",
        }));
      }

      return data || [];
    },
    enabled: !!user,
  });
}
