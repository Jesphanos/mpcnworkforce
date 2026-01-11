import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useFinancialNarrativeForPeriod } from "@/hooks/useFinancialNarratives";
import { useCapabilities } from "@/hooks/useCapabilities";
import { 
  BookOpen, 
  TrendingUp, 
  TrendingDown, 
  Settings2, 
  Users, 
  ArrowRight,
  Edit,
} from "lucide-react";

interface FinancialNarrativeCardProps {
  periodId: string;
  onEdit?: () => void;
}

/**
 * Financial Narrative Card
 * Displays human-readable explanation for a financial period
 */
export function FinancialNarrativeCard({ periodId, onEdit }: FinancialNarrativeCardProps) {
  const { data: narrative, isLoading } = useFinancialNarrativeForPeriod(periodId);
  const { can } = useCapabilities();
  const canManage = can("canManageFinancials");

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-4 w-60" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-24" />
        </CardContent>
      </Card>
    );
  }

  if (!narrative) {
    return (
      <Card className="border-dashed">
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            Period Explanation
          </CardTitle>
          <CardDescription>
            No explanation available for this period
          </CardDescription>
        </CardHeader>
        {canManage && onEdit && (
          <CardContent>
            <Button variant="outline" size="sm" onClick={onEdit}>
              <Edit className="h-4 w-4 mr-2" />
              Add Explanation
            </Button>
          </CardContent>
        )}
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-info" />
            Why This Changed
          </CardTitle>
          {canManage && onEdit && (
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onEdit}>
              <Edit className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Period Summary */}
        <p className="text-sm">{narrative.period_summary}</p>

        {/* Positive Drivers */}
        {narrative.primary_drivers.length > 0 && (
          <div className="space-y-1.5">
            <p className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
              <TrendingUp className="h-3.5 w-3.5 text-success" />
              What Helped
            </p>
            <div className="flex flex-wrap gap-1.5">
              {narrative.primary_drivers.map((driver, i) => (
                <Badge key={i} variant="secondary" className="bg-success/10 text-success text-xs">
                  {driver}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Negative Drivers */}
        {narrative.negative_drivers && narrative.negative_drivers.length > 0 && (
          <div className="space-y-1.5">
            <p className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
              <TrendingDown className="h-3.5 w-3.5 text-destructive" />
              What Hurt
            </p>
            <div className="flex flex-wrap gap-1.5">
              {narrative.negative_drivers.map((driver, i) => (
                <Badge key={i} variant="secondary" className="bg-destructive/10 text-destructive text-xs">
                  {driver}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Adjustment Notes */}
        {narrative.adjustment_notes && (
          <div className="space-y-1.5">
            <p className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
              <Settings2 className="h-3.5 w-3.5" />
              Adjustments Made
            </p>
            <p className="text-xs text-muted-foreground">{narrative.adjustment_notes}</p>
          </div>
        )}

        {/* Workforce Impact */}
        {narrative.workforce_impact && (
          <div className="space-y-1.5">
            <p className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
              <Users className="h-3.5 w-3.5" />
              Impact on Workforce
            </p>
            <p className="text-xs text-muted-foreground">{narrative.workforce_impact}</p>
          </div>
        )}

        {/* Next Period Outlook */}
        {narrative.next_period_outlook && (
          <div className="pt-2 border-t">
            <p className="text-xs font-medium text-muted-foreground flex items-center gap-1.5 mb-1">
              <ArrowRight className="h-3.5 w-3.5" />
              What We're Changing Next
            </p>
            <p className="text-xs">{narrative.next_period_outlook}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
