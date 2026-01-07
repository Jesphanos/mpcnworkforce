import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export interface Team {
  id: string;
  name: string;
  description: string | null;
  skill_focus: string | null;
  region: string | null;
  department_id: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
}

interface TeamMember {
  id: string;
  team_id: string;
  user_id: string;
  role: string;
  assigned_by: string | null;
  assigned_at: string;
}

export function useTeams() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const teamsQuery = useQuery({
    queryKey: ["teams"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("teams")
        .select("*")
        .order("name");
      
      if (error) throw error;
      return data as Team[];
    },
    enabled: !!user,
  });

  const createTeam = useMutation({
    mutationFn: async ({ name, description, skill_focus, region }: { 
      name: string; 
      description?: string; 
      skill_focus?: string; 
      region?: string;
    }) => {
      const { data, error } = await supabase
        .from("teams")
        .insert({ name, description, skill_focus, region, created_by: user!.id })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teams"] });
      toast.success("Team created successfully");
    },
    onError: (error) => {
      toast.error("Failed to create team: " + error.message);
    },
  });

  const updateTeam = useMutation({
    mutationFn: async ({ id, name, description, skill_focus, region }: { 
      id: string; 
      name: string; 
      description?: string;
      skill_focus?: string;
      region?: string;
    }) => {
      const { error } = await supabase
        .from("teams")
        .update({ name, description, skill_focus, region })
        .eq("id", id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teams"] });
      toast.success("Team updated successfully");
    },
    onError: (error) => {
      toast.error("Failed to update team: " + error.message);
    },
  });

  const deleteTeam = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("teams")
        .delete()
        .eq("id", id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teams"] });
      toast.success("Team deleted successfully");
    },
    onError: (error) => {
      toast.error("Failed to delete team: " + error.message);
    },
  });

  return {
    teams: teamsQuery.data || [],
    isLoading: teamsQuery.isLoading,
    createTeam,
    updateTeam,
    deleteTeam,
  };
}

export function useTeamMembers(teamId?: string) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const membersQuery = useQuery({
    queryKey: ["team-members", teamId],
    queryFn: async () => {
      let query = supabase.from("team_members").select("*");
      
      if (teamId) {
        query = query.eq("team_id", teamId);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data as TeamMember[];
    },
    enabled: !!user,
  });

  const assignMember = useMutation({
    mutationFn: async ({ teamId, userId, role = "member" }: { teamId: string; userId: string; role?: string }) => {
      const { data, error } = await supabase
        .from("team_members")
        .insert({ team_id: teamId, user_id: userId, role, assigned_by: user!.id })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["team-members"] });
      toast.success("Member assigned to team");
    },
    onError: (error) => {
      toast.error("Failed to assign member: " + error.message);
    },
  });

  const removeMember = useMutation({
    mutationFn: async ({ teamId, userId }: { teamId: string; userId: string }) => {
      const { error } = await supabase
        .from("team_members")
        .delete()
        .eq("team_id", teamId)
        .eq("user_id", userId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["team-members"] });
      toast.success("Member removed from team");
    },
    onError: (error) => {
      toast.error("Failed to remove member: " + error.message);
    },
  });

  return {
    members: membersQuery.data || [],
    isLoading: membersQuery.isLoading,
    assignMember,
    removeMember,
  };
}

export function useUserTeam() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["user-team", user?.id],
    queryFn: async () => {
      const { data: membership, error: memberError } = await supabase
        .from("team_members")
        .select("team_id, role")
        .eq("user_id", user!.id)
        .maybeSingle();
      
      if (memberError) throw memberError;
      if (!membership) return null;

      const { data: team, error: teamError } = await supabase
        .from("teams")
        .select("*")
        .eq("id", membership.team_id)
        .single();
      
      if (teamError) throw teamError;
      
      return { ...team, memberRole: membership.role };
    },
    enabled: !!user,
  });
}
