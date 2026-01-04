import { useState } from "react";
import { TrendingUp, TrendingDown, DollarSign, PiggyBank, ChevronDown } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import { useEmployeeInvestment } from "@/hooks/useEmployeeInvestment";

export function InvestmentOverviewCard() {
  const [isOpen, setIsOpen] = useState(true);
  const { data: investment, isLoading } = useEmployeeInvestment();

  // Don't show if not an investor
  if (!isLoading && (!investment || !investment.isInvestor)) {
    return null;
  }

  if (isLoading) {
    return (
      <Card className="bg-muted/30">
        <CardHeader className="pb-3">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-4 w-32" />
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            {Array.from({ length: 2 }).map((_, i) => (
              <Skeleton key={i} className="h-16" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!investment) return null;

  const isPositiveReturn = investment.returnRate >= 0;
  const returnColor = isPositiveReturn ? "text-success" : "text-destructive";
  const ReturnIcon = isPositiveReturn ? TrendingUp : TrendingDown;

  const commentary = isPositiveReturn
    ? investment.returnRate > 5
      ? "Your investment is performing above the organization average."
      : "Your investment is growing steadily with the market."
    : "Market conditions have temporarily affected returns.";

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <Card className="bg-muted/30 border-muted">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <PiggyBank className="h-5 w-5 text-muted-foreground" />
              <CardTitle className="text-base">Investment Overview</CardTitle>
            </div>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <ChevronDown
                  className={`h-4 w-4 transition-transform ${isOpen ? "" : "-rotate-90"}`}
                />
              </Button>
            </CollapsibleTrigger>
          </div>
          <CardDescription className="flex items-center gap-2">
            <Badge variant="outline" className={`gap-1 ${returnColor}`}>
              <ReturnIcon className="h-3 w-3" />
              {isPositiveReturn ? "+" : ""}{investment.returnRate.toFixed(2)}% ROI
            </Badge>
            <span className="text-xs">Employee-Investor</span>
          </CardDescription>
        </CardHeader>
        <CollapsibleContent>
          <CardContent className="pt-0 space-y-4">
            {/* Investment Stats */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-lg bg-background/50 flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <DollarSign className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-lg font-semibold">
                    ${investment.personalInvestment.toLocaleString()}
                  </p>
                  <p className="text-xs text-muted-foreground">Initial Investment</p>
                </div>
              </div>
              <div className="p-3 rounded-lg bg-background/50 flex items-center gap-3">
                <div className={`h-8 w-8 rounded-full flex items-center justify-center ${isPositiveReturn ? "bg-success/10" : "bg-destructive/10"}`}>
                  <ReturnIcon className={`h-4 w-4 ${returnColor}`} />
                </div>
                <div>
                  <p className="text-lg font-semibold">
                    ${investment.currentBalance.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                  </p>
                  <p className="text-xs text-muted-foreground">Current Balance</p>
                </div>
              </div>
            </div>

            {/* Commentary */}
            <div className="p-3 rounded-lg bg-background/50 border border-border/50">
              <p className="text-sm text-muted-foreground leading-relaxed">
                {commentary}
              </p>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}
