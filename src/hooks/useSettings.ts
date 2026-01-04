import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface PlatformSetting {
  id: string;
  name: string;
  base_rate: number;
  is_active: boolean;
  color: string;
  created_at: string;
  updated_at: string;
}

export interface SystemSetting {
  id: string;
  key: string;
  value: Record<string, unknown>;
  description: string | null;
  updated_at: string;
  updated_by: string | null;
}

export function usePlatformSettings() {
  return useQuery({
    queryKey: ["platform-settings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("platform_settings")
        .select("*")
        .order("name");

      if (error) throw error;
      return data as PlatformSetting[];
    },
  });
}

export function useActivePlatforms() {
  return useQuery({
    queryKey: ["active-platforms"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("platform_settings")
        .select("*")
        .eq("is_active", true)
        .order("name");

      if (error) throw error;
      return data as PlatformSetting[];
    },
  });
}

export function useSystemSettings() {
  return useQuery({
    queryKey: ["system-settings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("system_settings")
        .select("*")
        .order("key");

      if (error) throw error;
      return data as SystemSetting[];
    },
  });
}

export function useUpdatePlatform() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (platform: Partial<PlatformSetting> & { id: string }) => {
      const { error } = await supabase
        .from("platform_settings")
        .update({
          name: platform.name,
          base_rate: platform.base_rate,
          is_active: platform.is_active,
          color: platform.color,
        })
        .eq("id", platform.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["platform-settings"] });
      queryClient.invalidateQueries({ queryKey: ["active-platforms"] });
      toast.success("Platform updated successfully");
    },
    onError: (error) => {
      toast.error("Failed to update platform: " + error.message);
    },
  });
}

export function useCreatePlatform() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (platform: { name: string; base_rate: number; color: string }) => {
      const { error } = await supabase
        .from("platform_settings")
        .insert(platform);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["platform-settings"] });
      queryClient.invalidateQueries({ queryKey: ["active-platforms"] });
      toast.success("Platform created successfully");
    },
    onError: (error) => {
      toast.error("Failed to create platform: " + error.message);
    },
  });
}

export function useDeletePlatform() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("platform_settings")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["platform-settings"] });
      queryClient.invalidateQueries({ queryKey: ["active-platforms"] });
      toast.success("Platform deleted successfully");
    },
    onError: (error) => {
      toast.error("Failed to delete platform: " + error.message);
    },
  });
}

export function useUpdateSystemSetting() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ key, value }: { key: string; value: Record<string, unknown> }) => {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { error } = await supabase
        .from("system_settings")
        .update({ value: value as unknown as import("@/integrations/supabase/types").Json, updated_by: user?.id })
        .eq("key", key);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["system-settings"] });
      toast.success("Setting updated successfully");
    },
    onError: (error) => {
      toast.error("Failed to update setting: " + error.message);
    },
  });
}
