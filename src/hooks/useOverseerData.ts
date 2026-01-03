import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface MemberPerformance {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  role: string;
  total_tasks: number;
  approved_tasks: number;
  rejected_tasks: number;
  pending_tasks: number;
  total_reports: number;
  approved_reports: number;
  rejected_reports: number;
  pending_reports: number;
  total_hours: number;
  total_earnings: number;
}

export interface TeamOverview {
  total_members: number;
  total_tasks: number;
  total_reports: number;
  pending_reviews: number;
  total_hours_worked: number;
  total_earnings: number;
  approval_rate: number;
}

export interface PeriodEarnings {
  period_id: string;
  period_name: string;
  start_date: string;
  end_date: string;
  status: string;
  total_hours: number;
  total_earnings: number;
  member_count: number;
}

export function useOverseerStats() {
  const { user, role } = useAuth();
  const isOverseer = role === "general_overseer";

  return useQuery({
    queryKey: ["overseer-stats"],
    queryFn: async (): Promise<TeamOverview> => {
      // Get all tasks
      const { data: tasks } = await supabase.from("tasks").select("final_status, hours_worked, calculated_earnings");
      
      // Get all reports
      const { data: reports } = await supabase.from("work_reports").select("final_status, hours_worked, earnings");
      
      // Get all members with roles
      const { data: roles } = await supabase.from("user_roles").select("user_id");
      
      const totalTasks = tasks?.length || 0;
      const approvedTasks = tasks?.filter((t) => t.final_status === "approved").length || 0;
      const pendingTasks = tasks?.filter((t) => t.final_status === "pending").length || 0;
      
      const totalReports = reports?.length || 0;
      const approvedReports = reports?.filter((r) => r.final_status === "approved").length || 0;
      const pendingReports = reports?.filter((r) => r.final_status === "pending").length || 0;
      
      const totalHours = 
        (tasks?.reduce((sum, t) => sum + (t.hours_worked || 0), 0) || 0) +
        (reports?.reduce((sum, r) => sum + (r.hours_worked || 0), 0) || 0);
      
      const totalEarnings = 
        (tasks?.filter((t) => t.final_status === "approved").reduce((sum, t) => sum + (t.calculated_earnings || 0), 0) || 0) +
        (reports?.filter((r) => r.final_status === "approved").reduce((sum, r) => sum + (r.earnings || 0), 0) || 0);

      const totalDecided = totalTasks + totalReports - pendingTasks - pendingReports;
      const totalApproved = approvedTasks + approvedReports;

      return {
        total_members: roles?.length || 0,
        total_tasks: totalTasks,
        total_reports: totalReports,
        pending_reviews: pendingTasks + pendingReports,
        total_hours_worked: totalHours,
        total_earnings: totalEarnings,
        approval_rate: totalDecided > 0 ? (totalApproved / totalDecided) * 100 : 0,
      };
    },
    enabled: !!user && isOverseer,
  });
}

export function useMemberPerformance() {
  const { user, role } = useAuth();
  const isOverseer = role === "general_overseer";

  return useQuery({
    queryKey: ["member-performance"],
    queryFn: async (): Promise<MemberPerformance[]> => {
      // Get all profiles
      const { data: profiles } = await supabase.from("profiles").select("id, full_name, avatar_url");
      
      // Get all roles
      const { data: roles } = await supabase.from("user_roles").select("user_id, role");
      
      // Get all tasks
      const { data: tasks } = await supabase.from("tasks").select("user_id, final_status, hours_worked, calculated_earnings");
      
      // Get all reports
      const { data: reports } = await supabase.from("work_reports").select("user_id, final_status, hours_worked, earnings");

      const roleMap = new Map(roles?.map((r) => [r.user_id, r.role]) || []);

      return (profiles || []).map((profile) => {
        const userTasks = tasks?.filter((t) => t.user_id === profile.id) || [];
        const userReports = reports?.filter((r) => r.user_id === profile.id) || [];

        const approvedTasks = userTasks.filter((t) => t.final_status === "approved");
        const approvedReports = userReports.filter((r) => r.final_status === "approved");

        return {
          id: profile.id,
          full_name: profile.full_name,
          avatar_url: profile.avatar_url,
          role: roleMap.get(profile.id) || "employee",
          total_tasks: userTasks.length,
          approved_tasks: approvedTasks.length,
          rejected_tasks: userTasks.filter((t) => t.final_status === "rejected").length,
          pending_tasks: userTasks.filter((t) => t.final_status === "pending").length,
          total_reports: userReports.length,
          approved_reports: approvedReports.length,
          rejected_reports: userReports.filter((r) => r.final_status === "rejected").length,
          pending_reports: userReports.filter((r) => r.final_status === "pending").length,
          total_hours:
            userTasks.reduce((sum, t) => sum + (t.hours_worked || 0), 0) +
            userReports.reduce((sum, r) => sum + (r.hours_worked || 0), 0),
          total_earnings:
            approvedTasks.reduce((sum, t) => sum + (t.calculated_earnings || 0), 0) +
            approvedReports.reduce((sum, r) => sum + (r.earnings || 0), 0),
        };
      }).filter((m) => m.total_tasks > 0 || m.total_reports > 0);
    },
    enabled: !!user && isOverseer,
  });
}

export function usePeriodEarnings() {
  const { user, role } = useAuth();
  const isOverseer = role === "general_overseer";

  return useQuery({
    queryKey: ["period-earnings"],
    queryFn: async (): Promise<PeriodEarnings[]> => {
      // Get salary periods
      const { data: periods } = await supabase
        .from("salary_periods")
        .select("*")
        .order("start_date", { ascending: false });

      if (!periods) return [];

      // Get all approved reports and tasks
      const { data: reports } = await supabase
        .from("work_reports")
        .select("user_id, work_date, hours_worked, earnings, final_status")
        .eq("final_status", "approved");

      const { data: tasks } = await supabase
        .from("tasks")
        .select("user_id, work_date, hours_worked, calculated_earnings, final_status")
        .eq("final_status", "approved");

      return periods.map((period) => {
        const periodReports = reports?.filter(
          (r) => r.work_date >= period.start_date && r.work_date <= period.end_date
        ) || [];
        const periodTasks = tasks?.filter(
          (t) => t.work_date >= period.start_date && t.work_date <= period.end_date
        ) || [];

        const uniqueMembers = new Set([
          ...periodReports.map((r) => r.user_id),
          ...periodTasks.map((t) => t.user_id),
        ]);

        return {
          period_id: period.id,
          period_name: period.name,
          start_date: period.start_date,
          end_date: period.end_date,
          status: period.status,
          total_hours:
            periodReports.reduce((sum, r) => sum + (r.hours_worked || 0), 0) +
            periodTasks.reduce((sum, t) => sum + (t.hours_worked || 0), 0),
          total_earnings:
            periodReports.reduce((sum, r) => sum + (r.earnings || 0), 0) +
            periodTasks.reduce((sum, t) => sum + (t.calculated_earnings || 0), 0),
          member_count: uniqueMembers.size,
        };
      });
    },
    enabled: !!user && isOverseer,
  });
}
