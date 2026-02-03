import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

type AppRole = "employee" | "trader" | "team_lead" | "department_head" | "report_admin" | "finance_hr_admin" | "investment_admin" | "user_admin" | "general_overseer";

interface FeatureAccessConfig {
  disabled_routes: Record<string, AppRole[]>;
}

const DEFAULT_CONFIG: FeatureAccessConfig = {
  disabled_routes: {
    trading: [],
    investments: [],
    reports: [],
    tasks: [],
    team: [],
    finance_hr: [],
    governance: [],
    users: [],
    activity: [],
    learn: [],
  },
};

export function useFeatureAccess() {
  const { role } = useAuth();
  
  const { data: config, isLoading } = useQuery({
    queryKey: ["feature-access"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("system_settings")
        .select("value")
        .eq("key", "feature_access")
        .single();

      if (error) {
        console.error("Error fetching feature access:", error);
        return DEFAULT_CONFIG;
      }

      return (data?.value as unknown as FeatureAccessConfig) || DEFAULT_CONFIG;
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  const isRouteDisabled = (routeName: string): boolean => {
    if (!config || !role) return false;
    const disabledRoles = config.disabled_routes?.[routeName] || [];
    return disabledRoles.includes(role as AppRole);
  };

  const getDisabledRoutes = (): string[] => {
    if (!config || !role) return [];
    return Object.entries(config.disabled_routes || {})
      .filter(([_, roles]) => roles.includes(role as AppRole))
      .map(([route]) => route);
  };

  return {
    config: config || DEFAULT_CONFIG,
    isLoading,
    isRouteDisabled,
    getDisabledRoutes,
  };
}

export function useFeatureAccessAdmin() {
  const queryClient = useQueryClient();

  const { data: config, isLoading } = useQuery({
    queryKey: ["feature-access"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("system_settings")
        .select("value")
        .eq("key", "feature_access")
        .single();

      if (error) {
        console.error("Error fetching feature access:", error);
        return DEFAULT_CONFIG;
      }

      return (data?.value as unknown as FeatureAccessConfig) || DEFAULT_CONFIG;
    },
  });

  const updateFeatureAccess = useMutation({
    mutationFn: async (newConfig: FeatureAccessConfig) => {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { error } = await supabase
        .from("system_settings")
        .update({ 
          value: newConfig as unknown as import("@/integrations/supabase/types").Json,
          updated_by: user?.id 
        })
        .eq("key", "feature_access");

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["feature-access"] });
      toast.success("Feature access updated successfully");
    },
    onError: (error) => {
      toast.error("Failed to update feature access: " + error.message);
    },
  });

  const toggleRouteForRole = (route: string, role: AppRole, enabled: boolean) => {
    if (!config) return;

    const currentRoles = config.disabled_routes?.[route] || [];
    let newRoles: AppRole[];

    if (enabled) {
      // Remove role from disabled list (enable the route)
      newRoles = currentRoles.filter(r => r !== role);
    } else {
      // Add role to disabled list (disable the route)
      newRoles = currentRoles.includes(role) ? currentRoles : [...currentRoles, role];
    }

    const newConfig: FeatureAccessConfig = {
      ...config,
      disabled_routes: {
        ...config.disabled_routes,
        [route]: newRoles,
      },
    };

    updateFeatureAccess.mutate(newConfig);
  };

  return {
    config: config || DEFAULT_CONFIG,
    isLoading,
    updateFeatureAccess,
    toggleRouteForRole,
  };
}
