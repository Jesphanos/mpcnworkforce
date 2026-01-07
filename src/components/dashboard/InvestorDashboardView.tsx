import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { RoleAuthorityBanner } from "@/components/ui/RoleAuthorityBanner";
import { useUserInvestmentSummary } from "@/hooks/useMpcnFinancials";
import { useAuth } from "@/contexts/AuthContext";
import { 
  Wallet,
  TrendingUp,
  PieChart,
  ArrowRight,
  Bell,
} from "lucide-react";

/**
 * Investor Dashboard - Trust Layer
 * Read-only investment tracking
 * Zero workforce control
 */
export function InvestorDashboardView() {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const { data: investmentSummary, isLoading } = useUserInvestmentSummary();

  const investmentCards = [
    {
      title: "My Investments",
      description: "View your investment details",
      icon: Wallet,
      url: "/investments",
      color: "text-primary",
      bg: "bg-primary/10",
    },
    {
      title: "Returns History",
      description: "Track your profit history",
      icon: TrendingUp,
      url: "/investments?tab=returns",
      color: "text-success",
      bg: "bg-success/10",
    },
    {
      title: "MPCN Performance",
      description: "Global platform performance",
      icon: PieChart,
      url: "/investments?tab=performance",
      color: "text-info",
      bg: "bg-info/10",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Read-only Banner */}
      <RoleAuthorityBanner
        variant="readonly"
        title="Investor View — Read-Only Access"
        description="This dashboard shows your investment performance. You do not have access to workforce operations."
      />

      {/* Investment Summary */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Invested
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <div className="text-2xl font-bold">
                ${(profile?.initial_investment || investmentSummary?.totalInvested || 0).toLocaleString()}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Returns
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <div className="text-2xl font-bold text-success">
                +${(investmentSummary?.totalReturns || 0).toLocaleString()}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              ROI
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold">
                {investmentSummary?.totalInvested ? ((investmentSummary.totalReturns / investmentSummary.totalInvested) * 100).toFixed(1) : 0}%
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Navigation Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        {investmentCards.map((card) => (
          <Card 
            key={card.title}
            className="hover:shadow-md transition-all cursor-pointer hover:scale-[1.02]"
            onClick={() => navigate(card.url)}
          >
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className={`h-10 w-10 rounded-lg ${card.bg} flex items-center justify-center`}>
                  <card.icon className={`h-5 w-5 ${card.color}`} />
                </div>
                <div>
                  <CardTitle className="text-base">{card.title}</CardTitle>
                  <CardDescription className="text-xs">{card.description}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Button variant="outline" size="sm" className="w-full">
                View
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Notices Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-muted-foreground" />
            <CardTitle>Investment Notices</CardTitle>
          </div>
          <CardDescription>Updates about MPCN performance and distributions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <p className="text-sm">No new notices at this time</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
