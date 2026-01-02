import { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { useSalaryPeriods } from "@/hooks/useSalaryPeriods";
import { usePayrollCalculation, EmployeePayroll } from "@/hooks/usePayrollCalculation";
import { Calculator, DollarSign, Clock, FileText, Users, Download } from "lucide-react";
import { toast } from "sonner";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

function exportToCSV(
  data: EmployeePayroll[],
  periodName: string,
  startDate: string,
  endDate: string,
  totals: { employees: number; hours: number; earnings: number; reports: number }
) {
  const headers = ["Employee", "Reports", "Hours", "Earnings", "Avg/Hour"];
  const rows = data.map((emp) => [
    emp.full_name || "Unknown Employee",
    emp.approved_reports.toString(),
    emp.total_hours.toFixed(1),
    `$${emp.total_earnings.toFixed(2)}`,
    `$${emp.total_hours > 0 ? (emp.total_earnings / emp.total_hours).toFixed(2) : "0.00"}`,
  ]);

  // Add totals row
  rows.push([
    "TOTAL",
    totals.reports.toString(),
    totals.hours.toFixed(1),
    `$${totals.earnings.toFixed(2)}`,
    "",
  ]);

  const csvContent = [
    `Payroll Report: ${periodName}`,
    `Period: ${new Date(startDate).toLocaleDateString()} - ${new Date(endDate).toLocaleDateString()}`,
    "",
    headers.join(","),
    ...rows.map((row) => row.join(",")),
  ].join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `payroll-${periodName.replace(/\s+/g, "-").toLowerCase()}.csv`;
  link.click();
  URL.revokeObjectURL(link.href);
  toast.success("CSV exported successfully");
}

function exportToPDF(
  data: EmployeePayroll[],
  periodName: string,
  startDate: string,
  endDate: string,
  totals: { employees: number; hours: number; earnings: number; reports: number }
) {
  const doc = new jsPDF();

  // Title
  doc.setFontSize(18);
  doc.text("Payroll Report", 14, 22);

  // Period info
  doc.setFontSize(12);
  doc.text(`Period: ${periodName}`, 14, 32);
  doc.text(
    `Date Range: ${new Date(startDate).toLocaleDateString()} - ${new Date(endDate).toLocaleDateString()}`,
    14,
    40
  );

  // Summary
  doc.setFontSize(10);
  doc.text(`Total Employees: ${totals.employees}`, 14, 52);
  doc.text(`Total Hours: ${totals.hours.toFixed(1)}`, 14, 58);
  doc.text(`Total Earnings: $${totals.earnings.toFixed(2)}`, 14, 64);
  doc.text(`Approved Reports: ${totals.reports}`, 14, 70);

  // Table
  const tableData = data.map((emp) => [
    emp.full_name || "Unknown Employee",
    emp.approved_reports.toString(),
    `${emp.total_hours.toFixed(1)}h`,
    `$${emp.total_earnings.toFixed(2)}`,
    `$${emp.total_hours > 0 ? (emp.total_earnings / emp.total_hours).toFixed(2) : "0.00"}/h`,
  ]);

  // Add totals row
  tableData.push([
    "TOTAL",
    totals.reports.toString(),
    `${totals.hours.toFixed(1)}h`,
    `$${totals.earnings.toFixed(2)}`,
    "",
  ]);

  autoTable(doc, {
    startY: 78,
    head: [["Employee", "Reports", "Hours", "Earnings", "Avg/Hour"]],
    body: tableData,
    theme: "striped",
    headStyles: { fillColor: [59, 130, 246] },
    footStyles: { fillColor: [229, 231, 235], textColor: [0, 0, 0], fontStyle: "bold" },
  });

  doc.save(`payroll-${periodName.replace(/\s+/g, "-").toLowerCase()}.pdf`);
  toast.success("PDF exported successfully");
}

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

  const handleExportCSV = () => {
    if (!payrollData || !selectedPeriod) return;
    exportToCSV(payrollData, selectedPeriod.name, selectedPeriod.start_date, selectedPeriod.end_date, totals);
  };

  const handleExportPDF = () => {
    if (!payrollData || !selectedPeriod) return;
    exportToPDF(payrollData, selectedPeriod.name, selectedPeriod.start_date, selectedPeriod.end_date, totals);
  };

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
          <div className="flex flex-col sm:flex-row sm:items-end gap-4">
            <div className="flex-1 max-w-sm">
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

            {selectedPeriodId && payrollData && payrollData.length > 0 && (
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={handleExportCSV}>
                  <Download className="h-4 w-4 mr-2" />
                  CSV
                </Button>
                <Button variant="outline" size="sm" onClick={handleExportPDF}>
                  <Download className="h-4 w-4 mr-2" />
                  PDF
                </Button>
              </div>
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
