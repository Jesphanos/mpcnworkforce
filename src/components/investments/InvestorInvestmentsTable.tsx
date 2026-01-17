import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { 
  Briefcase, 
  TrendingUp, 
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Clock,
  Ban,
} from "lucide-react";
import { format } from "date-fns";
import { useInvestorInvestments, type InvestmentScope, type InvestmentRiskLevel } from "@/hooks/useInvestorProfile";
import { cn } from "@/lib/utils";

const scopeLabels: Record<InvestmentScope, string> = {
  general_fund: "General Fund",
  project_specific: "Project-Specific",
  team_specific: "Team-Specific",
};

const riskColors: Record<InvestmentRiskLevel, string> = {
  low: "bg-success/10 text-success border-success/20",
  medium: "bg-warning/10 text-warning border-warning/20",
  high: "bg-destructive/10 text-destructive border-destructive/20",
};

const statusConfig: Record<string, { icon: typeof CheckCircle; color: string }> = {
  active: { icon: CheckCircle, color: "text-success" },
  matured: { icon: CheckCircle, color: "text-info" },
  loss: { icon: AlertTriangle, color: "text-destructive" },
  recovered: { icon: TrendingUp, color: "text-warning" },
  withdrawn: { icon: Ban, color: "text-muted-foreground" },
};

export function InvestorInvestmentsTable() {
  const { data: investments, isLoading } = useInvestorInvestments();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-40" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-60 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Briefcase className="h-5 w-5" />
          My Investments
        </CardTitle>
        <CardDescription>
          Detailed view of all your investments and their performance
        </CardDescription>
      </CardHeader>
      <CardContent>
        {investments && investments.length > 0 ? (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Investment</TableHead>
                  <TableHead>Scope</TableHead>
                  <TableHead>Risk</TableHead>
                  <TableHead className="text-right">Initial</TableHead>
                  <TableHead className="text-right">Current</TableHead>
                  <TableHead className="text-right">Performance</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {investments.map((investment) => {
                  const roi = investment.initial_amount > 0 
                    ? ((investment.current_value - investment.initial_amount) / investment.initial_amount) * 100
                    : 0;
                  const isPositive = roi >= 0;
                  const statusConf = statusConfig[investment.status] || statusConfig.active;
                  const StatusIcon = statusConf.icon;

                  return (
                    <TableRow key={investment.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{investment.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {investment.platform} • {format(new Date(investment.purchase_date), "MMM yyyy")}
                          </p>
                          {investment.is_reinvestment && (
                            <Badge variant="outline" className="text-xs mt-1">
                              Reinvestment
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">
                          {investment.investment_scope ? scopeLabels[investment.investment_scope] : "General"}
                        </span>
                      </TableCell>
                      <TableCell>
                        {investment.risk_level && (
                          <Badge variant="outline" className={cn("capitalize", riskColors[investment.risk_level])}>
                            {investment.risk_level}
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        ${investment.initial_amount.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        ${investment.current_value.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          {isPositive ? (
                            <TrendingUp className="h-3 w-3 text-success" />
                          ) : (
                            <TrendingDown className="h-3 w-3 text-destructive" />
                          )}
                          <span className={cn(
                            "font-medium",
                            isPositive ? "text-success" : "text-destructive"
                          )}>
                            {isPositive ? "+" : ""}{roi.toFixed(1)}%
                          </span>
                        </div>
                        {investment.loss_amount && investment.loss_amount > 0 && (
                          <p className="text-xs text-destructive mt-1">
                            Loss: ${investment.loss_amount.toLocaleString()}
                          </p>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1.5">
                          <StatusIcon className={cn("h-4 w-4", statusConf.color)} />
                          <span className="capitalize text-sm">{investment.status}</span>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <Briefcase className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>No investments found</p>
            <p className="text-sm">Your investments will appear here once recorded.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
