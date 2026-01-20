import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { LEARNING_MODULES } from "@/config/mpcnLearnConfig";

// Certification paths configuration
const CERTIFICATION_PATHS = [
  { id: "foundations", name: "Foundations Certified", requiredModules: ["a1-foundations-investment", "a2-foundations-trading", "a3-foundations-freelancing", "a4-ethics-responsibility"] },
  { id: "risk_protection", name: "Risk & Protection Certified", requiredModules: ["c1-understanding-risk", "c2-why-controls-exist"] },
  { id: "stewardship", name: "Stewardship Certified", requiredModules: ["e1-biblical-wealth", "e2-prayer-reflection", "e3-faith-work"] },
  { id: "skilled_worker", name: "Skilled Worker Path Complete", requiredModules: ["a1-foundations-investment", "a2-foundations-trading", "a3-foundations-freelancing", "a4-ethics-responsibility", "b1-what-mpcn-is", "c1-understanding-risk", "c2-why-controls-exist"] },
  { id: "trader", name: "Trader Path Complete", requiredModules: ["a1-foundations-investment", "a2-foundations-trading", "a4-ethics-responsibility", "b1-what-mpcn-is", "c1-understanding-risk", "c2-why-controls-exist"] },
  { id: "team_lead", name: "Team Lead Path Complete", requiredModules: ["a1-foundations-investment", "a2-foundations-trading", "a3-foundations-freelancing", "a4-ethics-responsibility", "b1-what-mpcn-is", "b2-how-mpcn-creates-value", "b3-governance-philosophy", "c1-understanding-risk", "c2-why-controls-exist"] },
];

export function getCertificationPaths() {
  return CERTIFICATION_PATHS;
}

export interface LearningProgressData {
  id: string;
  user_id: string;
  module_id: string;
  module_group: string;
  started_at: string;
  completed_at: string | null;
  progress_percentage: number;
  notes: string | null;
  created_at: string;
  updated_at: string;
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

export function useLearningProgress(userId?: string) {
  const { user } = useAuth();
  const targetUserId = userId || user?.id;
  const queryClient = useQueryClient();

  // Fetch user's learning progress
  const progressQuery = useQuery({
    queryKey: ["learning-progress", targetUserId],
    queryFn: async () => {
      if (!targetUserId) return [];
      
      const { data, error } = await supabase
        .from("learning_progress")
        .select("*")
        .eq("user_id", targetUserId)
        .order("started_at", { ascending: false });

      if (error) throw error;
      return data as LearningProgressData[];
    },
    enabled: !!targetUserId,
  });

  // Fetch user's certificates
  const certificatesQuery = useQuery({
    queryKey: ["learning-certificates", targetUserId],
    queryFn: async () => {
      if (!targetUserId) return [];
      
      const { data, error } = await supabase
        .from("learning_certificates")
        .select("*")
        .eq("user_id", targetUserId)
        .order("issued_at", { ascending: false });

      if (error) throw error;
      return data as LearningCertificate[];
    },
    enabled: !!targetUserId,
  });

  // Start a module
  const startModule = useMutation({
    mutationFn: async ({ moduleId, moduleGroup }: { moduleId: string; moduleGroup: string }) => {
      if (!targetUserId) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("learning_progress")
        .upsert({
          user_id: targetUserId,
          module_id: moduleId,
          module_group: moduleGroup,
          started_at: new Date().toISOString(),
          progress_percentage: 0,
        }, { onConflict: "user_id,module_id" })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["learning-progress", targetUserId] });
      toast.success("Module started!");
    },
    onError: (error) => {
      toast.error("Failed to start module: " + error.message);
    },
  });

  // Update module progress
  const updateProgress = useMutation({
    mutationFn: async ({ 
      moduleId, 
      progress,
      notes 
    }: { 
      moduleId: string; 
      progress: number;
      notes?: string;
    }) => {
      if (!targetUserId) throw new Error("Not authenticated");

      const updateData: Record<string, unknown> = {
        progress_percentage: progress,
      };

      if (notes) {
        updateData.notes = notes;
      }

      if (progress >= 100) {
        updateData.completed_at = new Date().toISOString();
      }

      const { data, error } = await supabase
        .from("learning_progress")
        .update(updateData)
        .eq("user_id", targetUserId)
        .eq("module_id", moduleId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["learning-progress", targetUserId] });
      if (data.progress_percentage >= 100) {
        toast.success("Module completed! 🎉");
      }
    },
    onError: (error) => {
      toast.error("Failed to update progress: " + error.message);
    },
  });

  // Complete a module
  const completeModule = useMutation({
    mutationFn: async ({ moduleId }: { moduleId: string }) => {
      if (!targetUserId) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("learning_progress")
        .update({
          progress_percentage: 100,
          completed_at: new Date().toISOString(),
        })
        .eq("user_id", targetUserId)
        .eq("module_id", moduleId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["learning-progress", targetUserId] });
      toast.success("Module completed! 🎉");
    },
    onError: (error) => {
      toast.error("Failed to complete module: " + error.message);
    },
  });

  // Check certification eligibility
  const checkCertificationEligibility = (certificateType: string): boolean => {
    const progress = progressQuery.data || [];
    const completedModules = progress
      .filter(p => p.completed_at !== null)
      .map(p => p.module_id);

    const paths = getCertificationPaths();
    const path = paths.find(p => p.id === certificateType);
    
    if (!path) return false;
    
    return path.requiredModules.every(moduleId => completedModules.includes(moduleId));
  };

  // Get progress stats
  const getProgressStats = () => {
    const progress = progressQuery.data || [];
    const totalModules = LEARNING_MODULES.length;
    const completedModules = progress.filter(p => p.completed_at !== null).length;
    const inProgressModules = progress.filter(p => p.completed_at === null && p.progress_percentage > 0).length;

    return {
      totalModules,
      completedModules,
      inProgressModules,
      completionRate: totalModules > 0 ? (completedModules / totalModules) * 100 : 0,
    };
  };

  // Get module progress
  const getModuleProgress = (moduleId: string): LearningProgressData | undefined => {
    return progressQuery.data?.find(p => p.module_id === moduleId);
  };

  return {
    progress: progressQuery.data || [],
    certificates: certificatesQuery.data || [],
    isLoading: progressQuery.isLoading || certificatesQuery.isLoading,
    startModule,
    updateProgress,
    completeModule,
    checkCertificationEligibility,
    getProgressStats,
    getModuleProgress,
    refetch: () => {
      progressQuery.refetch();
      certificatesQuery.refetch();
    },
  };
}
