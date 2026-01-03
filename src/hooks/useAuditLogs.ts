import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface AuditLog {
  id: string;
  entity_type: string;
  entity_id: string;
  action: string;
  performed_by: string;
  performed_at: string;
  previous_values: Record<string, unknown> | null;
  new_values: Record<string, unknown> | null;
  notes: string | null;
}

export function useAuditLogs(entityType?: string, entityId?: string) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["audit-logs", entityType, entityId],
    queryFn: async () => {
      let query = supabase
        .from("audit_logs")
        .select("*")
        .order("performed_at", { ascending: false })
        .limit(100);

      if (entityType) {
        query = query.eq("entity_type", entityType);
      }
      if (entityId) {
        query = query.eq("entity_id", entityId);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as AuditLog[];
    },
    enabled: !!user,
  });
}

export function useEntityAuditLogs(entityType: string, entityId: string) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["audit-logs", entityType, entityId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("audit_logs")
        .select("*")
        .eq("entity_type", entityType)
        .eq("entity_id", entityId)
        .order("performed_at", { ascending: false });

      if (error) throw error;
      return data as AuditLog[];
    },
    enabled: !!user && !!entityId,
  });
}
