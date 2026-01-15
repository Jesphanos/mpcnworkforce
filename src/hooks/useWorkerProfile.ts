import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface WorkerProfileData {
  profile: {
    id: string;
    full_name: string | null;
    avatar_url: string | null;
    skills: string[] | null;
    country: string | null;
    created_at: string;
  } | null;
  learningInsights: {
    id: string;
    entity_type: string;
    what_went_well: string | null;
    what_to_improve: string | null;
    skill_signal: string | null;
    suggestions: string[] | null;
    resolution_status: string;
    created_at: string;
  }[];
  taskStats: {
    total_tasks: number;
    completed_tasks: number;
    pending_tasks: number;
    average_rating: number | null;
    total_hours: number;
    total_earnings: number;
  };
  skillProgression: {
    skill: string;
    count: number;
    first_seen: string;
    last_seen: string;
  }[];
  teamInfo: {
    team_id: string;
    team_name: string;
    role: string;
  } | null;
}

/**
 * Hook to fetch comprehensive worker profile data
 */
export function useWorkerProfile(userId?: string) {
  const { user } = useAuth();
  const targetUserId = userId || user?.id;

  return useQuery({
    queryKey: ["worker-profile", targetUserId],
    queryFn: async (): Promise<WorkerProfileData> => {
      if (!targetUserId) throw new Error("No user ID provided");

      // Fetch profile
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("id, full_name, avatar_url, skills, country, created_at")
        .eq("id", targetUserId)
        .single();

      if (profileError && profileError.code !== "PGRST116") throw profileError;

      // Fetch learning insights
      const { data: insights, error: insightsError } = await supabase
        .from("learning_insights")
        .select("id, entity_type, what_went_well, what_to_improve, skill_signal, suggestions, resolution_status, created_at")
        .eq("user_id", targetUserId)
        .order("created_at", { ascending: false });

      if (insightsError) throw insightsError;

      // Fetch tasks
      const { data: tasks, error: tasksError } = await supabase
        .from("tasks")
        .select("final_status, rating, hours_worked, calculated_earnings")
        .eq("user_id", targetUserId);

      if (tasksError) throw tasksError;

      // Calculate task stats
      const taskStats = {
        total_tasks: tasks?.length || 0,
        completed_tasks: tasks?.filter(t => t.final_status === "approved").length || 0,
        pending_tasks: tasks?.filter(t => t.final_status === "pending").length || 0,
        average_rating: null as number | null,
        total_hours: 0,
        total_earnings: 0,
      };

      const ratings = tasks?.filter(t => t.rating !== null).map(t => Number(t.rating)) || [];
      if (ratings.length > 0) {
        taskStats.average_rating = ratings.reduce((a, b) => a + b, 0) / ratings.length;
      }
      taskStats.total_hours = tasks?.reduce((sum, t) => sum + Number(t.hours_worked || 0), 0) || 0;
      taskStats.total_earnings = tasks?.filter(t => t.final_status === "approved").reduce((sum, t) => sum + Number(t.calculated_earnings || 0), 0) || 0;

      // Calculate skill progression
      const skillMap: Record<string, { count: number; first_seen: string; last_seen: string }> = {};
      insights?.forEach((insight) => {
        if (insight.skill_signal) {
          if (!skillMap[insight.skill_signal]) {
            skillMap[insight.skill_signal] = {
              count: 0,
              first_seen: insight.created_at,
              last_seen: insight.created_at,
            };
          }
          skillMap[insight.skill_signal].count++;
          skillMap[insight.skill_signal].last_seen = insight.created_at;
        }
      });

      const skillProgression = Object.entries(skillMap)
        .map(([skill, data]) => ({ skill, ...data }))
        .sort((a, b) => b.count - a.count);

      // Fetch team info
      const { data: teamMember, error: teamError } = await supabase
        .from("team_members")
        .select("team_id, role, teams:team_id(name)")
        .eq("user_id", targetUserId)
        .maybeSingle();

      let teamInfo = null;
      if (teamMember && !teamError) {
        teamInfo = {
          team_id: teamMember.team_id,
          team_name: (teamMember.teams as any)?.name || "Unknown Team",
          role: teamMember.role,
        };
      }

      return {
        profile,
        learningInsights: insights || [],
        taskStats,
        skillProgression,
        teamInfo,
      };
    },
    enabled: !!targetUserId,
  });
}
