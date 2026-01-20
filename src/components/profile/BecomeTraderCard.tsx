import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useCapabilities } from "@/hooks/useCapabilities";
import { CandlestickChart, CheckCircle, AlertTriangle, ArrowRight, Shield, Target, BookOpen } from "lucide-react";

export function BecomeTraderCard() {
  const { isTrader } = useCapabilities();
  const navigate = useNavigate();

  // Don't show if already a trader
  if (isTrader()) {
    return (
      <Card className="border-success/30 bg-success/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-success">
            <CheckCircle className="h-5 w-5" />
            Trader Status Active
          </CardTitle>
          <CardDescription>
            You have trader access. Visit the Trading page to manage your trades and view performance.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="outline" onClick={() => navigate("/trading")}>
            <CandlestickChart className="h-4 w-4 mr-2" />
            Open Trading Terminal
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-warning/30 bg-gradient-to-br from-warning/5 to-transparent">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CandlestickChart className="h-5 w-5 text-warning" />
          Become a Trader
        </CardTitle>
        <CardDescription>
          Join the MPCN trading desk. Start with demo trading and progress to live execution after evaluation.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3 text-sm">
          <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
            <BookOpen className="h-5 w-5 text-warning mt-0.5" />
            <div>
              <p className="font-medium">Structured Onboarding</p>
              <p className="text-muted-foreground">Complete trading school verification and ethics acknowledgment.</p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
            <Target className="h-5 w-5 text-success mt-0.5" />
            <div>
              <p className="font-medium">Demo-First Approach</p>
              <p className="text-muted-foreground">Practice with demo capital before accessing live trading.</p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
            <Shield className="h-5 w-5 text-primary mt-0.5" />
            <div>
              <p className="font-medium">Risk Management Built-In</p>
              <p className="text-muted-foreground">Mandatory stop-losses, position limits, and daily loss caps.</p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
            <AlertTriangle className="h-5 w-5 text-destructive mt-0.5" />
            <div>
              <p className="font-medium">Performance Accountability</p>
              <p className="text-muted-foreground">All trades are logged and reviewed. No direct fund custody.</p>
            </div>
          </div>
        </div>

        <Button 
          className="w-full bg-warning hover:bg-warning/90 text-warning-foreground font-semibold" 
          onClick={() => navigate("/trading")}
        >
          <CandlestickChart className="h-4 w-4 mr-2" />
          Start Trader Onboarding
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </CardContent>
    </Card>
  );
}
