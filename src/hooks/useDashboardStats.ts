import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { format } from "date-fns";

interface DashboardStats {
  activeTasks: number;
  completedTasks: number;
  pendingReviews: number;
  teamMembers: number;
}

interface DateRange {
  from?: Date;
  to?: Date;
}

export function useDashboardStats(dateRange?: DateRange) {
  const { user, hasRole } = useAuth();
  const isAdmin = hasRole("report_admin") || hasRole("general_overseer") || hasRole("team_lead") || hasRole("user_admin");

  const fromDate = dateRange?.from ? format(dateRange.from, "yyyy-MM-dd") : null;
  const toDate = dateRange?.to ? format(dateRange.to, "yyyy-MM-dd") : null;

  return useQuery({
    queryKey: ["dashboard-stats", user?.id, isAdmin, fromDate, toDate],
    queryFn: async (): Promise<DashboardStats> => {
      if (!user) {
        return { activeTasks: 0, completedTasks: 0, pendingReviews: 0, teamMembers: 0 };
      }

      // Build queries with optional date filtering
      let activeTasksQuery = supabase
        .from("tasks")
        .select("*", { count: "exact", head: true })
        .in("final_status", ["pending", "in_progress"]);

      let completedTasksQuery = supabase
        .from("tasks")
        .select("*", { count: "exact", head: true })
        .eq("final_status", "approved");

      let pendingReportsQuery = supabase
        .from("work_reports")
        .select("*", { count: "exact", head: true })
        .eq("status", "pending");

      let pendingTasksQuery = supabase
        .from("tasks")
        .select("*", { count: "exact", head: true })
        .eq("final_status", "pending");

      // Apply date filters if provided
      if (fromDate) {
        activeTasksQuery = activeTasksQuery.gte("work_date", fromDate);
        completedTasksQuery = completedTasksQuery.gte("work_date", fromDate);
        pendingReportsQuery = pendingReportsQuery.gte("work_date", fromDate);
        pendingTasksQuery = pendingTasksQuery.gte("work_date", fromDate);
      }
      if (toDate) {
        activeTasksQuery = activeTasksQuery.lte("work_date", toDate);
        completedTasksQuery = completedTasksQuery.lte("work_date", toDate);
        pendingReportsQuery = pendingReportsQuery.lte("work_date", toDate);
        pendingTasksQuery = pendingTasksQuery.lte("work_date", toDate);
      }

      const [
        { count: activeTasks },
        { count: completedTasks },
        { count: pendingReports },
        { count: pendingTasks },
      ] = await Promise.all([
        activeTasksQuery,
        completedTasksQuery,
        pendingReportsQuery,
        pendingTasksQuery,
      ]);

      // Team members count - only for admins (not filtered by date)
      let teamMembers = 0;
      if (isAdmin) {
        const { count } = await supabase
          .from("profiles")
          .select("*", { count: "exact", head: true });
        teamMembers = count || 0;
      }

      return {
        activeTasks: activeTasks || 0,
        completedTasks: completedTasks || 0,
        pendingReviews: (pendingReports || 0) + (pendingTasks || 0),
        teamMembers,
      };
    },
    enabled: !!user,
  });
}
