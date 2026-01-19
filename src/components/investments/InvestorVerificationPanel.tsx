import { useState } from "react";
import { format } from "date-fns";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  UserCheck, 
  UserX, 
  Clock, 
  CheckCircle, 
  XCircle,
  Eye,
  AlertCircle,
  Building2,
  User,
  Globe,
  DollarSign,
  Filter,
} from "lucide-react";
import { 
  usePendingInvestors, 
  useAllInvestors, 
  useVerifyInvestor,
  type PendingInvestor 
} from "@/hooks/useInvestorVerification";
import type { InvestorVerificationStatus } from "@/hooks/useInvestorProfile";

const investorTypeLabels: Record<string, { label: string; color: string }> = {
  financial: { label: "Financial", color: "bg-blue-500/10 text-blue-600" },
  strategic: { label: "Strategic", color: "bg-purple-500/10 text-purple-600" },
  employee_investor: { label: "Employee Investor", color: "bg-green-500/10 text-green-600" },
  founding: { label: "Founding", color: "bg-amber-500/10 text-amber-600" },
};

const statusConfig: Record<string, { label: string; icon: typeof Clock; color: string }> = {
  pending: { label: "Pending", icon: Clock, color: "text-warning" },
  verified: { label: "Verified", icon: CheckCircle, color: "text-success" },
  rejected: { label: "Rejected", icon: XCircle, color: "text-destructive" },
};

function InvestorReviewDialog({
  investor,
  isOpen,
  onClose,
}: {
  investor: PendingInvestor;
  isOpen: boolean;
  onClose: () => void;
}) {
  const [notes, setNotes] = useState("");
  const { mutate: verifyInvestor, isPending } = useVerifyInvestor();

  const handleAction = (status: "verified" | "rejected") => {
    verifyInvestor(
      { investorId: investor.id, status, notes: notes || undefined },
      { onSuccess: () => {
        setNotes("");
        onClose();
      }}
    );
  };

  const investorType = investor.investor_type 
    ? investorTypeLabels[investor.investor_type] 
    : null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Review Investor Application
          </DialogTitle>
          <DialogDescription>
            Review the investor details and approve or reject their registration.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Investor Details */}
          <div className="grid gap-3 p-4 rounded-lg bg-muted/50">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">{investor.full_name || "Unnamed Investor"}</span>
            </div>
            
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4 text-muted-foreground" />
                <span className="capitalize">{investor.investor_entity_type || "Individual"}</span>
              </div>
              
              {investor.country && (
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4 text-muted-foreground" />
                  <span>{investor.country}</span>
                </div>
              )}
              
              {investor.initial_investment && (
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                  <span>
                    {investor.currency_preference || "USD"} {investor.initial_investment.toLocaleString()}
                  </span>
                </div>
              )}
            </div>

            {investorType && (
              <Badge className={investorType.color}>
                {investorType.label}
              </Badge>
            )}

            <div className="text-xs text-muted-foreground">
              Applied: {format(new Date(investor.created_at), "PPP 'at' p")}
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label>Review Notes (Optional)</Label>
            <Textarea
              placeholder="Add notes about your decision..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
            <p className="text-xs text-muted-foreground">
              Notes will be recorded in the audit log.
            </p>
          </div>

          {/* Warning */}
          <div className="flex items-start gap-2 p-3 rounded-lg bg-warning/10 text-warning-foreground">
            <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
            <p className="text-sm">
              This action will grant or deny investment access. Review carefully before proceeding.
            </p>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={onClose} disabled={isPending}>
            Cancel
          </Button>
          <Button 
            variant="destructive" 
            onClick={() => handleAction("rejected")}
            disabled={isPending}
          >
            <UserX className="h-4 w-4 mr-1" />
            Reject
          </Button>
          <Button 
            onClick={() => handleAction("verified")}
            disabled={isPending}
          >
            <UserCheck className="h-4 w-4 mr-1" />
            Approve
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function InvestorVerificationPanel() {
  const [statusFilter, setStatusFilter] = useState<InvestorVerificationStatus | "all">("pending");
  const [selectedInvestor, setSelectedInvestor] = useState<PendingInvestor | null>(null);
  
  const { data: pendingInvestors, isLoading: pendingLoading } = usePendingInvestors();
  const { data: allInvestors, isLoading: allLoading } = useAllInvestors(statusFilter);

  const investors = statusFilter === "pending" ? pendingInvestors : allInvestors;
  const isLoading = statusFilter === "pending" ? pendingLoading : allLoading;
  const pendingCount = pendingInvestors?.length || 0;

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-64 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <UserCheck className="h-5 w-5" />
                Investor Verification
                {pendingCount > 0 && (
                  <Badge variant="destructive" className="ml-2">
                    {pendingCount} pending
                  </Badge>
                )}
              </CardTitle>
              <CardDescription>
                Review and approve pending investor registrations
              </CardDescription>
            </div>

            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Select 
                value={statusFilter} 
                onValueChange={(v) => setStatusFilter(v as typeof statusFilter)}
              >
                <SelectTrigger className="w-[150px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="verified">Verified</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                  <SelectItem value="all">All</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {investors && investors.length > 0 ? (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Investor</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Entity</TableHead>
                    <TableHead>Initial Investment</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Applied</TableHead>
                    <TableHead className="w-[100px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {investors.map((investor) => {
                    const investorType = investor.investor_type 
                      ? investorTypeLabels[investor.investor_type] 
                      : null;
                    const status = investor.investor_verification_status
                      ? statusConfig[investor.investor_verification_status]
                      : statusConfig.pending;
                    const StatusIcon = status.icon;

                    return (
                      <TableRow key={investor.id}>
                        <TableCell>
                          <div className="font-medium">
                            {investor.full_name || "Unnamed"}
                          </div>
                          {investor.country && (
                            <div className="text-xs text-muted-foreground">
                              {investor.country}
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          {investorType ? (
                            <Badge className={investorType.color}>
                              {investorType.label}
                            </Badge>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell className="capitalize">
                          {investor.investor_entity_type || "Individual"}
                        </TableCell>
                        <TableCell>
                          {investor.initial_investment ? (
                            <span>
                              {investor.currency_preference || "USD"}{" "}
                              {investor.initial_investment.toLocaleString()}
                            </span>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className={`flex items-center gap-1 ${status.color}`}>
                            <StatusIcon className="h-4 w-4" />
                            <span className="text-sm">{status.label}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {format(new Date(investor.created_at), "PP")}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedInvestor(investor)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <UserCheck className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No {statusFilter === "all" ? "" : statusFilter} investor applications found</p>
            </div>
          )}
        </CardContent>
      </Card>

      {selectedInvestor && (
        <InvestorReviewDialog
          investor={selectedInvestor}
          isOpen={!!selectedInvestor}
          onClose={() => setSelectedInvestor(null)}
        />
      )}
    </>
  );
}
