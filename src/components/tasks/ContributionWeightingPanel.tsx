import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Skeleton } from "@/components/ui/skeleton";
import { useTaskContributions, useCreateContributions, useVerifyContribution, calculateWeightedEarnings } from "@/hooks/useTaskContributions";
import { useCapabilities } from "@/hooks/useCapabilities";
import { Users, CheckCircle, Plus, DollarSign } from "lucide-react";

interface ContributionWeightingPanelProps {
  taskId: string;
  collaborators: string[];
  totalEarnings: number;
  isShared: boolean;
}

/**
 * Contribution Weighting Panel
 * For managing contribution weights in shared tasks
 */
export function ContributionWeightingPanel({
  taskId,
  collaborators,
  totalEarnings,
  isShared,
}: ContributionWeightingPanelProps) {
  const { data: contributions, isLoading } = useTaskContributions(taskId);
  const createContributions = useCreateContributions();
  const verifyContribution = useVerifyContribution();
  const { can } = useCapabilities();
  const canManage = can("canApproveTasks");

  const [newWeights, setNewWeights] = useState<Record<string, number>>({});

  if (!isShared || collaborators.length === 0) {
    return null;
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-40" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-32" />
        </CardContent>
      </Card>
    );
  }

  const hasContributions = contributions && contributions.length > 0;
  const weightedEarnings = hasContributions
    ? calculateWeightedEarnings(totalEarnings, contributions)
    : [];

  const handleSaveWeights = async () => {
    const contributionInputs = collaborators.map((userId) => ({
      task_id: taskId,
      user_id: userId,
      contribution_weight: newWeights[userId] || 1.0,
    }));
    await createContributions.mutateAsync(contributionInputs);
    setNewWeights({});
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <Users className="h-4 w-4" />
          Contribution Weighting
        </CardTitle>
        <CardDescription>
          {hasContributions
            ? "Individual contributions for this shared task"
            : "Define how earnings are split among contributors"}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {hasContributions ? (
          <>
            {/* Display existing contributions */}
            <div className="space-y-3">
              {contributions.map((contribution) => {
                const earning = weightedEarnings.find((e) => e.userId === contribution.user_id);
                return (
                  <div
                    key={contribution.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium">
                        {Math.round(contribution.contribution_weight * 100)}%
                      </div>
                      <div>
                        <p className="text-sm font-medium">
                          Contributor
                          {contribution.verified_at && (
                            <CheckCircle className="h-3.5 w-3.5 text-success inline ml-1.5" />
                          )}
                        </p>
                        {contribution.contribution_notes && (
                          <p className="text-xs text-muted-foreground">
                            {contribution.contribution_notes}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium flex items-center gap-1">
                        <DollarSign className="h-3.5 w-3.5" />
                        {earning?.amount.toFixed(2) || "0.00"}
                      </p>
                      {!contribution.verified_at && canManage && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 text-xs"
                          onClick={() => verifyContribution.mutate(contribution.id)}
                        >
                          Verify
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="pt-2 border-t">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Total Earnings</span>
                <span className="font-medium">${totalEarnings.toFixed(2)}</span>
              </div>
            </div>
          </>
        ) : canManage ? (
          <>
            {/* Weight assignment form */}
            <div className="space-y-4">
              {collaborators.map((userId, index) => (
                <div key={userId} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs">Contributor {index + 1}</Label>
                    <Badge variant="outline">
                      {Math.round((newWeights[userId] || 1) * 100)}%
                    </Badge>
                  </div>
                  <Slider
                    value={[(newWeights[userId] || 1) * 100]}
                    onValueChange={([value]) =>
                      setNewWeights({ ...newWeights, [userId]: value / 100 })
                    }
                    max={100}
                    min={0}
                    step={5}
                    className="w-full"
                  />
                </div>
              ))}
            </div>

            <Button
              onClick={handleSaveWeights}
              disabled={createContributions.isPending}
              className="w-full"
            >
              <Plus className="h-4 w-4 mr-2" />
              {createContributions.isPending ? "Saving..." : "Save Contributions"}
            </Button>
          </>
        ) : (
          <p className="text-sm text-muted-foreground text-center py-4">
            Contributions not yet assigned
          </p>
        )}
      </CardContent>
    </Card>
  );
}
