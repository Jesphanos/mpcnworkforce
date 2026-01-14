import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface LeaderboardEntry {
  user_id: string;
  full_name: string | null;
  avatar_url: string | null;
  skill_count: number;
  completed_tasks: number;
  top_skills: string[];
  rank: number;
}

/**
 * Hook to fetch worker leaderboard data
 * Ranks workers by skill signals and completed tasks
 */
export function useWorkerLeaderboard(limit = 10) {
  return useQuery({
    queryKey: ["worker-leaderboard", limit],
    queryFn: async () => {
      // Get skill counts per user from learning_insights
      const { data: skillData, error: skillError } = await supabase
        .from("learning_insights")
        .select("user_id, skill_signal")
        .not("skill_signal", "is", null);

      if (skillError) throw skillError;

      // Get completed tasks per user
      const { data: taskData, error: taskError } = await supabase
        .from("tasks")
        .select("user_id")
        .eq("final_status", "approved");

      if (taskError) throw taskError;

      // Get profiles
      const { data: profiles, error: profileError } = await supabase
        .from("profiles")
        .select("id, full_name, avatar_url");

      if (profileError) throw profileError;

      // Aggregate data by user
      const userStats: Record<string, {
        skill_count: number;
        completed_tasks: number;
        skills: Record<string, number>;
      }> = {};

      // Count skills
      skillData?.forEach((insight) => {
        if (!userStats[insight.user_id]) {
          userStats[insight.user_id] = { skill_count: 0, completed_tasks: 0, skills: {} };
        }
        userStats[insight.user_id].skill_count++;
        if (insight.skill_signal) {
          userStats[insight.user_id].skills[insight.skill_signal] = 
            (userStats[insight.user_id].skills[insight.skill_signal] || 0) + 1;
        }
      });

      // Count completed tasks
      taskData?.forEach((task) => {
        if (!userStats[task.user_id]) {
          userStats[task.user_id] = { skill_count: 0, completed_tasks: 0, skills: {} };
        }
        userStats[task.user_id].completed_tasks++;
      });

      // Build leaderboard
      const profileMap = new Map(profiles?.map((p) => [p.id, p]) || []);
      
      const leaderboard: LeaderboardEntry[] = Object.entries(userStats)
        .map(([userId, stats]) => {
          const profile = profileMap.get(userId);
          const topSkills = Object.entries(stats.skills)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 3)
            .map(([skill]) => skill);

          return {
            user_id: userId,
            full_name: profile?.full_name || null,
            avatar_url: profile?.avatar_url || null,
            skill_count: stats.skill_count,
            completed_tasks: stats.completed_tasks,
            top_skills: topSkills,
            rank: 0,
          };
        })
        // Score: skill_count * 2 + completed_tasks
        .sort((a, b) => (b.skill_count * 2 + b.completed_tasks) - (a.skill_count * 2 + a.completed_tasks))
        .slice(0, limit)
        .map((entry, index) => ({ ...entry, rank: index + 1 }));

      return leaderboard;
    },
  });
}
