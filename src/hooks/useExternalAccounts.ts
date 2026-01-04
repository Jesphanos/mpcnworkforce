import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export interface ExternalAccount {
  id: string;
  user_id: string;
  platform_name: string;
  external_username: string;
  profile_link: string | null;
  status: "pending" | "connected" | "verified";
  verified_by: string | null;
  verified_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateExternalAccountInput {
  platform_name: string;
  external_username: string;
  profile_link?: string;
}

export function useExternalAccounts(userId?: string) {
  const { user } = useAuth();
  const targetUserId = userId || user?.id;

  return useQuery({
    queryKey: ["external-accounts", targetUserId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("external_accounts")
        .select("*")
        .eq("user_id", targetUserId!)
        .order("platform_name");

      if (error) throw error;
      return data as ExternalAccount[];
    },
    enabled: !!targetUserId,
  });
}

export function useAllExternalAccounts() {
  const { hasRole } = useAuth();

  return useQuery({
    queryKey: ["all-external-accounts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("external_accounts")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as ExternalAccount[];
    },
    enabled: hasRole("user_admin") || hasRole("general_overseer"),
  });
}

export function useCreateExternalAccount() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (input: CreateExternalAccountInput) => {
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("external_accounts")
        .insert({
          user_id: user.id,
          ...input,
          status: "pending",
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["external-accounts"] });
      toast.success("External account added successfully");
    },
    onError: (error) => {
      if (error.message.includes("duplicate")) {
        toast.error("This platform is already connected");
      } else {
        toast.error("Failed to add account: " + error.message);
      }
    },
  });
}

export function useUpdateExternalAccount() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      ...updates
    }: Partial<ExternalAccount> & { id: string }) => {
      const { data, error } = await supabase
        .from("external_accounts")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["external-accounts"] });
      toast.success("Account updated successfully");
    },
    onError: (error) => {
      toast.error("Failed to update account: " + error.message);
    },
  });
}

export function useDeleteExternalAccount() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("external_accounts")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["external-accounts"] });
      toast.success("Account removed successfully");
    },
    onError: (error) => {
      toast.error("Failed to remove account: " + error.message);
    },
  });
}

export function useVerifyExternalAccount() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: "connected" | "verified" }) => {
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("external_accounts")
        .update({
          status,
          verified_by: status === "verified" ? user.id : null,
          verified_at: status === "verified" ? new Date().toISOString() : null,
        })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["external-accounts"] });
      queryClient.invalidateQueries({ queryKey: ["all-external-accounts"] });
      toast.success(`Account ${variables.status === "verified" ? "verified" : "status updated"}`);
    },
    onError: (error) => {
      toast.error("Failed to verify account: " + error.message);
    },
  });
}
