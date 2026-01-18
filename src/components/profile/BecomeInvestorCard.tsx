import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { TrendingUp, Loader2, CheckCircle, AlertTriangle } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export function BecomeInvestorCard() {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  // Don't show if already an investor
  if (profile?.is_investor) {
    return (
      <Card className="border-green-500/30 bg-green-500/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-600">
            <CheckCircle className="h-5 w-5" />
            Investor Status Active
          </CardTitle>
          <CardDescription>
            You have investor access. Visit the Investments page to manage your portfolio.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const handleBecomeInvestor = async () => {
    if (!user || !acceptedTerms) return;

    setIsLoading(true);
    
    const { error } = await supabase
      .from("profiles")
      .update({
        is_investor: true,
        investor_type: "employee_investor",
        investor_verification_status: "pending",
      })
      .eq("id", user.id);

    setIsLoading(false);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to update investor status. Please try again.",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Investor Status Activated!",
        description: "You now have access to the Investments page.",
      });
      // Refresh the page to update the profile context
      window.location.reload();
    }
  };

  return (
    <Card className="border-primary/30">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-green-600" />
          Become an Investor
        </CardTitle>
        <CardDescription>
          Invest in MPCN alongside your employee role. Your investment and work data remain completely separate.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3 text-sm">
          <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
            <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
            <div>
              <p className="font-medium">Transparent Performance</p>
              <p className="text-muted-foreground">View MPCN global performance, profits, and losses honestly.</p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
            <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
            <div>
              <p className="font-medium">Separate Dashboards</p>
              <p className="text-muted-foreground">Your salary and investment returns never mix.</p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
            <AlertTriangle className="h-5 w-5 text-amber-500 mt-0.5" />
            <div>
              <p className="font-medium">Investment Risk</p>
              <p className="text-muted-foreground">Returns are not guaranteed. Both profits and losses are displayed.</p>
            </div>
          </div>
        </div>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button className="w-full" variant="default">
              <TrendingUp className="h-4 w-4 mr-2" />
              Become an Investor
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Activate Investor Status</AlertDialogTitle>
              <AlertDialogDescription asChild>
                <div className="space-y-4">
                  <p>
                    By becoming an investor, you'll gain access to the Investments page where you can:
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    <li>View and manage your investments</li>
                    <li>Track returns and performance</li>
                    <li>Request withdrawals</li>
                    <li>See MPCN global financial health</li>
                  </ul>
                  
                  <div className="bg-amber-500/10 border border-amber-500/30 p-3 rounded-lg">
                    <p className="text-sm text-amber-700 dark:text-amber-400">
                      <strong>Important:</strong> Investment involves risk. Returns are not guaranteed and you may lose part or all of your investment.
                    </p>
                  </div>

                  <div className="flex items-start gap-3 pt-2">
                    <Checkbox
                      id="terms"
                      checked={acceptedTerms}
                      onCheckedChange={(checked) => setAcceptedTerms(checked === true)}
                    />
                    <Label htmlFor="terms" className="text-sm cursor-pointer">
                      I understand that investment involves risk and that my employment status is separate from my investor status.
                    </Label>
                  </div>
                </div>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setAcceptedTerms(false)}>
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleBecomeInvestor}
                disabled={!acceptedTerms || isLoading}
              >
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Confirm & Activate
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardContent>
    </Card>
  );
}