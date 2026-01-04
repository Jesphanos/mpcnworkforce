import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface ActivityItem {
  id: string;
  type: "task" | "report";
  title: string;
  description: string;
  status: string;
  timestamp: string;
  url: string;
}

export interface ActivityFilters {
  type?: "all" | "task" | "report";
  status?: "all" | "pending" | "approved" | "rejected";
}

export function useRecentActivity(limit = 5, filters?: ActivityFilters) {
  const { user, hasRole } = useAuth();
  const isAdmin = hasRole("report_admin") || hasRole("general_overseer") || hasRole("team_lead");

  const typeFilter = filters?.type || "all";
  const statusFilter = filters?.status || "all";

  return useQuery({
    queryKey: ["recent-activity", user?.id, isAdmin, typeFilter, statusFilter],
    queryFn: async (): Promise<ActivityItem[]> => {
      if (!user) return [];

      const activities: ActivityItem[] = [];

      // Fetch recent tasks (if not filtered to reports only)
      if (typeFilter === "all" || typeFilter === "task") {
        let tasksQuery = supabase
          .from("tasks")
          .select("id, title, status, final_status, created_at, updated_at")
          .order("updated_at", { ascending: false })
          .limit(limit);

        if (statusFilter !== "all") {
          tasksQuery = tasksQuery.eq("final_status", statusFilter);
        }

        const { data: tasks } = await tasksQuery;

        if (tasks) {
          tasks.forEach((task) => {
            activities.push({
              id: task.id,
              type: "task",
              title: task.title,
              description: `Task ${task.final_status === "approved" ? "approved" : task.final_status === "rejected" ? "rejected" : "updated"}`,
              status: task.final_status,
              timestamp: task.updated_at,
              url: "/tasks",
            });
          });
        }
      }

      // Fetch recent work reports (if not filtered to tasks only)
      if (typeFilter === "all" || typeFilter === "report") {
        let reportsQuery = supabase
          .from("work_reports")
          .select("id, platform, status, final_status, work_date, created_at, updated_at")
          .order("updated_at", { ascending: false })
          .limit(limit);

        if (statusFilter !== "all") {
          reportsQuery = reportsQuery.eq("final_status", statusFilter);
        }

        const { data: reports } = await reportsQuery;

        if (reports) {
          reports.forEach((report) => {
            activities.push({
              id: report.id,
              type: "report",
              title: `${report.platform} Report`,
              description: `Report for ${report.work_date} ${report.final_status === "approved" ? "approved" : report.final_status === "rejected" ? "rejected" : "submitted"}`,
              status: report.final_status || report.status,
              timestamp: report.updated_at,
              url: "/reports",
            });
          });
        }
      }

      // Sort by timestamp and return limited results
      return activities
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .slice(0, limit);
    },
    enabled: !!user,
  });
}
