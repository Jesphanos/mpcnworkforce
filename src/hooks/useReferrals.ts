import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface Referral {
  id: string;
  referrer_id: string;
  referred_id: string;
  status: "pending" | "completed";
  completed_at: string | null;
  created_at: string;
}

export function useMyReferrals() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["my-referrals", user?.id],
    queryFn: async () => {
      if (!user) throw new Error("Not authenticated");
      
      const { data, error } = await supabase
        .from("referrals")
        .select("*")
        .eq("referrer_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as Referral[];
    },
    enabled: !!user,
  });
}

export function useReferralStats() {
  const { data: referrals } = useMyReferrals();
  
  const totalReferrals = referrals?.length || 0;
  const completedReferrals = referrals?.filter(r => r.status === "completed").length || 0;
  const pendingReferrals = referrals?.filter(r => r.status === "pending").length || 0;
  
  return {
    totalReferrals,
    completedReferrals,
    pendingReferrals,
  };
}
