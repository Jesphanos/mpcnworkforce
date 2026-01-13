import { useState } from "react";
import { format } from "date-fns";
import { 
  Lock, 
  Unlock, 
  Edit2, 
  CheckCircle2, 
  AlertCircle,
  FileText,
  History,
  BookOpen,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  useMpcnFinancials, 
  MpcnFinancial, 
  FinancialPeriodStatus 
} from "@/hooks/useMpcnFinancials";
import { useCapabilities } from "@/hooks/useCapabilities";
import { useFinancialNarrativeForPeriod } from "@/hooks/useFinancialNarratives";
import { FinancialNarrativeForm } from "./FinancialNarrativeForm";
import { cn } from "@/lib/utils";

const STATUS_CONFIG: Record<FinancialPeriodStatus, { 
  label: string; 
  icon: typeof Lock;
  color: string;
  bgColor: string;
}> = {
  draft: {
    label: "Draft",
    icon: Edit2,
    color: "text-muted-foreground",
    bgColor: "bg-muted/50",
  },
  finalized: {
    label: "Finalized",
    icon: Lock,
    color: "text-success",
    bgColor: "bg-success/10",
  },
  corrected: {
    label: "Corrected",
    icon: History,
    color: "text-warning",
    bgColor: "bg-warning/10",
  },
};

function FinalizeDialog({ 
  financial, 
  isOpen, 
  onClose 
}: { 
  financial: MpcnFinancial; 
  isOpen: boolean;
  onClose: () => void;
}) {
  const [disclosureNotes, setDisclosureNotes] = useState(financial.disclosure_notes || "");
  const { finalizeFinancial } = useMpcnFinancials();
  
  const handleFinalize = () => {
    finalizeFinancial.mutate(
      { id: financial.id, disclosure_notes: disclosureNotes || undefined },
      { onSuccess: onClose }
    );
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5" />
            Finalize Financial Period
          </DialogTitle>
          <DialogDescription>
            Once finalized, this period cannot be modified except by the General Overseer with a correction reason.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="p-3 rounded-lg bg-muted/50 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Period Date:</span>
              <span className="font-medium">{format(new Date(financial.profit_date), "MMMM yyyy")}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Total Pool:</span>
              <span className="font-medium">${financial.total_pool.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Total Profit:</span>
              <span className="font-medium">${financial.total_profit.toLocaleString()}</span>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label>Disclosure Notes (Optional)</Label>
            <Textarea
              placeholder="Add any notes for investors about this period..."
              value={disclosureNotes}
              onChange={(e) => setDisclosureNotes(e.target.value)}
              rows={3}
            />
            <p className="text-xs text-muted-foreground">
              These notes will be visible to all investors reviewing this period.
            </p>
          </div>
          
          <div className="flex items-start gap-2 p-3 rounded-lg bg-warning/10 text-warning-foreground">
            <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
            <p className="text-sm">
              This action will lock the financial period. Make sure all values are correct before proceeding.
            </p>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleFinalize} disabled={finalizeFinancial.isPending}>
            <Lock className="h-4 w-4 mr-1" />
            Finalize Period
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function CorrectionDialog({ 
  financial, 
  isOpen, 
  onClose 
}: { 
  financial: MpcnFinancial; 
  isOpen: boolean;
  onClose: () => void;
}) {
  const [form, setForm] = useState({
    total_pool: financial.total_pool.toString(),
    total_profit: financial.total_profit.toString(),
    correction_reason: "",
  });
  const { correctFinancial } = useMpcnFinancials();
  
  const handleCorrect = () => {
    correctFinancial.mutate(
      { 
        id: financial.id, 
        total_pool: parseFloat(form.total_pool),
        total_profit: parseFloat(form.total_profit),
        correction_reason: form.correction_reason,
      },
      { onSuccess: onClose }
    );
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Unlock className="h-5 w-5" />
            Correct Finalized Period
          </DialogTitle>
          <DialogDescription>
            You are making a correction to a finalized period. A correction reason is required and will be logged.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          {financial.original_total_pool !== null && (
            <div className="p-3 rounded-lg bg-muted/50 space-y-2">
              <p className="text-xs font-medium text-muted-foreground">Original Values</p>
              <div className="flex justify-between text-sm">
                <span>Pool:</span>
                <span>${financial.original_total_pool?.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Profit:</span>
                <span>${financial.original_total_profit?.toLocaleString()}</span>
              </div>
            </div>
          )}
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Total Pool</Label>
              <Input
                type="number"
                value={form.total_pool}
                onChange={(e) => setForm({ ...form, total_pool: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Total Profit</Label>
              <Input
                type="number"
                value={form.total_profit}
                onChange={(e) => setForm({ ...form, total_profit: e.target.value })}
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label>Correction Reason (Required)</Label>
            <Textarea
              placeholder="Explain why this correction is needed..."
              value={form.correction_reason}
              onChange={(e) => setForm({ ...form, correction_reason: e.target.value })}
              rows={3}
            />
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            onClick={handleCorrect} 
            disabled={correctFinancial.isPending || !form.correction_reason.trim()}
            variant="destructive"
          >
            Apply Correction
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function FinancialRow({ financial }: { financial: MpcnFinancial }) {
  const [showFinalize, setShowFinalize] = useState(false);
  const [showCorrect, setShowCorrect] = useState(false);
  const [showNarrativeForm, setShowNarrativeForm] = useState(false);
  const { isOverseer, can } = useCapabilities();
  const canManage = can("canManageFinancials");
  const { data: narrative } = useFinancialNarrativeForPeriod(financial.id);
  
  const statusConfig = STATUS_CONFIG[financial.status];
  const StatusIcon = statusConfig.icon;
  
  return (
    <>
      <TableRow>
        <TableCell>
          <span className="font-medium">
            {format(new Date(financial.profit_date), "MMMM yyyy")}
          </span>
        </TableCell>
        <TableCell className="text-right">
          ${financial.total_pool.toLocaleString()}
          {financial.original_total_pool !== null && financial.original_total_pool !== financial.total_pool && (
            <span className="text-xs text-muted-foreground block">
              (was ${financial.original_total_pool.toLocaleString()})
            </span>
          )}
        </TableCell>
        <TableCell className="text-right">
          ${financial.total_profit.toLocaleString()}
          {financial.original_total_profit !== null && financial.original_total_profit !== financial.total_profit && (
            <span className="text-xs text-muted-foreground block">
              (was ${financial.original_total_profit.toLocaleString()})
            </span>
          )}
        </TableCell>
        <TableCell>
          <Badge variant="outline" className={cn("gap-1", statusConfig.color, statusConfig.bgColor)}>
            <StatusIcon className="h-3 w-3" />
            {statusConfig.label}
          </Badge>
        </TableCell>
        <TableCell>
          {financial.disclosure_notes ? (
            <span className="text-xs text-muted-foreground line-clamp-2">
              {financial.disclosure_notes}
            </span>
          ) : (
            <span className="text-xs text-muted-foreground/50">—</span>
          )}
        </TableCell>
        <TableCell>
          <div className="flex items-center gap-1">
            {canManage && (
              <Button 
                size="sm" 
                variant="ghost" 
                onClick={() => setShowNarrativeForm(true)}
                title={narrative ? "Edit explanation" : "Add explanation"}
              >
                <BookOpen className={cn("h-3 w-3", narrative ? "text-info" : "text-muted-foreground")} />
              </Button>
            )}
            {financial.status === "draft" && (
              <Button size="sm" variant="outline" onClick={() => setShowFinalize(true)}>
                <Lock className="h-3 w-3 mr-1" />
                Finalize
              </Button>
            )}
            {(financial.status === "finalized" || financial.status === "corrected") && isOverseer() && (
              <Button size="sm" variant="ghost" onClick={() => setShowCorrect(true)}>
                <Edit2 className="h-3 w-3 mr-1" />
                Correct
              </Button>
            )}
          </div>
        </TableCell>
      </TableRow>
      
      <FinalizeDialog 
        financial={financial} 
        isOpen={showFinalize} 
        onClose={() => setShowFinalize(false)} 
      />
      <CorrectionDialog 
        financial={financial} 
        isOpen={showCorrect} 
        onClose={() => setShowCorrect(false)} 
      />
      <FinancialNarrativeForm
        open={showNarrativeForm}
        onOpenChange={setShowNarrativeForm}
        periodId={financial.id}
        existingNarrative={narrative}
      />
    </>
  );
}

export function FinancialManagement() {
  const { financials, isLoading } = useMpcnFinancials();
  const { isOverseer } = useCapabilities();
  
  const draftCount = financials.filter(f => f.status === "draft").length;
  const finalizedCount = financials.filter(f => f.status === "finalized" || f.status === "corrected").length;
  
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
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Financial Period Management
          {draftCount > 0 && (
            <Badge variant="secondary" className="ml-2">
              {draftCount} draft
            </Badge>
          )}
        </CardTitle>
        <CardDescription>
          Finalize periods to lock values, or correct finalized periods with oversight approval
          {isOverseer() && (
            <span className="block mt-1 text-xs text-primary">
              As General Overseer, you can correct finalized periods
            </span>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {financials.length > 0 ? (
          <ScrollArea className="max-h-[500px]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Period</TableHead>
                  <TableHead className="text-right">Total Pool</TableHead>
                  <TableHead className="text-right">Total Profit</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Disclosure Notes</TableHead>
                  <TableHead className="w-[120px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {financials.map((financial) => (
                  <FinancialRow key={financial.id} financial={financial} />
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <FileText className="h-10 w-10 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No financial periods</p>
            <p className="text-xs">Create a financial period to get started</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
