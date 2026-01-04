import { format, differenceInDays } from "date-fns";
import { Lock, Unlock, Calendar } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { toast } from "sonner";
import { SalaryPeriod, useToggleSalaryPeriodStatus } from "@/hooks/useSalaryPeriods";
import { useAuth } from "@/contexts/AuthContext";

interface SalaryPeriodsTableProps {
  periods: SalaryPeriod[];
}

export function SalaryPeriodsTable({ periods }: SalaryPeriodsTableProps) {
  const { hasRole } = useAuth();
  const canManage = hasRole("finance_hr_admin");
  const isOverseer = hasRole("general_overseer");
  const toggleStatus = useToggleSalaryPeriodStatus();
  
  const [reopenReason, setReopenReason] = useState("");
  const [selectedPeriod, setSelectedPeriod] = useState<SalaryPeriod | null>(null);

  const handleToggleStatus = async (period: SalaryPeriod) => {
    const isReopening = period.status === "closed";
    
    // Overseer reopening requires reason
    if (isReopening && isOverseer && !reopenReason.trim()) {
      toast.error("Reason is required for reopening salary periods");
      return;
    }
    
    await toggleStatus.mutateAsync({
      periodId: period.id,
      currentStatus: period.status,
      reason: isReopening ? reopenReason : undefined,
    });
    
    setSelectedPeriod(null);
    setReopenReason("");
  };

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
              {(canManage || isOverseer) && <TableHead>Actions</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {periods.map((period) => {
              const duration = differenceInDays(
                new Date(period.end_date),
                new Date(period.start_date)
              );
              const isClosing = period.status === "open";
              
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
                  {(canManage || isOverseer) && (
                    <TableCell>
                      {isClosing ? (
                        // Closing doesn't require a reason dialog
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleToggleStatus(period)}
                          disabled={toggleStatus.isPending}
                        >
                          <Lock className="h-4 w-4 mr-1" />
                          Close
                        </Button>
                      ) : (
                        // Reopening requires a reason for overseer
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setSelectedPeriod(period)}
                            >
                              <Unlock className="h-4 w-4 mr-1" />
                              Reopen
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Reopen Salary Period</DialogTitle>
                              <DialogDescription>
                                {isOverseer 
                                  ? "Reopening a closed salary period requires a mandatory reason for audit purposes."
                                  : "Provide a reason for reopening this salary period."}
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div>
                                <Label>Period: {period.name}</Label>
                                <p className="text-sm text-muted-foreground mt-1">
                                  {format(new Date(period.start_date), "MMM d, yyyy")} - {format(new Date(period.end_date), "MMM d, yyyy")}
                                </p>
                              </div>
                              <div>
                                <Label>Reason {isOverseer ? "(Required)" : "(Recommended)"}</Label>
                                <Textarea
                                  placeholder="Enter reason for reopening..."
                                  value={reopenReason}
                                  onChange={(e) => setReopenReason(e.target.value)}
                                  className="mt-1"
                                />
                                {isOverseer && !reopenReason.trim() && (
                                  <p className="text-xs text-destructive mt-1">
                                    Overseer actions require a mandatory reason
                                  </p>
                                )}
                              </div>
                            </div>
                            <DialogFooter>
                              <Button 
                                variant="outline" 
                                onClick={() => { setSelectedPeriod(null); setReopenReason(""); }}
                              >
                                Cancel
                              </Button>
                              <Button
                                onClick={() => handleToggleStatus(period)}
                                disabled={toggleStatus.isPending || (isOverseer && !reopenReason.trim())}
                              >
                                Reopen Period
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      )}
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