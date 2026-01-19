import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import type { InvestorType, InvestorVerificationStatus } from "./useInvestorProfile";

export interface PendingInvestor {
  id: string;
  full_name: string | null;
  investor_type: InvestorType | null;
  investor_entity_type: string | null;
  investor_verification_status: InvestorVerificationStatus | null;
  initial_investment: number | null;
  country: string | null;
  currency_preference: string | null;
  created_at: string;
}

/**
 * Hook to fetch all pending investor registrations for admin review
 */
export function usePendingInvestors() {
  return useQuery({
    queryKey: ["pending-investors"],
    queryFn: async (): Promise<PendingInvestor[]> => {
      const { data, error } = await supabase
        .from("profiles")
        .select(`
          id, full_name, investor_type, investor_entity_type,
          investor_verification_status, initial_investment,
          country, currency_preference, created_at
        `)
        .eq("is_investor", true)
        .eq("investor_verification_status", "pending")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return (data || []) as PendingInvestor[];
    },
  });
}

/**
 * Hook to fetch all investors for admin management
 */
export function useAllInvestors(statusFilter?: InvestorVerificationStatus | "all") {
  return useQuery({
    queryKey: ["all-investors", statusFilter],
    queryFn: async (): Promise<PendingInvestor[]> => {
      let query = supabase
        .from("profiles")
        .select(`
          id, full_name, investor_type, investor_entity_type,
          investor_verification_status, initial_investment,
          country, currency_preference, created_at
        `)
        .eq("is_investor", true);

      if (statusFilter && statusFilter !== "all") {
        query = query.eq("investor_verification_status", statusFilter);
      }

      const { data, error } = await query.order("created_at", { ascending: false });

      if (error) throw error;
      return (data || []) as PendingInvestor[];
    },
  });
}

/**
 * Hook to approve or reject investor verification
 */
export function useVerifyInvestor() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ 
      investorId, 
      status, 
      notes 
    }: { 
      investorId: string; 
      status: "verified" | "rejected";
      notes?: string;
    }) => {
      if (!user) throw new Error("Not authenticated");

      // Update investor verification status
      const { error: updateError } = await supabase
        .from("profiles")
        .update({
          investor_verification_status: status,
          investor_verified_at: status === "verified" ? new Date().toISOString() : null,
          investor_verified_by: user.id,
        })
        .eq("id", investorId);

      if (updateError) throw updateError;

      // Log the action via the database function
      const { error: logError } = await supabase.rpc("log_investor_action", {
        p_investor_id: investorId,
        p_action_type: status === "verified" ? "verification_approved" : "verification_rejected",
        p_amount: 0,
        p_description: notes || `Investor ${status} by admin`,
        p_performed_by: user.id,
      });

      if (logError) {
        console.error("Failed to log investor action:", logError);
        // Don't throw - the main action succeeded
      }

      // Also log to main audit log
      await supabase.rpc("log_audit_event", {
        p_entity_type: "investor_verification",
        p_entity_id: investorId,
        p_action: status === "verified" ? "approved" : "rejected",
        p_performed_by: user.id,
        p_notes: notes,
        p_new_values: { status },
      });

      return { investorId, status };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["pending-investors"] });
      queryClient.invalidateQueries({ queryKey: ["all-investors"] });
      queryClient.invalidateQueries({ queryKey: ["investor-profile", data.investorId] });
      toast.success(`Investor ${data.status === "verified" ? "approved" : "rejected"} successfully`);
    },
    onError: (error) => {
      toast.error("Failed to update investor status: " + error.message);
    },
  });
}
