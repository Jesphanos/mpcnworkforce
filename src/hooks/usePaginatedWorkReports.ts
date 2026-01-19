import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { usePagination, PaginationResult } from "./usePagination";
import { WorkReport } from "./useWorkReports";
import { PAGINATION } from "@/lib/constants";

interface UsePaginatedWorkReportsOptions {
  status?: string;
  teamLeadStatus?: string;
  finalStatus?: string;
  searchQuery?: string;
  dateFrom?: Date;
  dateTo?: Date;
}

interface PaginatedWorkReportsResult {
  data: WorkReport[];
  pagination: PaginationResult;
  isLoading: boolean;
  error: Error | null;
}

export function usePaginatedWorkReports(
  options: UsePaginatedWorkReportsOptions = {}
): PaginatedWorkReportsResult {
  const { user, hasRole } = useAuth();
  const pagination = usePagination(1, PAGINATION.DEFAULT_PAGE_SIZE);
  const isAdmin = hasRole("report_admin") || hasRole("general_overseer");
  const isTeamLead = hasRole("team_lead");

  // Count query for total items
  const { data: countData } = useQuery({
    queryKey: ["work-reports-count", user?.id, isAdmin, isTeamLead, options],
    queryFn: async () => {
      let query = supabase
        .from("work_reports")
        .select("id", { count: "exact", head: true });

      // Apply filters
      if (options.status) {
        query = query.eq("status", options.status);
      }
      if (options.teamLeadStatus) {
        query = query.eq("team_lead_status", options.teamLeadStatus);
      }
      if (options.finalStatus) {
        query = query.eq("final_status", options.finalStatus);
      }
      if (options.dateFrom) {
        query = query.gte("work_date", options.dateFrom.toISOString().split("T")[0]);
      }
      if (options.dateTo) {
        query = query.lte("work_date", options.dateTo.toISOString().split("T")[0]);
      }
      if (options.searchQuery) {
        query = query.or(
          `platform.ilike.%${options.searchQuery}%,description.ilike.%${options.searchQuery}%`
        );
      }

      // Non-admins only see their own reports
      if (!isAdmin && !isTeamLead) {
        query = query.eq("user_id", user?.id);
      }

      const { count, error } = await query;
      if (error) throw error;
      return count || 0;
    },
    enabled: !!user,
  });

  // Update total items when count changes
  if (countData !== undefined && countData !== pagination.totalItems) {
    pagination.setTotalItems(countData);
  }

  // Data query with pagination
  const { data, isLoading, error } = useQuery({
    queryKey: [
      "work-reports-paginated",
      user?.id,
      isAdmin,
      isTeamLead,
      pagination.page,
      pagination.pageSize,
      options,
    ],
    queryFn: async () => {
      const { from, to } = pagination.getRange();

      let query = supabase
        .from("work_reports")
        .select("*")
        .order("work_date", { ascending: false })
        .range(from, to);

      // Apply filters
      if (options.status) {
        query = query.eq("status", options.status);
      }
      if (options.teamLeadStatus) {
        query = query.eq("team_lead_status", options.teamLeadStatus);
      }
      if (options.finalStatus) {
        query = query.eq("final_status", options.finalStatus);
      }
      if (options.dateFrom) {
        query = query.gte("work_date", options.dateFrom.toISOString().split("T")[0]);
      }
      if (options.dateTo) {
        query = query.lte("work_date", options.dateTo.toISOString().split("T")[0]);
      }
      if (options.searchQuery) {
        query = query.or(
          `platform.ilike.%${options.searchQuery}%,description.ilike.%${options.searchQuery}%`
        );
      }

      // Non-admins only see their own reports
      if (!isAdmin && !isTeamLead) {
        query = query.eq("user_id", user?.id);
      }

      const { data, error } = await query;
      if (error) throw error;
      return (data || []) as WorkReport[];
    },
    enabled: !!user,
  });

  return {
    data: data || [],
    pagination,
    isLoading,
    error: error as Error | null,
  };
}
