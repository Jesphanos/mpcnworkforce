import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
  Sparkles,
  PartyPopper,
} from "lucide-react";
import { useCreateTraderProfile } from "@/hooks/useTrading";
import { useAuth } from "@/contexts/AuthContext";
import { Celebration } from "@/components/ui/celebration";
import { cn } from "@/lib/utils";

const STEPS = [
  { id: 1, title: "Introduction", icon: BookOpen, description: "Welcome to MPCN Trading" },
  { id: 2, title: "Ethics", icon: Scale, description: "Trading ethics agreement" },
  { id: 3, title: "Capital", icon: Shield, description: "Capital protection rules" },
  { id: 4, title: "Risk Policy", icon: AlertTriangle, description: "Loss & drawdown policy" },
];

export function TraderOnboardingWizard({ onComplete }: { onComplete?: () => void }) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [ethicsAcknowledged, setEthicsAcknowledged] = useState(false);
  const [capitalProtectionAcknowledged, setCapitalProtectionAcknowledged] = useState(false);
  const [lossPolicyAcknowledged, setLossPolicyAcknowledged] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);

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
    
    setShowCelebration(true);
  };

  const handleCelebrationComplete = () => {
    setShowCelebration(false);
    if (onComplete) {
      onComplete();
    } else {
      navigate("/trading");
    }
  };

  return (
    <>
      <Celebration
        show={showCelebration}
        type="completion"
        title="Welcome to MPCN Trading!"
        message="You've completed onboarding. Your demo account is ready."
        onComplete={handleCelebrationComplete}
        duration={4000}
      />

      <Card className="max-w-2xl mx-auto overflow-hidden">
        <CardHeader className="bg-gradient-to-br from-primary/5 to-transparent pb-6">
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
            <Badge variant="secondary" className="text-sm">
              Step {currentStep} of {STEPS.length}
            </Badge>
          </div>

          {/* Animated Progress Bar */}
          <div className="mt-6 relative">
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-primary to-primary/80 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.5, ease: "easeOut" }}
              />
            </div>
          </div>
          
          {/* Enhanced Step indicators */}
          <div className="flex justify-between mt-6 relative">
            {/* Connection line */}
            <div className="absolute top-4 left-0 right-0 h-0.5 bg-muted -z-10" />
            
            {STEPS.map((step, index) => {
              const Icon = step.icon;
              const isCompleted = step.id < currentStep;
              const isCurrent = step.id === currentStep;
              
              return (
                <motion.div
                  key={step.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex flex-col items-center gap-2 relative"
                >
                  <motion.div
                    animate={isCurrent ? { scale: [1, 1.1, 1] } : {}}
                    transition={{ repeat: isCurrent ? Infinity : 0, duration: 2 }}
                    className={cn(
                      "h-10 w-10 rounded-full flex items-center justify-center border-2 transition-all duration-300",
                      isCurrent
                        ? "bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/30"
                        : isCompleted
                        ? "bg-success text-success-foreground border-success"
                        : "bg-muted text-muted-foreground border-muted"
                    )}
                  >
                    {isCompleted ? (
                      <motion.div
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ type: "spring", stiffness: 200 }}
                      >
                        <Check className="h-5 w-5" />
                      </motion.div>
                    ) : (
                      <Icon className="h-5 w-5" />
                    )}
                  </motion.div>
                  <div className="text-center">
                    <span className={cn(
                      "text-xs font-medium hidden sm:block",
                      isCurrent ? "text-primary" : isCompleted ? "text-success" : "text-muted-foreground"
                    )}>
                      {step.title}
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </CardHeader>

        <CardContent className="space-y-6 pt-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {/* Step 1: Introduction */}
              {currentStep === 1 && (
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-full bg-primary/10">
                      <Sparkles className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold">Welcome to MPCN Trading</h3>
                      <p className="text-sm text-muted-foreground">Your journey to disciplined trading starts here</p>
                    </div>
                  </div>
                  
                  <p className="text-muted-foreground">
                    You are about to enter a professional trading environment designed for 
                    <strong> discipline, transparency, and risk control</strong>.
                  </p>
                  
                  <div className="grid gap-3 mt-4">
                    {[
                      { icon: Shield, title: "No Direct Fund Custody", desc: "Traders never have direct access to organization funds." },
                      { icon: Scale, title: "Risk-First Design", desc: "Risk limits are always visible and enforced by the system." },
                      { icon: BookOpen, title: "Education + Performance", desc: "Your growth is measured by discipline, not just profits." },
                    ].map((item, i) => (
                      <motion.div
                        key={item.title}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 + i * 0.1 }}
                        className="flex items-start gap-3 p-4 rounded-lg bg-muted/50 border hover:border-primary/30 transition-colors"
                      >
                        <item.icon className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                        <div>
                          <p className="font-medium">{item.title}</p>
                          <p className="text-sm text-muted-foreground">{item.desc}</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                  
                  <div className="p-4 rounded-lg bg-warning/10 border border-warning/30">
                    <p className="text-sm">
                      <strong>Note:</strong> You will start as a <Badge variant="secondary">Trainee Trader</Badge> with 
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
                  
                  <ul className="space-y-3">
                    {[
                      "I will always use stop-losses on every trade",
                      "I will only trade with approved strategies",
                      "I will log all trades honestly and completely",
                      "I will not attempt to manipulate or circumvent risk controls",
                      "I understand that all my actions are logged and auditable",
                    ].map((text, i) => (
                      <motion.li
                        key={i}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="flex items-start gap-3 p-3 rounded-lg bg-muted/30"
                      >
                        <Check className="h-5 w-5 text-success mt-0.5 shrink-0" />
                        <span className="text-sm">{text}</span>
                      </motion.li>
                    ))}
                  </ul>
                  
                  <Separator />
                  
                  <motion.div 
                    className={cn(
                      "flex items-start gap-3 p-4 rounded-lg border-2 transition-colors",
                      ethicsAcknowledged ? "border-success bg-success/5" : "border-muted"
                    )}
                    whileTap={{ scale: 0.995 }}
                  >
                    <Checkbox
                      id="ethics"
                      checked={ethicsAcknowledged}
                      onCheckedChange={(checked) => setEthicsAcknowledged(!!checked)}
                      className="mt-0.5"
                    />
                    <Label htmlFor="ethics" className="text-sm leading-relaxed cursor-pointer">
                      I have read and agree to abide by the MPCN Trading Ethics Code. I understand 
                      that violations may result in suspension or removal from the trading program.
                    </Label>
                  </motion.div>
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
                    {[
                      { title: "Maximum Risk Per Trade", value: "1-2%", desc: "You cannot risk more than your assigned percentage per trade." },
                      { title: "Daily Loss Limit", value: "3%", desc: "Trading is automatically paused if you hit your daily loss limit." },
                      { title: "Weekly Drawdown Limit", value: "6%", desc: "Hitting the weekly limit triggers a mandatory review." },
                    ].map((item, i) => (
                      <motion.div
                        key={item.title}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="p-4 rounded-lg border hover:border-primary/30 transition-colors"
                      >
                        <div className="flex items-center justify-between mb-1">
                          <p className="font-medium">{item.title}</p>
                          <Badge variant="secondary">{item.value}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{item.desc}</p>
                      </motion.div>
                    ))}
                  </div>
                  
                  <Separator />
                  
                  <motion.div 
                    className={cn(
                      "flex items-start gap-3 p-4 rounded-lg border-2 transition-colors",
                      capitalProtectionAcknowledged ? "border-success bg-success/5" : "border-muted"
                    )}
                    whileTap={{ scale: 0.995 }}
                  >
                    <Checkbox
                      id="capital"
                      checked={capitalProtectionAcknowledged}
                      onCheckedChange={(checked) => setCapitalProtectionAcknowledged(!!checked)}
                      className="mt-0.5"
                    />
                    <Label htmlFor="capital" className="text-sm leading-relaxed cursor-pointer">
                      I understand that risk limits are set by MPCN and cannot be modified by traders. 
                      I accept that exceeding these limits will trigger automatic account restrictions.
                    </Label>
                  </motion.div>
                </div>
              )}

              {/* Step 4: Loss Policy */}
              {currentStep === 4 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Loss & Drawdown Policy</h3>
                  <p className="text-muted-foreground">
                    Understand how losses are handled in the MPCN trading program:
                  </p>
                  
                  <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/30">
                    <h4 className="font-medium text-destructive mb-3">What Happens When You Hit Limits</h4>
                    <ul className="space-y-2 text-sm">
                      {[
                        { label: "Daily Limit Hit", action: "Trading paused until next day" },
                        { label: "Weekly Limit Hit", action: "Mandatory review scheduled" },
                        { label: "Monthly Limit Hit", action: "Capital reduction + retraining" },
                        { label: "Rule Violations", action: "Immediate suspension pending review" },
                      ].map((item, i) => (
                        <motion.li
                          key={item.label}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: i * 0.1 }}
                          className="flex items-center gap-2"
                        >
                          <span className="text-destructive">•</span>
                          <strong>{item.label}:</strong> {item.action}
                        </motion.li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="p-4 rounded-lg bg-primary/10 border border-primary/30">
                    <h4 className="font-medium text-primary mb-2">Recovery Path</h4>
                    <p className="text-sm text-muted-foreground">
                      Traders who hit limits are not terminated. A structured recovery program 
                      is available, including additional training and gradual capital restoration.
                    </p>
                  </div>
                  
                  <Separator />
                  
                  <motion.div 
                    className={cn(
                      "flex items-start gap-3 p-4 rounded-lg border-2 transition-colors",
                      lossPolicyAcknowledged ? "border-success bg-success/5" : "border-muted"
                    )}
                    whileTap={{ scale: 0.995 }}
                  >
                    <Checkbox
                      id="loss"
                      checked={lossPolicyAcknowledged}
                      onCheckedChange={(checked) => setLossPolicyAcknowledged(!!checked)}
                      className="mt-0.5"
                    />
                    <Label htmlFor="loss" className="text-sm leading-relaxed cursor-pointer">
                      I accept the MPCN loss and drawdown policy. I understand that hitting 
                      risk limits is part of trading and that MPCN prioritizes capital protection 
                      over short-term performance.
                    </Label>
                  </motion.div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Navigation */}
          <div className="flex justify-between pt-4 border-t">
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
                className="min-w-[120px]"
              >
                Next
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            ) : (
              <Button
                onClick={handleComplete}
                disabled={!canProceed() || createProfile.isPending}
                className="min-w-[180px] bg-gradient-to-r from-success to-success/80 hover:from-success/90 hover:to-success/70"
              >
                {createProfile.isPending ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <PartyPopper className="h-4 w-4 mr-2" />
                )}
                Complete Onboarding
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </>
  );
}
