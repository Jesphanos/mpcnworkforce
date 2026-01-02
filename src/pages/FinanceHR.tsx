import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { SalaryPeriodForm } from "@/components/finance/SalaryPeriodForm";
import { SalaryPeriodsTable } from "@/components/finance/SalaryPeriodsTable";
import { EmployeeDirectory } from "@/components/finance/EmployeeDirectory";
import { PayrollCalculator } from "@/components/finance/PayrollCalculator";
import { useSalaryPeriods } from "@/hooks/useSalaryPeriods";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calculator, DollarSign } from "lucide-react";

export default function FinanceHR() {
  const { data: periods, isLoading } = useSalaryPeriods();
  const { hasRole } = useAuth();
  const canManage = hasRole("finance_hr_admin");

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-96" />
        </div>
      </DashboardLayout>
    );
  }

  const openPeriods = periods?.filter((p) => p.status === "open") || [];
  const closedPeriods = periods?.filter((p) => p.status === "closed") || [];

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Finance & HR</h1>
          <p className="text-muted-foreground">Manage payroll periods and employee records</p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Open Periods
              </CardTitle>
              <div className="rounded-lg p-2 bg-success/10">
                <DollarSign className="h-4 w-4 text-success" />
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{openPeriods.length}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Closed Periods
              </CardTitle>
              <div className="rounded-lg p-2 bg-muted">
                <Calculator className="h-4 w-4 text-muted-foreground" />
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{closedPeriods.length}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Periods
              </CardTitle>
              <div className="rounded-lg p-2 bg-primary/10">
                <DollarSign className="h-4 w-4 text-primary" />
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{periods?.length || 0}</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="periods" className="space-y-4">
          <TabsList>
            <TabsTrigger value="periods">Salary Periods</TabsTrigger>
            <TabsTrigger value="payroll">Payroll Calculator</TabsTrigger>
            <TabsTrigger value="employees">Employees</TabsTrigger>
          </TabsList>

          <TabsContent value="periods" className="space-y-4">
            {canManage && <SalaryPeriodForm />}
            <SalaryPeriodsTable periods={periods || []} />
          </TabsContent>

          <TabsContent value="payroll" className="space-y-4">
            <PayrollCalculator />
          </TabsContent>

          <TabsContent value="employees" className="space-y-4">
            <EmployeeDirectory />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
