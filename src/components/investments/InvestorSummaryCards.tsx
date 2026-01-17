import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Wallet, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  ArrowDownToLine,
  RotateCcw,
  AlertTriangle,
  PiggyBank,
} from "lucide-react";
import { useInvestorSummary } from "@/hooks/useInvestorProfile";
import { cn } from "@/lib/utils";

export function InvestorSummaryCards() {
  const { data: summary, isLoading } = useInvestorSummary();

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardContent className="pt-6">
              <Skeleton className="h-8 w-24 mb-2" />
              <Skeleton className="h-4 w-16" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!summary) {
    return null;
  }

  const isPositiveRoi = summary.roiPercent >= 0;

  const cards = [
    {
      title: "Total Invested",
      value: `$${summary.totalInvested.toLocaleString()}`,
      subtext: `${summary.activeInvestments} active investment(s)`,
      icon: Wallet,
      iconColor: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      title: "Current Value",
      value: `$${summary.currentValue.toLocaleString()}`,
      subtext: (
        <span className={cn("flex items-center gap-1", isPositiveRoi ? "text-success" : "text-destructive")}>
          {isPositiveRoi ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
          {isPositiveRoi ? "+" : ""}{summary.roiPercent.toFixed(1)}% ROI
        </span>
      ),
      icon: DollarSign,
      iconColor: isPositiveRoi ? "text-success" : "text-destructive",
      bgColor: isPositiveRoi ? "bg-success/10" : "bg-destructive/10",
    },
    {
      title: "Total Returns",
      value: `$${summary.totalReturns.toLocaleString()}`,
      subtext: "Profit distributions received",
      icon: PiggyBank,
      iconColor: "text-success",
      bgColor: "bg-success/10",
    },
    {
      title: "Available Balance",
      value: `$${summary.availableBalance.toLocaleString()}`,
      subtext: summary.pendingWithdrawalAmount > 0 
        ? `$${summary.pendingWithdrawalAmount.toLocaleString()} pending` 
        : "Available for withdrawal",
      icon: ArrowDownToLine,
      iconColor: "text-info",
      bgColor: "bg-info/10",
    },
  ];

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-4">
        {cards.map((card) => (
          <Card key={card.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
              <div className={cn("h-8 w-8 rounded-lg flex items-center justify-center", card.bgColor)}>
                <card.icon className={cn("h-4 w-4", card.iconColor)} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{card.value}</div>
              <p className="text-xs text-muted-foreground">{card.subtext}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Secondary Stats Row */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-muted">
          <CardContent className="pt-4 flex items-center gap-4">
            <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
              <ArrowDownToLine className="h-5 w-5 text-muted-foreground" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Withdrawn</p>
              <p className="text-lg font-semibold">${summary.totalWithdrawn.toLocaleString()}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-muted">
          <CardContent className="pt-4 flex items-center gap-4">
            <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
              <RotateCcw className="h-5 w-5 text-muted-foreground" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Reinvested</p>
              <p className="text-lg font-semibold">${summary.totalReinvested.toLocaleString()}</p>
            </div>
          </CardContent>
        </Card>

        <Card className={cn("border-muted", summary.totalLosses > 0 && "border-destructive/30")}>
          <CardContent className="pt-4 flex items-center gap-4">
            <div className={cn(
              "h-10 w-10 rounded-lg flex items-center justify-center",
              summary.totalLosses > 0 ? "bg-destructive/10" : "bg-muted"
            )}>
              <AlertTriangle className={cn(
                "h-5 w-5",
                summary.totalLosses > 0 ? "text-destructive" : "text-muted-foreground"
              )} />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Recorded Losses</p>
              <p className={cn(
                "text-lg font-semibold",
                summary.totalLosses > 0 ? "text-destructive" : ""
              )}>
                ${summary.totalLosses.toLocaleString()}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
