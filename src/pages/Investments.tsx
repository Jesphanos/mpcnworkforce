import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Skeleton } from "@/components/ui/skeleton";
import { InvestmentForm } from "@/components/investments/InvestmentForm";
import { InvestmentsTable } from "@/components/investments/InvestmentsTable";
import { InvestmentStats } from "@/components/investments/InvestmentStats";
import { useInvestments } from "@/hooks/useInvestments";
import { useAuth } from "@/contexts/AuthContext";

export default function Investments() {
  const { data: investments, isLoading } = useInvestments();
  const { hasRole } = useAuth();
  const canManage = hasRole("investment_admin");

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <Skeleton className="h-8 w-48" />
          <div className="grid gap-4 md:grid-cols-5">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-24" />
            ))}
          </div>
          <Skeleton className="h-96" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Investments</h1>
          <p className="text-muted-foreground">
            {canManage ? "Track and manage organization investments" : "View organization investment portfolio"}
          </p>
        </div>

        <InvestmentStats investments={investments || []} />

        {canManage && <InvestmentForm />}

        <InvestmentsTable investments={investments || []} />
      </div>
    </DashboardLayout>
  );
}
