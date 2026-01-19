import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  TrendingUp,
  Shield,
  Scale,
  BookOpen,
  Check,
  AlertTriangle,
  ChevronRight,
  ChevronLeft,
  Loader2,
} from "lucide-react";
import { useCreateTraderProfile } from "@/hooks/useTrading";
import { useAuth } from "@/contexts/AuthContext";

const STEPS = [
  { id: 1, title: "Introduction", icon: BookOpen },
  { id: 2, title: "Ethics Acknowledgement", icon: Scale },
  { id: 3, title: "Capital Protection", icon: Shield },
  { id: 4, title: "Risk Policy", icon: AlertTriangle },
];

export function TraderOnboardingWizard({ onComplete }: { onComplete?: () => void }) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [ethicsAcknowledged, setEthicsAcknowledged] = useState(false);
  const [capitalProtectionAcknowledged, setCapitalProtectionAcknowledged] = useState(false);
  const [lossPolicyAcknowledged, setLossPolicyAcknowledged] = useState(false);

  const createProfile = useCreateTraderProfile();

  const progress = (currentStep / STEPS.length) * 100;

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return true;
      case 2:
        return ethicsAcknowledged;
      case 3:
        return capitalProtectionAcknowledged;
      case 4:
        return lossPolicyAcknowledged;
      default:
        return false;
    }
  };

  const handleComplete = async () => {
    await createProfile.mutateAsync({
      ethics_acknowledged: ethicsAcknowledged,
      capital_protection_acknowledged: capitalProtectionAcknowledged,
      loss_policy_acknowledged: lossPolicyAcknowledged,
    });
    
    if (onComplete) {
      onComplete();
    } else {
      navigate("/trading");
    }
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Trader Onboarding
            </CardTitle>
            <CardDescription>
              Complete all steps to access the trading environment
            </CardDescription>
          </div>
          <Badge variant="secondary">
            Step {currentStep} of {STEPS.length}
          </Badge>
        </div>
        <Progress value={progress} className="mt-4" />
        
        {/* Step indicators */}
        <div className="flex justify-between mt-4">
          {STEPS.map((step) => {
            const Icon = step.icon;
            const isCompleted = step.id < currentStep;
            const isCurrent = step.id === currentStep;
            
            return (
              <div
                key={step.id}
                className={`flex flex-col items-center gap-1 ${
                  isCurrent ? "text-primary" : isCompleted ? "text-success" : "text-muted-foreground"
                }`}
              >
                <div
                  className={`h-8 w-8 rounded-full flex items-center justify-center ${
                    isCurrent
                      ? "bg-primary text-primary-foreground"
                      : isCompleted
                      ? "bg-success text-success-foreground"
                      : "bg-muted"
                  }`}
                >
                  {isCompleted ? <Check className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
                </div>
                <span className="text-xs hidden sm:inline">{step.title}</span>
              </div>
            );
          })}
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Step 1: Introduction */}
        {currentStep === 1 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Welcome to MPCN Trading</h3>
            <p className="text-muted-foreground">
              You are about to enter a professional trading environment designed for 
              <strong> discipline, transparency, and risk control</strong>.
            </p>
            
            <div className="grid gap-3 mt-4">
              <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                <Shield className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <p className="font-medium">No Direct Fund Custody</p>
                  <p className="text-sm text-muted-foreground">
                    Traders never have direct access to organization funds.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                <Scale className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <p className="font-medium">Risk-First Design</p>
                  <p className="text-sm text-muted-foreground">
                    Risk limits are always visible and enforced by the system.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                <BookOpen className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <p className="font-medium">Education + Performance</p>
                  <p className="text-sm text-muted-foreground">
                    Your growth is measured by discipline, not just profits.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="p-4 rounded-lg bg-warning/10 border border-warning/20">
              <p className="text-sm text-warning-foreground">
                <strong>Important:</strong> You will start as a <Badge variant="secondary">Trainee Trader</Badge> with 
                demo access only. Live trading is enabled after evaluation.
              </p>
            </div>
          </div>
        )}

        {/* Step 2: Ethics */}
        {currentStep === 2 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Trading Ethics Acknowledgement</h3>
            <p className="text-muted-foreground">
              As an MPCN trader, you commit to the following ethical standards:
            </p>
            
            <ul className="space-y-2 text-sm">
              <li className="flex items-start gap-2">
                <Check className="h-4 w-4 text-success mt-0.5" />
                <span>I will always use stop-losses on every trade</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="h-4 w-4 text-success mt-0.5" />
                <span>I will only trade with approved strategies</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="h-4 w-4 text-success mt-0.5" />
                <span>I will log all trades honestly and completely</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="h-4 w-4 text-success mt-0.5" />
                <span>I will not attempt to manipulate or circumvent risk controls</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="h-4 w-4 text-success mt-0.5" />
                <span>I understand that all my actions are logged and auditable</span>
              </li>
            </ul>
            
            <Separator />
            
            <div className="flex items-start gap-3">
              <Checkbox
                id="ethics"
                checked={ethicsAcknowledged}
                onCheckedChange={(checked) => setEthicsAcknowledged(!!checked)}
              />
              <Label htmlFor="ethics" className="text-sm leading-relaxed">
                I have read and agree to abide by the MPCN Trading Ethics Code. I understand 
                that violations may result in suspension or removal from the trading program.
              </Label>
            </div>
          </div>
        )}

        {/* Step 3: Capital Protection */}
        {currentStep === 3 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Capital Protection Rules</h3>
            <p className="text-muted-foreground">
              MPCN enforces strict capital protection to ensure long-term sustainability:
            </p>
            
            <div className="grid gap-3">
              <div className="p-3 rounded-lg border">
                <p className="font-medium">Maximum Risk Per Trade</p>
                <p className="text-sm text-muted-foreground">
                  You cannot risk more than your assigned percentage per trade (typically 1-2%).
                </p>
              </div>
              
              <div className="p-3 rounded-lg border">
                <p className="font-medium">Daily Loss Limit</p>
                <p className="text-sm text-muted-foreground">
                  Trading is automatically paused if you hit your daily loss limit (typically 3%).
                </p>
              </div>
              
              <div className="p-3 rounded-lg border">
                <p className="font-medium">Weekly Drawdown Limit</p>
                <p className="text-sm text-muted-foreground">
                  Hitting the weekly limit triggers a mandatory review (typically 6%).
                </p>
              </div>
            </div>
            
            <Separator />
            
            <div className="flex items-start gap-3">
              <Checkbox
                id="capital"
                checked={capitalProtectionAcknowledged}
                onCheckedChange={(checked) => setCapitalProtectionAcknowledged(!!checked)}
              />
              <Label htmlFor="capital" className="text-sm leading-relaxed">
                I understand that risk limits are set by MPCN and cannot be modified by traders. 
                I accept that exceeding these limits will trigger automatic account restrictions.
              </Label>
            </div>
          </div>
        )}

        {/* Step 4: Loss Policy */}
        {currentStep === 4 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Loss & Drawdown Policy</h3>
            <p className="text-muted-foreground">
              Understand how losses are handled in the MPCN trading program:
            </p>
            
            <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20">
              <h4 className="font-medium text-destructive mb-2">What Happens When You Hit Limits</h4>
              <ul className="space-y-1 text-sm">
                <li>• <strong>Daily Limit Hit:</strong> Trading paused until next day</li>
                <li>• <strong>Weekly Limit Hit:</strong> Mandatory review scheduled</li>
                <li>• <strong>Monthly Limit Hit:</strong> Capital reduction + retraining</li>
                <li>• <strong>Rule Violations:</strong> Immediate suspension pending review</li>
              </ul>
            </div>
            
            <div className="p-4 rounded-lg bg-info/10 border border-info/20">
              <h4 className="font-medium text-info mb-2">Recovery Path</h4>
              <p className="text-sm">
                Traders who hit limits are not terminated. A structured recovery program 
                is available, including additional training and gradual capital restoration.
              </p>
            </div>
            
            <Separator />
            
            <div className="flex items-start gap-3">
              <Checkbox
                id="loss"
                checked={lossPolicyAcknowledged}
                onCheckedChange={(checked) => setLossPolicyAcknowledged(!!checked)}
              />
              <Label htmlFor="loss" className="text-sm leading-relaxed">
                I accept the MPCN loss and drawdown policy. I understand that hitting 
                risk limits is part of trading and that MPCN prioritizes capital protection 
                over short-term performance.
              </Label>
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex justify-between pt-4">
          <Button
            variant="outline"
            onClick={() => setCurrentStep((s) => Math.max(1, s - 1))}
            disabled={currentStep === 1}
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back
          </Button>
          
          {currentStep < STEPS.length ? (
            <Button
              onClick={() => setCurrentStep((s) => s + 1)}
              disabled={!canProceed()}
            >
              Next
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          ) : (
            <Button
              onClick={handleComplete}
              disabled={!canProceed() || createProfile.isPending}
            >
              {createProfile.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Complete Onboarding
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
