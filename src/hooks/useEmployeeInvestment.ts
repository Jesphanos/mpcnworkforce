import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface EmployeeInvestmentStats {
  personalInvestment: number;
  currentBalance: number;
  returnRate: number;
  isInvestor: boolean;
}

export function useEmployeeInvestment() {
  const { user, profile } = useAuth();

  return useQuery({
    queryKey: ["employee-investment", user?.id],
    queryFn: async (): Promise<EmployeeInvestmentStats> => {
      if (!user) throw new Error("Not authenticated");

      // Get profile for investment info
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("is_investor, initial_investment")
        .eq("id", user.id)
        .maybeSingle();

      if (profileError) throw profileError;

      const isInvestor = profileData?.is_investor || false;
      const personalInvestment = Number(profileData?.initial_investment || 0);

      // If not an investor, return empty stats
      if (!isInvestor) {
        return {
          personalInvestment: 0,
          currentBalance: 0,
          returnRate: 0,
          isInvestor: false,
        };
      }

      // Get total organization investment performance
      const { data: investments, error: investmentsError } = await supabase
        .from("investments")
        .select("initial_amount, current_value, status")
        .eq("status", "active");

      if (investmentsError) throw investmentsError;

      // Calculate overall return rate from organization investments
      const totalInitial = investments?.reduce((sum, inv) => sum + Number(inv.initial_amount), 0) || 0;
      const totalCurrent = investments?.reduce((sum, inv) => sum + Number(inv.current_value), 0) || 0;
      const overallReturnRate = totalInitial > 0 ? ((totalCurrent - totalInitial) / totalInitial) * 100 : 0;

      // Calculate proportional current balance
      const currentBalance = personalInvestment * (1 + overallReturnRate / 100);

      return {
        personalInvestment,
        currentBalance,
        returnRate: overallReturnRate,
        isInvestor,
      };
    },
    enabled: !!user,
  });
}
