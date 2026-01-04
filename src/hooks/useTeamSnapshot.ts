import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface TeamSnapshot {
  teamName: string;
  activeTasksCount: number;
  pendingReportsCount: number;
  trend: "improving" | "steady" | "declining";
  commentary: string;
}

export function useTeamSnapshot() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["team-snapshot", user?.id],
    queryFn: async (): Promise<TeamSnapshot> => {
      if (!user) throw new Error("Not authenticated");

      // Get active tasks count (organization-wide for now, can be filtered by team later)
      const { count: activeTasksCount } = await supabase
        .from("tasks")
        .select("*", { count: "exact", head: true })
        .eq("final_status", "pending");

      // Get pending reports count
      const { count: pendingReportsCount } = await supabase
        .from("work_reports")
        .select("*", { count: "exact", head: true })
        .eq("final_status", "pending");

      // Get recent completion rate to determine trend
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      
      const fourteenDaysAgo = new Date();
      fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);

      const { count: recentApproved } = await supabase
        .from("tasks")
        .select("*", { count: "exact", head: true })
        .eq("final_status", "approved")
        .gte("updated_at", sevenDaysAgo.toISOString());

      const { count: previousApproved } = await supabase
        .from("tasks")
        .select("*", { count: "exact", head: true })
        .eq("final_status", "approved")
        .gte("updated_at", fourteenDaysAgo.toISOString())
        .lt("updated_at", sevenDaysAgo.toISOString());

      // Determine trend
      let trend: "improving" | "steady" | "declining" = "steady";
      if ((recentApproved || 0) > (previousApproved || 0) * 1.1) {
        trend = "improving";
      } else if ((recentApproved || 0) < (previousApproved || 0) * 0.9) {
        trend = "declining";
      }

      // Generate neutral commentary
      const commentary = generateCommentary(activeTasksCount || 0, pendingReportsCount || 0, trend);

      return {
        teamName: "Organization", // Can be updated when team structure is added
        activeTasksCount: activeTasksCount || 0,
        pendingReportsCount: pendingReportsCount || 0,
        trend,
        commentary,
      };
    },
    enabled: !!user,
  });
}

function generateCommentary(activeTasks: number, pendingReports: number, trend: string): string {
  const trendText = trend === "improving" 
    ? "Task completion is trending upward this week." 
    : trend === "declining"
    ? "Task activity has slowed compared to last week."
    : "Team activity remains consistent with recent performance.";

  const activityText = activeTasks > 0 || pendingReports > 0
    ? `Currently ${activeTasks} active tasks and ${pendingReports} reports awaiting review.`
    : "No pending tasks or reports at this time.";

  return `${trendText} ${activityText}`;
}
