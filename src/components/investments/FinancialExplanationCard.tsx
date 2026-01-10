/**
 * Financial Explanation Card
 * 
 * Provides contextual explanation for financial data.
 * Answers "Why this changed" for every financial chart/period.
 * 
 * This is critical for:
 * - Investor trust
 * - Worker legitimacy
 * - Regulatory defensibility
 */
import { Info, TrendingUp, TrendingDown, Minus, AlertCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

export interface FinancialDriver {
  label: string;
  impact: "positive" | "negative" | "neutral";
  description?: string;
}

export interface FinancialExplanationProps {
  /** Period summary (e.g., "Q4 2024" or "January 2025") */
  periodLabel: string;
  /** Short explanation of the period */
  periodSummary: string;
  /** Primary drivers of change */
  drivers?: FinancialDriver[];
  /** Optional adjustment notes */
  adjustmentNotes?: string;
  /** Optional disclosure notes (for investors) */
  disclosureNotes?: string;
  /** Show in compact mode */
  compact?: boolean;
  className?: string;
}

export function FinancialExplanationCard({
  periodLabel,
  periodSummary,
  drivers = [],
  adjustmentNotes,
  disclosureNotes,
  compact = false,
  className,
}: FinancialExplanationProps) {
  const impactIcons = {
    positive: TrendingUp,
    negative: TrendingDown,
    neutral: Minus,
  };

  const impactColors = {
    positive: "text-success",
    negative: "text-destructive",
    neutral: "text-muted-foreground",
  };

  if (compact) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className={cn("flex items-center gap-2 text-sm text-muted-foreground cursor-help", className)}>
              <Info className="h-4 w-4" />
              <span>{periodSummary}</span>
            </div>
          </TooltipTrigger>
          <TooltipContent className="max-w-xs">
            <div className="space-y-2">
              <p className="font-medium">{periodLabel}</p>
              <p className="text-xs">{periodSummary}</p>
              {drivers.length > 0 && (
                <div className="space-y-1">
                  <p className="text-xs font-medium">Key factors:</p>
                  {drivers.map((driver, i) => (
                    <div key={i} className="flex items-center gap-1 text-xs">
                      {impactIcons[driver.impact] && (
                        <span className={impactColors[driver.impact]}>•</span>
                      )}
                      <span>{driver.label}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <Card className={cn("bg-muted/30 border-dashed", className)}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Info className="h-4 w-4 text-info" />
            Why This Changed
          </CardTitle>
          <Badge variant="outline" className="text-xs">
            {periodLabel}
          </Badge>
        </div>
        <CardDescription className="text-sm">
          {periodSummary}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Primary Drivers */}
        {drivers.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Key Factors
            </p>
            <div className="space-y-1">
              {drivers.map((driver, index) => {
                const ImpactIcon = impactIcons[driver.impact];
                return (
                  <div
                    key={index}
                    className="flex items-start gap-2 text-sm"
                  >
                    <ImpactIcon
                      className={cn(
                        "h-4 w-4 mt-0.5 shrink-0",
                        impactColors[driver.impact]
                      )}
                    />
                    <div>
                      <span className="font-medium">{driver.label}</span>
                      {driver.description && (
                        <p className="text-xs text-muted-foreground">
                          {driver.description}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Adjustment Notes */}
        {adjustmentNotes && (
          <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Adjustments
            </p>
            <div className="flex items-start gap-2 text-sm bg-warning/10 p-2 rounded-md">
              <AlertCircle className="h-4 w-4 text-warning mt-0.5 shrink-0" />
              <span>{adjustmentNotes}</span>
            </div>
          </div>
        )}

        {/* Disclosure Notes */}
        {disclosureNotes && (
          <div className="space-y-1 pt-2 border-t border-dashed">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Investor Disclosure
            </p>
            <p className="text-sm text-muted-foreground italic">
              {disclosureNotes}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

/**
 * Generate explanation from financial period data
 */
export function generateFinancialExplanation(
  current: { total_pool: number; total_profit: number; notes?: string | null },
  previous?: { total_pool: number; total_profit: number } | null
): { summary: string; drivers: FinancialDriver[] } {
  const drivers: FinancialDriver[] = [];
  let summary = "Financial period recorded.";

  if (previous) {
    const poolChange = current.total_pool - previous.total_pool;
    const profitChange = current.total_profit - previous.total_profit;
    const poolChangePercent = previous.total_pool > 0 
      ? ((poolChange / previous.total_pool) * 100).toFixed(1)
      : "N/A";
    const profitChangePercent = previous.total_profit > 0
      ? ((profitChange / previous.total_profit) * 100).toFixed(1)
      : "N/A";

    if (poolChange !== 0) {
      drivers.push({
        label: `Pool ${poolChange > 0 ? "increased" : "decreased"} by ${poolChangePercent}%`,
        impact: poolChange > 0 ? "positive" : "negative",
        description: `$${Math.abs(poolChange).toLocaleString()} ${poolChange > 0 ? "added" : "removed"}`,
      });
    }

    if (profitChange !== 0) {
      drivers.push({
        label: `Profit ${profitChange > 0 ? "increased" : "decreased"} by ${profitChangePercent}%`,
        impact: profitChange > 0 ? "positive" : "negative",
        description: `$${Math.abs(profitChange).toLocaleString()} ${profitChange > 0 ? "gain" : "loss"}`,
      });
    }

    if (poolChange > 0 && profitChange > 0) {
      summary = "Strong performance with growth in both pool and profit.";
    } else if (poolChange > 0 && profitChange <= 0) {
      summary = "Pool expanded but profit margins contracted.";
    } else if (poolChange <= 0 && profitChange > 0) {
      summary = "Improved profitability despite pool contraction.";
    } else if (poolChange < 0 && profitChange < 0) {
      summary = "Challenging period with contractions in both metrics.";
    } else {
      summary = "Stable period with minimal changes.";
    }
  }

  if (current.notes) {
    drivers.push({
      label: "Additional context provided",
      impact: "neutral",
      description: current.notes,
    });
  }

  return { summary, drivers };
}
