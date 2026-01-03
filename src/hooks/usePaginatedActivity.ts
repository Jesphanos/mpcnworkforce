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

interface PaginatedActivityResult {
  activities: ActivityItem[];
  totalCount: number;
  totalPages: number;
}

export function usePaginatedActivity(page: number, pageSize = 10) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["paginated-activity", user?.id, page, pageSize],
    queryFn: async (): Promise<PaginatedActivityResult> => {
      if (!user) return { activities: [], totalCount: 0, totalPages: 0 };

      // Get total counts for pagination
      const [{ count: tasksCount }, { count: reportsCount }] = await Promise.all([
        supabase.from("tasks").select("*", { count: "exact", head: true }),
        supabase.from("work_reports").select("*", { count: "exact", head: true }),
      ]);

      const totalCount = (tasksCount || 0) + (reportsCount || 0);
      const totalPages = Math.ceil(totalCount / pageSize);

      // Fetch all activities with a reasonable limit, then paginate in memory
      // This ensures proper sorting across both tables
      const offset = page * pageSize;
      
      const [{ data: tasks }, { data: reports }] = await Promise.all([
        supabase
          .from("tasks")
          .select("id, title, status, final_status, created_at, updated_at")
          .order("updated_at", { ascending: false }),
        supabase
          .from("work_reports")
          .select("id, platform, status, final_status, work_date, created_at, updated_at")
          .order("updated_at", { ascending: false }),
      ]);

      const activities: ActivityItem[] = [];

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

      // Sort by timestamp and paginate
      const sortedActivities = activities
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .slice(offset, offset + pageSize);

      return {
        activities: sortedActivities,
        totalCount: activities.length,
        totalPages: Math.ceil(activities.length / pageSize),
      };
    },
    enabled: !!user,
  });
}
