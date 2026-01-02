import { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useSalaryPeriods } from "@/hooks/useSalaryPeriods";
import { usePayrollCalculation } from "@/hooks/usePayrollCalculation";
import { Calculator, DollarSign, Clock, FileText, Users } from "lucide-react";

export function PayrollCalculator() {
  const { data: periods, isLoading: periodsLoading } = useSalaryPeriods();
  const [selectedPeriodId, setSelectedPeriodId] = useState<string>("");

  const selectedPeriod = useMemo(
    () => periods?.find((p) => p.id === selectedPeriodId),
    [periods, selectedPeriodId]
  );

  const { data: payrollData, isLoading: payrollLoading } = usePayrollCalculation(
    selectedPeriodId || null,
    selectedPeriod?.start_date || null,
    selectedPeriod?.end_date || null
  );

  const totals = useMemo(() => {
    if (!payrollData || payrollData.length === 0) {
      return { employees: 0, hours: 0, earnings: 0, reports: 0 };
    }
    return payrollData.reduce(
      (acc, emp) => ({
        employees: acc.employees + 1,
        hours: acc.hours + emp.total_hours,
        earnings: acc.earnings + emp.total_earnings,
        reports: acc.reports + emp.approved_reports,
      }),
      { employees: 0, hours: 0, earnings: 0, reports: 0 }
    );
  }, [payrollData]);

  if (periodsLoading) {
    return <Skeleton className="h-96" />;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Payroll Calculator
          </CardTitle>
          <CardDescription>
            Calculate employee earnings based on approved reports within a salary period
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="max-w-sm">
            <label className="text-sm font-medium mb-2 block">Select Salary Period</label>
            <Select value={selectedPeriodId} onValueChange={setSelectedPeriodId}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a salary period" />
              </SelectTrigger>
              <SelectContent>
                {periods?.map((period) => (
                  <SelectItem key={period.id} value={period.id}>
                    <div className="flex items-center gap-2">
                      <span>{period.name}</span>
                      <Badge variant={period.status === "open" ? "default" : "secondary"} className="text-xs">
                        {period.status}
                      </Badge>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedPeriod && (
              <p className="text-sm text-muted-foreground mt-2">
                {new Date(selectedPeriod.start_date).toLocaleDateString()} -{" "}
                {new Date(selectedPeriod.end_date).toLocaleDateString()}
              </p>
            )}
          </div>

          {selectedPeriodId && (
            <>
              {/* Summary Cards */}
              <div className="grid gap-4 md:grid-cols-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Employees
                    </CardTitle>
                    <div className="rounded-lg p-2 bg-primary/10">
                      <Users className="h-4 w-4 text-primary" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold">{totals.employees}</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Total Hours
                    </CardTitle>
                    <div className="rounded-lg p-2 bg-blue-500/10">
                      <Clock className="h-4 w-4 text-blue-500" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold">{totals.hours.toFixed(1)}</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Total Earnings
                    </CardTitle>
                    <div className="rounded-lg p-2 bg-success/10">
                      <DollarSign className="h-4 w-4 text-success" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold">${totals.earnings.toFixed(2)}</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Approved Reports
                    </CardTitle>
                    <div className="rounded-lg p-2 bg-purple-500/10">
                      <FileText className="h-4 w-4 text-purple-500" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold">{totals.reports}</p>
                  </CardContent>
                </Card>
              </div>

              {/* Employee Breakdown Table */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Employee Breakdown</CardTitle>
                  <CardDescription>
                    Detailed earnings per employee for the selected period
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {payrollLoading ? (
                    <div className="space-y-2">
                      <Skeleton className="h-10 w-full" />
                      <Skeleton className="h-10 w-full" />
                      <Skeleton className="h-10 w-full" />
                    </div>
                  ) : payrollData && payrollData.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Employee</TableHead>
                          <TableHead className="text-right">Reports</TableHead>
                          <TableHead className="text-right">Hours</TableHead>
                          <TableHead className="text-right">Earnings</TableHead>
                          <TableHead className="text-right">Avg/Hour</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {payrollData.map((employee) => (
                          <TableRow key={employee.user_id}>
                            <TableCell className="font-medium">
                              {employee.full_name || "Unknown Employee"}
                            </TableCell>
                            <TableCell className="text-right">
                              <Badge variant="outline">{employee.approved_reports}</Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              {employee.total_hours.toFixed(1)}h
                            </TableCell>
                            <TableCell className="text-right font-semibold text-success">
                              ${employee.total_earnings.toFixed(2)}
                            </TableCell>
                            <TableCell className="text-right text-muted-foreground">
                              ${employee.total_hours > 0
                                ? (employee.total_earnings / employee.total_hours).toFixed(2)
                                : "0.00"}/h
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
                      <p>No approved reports found for this period</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
