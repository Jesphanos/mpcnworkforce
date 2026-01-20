import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { getCertificationPaths } from "./useLearningProgress";

export interface UserLearningProgress {
  user_id: string;
  full_name: string | null;
  avatar_url: string | null;
  modules_started: number;
  modules_completed: number;
  total_modules: number;
  completion_percentage: number;
  certifications: string[];
  last_activity: string | null;
}

export interface DetailedLearningProgress {
  id: string;
  user_id: string;
  module_id: string;
  module_group: string;
  started_at: string;
  completed_at: string | null;
  progress_percentage: number;
  notes: string | null;
}

export interface LearningCertificate {
  id: string;
  user_id: string;
  certificate_type: string;
  certificate_name: string;
  issued_at: string;
  issued_by: string | null;
  modules_completed: string[];
  metadata: Record<string, unknown>;
  created_at: string;
}

export function useAdminLearningData() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch all users' learning progress summary
  const usersProgressQuery = useQuery({
    queryKey: ["admin-learning-progress"],
    queryFn: async () => {
      // First get all profiles
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("id, full_name, avatar_url, certifications");

      if (profilesError) throw profilesError;

      // Get all learning progress
      const { data: progress, error: progressError } = await supabase
        .from("learning_progress")
        .select("*");

      if (progressError) throw progressError;

      // Get all certificates
      const { data: certificates, error: certError } = await supabase
        .from("learning_certificates")
        .select("*");

      if (certError) throw certError;

      // Aggregate data per user
      const userProgressMap = new Map<string, UserLearningProgress>();

      // Initialize with profiles
      profiles.forEach((profile) => {
        userProgressMap.set(profile.id, {
          user_id: profile.id,
          full_name: profile.full_name,
          avatar_url: profile.avatar_url,
          modules_started: 0,
          modules_completed: 0,
          total_modules: 14, // Total modules in the system
          completion_percentage: 0,
          certifications: profile.certifications || [],
          last_activity: null,
        });
      });

      // Process progress data
      progress.forEach((p) => {
        const userData = userProgressMap.get(p.user_id);
        if (userData) {
          userData.modules_started++;
          if (p.completed_at) {
            userData.modules_completed++;
          }
          if (!userData.last_activity || new Date(p.updated_at) > new Date(userData.last_activity)) {
            userData.last_activity = p.updated_at;
          }
        }
      });

      // Calculate completion percentages
      userProgressMap.forEach((userData) => {
        userData.completion_percentage = userData.total_modules > 0 
          ? Math.round((userData.modules_completed / userData.total_modules) * 100) 
          : 0;
      });

      // Add certificate counts
      certificates.forEach((cert) => {
        const userData = userProgressMap.get(cert.user_id);
        if (userData && !userData.certifications.includes(cert.certificate_type)) {
          userData.certifications.push(cert.certificate_type);
        }
      });

      return Array.from(userProgressMap.values()).filter(u => u.modules_started > 0);
    },
  });

  // Fetch detailed progress for a specific user
  const useUserDetailedProgress = (userId: string | null) => {
    return useQuery({
      queryKey: ["admin-user-detailed-progress", userId],
      queryFn: async () => {
        if (!userId) return { progress: [], certificates: [] };

        const { data: progress, error: progressError } = await supabase
          .from("learning_progress")
          .select("*")
          .eq("user_id", userId)
          .order("started_at", { ascending: false });

        if (progressError) throw progressError;

        const { data: certificates, error: certError } = await supabase
          .from("learning_certificates")
          .select("*")
          .eq("user_id", userId)
          .order("issued_at", { ascending: false });

        if (certError) throw certError;

        return {
          progress: progress as DetailedLearningProgress[],
          certificates: certificates as LearningCertificate[],
        };
      },
      enabled: !!userId,
    });
  };

  // Issue a certificate to a user
  const issueCertificate = useMutation({
    mutationFn: async ({ 
      userId, 
      certificateType, 
      certificateName,
      modulesCompleted 
    }: { 
      userId: string; 
      certificateType: string;
      certificateName: string;
      modulesCompleted: string[];
    }) => {
      if (!user?.id) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("learning_certificates")
        .insert({
          user_id: userId,
          certificate_type: certificateType,
          certificate_name: certificateName,
          issued_by: user.id,
          modules_completed: modulesCompleted,
          issued_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;

      // Update user's certifications in profile
      const { data: profile } = await supabase
        .from("profiles")
        .select("certifications")
        .eq("id", userId)
        .single();

      const currentCerts = profile?.certifications || [];
      if (!currentCerts.includes(certificateType)) {
        await supabase
          .from("profiles")
          .update({ certifications: [...currentCerts, certificateType] })
          .eq("id", userId);
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-learning-progress"] });
      queryClient.invalidateQueries({ queryKey: ["admin-user-detailed-progress"] });
      toast.success("Certificate issued successfully!");
    },
    onError: (error) => {
      toast.error("Failed to issue certificate: " + error.message);
    },
  });

  // Revoke a certificate
  const revokeCertificate = useMutation({
    mutationFn: async ({ certificateId, userId, certificateType }: { 
      certificateId: string;
      userId: string;
      certificateType: string;
    }) => {
      const { error } = await supabase
        .from("learning_certificates")
        .delete()
        .eq("id", certificateId);

      if (error) throw error;

      // Remove from profile certifications
      const { data: profile } = await supabase
        .from("profiles")
        .select("certifications")
        .eq("id", userId)
        .single();

      if (profile?.certifications) {
        const updatedCerts = profile.certifications.filter((c: string) => c !== certificateType);
        await supabase
          .from("profiles")
          .update({ certifications: updatedCerts })
          .eq("id", userId);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-learning-progress"] });
      queryClient.invalidateQueries({ queryKey: ["admin-user-detailed-progress"] });
      toast.success("Certificate revoked");
    },
    onError: (error) => {
      toast.error("Failed to revoke certificate: " + error.message);
    },
  });

  return {
    usersProgress: usersProgressQuery.data || [],
    isLoading: usersProgressQuery.isLoading,
    useUserDetailedProgress,
    issueCertificate,
    revokeCertificate,
    certificationPaths: getCertificationPaths(),
    refetch: () => usersProgressQuery.refetch(),
  };
}
