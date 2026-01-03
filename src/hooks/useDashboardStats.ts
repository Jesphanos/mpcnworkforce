import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface DashboardStats {
  activeTasks: number;
  completedTasks: number;
  pendingReviews: number;
  teamMembers: number;
}

export function useDashboardStats() {
  const { user, hasRole } = useAuth();
  const isAdmin = hasRole("report_admin") || hasRole("general_overseer") || hasRole("team_lead") || hasRole("user_admin");

  return useQuery({
    queryKey: ["dashboard-stats", user?.id, isAdmin],
    queryFn: async (): Promise<DashboardStats> => {
      if (!user) {
        return { activeTasks: 0, completedTasks: 0, pendingReviews: 0, teamMembers: 0 };
      }

      // Fetch task counts
      const [
        { count: activeTasks },
        { count: completedTasks },
        { count: pendingReports },
        { count: pendingTasks },
      ] = await Promise.all([
        supabase
          .from("tasks")
          .select("*", { count: "exact", head: true })
          .in("final_status", ["pending", "in_progress"]),
        supabase
          .from("tasks")
          .select("*", { count: "exact", head: true })
          .eq("final_status", "approved"),
        supabase
          .from("work_reports")
          .select("*", { count: "exact", head: true })
          .eq("status", "pending"),
        supabase
          .from("tasks")
          .select("*", { count: "exact", head: true })
          .eq("final_status", "pending"),
      ]);

      // Team members count - only for admins
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
