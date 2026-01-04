import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { format, subDays, eachDayOfInterval, parseISO } from "date-fns";

interface TrendDataPoint {
  date: string;
  tasks: number;
  reports: number;
}

interface DateRange {
  from?: Date;
  to?: Date;
}

export function useDashboardTrends(dateRange?: DateRange) {
  const { user } = useAuth();

  // Default to last 14 days if no range specified
  const endDate = dateRange?.to || new Date();
  const startDate = dateRange?.from || subDays(endDate, 13);

  const fromDate = format(startDate, "yyyy-MM-dd");
  const toDate = format(endDate, "yyyy-MM-dd");

  return useQuery({
    queryKey: ["dashboard-trends", user?.id, fromDate, toDate],
    queryFn: async (): Promise<TrendDataPoint[]> => {
      if (!user) return [];

      const [{ data: tasksData }, { data: reportsData }] = await Promise.all([
        supabase
          .from("tasks")
          .select("work_date")
          .gte("work_date", fromDate)
          .lte("work_date", toDate),
        supabase
          .from("work_reports")
          .select("work_date")
          .gte("work_date", fromDate)
          .lte("work_date", toDate),
      ]);

      // Create a map of dates to counts
      const dateMap = new Map<string, { tasks: number; reports: number }>();

      // Initialize all dates in range
      const allDates = eachDayOfInterval({ start: startDate, end: endDate });
      allDates.forEach((date) => {
        const dateStr = format(date, "yyyy-MM-dd");
        dateMap.set(dateStr, { tasks: 0, reports: 0 });
      });

      // Count tasks per date
      tasksData?.forEach((task) => {
        const existing = dateMap.get(task.work_date) || { tasks: 0, reports: 0 };
        dateMap.set(task.work_date, { ...existing, tasks: existing.tasks + 1 });
      });

      // Count reports per date
      reportsData?.forEach((report) => {
        const existing = dateMap.get(report.work_date) || { tasks: 0, reports: 0 };
        dateMap.set(report.work_date, { ...existing, reports: existing.reports + 1 });
      });

      // Convert to array and format dates for display
      return Array.from(dateMap.entries())
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([date, counts]) => ({
          date: format(parseISO(date), "MMM d"),
          tasks: counts.tasks,
          reports: counts.reports,
        }));
    },
    enabled: !!user,
  });
}
