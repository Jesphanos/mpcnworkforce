import { format, differenceInDays } from "date-fns";
import { Lock, Unlock, Calendar } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SalaryPeriod, useToggleSalaryPeriodStatus } from "@/hooks/useSalaryPeriods";
import { useAuth } from "@/contexts/AuthContext";

interface SalaryPeriodsTableProps {
  periods: SalaryPeriod[];
}

export function SalaryPeriodsTable({ periods }: SalaryPeriodsTableProps) {
  const { hasRole } = useAuth();
  const canManage = hasRole("finance_hr_admin");
  const toggleStatus = useToggleSalaryPeriodStatus();

  if (periods.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-10">
          <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground">No salary periods created yet</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Salary Periods</CardTitle>
        <CardDescription>Manage pay periods and track payroll cycles</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Start Date</TableHead>
              <TableHead>End Date</TableHead>
              <TableHead>Duration</TableHead>
              <TableHead>Status</TableHead>
              {canManage && <TableHead>Actions</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {periods.map((period) => {
              const duration = differenceInDays(
                new Date(period.end_date),
                new Date(period.start_date)
              );
              return (
                <TableRow key={period.id}>
                  <TableCell className="font-medium">{period.name}</TableCell>
                  <TableCell>{format(new Date(period.start_date), "MMM d, yyyy")}</TableCell>
                  <TableCell>{format(new Date(period.end_date), "MMM d, yyyy")}</TableCell>
                  <TableCell>{duration} days</TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={
                        period.status === "open"
                          ? "bg-success/10 text-success border-success/20"
                          : "bg-muted text-muted-foreground"
                      }
                    >
                      {period.status === "open" ? (
                        <Unlock className="h-3 w-3 mr-1" />
                      ) : (
                        <Lock className="h-3 w-3 mr-1" />
                      )}
                      {period.status}
                    </Badge>
                  </TableCell>
                  {canManage && (
                    <TableCell>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          toggleStatus.mutate({
                            periodId: period.id,
                            currentStatus: period.status,
                          })
                        }
                        disabled={toggleStatus.isPending}
                      >
                        {period.status === "open" ? (
                          <>
                            <Lock className="h-4 w-4 mr-1" />
                            Close
                          </>
                        ) : (
                          <>
                            <Unlock className="h-4 w-4 mr-1" />
                            Reopen
                          </>
                        )}
                      </Button>
                    </TableCell>
                  )}
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
