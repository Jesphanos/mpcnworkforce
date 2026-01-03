import { usePeriodEarnings } from "@/hooks/useOverseerData";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar, DollarSign } from "lucide-react";
import { format } from "date-fns";

export function PeriodEarningsTable() {
  const { data: periods, isLoading } = usePeriodEarnings();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Salary Periods
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Salary Periods
        </CardTitle>
        <CardDescription>
          Earnings summary by salary period
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Period</TableHead>
              <TableHead>Date Range</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-center">Members</TableHead>
              <TableHead className="text-right">Hours</TableHead>
              <TableHead className="text-right">Total Earnings</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {periods?.map((period) => (
              <TableRow key={period.period_id}>
                <TableCell className="font-medium">{period.period_name}</TableCell>
                <TableCell className="text-muted-foreground">
                  {format(new Date(period.start_date), "MMM d")} -{" "}
                  {format(new Date(period.end_date), "MMM d, yyyy")}
                </TableCell>
                <TableCell>
                  <Badge
                    variant={period.status === "open" ? "default" : "secondary"}
                    className={
                      period.status === "open"
                        ? "bg-green-100 text-green-800"
                        : "bg-slate-100 text-slate-800"
                    }
                  >
                    {period.status === "open" ? "Open" : "Closed"}
                  </Badge>
                </TableCell>
                <TableCell className="text-center">{period.member_count}</TableCell>
                <TableCell className="text-right">{period.total_hours.toFixed(1)}h</TableCell>
                <TableCell className="text-right">
                  <span className="font-semibold text-green-600 flex items-center justify-end gap-1">
                    <DollarSign className="h-4 w-4" />
                    {period.total_earnings.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </span>
                </TableCell>
              </TableRow>
            ))}
            {(!periods || periods.length === 0) && (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  No salary periods found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
