/**
 * Authority-Level Confirmation Dialog
 * 
 * Implements increasing confirmation friction based on authority level:
 * - Worker actions: Minimal confirmation
 * - Team Lead actions: Confirmation + summary
 * - Administrator actions: Confirmation + impact preview
 * - General Overseer actions: Multi-step confirmation with explicit acknowledgment
 */

import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { AlertTriangle, Shield, Crown, CheckCircle2, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { getAuthorityTier } from "@/components/layout/AuthorityLayoutWrapper";
import type { AppRole } from "@/config/roleCapabilities";

interface AuthorityConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  role: AppRole | null;
  title: string;
  description: string;
  actionLabel?: string;
  cancelLabel?: string;
  variant?: "default" | "destructive" | "warning";
  impactSummary?: string[];
  requiresReason?: boolean;
  onConfirm: (reason?: string) => void | Promise<void>;
}

export function AuthorityConfirmDialog({
  open,
  onOpenChange,
  role,
  title,
  description,
  actionLabel = "Confirm",
  cancelLabel = "Cancel",
  variant = "default",
  impactSummary = [],
  requiresReason = false,
  onConfirm,
}: AuthorityConfirmDialogProps) {
  const [step, setStep] = useState(1);
  const [reason, setReason] = useState("");
  const [acknowledged, setAcknowledged] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const tier = getAuthorityTier(role);
  const totalSteps = tier === 0 ? 3 : tier === 1 ? 2 : 1;
  
  const handleConfirm = async () => {
    if (tier === 0 && step < 3) {
      setStep(step + 1);
      return;
    }
    
    if (tier === 1 && step < 2) {
      setStep(step + 1);
      return;
    }
    
    setIsLoading(true);
    try {
      await onConfirm(requiresReason || tier <= 1 ? reason : undefined);
    } finally {
      setIsLoading(false);
      setStep(1);
      setReason("");
      setAcknowledged(false);
    }
  };

  const handleCancel = () => {
    setStep(1);
    setReason("");
    setAcknowledged(false);
    onOpenChange(false);
  };

  const canProceed = () => {
    if (tier === 0) {
      if (step === 2 && !reason.trim()) return false;
      if (step === 3 && !acknowledged) return false;
    }
    if (tier === 1 && step === 2 && !reason.trim()) return false;
    if (requiresReason && !reason.trim()) return false;
    return true;
  };

  const getIcon = () => {
    if (tier === 0) return <Crown className="h-6 w-6 text-amber-600" />;
    if (tier === 1) return <Shield className="h-6 w-6 text-purple-600" />;
    if (variant === "destructive") return <AlertTriangle className="h-6 w-6 text-destructive" />;
    return <CheckCircle2 className="h-6 w-6 text-primary" />;
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <div className="flex items-center gap-3">
            {getIcon()}
            <AlertDialogTitle>{title}</AlertDialogTitle>
          </div>
          
          {/* Step indicator for multi-step confirmations */}
          {totalSteps > 1 && (
            <div className="flex items-center gap-2 mt-2">
              {Array.from({ length: totalSteps }).map((_, i) => (
                <div
                  key={i}
                  className={cn(
                    "h-1.5 flex-1 rounded-full transition-colors",
                    i < step ? "bg-primary" : "bg-muted"
                  )}
                />
              ))}
              <span className="text-xs text-muted-foreground ml-2">
                Step {step} of {totalSteps}
              </span>
            </div>
          )}
          
          <AlertDialogDescription className="pt-2">
            {description}
          </AlertDialogDescription>
        </AlertDialogHeader>

        {/* Step 1: Impact Summary (for Tier 0 & 1) */}
        {step === 1 && impactSummary.length > 0 && tier <= 1 && (
          <div className="bg-muted/50 rounded-lg p-3 space-y-2">
            <p className="text-sm font-medium">Impact Summary</p>
            <ul className="text-sm text-muted-foreground space-y-1">
              {impactSummary.map((impact, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  {impact}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Step 2: Reason Input (for Tier 0 & 1 when proceeding) */}
        {((tier === 0 && step === 2) || (tier === 1 && step === 2) || requiresReason) && (
          <div className="space-y-2">
            <Label htmlFor="reason" className="text-sm font-medium">
              Justification Required
            </Label>
            <Textarea
              id="reason"
              placeholder="Enter your reason for this action..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="min-h-[100px]"
            />
            <p className="text-xs text-muted-foreground">
              This justification will be permanently logged in the audit trail.
            </p>
          </div>
        )}

        {/* Step 3: Final Acknowledgment (Tier 0 only) */}
        {tier === 0 && step === 3 && (
          <div className="space-y-4">
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4">
              <p className="text-sm font-medium text-amber-700 dark:text-amber-400">
                Supreme Authority Action
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                As General Overseer, this action will be executed with full system authority.
                This cannot be undone and will be permanently recorded.
              </p>
            </div>
            
            <div className="flex items-start gap-3">
              <Checkbox
                id="acknowledge"
                checked={acknowledged}
                onCheckedChange={(checked) => setAcknowledged(checked === true)}
              />
              <Label 
                htmlFor="acknowledge" 
                className="text-sm leading-relaxed cursor-pointer"
              >
                I understand that this action carries full governance authority and I accept
                responsibility for its consequences. My justification has been recorded.
              </Label>
            </div>
          </div>
        )}

        <AlertDialogFooter>
          <AlertDialogCancel onClick={handleCancel} disabled={isLoading}>
            {cancelLabel}
          </AlertDialogCancel>
          <Button
            onClick={handleConfirm}
            disabled={!canProceed() || isLoading}
            variant={variant === "destructive" ? "destructive" : "default"}
            className={cn(
              tier === 0 && "bg-amber-600 hover:bg-amber-700 text-white",
              tier === 1 && "bg-purple-600 hover:bg-purple-700 text-white"
            )}
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {step < totalSteps ? "Continue" : actionLabel}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
