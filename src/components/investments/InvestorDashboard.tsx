import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useUserInvestmentSummary, useInvestmentReturns } from "@/hooks/useMpcnFinancials";
import { useAuth } from "@/contexts/AuthContext";
import { format } from "date-fns";
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  PieChart, 
  Wallet, 
  ArrowUpRight,
  Landmark,
  BarChart3,
} from "lucide-react";
import { cn } from "@/lib/utils";

export function InvestorDashboard() {
  const { user, profile } = useAuth();
  const { data: summary, isLoading: summaryLoading } = useUserInvestmentSummary();
  const { returns, isLoading: returnsLoading } = useInvestmentReturns(user?.id);

  const isLoading = summaryLoading || returnsLoading;

  if (!profile?.is_investor) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16">
          <Landmark className="h-16 w-16 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Not an Investor</h3>
          <p className="text-muted-foreground text-center max-w-md">
            You don't have investor status. Contact an administrator if you believe this is an error.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
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
        <Card>
          <CardContent className="pt-6">
            <Skeleton className="h-64 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  const roiPercent = summary?.totalInvested 
    ? ((summary.currentValue - summary.totalInvested) / summary.totalInvested * 100)
    : 0;

  const isPositiveRoi = roiPercent >= 0;

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Invested</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${(summary?.totalInvested || 0).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              {summary?.investmentCount || 0} investment(s)
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Value</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${(summary?.currentValue || 0).toLocaleString()}
            </div>
            <div className="flex items-center text-xs">
              {isPositiveRoi ? (
                <>
                  <TrendingUp className="h-3 w-3 text-success mr-1" />
                  <span className="text-success">+{roiPercent.toFixed(1)}%</span>
                </>
              ) : (
                <>
                  <TrendingDown className="h-3 w-3 text-destructive mr-1" />
                  <span className="text-destructive">{roiPercent.toFixed(1)}%</span>
                </>
              )}
              <span className="text-muted-foreground ml-1">ROI</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Returns</CardTitle>
            <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">
              ${(summary?.totalReturns || 0).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              {summary?.returnCount || 0} payout(s)
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pool Share</CardTitle>
            <PieChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(summary?.totalPoolShare || 0).toFixed(2)}%
            </div>
            <p className="text-xs text-muted-foreground">
              of ${(summary?.latestPoolTotal || 0).toLocaleString()} total
            </p>
          </CardContent>
        </Card>
      </div>

      {/* MPCN Pool Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            MPCN Pool Overview
          </CardTitle>
          <CardDescription>
            Latest financial period snapshot
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="p-4 rounded-lg border bg-card">
              <p className="text-sm text-muted-foreground mb-1">Total Pool Value</p>
              <p className="text-3xl font-bold">
                ${(summary?.latestPoolTotal || 0).toLocaleString()}
              </p>
            </div>
            <div className="p-4 rounded-lg border bg-card">
              <p className="text-sm text-muted-foreground mb-1">Latest Profit</p>
              <p className="text-3xl font-bold text-success">
                ${(summary?.latestProfit || 0).toLocaleString()}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Returns History */}
      <Card>
        <CardHeader>
          <CardTitle>Returns History</CardTitle>
          <CardDescription>
            Your profit distribution payouts
          </CardDescription>
        </CardHeader>
        <CardContent>
          {returns.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <DollarSign className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No returns recorded yet</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Notes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {returns.map((ret) => (
                  <TableRow key={ret.id}>
                    <TableCell>
                      {format(new Date(ret.profit_date), "MMM d, yyyy")}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="bg-success/10 text-success border-success/20">
                        +${Number(ret.return_amount).toLocaleString()}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {ret.notes || "-"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
