import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  ArrowDownToLine, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Wallet,
  Info,
  AlertTriangle,
} from "lucide-react";
import { format } from "date-fns";
import { useWithdrawalRequests, useCreateWithdrawalRequest, useInvestorSummary, type WithdrawalStatus } from "@/hooks/useInvestorProfile";
import { cn } from "@/lib/utils";

const statusConfig: Record<WithdrawalStatus, { label: string; icon: typeof Clock; color: string }> = {
  requested: { label: "Pending", icon: Clock, color: "bg-warning/10 text-warning border-warning/20" },
  approved: { label: "Approved", icon: CheckCircle, color: "bg-info/10 text-info border-info/20" },
  paid: { label: "Paid", icon: CheckCircle, color: "bg-success/10 text-success border-success/20" },
  rejected: { label: "Rejected", icon: XCircle, color: "bg-destructive/10 text-destructive border-destructive/20" },
};

export function InvestorWithdrawalsPanel() {
  const { data: withdrawals, isLoading } = useWithdrawalRequests();
  const { data: summary } = useInvestorSummary();
  const createWithdrawal = useCreateWithdrawalRequest();
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const [notes, setNotes] = useState("");

  const availableBalance = summary?.availableBalance || 0;
  const hasMinimumBalance = availableBalance >= 10;

  const handleSubmit = () => {
    const requestedAmount = parseFloat(amount);
    if (isNaN(requestedAmount) || requestedAmount <= 0) return;
    if (requestedAmount > availableBalance) return;

    createWithdrawal.mutate({
      requested_amount: requestedAmount,
      available_balance: availableBalance,
      notes: notes || undefined,
    }, {
      onSuccess: () => {
        setIsDialogOpen(false);
        setAmount("");
        setNotes("");
      }
    });
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-40" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-40 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="flex items-center gap-2">
            <ArrowDownToLine className="h-5 w-5" />
            Withdrawals
          </CardTitle>
          <CardDescription>Request and track withdrawals from your investment returns</CardDescription>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button disabled={!hasMinimumBalance}>
              <Wallet className="h-4 w-4 mr-2" />
              Request Withdrawal
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Request Withdrawal</DialogTitle>
              <DialogDescription>
                Submit a withdrawal request for review. Only available profits may be withdrawn.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <Alert className="border-info/50 bg-info/10">
                <Info className="h-4 w-4 text-info" />
                <AlertDescription>
                  Available balance: <strong>${availableBalance.toLocaleString()}</strong>
                </AlertDescription>
              </Alert>

              <Alert className="border-warning/50 bg-warning/10">
                <AlertTriangle className="h-4 w-4 text-warning" />
                <AlertDescription className="text-xs">
                  Withdrawals are subject to holding periods and internal approval. Processing may take 3-7 business days.
                </AlertDescription>
              </Alert>

              <div className="space-y-2">
                <Label htmlFor="amount">Amount ($)</Label>
                <Input
                  id="amount"
                  type="number"
                  min="10"
                  max={availableBalance}
                  step="0.01"
                  placeholder="Enter amount"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
                {parseFloat(amount) > availableBalance && (
                  <p className="text-xs text-destructive">Amount exceeds available balance</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notes (optional)</Label>
                <Textarea
                  id="notes"
                  placeholder="Any additional information..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleSubmit}
                disabled={
                  createWithdrawal.isPending || 
                  !amount || 
                  parseFloat(amount) <= 0 ||
                  parseFloat(amount) > availableBalance
                }
              >
                {createWithdrawal.isPending ? "Submitting..." : "Submit Request"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {!hasMinimumBalance && (
          <Alert className="mb-4 border-muted">
            <Info className="h-4 w-4" />
            <AlertDescription>
              Minimum balance of $10 required to request a withdrawal.
            </AlertDescription>
          </Alert>
        )}

        {withdrawals && withdrawals.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Notes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {withdrawals.map((withdrawal) => {
                const status = statusConfig[withdrawal.status];
                const StatusIcon = status.icon;
                return (
                  <TableRow key={withdrawal.id}>
                    <TableCell>
                      {format(new Date(withdrawal.requested_at), "MMM d, yyyy")}
                    </TableCell>
                    <TableCell className="font-medium">
                      ${Number(withdrawal.requested_amount).toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={status.color}>
                        <StatusIcon className="h-3 w-3 mr-1" />
                        {status.label}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground max-w-[200px] truncate">
                      {withdrawal.rejection_reason || withdrawal.notes || "-"}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <ArrowDownToLine className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>No withdrawal requests yet</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
