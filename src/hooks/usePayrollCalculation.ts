import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface EmployeePayroll {
  user_id: string;
  full_name: string | null;
  email: string;
  total_hours: number;
  total_earnings: number;
  approved_reports: number;
}

export function usePayrollCalculation(periodId: string | null, startDate: string | null, endDate: string | null) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["payroll-calculation", periodId, startDate, endDate],
    queryFn: async () => {
      if (!startDate || !endDate) return [];

      // Get approved work reports within the date range
      const { data: reports, error: reportsError } = await supabase
        .from("work_reports")
        .select("user_id, hours_worked, earnings")
        .eq("status", "approved")
        .gte("work_date", startDate)
        .lte("work_date", endDate);

      if (reportsError) throw reportsError;

      if (!reports || reports.length === 0) return [];

      // Get unique user IDs
      const userIds = [...new Set(reports.map((r) => r.user_id))];

      // Get profiles for those users
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("id, full_name")
        .in("id", userIds);

      if (profilesError) throw profilesError;

      // Get user emails from auth (via admin function or stored in profiles)
      // Since we can't directly query auth.users, we'll use the profiles data
      const profileMap = new Map(profiles?.map((p) => [p.id, p.full_name]) || []);

      // Aggregate by user
      const aggregated = reports.reduce<Record<string, { hours: number; earnings: number; count: number }>>(
        (acc, report) => {
          if (!acc[report.user_id]) {
            acc[report.user_id] = { hours: 0, earnings: 0, count: 0 };
          }
          acc[report.user_id].hours += Number(report.hours_worked);
          acc[report.user_id].earnings += Number(report.earnings);
          acc[report.user_id].count += 1;
          return acc;
        },
        {}
      );

      // Build result
      const result: EmployeePayroll[] = Object.entries(aggregated).map(([userId, data]) => ({
        user_id: userId,
        full_name: profileMap.get(userId) || null,
        email: "", // Email would require auth access
        total_hours: data.hours,
        total_earnings: data.earnings,
        approved_reports: data.count,
      }));

      return result.sort((a, b) => b.total_earnings - a.total_earnings);
    },
    enabled: !!user && !!startDate && !!endDate,
  });
}
