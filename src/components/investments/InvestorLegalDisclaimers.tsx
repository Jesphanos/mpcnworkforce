import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { 
  AlertTriangle, 
  Scale, 
  ShieldAlert, 
  Users, 
  Wallet,
  Info,
} from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Investment Notice - General Disclaimer
 * Shows investment risk warning
 */
export function InvestmentNotice({ className }: { className?: string }) {
  return (
    <Alert variant="default" className={cn("border-warning/50 bg-warning/10", className)}>
      <AlertTriangle className="h-4 w-4 text-warning" />
      <AlertTitle className="text-warning">Investment Notice</AlertTitle>
      <AlertDescription className="text-muted-foreground">
        Investments in MPCN involve risk. Returns are not guaranteed and may fluctuate based on 
        market conditions, project performance, and operational factors. Past performance does not 
        guarantee future results.
      </AlertDescription>
    </Alert>
  );
}

/**
 * Profit & Loss Transparency Clause
 */
export function TransparencyClause({ className }: { className?: string }) {
  return (
    <Alert variant="default" className={cn("border-primary/50 bg-primary/10", className)}>
      <Scale className="h-4 w-4 text-primary" />
      <AlertTitle>Transparency Policy</AlertTitle>
      <AlertDescription className="text-muted-foreground">
        MPCN commits to displaying both profits and losses accurately. Investors acknowledge 
        that losses are possible and that all investment reports reflect actual performance 
        without manipulation.
      </AlertDescription>
    </Alert>
  );
}

/**
 * No-Control Clause - Investment != Governance
 */
export function NoControlClause({ className }: { className?: string }) {
  return (
    <Alert variant="default" className={cn("border-info/50 bg-info/10", className)}>
      <ShieldAlert className="h-4 w-4 text-info" />
      <AlertTitle>Governance Clarification</AlertTitle>
      <AlertDescription className="text-muted-foreground">
        Investment in MPCN does not grant direct authority over employees, teams, or daily 
        operations unless explicitly stated in a separate written agreement.
      </AlertDescription>
    </Alert>
  );
}

/**
 * Employee-Investor Conflict Clause
 */
export function ConflictOfInterestClause({ className }: { className?: string }) {
  return (
    <Alert variant="default" className={cn("border-secondary/50 bg-secondary/10", className)}>
      <Users className="h-4 w-4 text-secondary-foreground" />
      <AlertTitle>Conflict of Interest Statement</AlertTitle>
      <AlertDescription className="text-muted-foreground">
        Employee–Investors operate under separated roles. Employment performance, reviews, or 
        disciplinary actions do not influence investment outcomes, and investment status does 
        not influence employment decisions.
      </AlertDescription>
    </Alert>
  );
}

/**
 * Withdrawal Clause
 */
export function WithdrawalClause({ className }: { className?: string }) {
  return (
    <Alert variant="default" className={cn("border-muted/50 bg-muted/50", className)}>
      <Wallet className="h-4 w-4 text-muted-foreground" />
      <AlertTitle>Withdrawals</AlertTitle>
      <AlertDescription className="text-muted-foreground">
        Withdrawals are subject to holding periods, available balances, and internal approval 
        processes. Only realized and available profits may be withdrawn.
      </AlertDescription>
    </Alert>
  );
}

/**
 * Compact disclaimer banner for headers
 */
export function InvestorDisclaimerBanner({ className }: { className?: string }) {
  return (
    <div className={cn(
      "flex items-center gap-2 px-4 py-2 rounded-lg bg-warning/10 border border-warning/20 text-sm",
      className
    )}>
      <Info className="h-4 w-4 text-warning shrink-0" />
      <span className="text-muted-foreground">
        <strong className="text-warning">Investment involves risk.</strong>{" "}
        Returns are not guaranteed. Investment ≠ operational control.
      </span>
    </div>
  );
}

/**
 * Full legal disclaimers card for investor dashboard
 */
export function InvestorLegalCard({ className }: { className?: string }) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Scale className="h-5 w-5" />
          Legal & Governance Notices
        </CardTitle>
        <CardDescription>
          Important information about your investment relationship with MPCN
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <InvestmentNotice />
        <TransparencyClause />
        <NoControlClause />
        <ConflictOfInterestClause />
        <WithdrawalClause />
      </CardContent>
    </Card>
  );
}
