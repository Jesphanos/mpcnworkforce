import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { format } from "date-fns";

interface PlatformData {
  name: string;
  tasks: number;
  reports: number;
  total: number;
}

interface DateRange {
  from?: Date;
  to?: Date;
}

export function usePlatformDistribution(dateRange?: DateRange) {
  const { user } = useAuth();

  const fromDate = dateRange?.from ? format(dateRange.from, "yyyy-MM-dd") : null;
  const toDate = dateRange?.to ? format(dateRange.to, "yyyy-MM-dd") : null;

  return useQuery({
    queryKey: ["platform-distribution", user?.id, fromDate, toDate],
    queryFn: async (): Promise<PlatformData[]> => {
      if (!user) return [];

      let tasksQuery = supabase.from("tasks").select("platform");
      let reportsQuery = supabase.from("work_reports").select("platform");

      if (fromDate) {
        tasksQuery = tasksQuery.gte("work_date", fromDate);
        reportsQuery = reportsQuery.gte("work_date", fromDate);
      }
      if (toDate) {
        tasksQuery = tasksQuery.lte("work_date", toDate);
        reportsQuery = reportsQuery.lte("work_date", toDate);
      }

      const [{ data: tasksData }, { data: reportsData }] = await Promise.all([
        tasksQuery,
        reportsQuery,
      ]);

      // Count by platform
      const platformMap = new Map<string, { tasks: number; reports: number }>();

      tasksData?.forEach((task) => {
        const existing = platformMap.get(task.platform) || { tasks: 0, reports: 0 };
        platformMap.set(task.platform, { ...existing, tasks: existing.tasks + 1 });
      });

      reportsData?.forEach((report) => {
        const existing = platformMap.get(report.platform) || { tasks: 0, reports: 0 };
        platformMap.set(report.platform, { ...existing, reports: existing.reports + 1 });
      });

      return Array.from(platformMap.entries())
        .map(([name, counts]) => ({
          name,
          tasks: counts.tasks,
          reports: counts.reports,
          total: counts.tasks + counts.reports,
        }))
        .sort((a, b) => b.total - a.total);
    },
    enabled: !!user,
  });
}
