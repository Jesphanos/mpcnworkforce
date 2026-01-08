import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface TeamTask {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  platform: string;
  work_date: string;
  hours_worked: number;
  base_rate: number;
  current_rate: number;
  calculated_earnings: number | null;
  final_status: string;
  team_lead_status: string | null;
  admin_status: string | null;
  created_at: string;
  user_name: string | null;
}

export interface TeamReport {
  id: string;
  user_id: string;
  platform: string;
  description: string | null;
  work_date: string;
  hours_worked: number;
  earnings: number;
  status: string;
  final_status: string | null;
  team_lead_status: string | null;
  admin_status: string | null;
  created_at: string;
  user_name: string | null;
}

export interface TeamMember {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  timezone: string | null;
  country: string | null;
  task_count: number;
  report_count: number;
  pending_count: number;
}

export function useTeamTasks() {
  const { user, hasRole } = useAuth();
  const canViewTeam = hasRole("team_lead") || hasRole("report_admin") || hasRole("general_overseer");

  return useQuery({
    queryKey: ["team-tasks", user?.id],
    queryFn: async () => {
      // Get all tasks
      const { data: tasks, error: tasksError } = await supabase
        .from("tasks")
        .select("*")
        .order("created_at", { ascending: false });

      if (tasksError) throw tasksError;

      // Get profiles for user names
      const userIds = [...new Set(tasks?.map((t) => t.user_id) || [])];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, full_name")
        .in("id", userIds);

      const profileMap = new Map(profiles?.map((p) => [p.id, p.full_name]) || []);

      return (tasks || []).map((task) => ({
        ...task,
        user_name: profileMap.get(task.user_id) || "Unknown User",
      })) as TeamTask[];
    },
    enabled: !!user && canViewTeam,
  });
}

export function useTeamReports() {
  const { user, hasRole } = useAuth();
  const canViewTeam = hasRole("team_lead") || hasRole("report_admin") || hasRole("general_overseer");

  return useQuery({
    queryKey: ["team-reports", user?.id],
    queryFn: async () => {
      // Get all reports
      const { data: reports, error: reportsError } = await supabase
        .from("work_reports")
        .select("*")
        .order("created_at", { ascending: false });

      if (reportsError) throw reportsError;

      // Get profiles for user names
      const userIds = [...new Set(reports?.map((r) => r.user_id) || [])];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, full_name")
        .in("id", userIds);

      const profileMap = new Map(profiles?.map((p) => [p.id, p.full_name]) || []);

      return (reports || []).map((report) => ({
        ...report,
        user_name: profileMap.get(report.user_id) || "Unknown User",
      })) as TeamReport[];
    },
    enabled: !!user && canViewTeam,
  });
}

export function useTeamMembers() {
  const { user, hasRole } = useAuth();
  const canViewTeam = hasRole("team_lead") || hasRole("report_admin") || hasRole("general_overseer");

  return useQuery({
    queryKey: ["team-members", user?.id],
    queryFn: async () => {
      // Get all profiles with timezone
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("id, full_name, avatar_url, timezone, country");

      if (profilesError) throw profilesError;

      // Get task counts per user
      const { data: tasks } = await supabase.from("tasks").select("user_id, final_status");
      const { data: reports } = await supabase.from("work_reports").select("user_id, final_status");

      const taskCounts = new Map<string, { total: number; pending: number }>();
      const reportCounts = new Map<string, { total: number; pending: number }>();

      tasks?.forEach((t) => {
        const current = taskCounts.get(t.user_id) || { total: 0, pending: 0 };
        current.total++;
        if (t.final_status === "pending") current.pending++;
        taskCounts.set(t.user_id, current);
      });

      reports?.forEach((r) => {
        const current = reportCounts.get(r.user_id) || { total: 0, pending: 0 };
        current.total++;
        if (r.final_status === "pending") current.pending++;
        reportCounts.set(r.user_id, current);
      });

      return (profiles || [])
        .filter((p) => taskCounts.has(p.id) || reportCounts.has(p.id))
        .map((profile) => ({
          id: profile.id,
          full_name: profile.full_name,
          avatar_url: profile.avatar_url,
          timezone: profile.timezone,
          country: profile.country,
          task_count: taskCounts.get(profile.id)?.total || 0,
          report_count: reportCounts.get(profile.id)?.total || 0,
          pending_count:
            (taskCounts.get(profile.id)?.pending || 0) +
            (reportCounts.get(profile.id)?.pending || 0),
        })) as TeamMember[];
    },
    enabled: !!user && canViewTeam,
  });
}
