import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useTeams } from "./useTeams";

export interface TeamPerformance {
  team_id: string;
  team_name: string;
  skill_focus: string | null;
  region: string | null;
  member_count: number;
  total_skills: number;
  completed_tasks: number;
  average_rating: number | null;
  score: number;
  rank: number;
}

/**
 * Hook to fetch team performance data for comparison
 */
export function useTeamPerformance() {
  const { teams } = useTeams();

  return useQuery({
    queryKey: ["team-performance", teams.map(t => t.id)],
    queryFn: async () => {
      if (!teams.length) return [];

      // Get all team members
      const { data: membersData, error: membersError } = await supabase
        .from("team_members")
        .select("team_id, user_id");

      if (membersError) throw membersError;

      // Get skill counts from learning_insights
      const { data: skillData, error: skillError } = await supabase
        .from("learning_insights")
        .select("user_id, skill_signal")
        .not("skill_signal", "is", null);

      if (skillError) throw skillError;

      // Get completed tasks with ratings
      const { data: taskData, error: taskError } = await supabase
        .from("tasks")
        .select("user_id, rating")
        .eq("final_status", "approved");

      if (taskError) throw taskError;

      // Build user stats
      const userSkills: Record<string, number> = {};
      const userTasks: Record<string, number> = {};
      const userRatings: Record<string, number[]> = {};

      skillData?.forEach((insight) => {
        userSkills[insight.user_id] = (userSkills[insight.user_id] || 0) + 1;
      });

      taskData?.forEach((task) => {
        userTasks[task.user_id] = (userTasks[task.user_id] || 0) + 1;
        if (task.rating !== null) {
          if (!userRatings[task.user_id]) userRatings[task.user_id] = [];
          userRatings[task.user_id].push(Number(task.rating));
        }
      });

      // Aggregate by team
      const teamPerformance: TeamPerformance[] = teams.map((team) => {
        const teamMembers = membersData?.filter(m => m.team_id === team.id) || [];
        const memberIds = teamMembers.map(m => m.user_id);

        let totalSkills = 0;
        let completedTasks = 0;
        let allRatings: number[] = [];

        memberIds.forEach((userId) => {
          totalSkills += userSkills[userId] || 0;
          completedTasks += userTasks[userId] || 0;
          if (userRatings[userId]) {
            allRatings = allRatings.concat(userRatings[userId]);
          }
        });

        const averageRating = allRatings.length > 0
          ? allRatings.reduce((a, b) => a + b, 0) / allRatings.length
          : null;

        // Score: skills * 2 + tasks + (avg rating * 10 if exists)
        const score = totalSkills * 2 + completedTasks + (averageRating ? averageRating * 10 : 0);

        return {
          team_id: team.id,
          team_name: team.name,
          skill_focus: team.skill_focus,
          region: team.region,
          member_count: memberIds.length,
          total_skills: totalSkills,
          completed_tasks: completedTasks,
          average_rating: averageRating,
          score,
          rank: 0,
        };
      });

      // Sort by score and assign ranks
      teamPerformance.sort((a, b) => b.score - a.score);
      teamPerformance.forEach((team, index) => {
        team.rank = index + 1;
      });

      return teamPerformance;
    },
    enabled: teams.length > 0,
  });
}
