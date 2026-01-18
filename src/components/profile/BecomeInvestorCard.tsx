import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TrendingUp, CheckCircle, AlertTriangle, ArrowRight } from "lucide-react";

export function BecomeInvestorCard() {
  const { profile } = useAuth();
  const navigate = useNavigate();

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
        <CardContent>
          <Button variant="outline" onClick={() => navigate("/investor-profile")}>
            <TrendingUp className="h-4 w-4 mr-2" />
            View Investor Profile
          </Button>
        </CardContent>
      </Card>
    );
  }

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

        <Button className="w-full" onClick={() => navigate("/investor-profile")}>
          <TrendingUp className="h-4 w-4 mr-2" />
          Start Investor Onboarding
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </CardContent>
    </Card>
  );
}