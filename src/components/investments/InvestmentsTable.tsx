import { format } from "date-fns";
import { TrendingUp, TrendingDown, Minus, Wallet } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Investment } from "@/hooks/useInvestments";

interface InvestmentsTableProps {
  investments: Investment[];
}

export function InvestmentsTable({ investments }: InvestmentsTableProps) {
  if (investments.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-10">
          <Wallet className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground">No investments tracked yet</p>
        </CardContent>
      </Card>
    );
  }

  const statusColors = {
    active: "bg-success/10 text-success border-success/20",
    sold: "bg-muted text-muted-foreground",
    matured: "bg-info/10 text-info border-info/20",
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Investment Portfolio</CardTitle>
        <CardDescription>Track and manage organization investments</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Platform</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Initial</TableHead>
              <TableHead>Current</TableHead>
              <TableHead>Return</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {investments.map((inv) => {
              const returnAmount = Number(inv.current_value) - Number(inv.initial_amount);
              const returnPercent = Number(inv.initial_amount) > 0
                ? (returnAmount / Number(inv.initial_amount)) * 100
                : 0;
              const isPositive = returnAmount > 0;
              const isNegative = returnAmount < 0;

              return (
                <TableRow key={inv.id}>
                  <TableCell className="font-medium">{inv.name}</TableCell>
                  <TableCell>{inv.platform}</TableCell>
                  <TableCell>{inv.investment_type}</TableCell>
                  <TableCell>${Number(inv.initial_amount).toLocaleString()}</TableCell>
                  <TableCell>${Number(inv.current_value).toLocaleString()}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      {isPositive && <TrendingUp className="h-4 w-4 text-success" />}
                      {isNegative && <TrendingDown className="h-4 w-4 text-destructive" />}
                      {!isPositive && !isNegative && <Minus className="h-4 w-4 text-muted-foreground" />}
                      <span
                        className={
                          isPositive
                            ? "text-success"
                            : isNegative
                            ? "text-destructive"
                            : "text-muted-foreground"
                        }
                      >
                        {returnPercent >= 0 ? "+" : ""}
                        {returnPercent.toFixed(2)}%
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={statusColors[inv.status]}>
                      {inv.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {format(new Date(inv.purchase_date), "MMM d, yyyy")}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
