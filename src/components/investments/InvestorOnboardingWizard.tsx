import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { 
  TrendingUp, 
  CheckCircle, 
  Shield, 
  Building, 
  User, 
  FileText,
  AlertTriangle,
  Copy,
  ArrowRight,
  ArrowLeft,
  Loader2,
  Wallet,
  Globe,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { InvestorType } from "@/hooks/useInvestorProfile";

const CURRENCIES = [
  { code: "USD", name: "US Dollar", symbol: "$" },
  { code: "EUR", name: "Euro", symbol: "€" },
  { code: "GBP", name: "British Pound", symbol: "£" },
  { code: "NGN", name: "Nigerian Naira", symbol: "₦" },
  { code: "KES", name: "Kenyan Shilling", symbol: "KSh" },
  { code: "GHS", name: "Ghanaian Cedi", symbol: "₵" },
  { code: "ZAR", name: "South African Rand", symbol: "R" },
];

const INVESTOR_TYPES: { value: InvestorType; label: string; description: string; icon: typeof TrendingUp }[] = [
  { 
    value: "financial", 
    label: "Financial Investor", 
    description: "Invest capital for financial returns",
    icon: Wallet,
  },
  { 
    value: "strategic", 
    label: "Strategic Investor", 
    description: "Invest tools, infrastructure, or networks",
    icon: Globe,
  },
  { 
    value: "employee_investor", 
    label: "Employee–Investor", 
    description: "Work in MPCN and also invest",
    icon: User,
  },
  { 
    value: "founding", 
    label: "Founding Investor", 
    description: "Early-stage backer with founding status",
    icon: Shield,
  },
];

interface OnboardingData {
  investorType: InvestorType;
  entityType: "individual" | "organization";
  organizationName?: string;
  currency: string;
  initialInvestmentIntent: string;
  acceptedRiskDisclosure: boolean;
  acceptedTerms: boolean;
  acceptedSeparation: boolean;
}

interface InvestorOnboardingWizardProps {
  onComplete: () => void;
  onSkip?: () => void;
}

export function InvestorOnboardingWizard({ onComplete, onSkip }: InvestorOnboardingWizardProps) {
  const { user, profile, role } = useAuth();
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [data, setData] = useState<OnboardingData>({
    investorType: role === "employee" || role === "team_lead" ? "employee_investor" : "financial",
    entityType: "individual",
    currency: "USD",
    initialInvestmentIntent: "",
    acceptedRiskDisclosure: false,
    acceptedTerms: false,
    acceptedSeparation: false,
  });

  const totalSteps = 4;
  const progress = (step / totalSteps) * 100;

  // Generate Investment ID (same as Employee ID for employees)
  const investorId = user?.id || "";
  const displayId = investorId.slice(0, 8).toUpperCase();
  const isEmployee = role === "employee" || role === "team_lead" || (role && role !== "general_overseer");

  const updateData = (updates: Partial<OnboardingData>) => {
    setData(prev => ({ ...prev, ...updates }));
  };

  const canProceed = (): boolean => {
    switch (step) {
      case 1:
        return !!data.investorType;
      case 2:
        return data.entityType === "individual" || !!data.organizationName?.trim();
      case 3:
        return !!data.currency;
      case 4:
        return data.acceptedRiskDisclosure && data.acceptedTerms && data.acceptedSeparation;
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (step < totalSteps) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleComplete = async () => {
    if (!user) return;

    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          is_investor: true,
          investor_type: data.investorType,
          investor_entity_type: data.entityType,
          investor_verification_status: "pending",
          currency_preference: data.currency,
          initial_investment: data.initialInvestmentIntent ? parseFloat(data.initialInvestmentIntent) : 0,
        })
        .eq("id", user.id);

      if (error) throw error;

      toast({
        title: "Welcome, Investor!",
        description: `Your Investor ID is ${displayId}. You can now access the Investments page.`,
      });

      onComplete();
    } catch (error: any) {
      toast({
        title: "Setup Failed",
        description: error.message || "Failed to complete investor setup",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyId = () => {
    navigator.clipboard.writeText(investorId);
    toast({ title: "Copied!", description: "Investor ID copied to clipboard" });
  };

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader className="text-center pb-2">
          <div className="mx-auto h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center mb-3">
            <TrendingUp className="h-7 w-7 text-primary" />
          </div>
          <CardTitle className="text-xl">Investor Onboarding</CardTitle>
          <CardDescription>
            Set up your investment profile in a few simple steps
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Progress */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Step {step} of {totalSteps}</span>
              <span>{Math.round(progress)}% complete</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          {/* Step Content */}
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-lg">Choose Your Investor Type</h3>
                <p className="text-sm text-muted-foreground">
                  This determines how your investments are categorized
                </p>
              </div>

              <RadioGroup
                value={data.investorType}
                onValueChange={(value) => updateData({ investorType: value as InvestorType })}
                className="grid gap-3"
              >
                {INVESTOR_TYPES.map((type) => {
                  const Icon = type.icon;
                  const isSelected = data.investorType === type.value;
                  return (
                    <label
                      key={type.value}
                      className={cn(
                        "flex items-start gap-4 p-4 rounded-lg border cursor-pointer transition-all",
                        isSelected 
                          ? "border-primary bg-primary/5 ring-1 ring-primary" 
                          : "border-border hover:bg-muted/50"
                      )}
                    >
                      <RadioGroupItem value={type.value} className="mt-1" />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <Icon className={cn("h-4 w-4", isSelected ? "text-primary" : "text-muted-foreground")} />
                          <span className="font-medium">{type.label}</span>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">{type.description}</p>
                      </div>
                    </label>
                  );
                })}
              </RadioGroup>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-lg">Account Details</h3>
                <p className="text-sm text-muted-foreground">
                  Are you investing as an individual or organization?
                </p>
              </div>

              <RadioGroup
                value={data.entityType}
                onValueChange={(value) => updateData({ entityType: value as "individual" | "organization" })}
                className="grid grid-cols-2 gap-3"
              >
                <label
                  className={cn(
                    "flex flex-col items-center gap-2 p-4 rounded-lg border cursor-pointer transition-all",
                    data.entityType === "individual"
                      ? "border-primary bg-primary/5"
                      : "border-border hover:bg-muted/50"
                  )}
                >
                  <User className="h-8 w-8 text-muted-foreground" />
                  <RadioGroupItem value="individual" className="sr-only" />
                  <span className="font-medium">Individual</span>
                </label>
                <label
                  className={cn(
                    "flex flex-col items-center gap-2 p-4 rounded-lg border cursor-pointer transition-all",
                    data.entityType === "organization"
                      ? "border-primary bg-primary/5"
                      : "border-border hover:bg-muted/50"
                  )}
                >
                  <Building className="h-8 w-8 text-muted-foreground" />
                  <RadioGroupItem value="organization" className="sr-only" />
                  <span className="font-medium">Organization</span>
                </label>
              </RadioGroup>

              {data.entityType === "organization" && (
                <div className="space-y-2">
                  <Label htmlFor="orgName">Organization Name</Label>
                  <Input
                    id="orgName"
                    placeholder="Enter organization name"
                    value={data.organizationName || ""}
                    onChange={(e) => updateData({ organizationName: e.target.value })}
                  />
                </div>
              )}

              {/* Investor ID Card */}
              <div className="p-4 rounded-lg bg-muted/50 border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wide">
                      Your {isEmployee ? "Employee / " : ""}Investor ID
                    </p>
                    <p className="font-mono text-xl font-bold text-primary">{displayId}</p>
                    {isEmployee && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Same as your Employee ID for unified tracking
                      </p>
                    )}
                  </div>
                  <Button variant="outline" size="sm" onClick={copyId}>
                    <Copy className="h-4 w-4 mr-2" />
                    Copy
                  </Button>
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-lg">Investment Preferences</h3>
                <p className="text-sm text-muted-foreground">
                  Set your currency and initial investment intent
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="currency">Preferred Currency</Label>
                <Select
                  value={data.currency}
                  onValueChange={(value) => updateData({ currency: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select currency" />
                  </SelectTrigger>
                  <SelectContent>
                    {CURRENCIES.map((currency) => (
                      <SelectItem key={currency.code} value={currency.code}>
                        {currency.symbol} {currency.code} – {currency.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="initialIntent">Initial Investment Intent (Optional)</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    {CURRENCIES.find(c => c.code === data.currency)?.symbol || "$"}
                  </span>
                  <Input
                    id="initialIntent"
                    type="number"
                    placeholder="0.00"
                    className="pl-8"
                    value={data.initialInvestmentIntent}
                    onChange={(e) => updateData({ initialInvestmentIntent: e.target.value })}
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  This is just an indication. Actual investments are made separately.
                </p>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-lg">Disclosures & Agreement</h3>
                <p className="text-sm text-muted-foreground">
                  Please review and accept the following
                </p>
              </div>

              <div className="space-y-3">
                {/* Risk Disclosure */}
                <div className="p-4 rounded-lg border bg-amber-500/5 border-amber-500/30">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5" />
                    <div className="flex-1">
                      <p className="font-medium text-sm">Investment Risk Notice</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Investments in MPCN involve risk. Returns are not guaranteed and may fluctuate 
                        based on market conditions, project performance, and operational factors. 
                        Past performance does not guarantee future results.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mt-3">
                    <Checkbox
                      id="riskDisclosure"
                      checked={data.acceptedRiskDisclosure}
                      onCheckedChange={(checked) => updateData({ acceptedRiskDisclosure: checked === true })}
                    />
                    <Label htmlFor="riskDisclosure" className="text-sm cursor-pointer">
                      I understand investment involves risk
                    </Label>
                  </div>
                </div>

                {/* Terms */}
                <div className="p-4 rounded-lg border">
                  <div className="flex items-start gap-3">
                    <FileText className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div className="flex-1">
                      <p className="font-medium text-sm">Transparency Policy</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        MPCN commits to displaying both profits and losses accurately. 
                        Investment reports reflect actual performance without manipulation.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mt-3">
                    <Checkbox
                      id="terms"
                      checked={data.acceptedTerms}
                      onCheckedChange={(checked) => updateData({ acceptedTerms: checked === true })}
                    />
                    <Label htmlFor="terms" className="text-sm cursor-pointer">
                      I accept the transparency policy
                    </Label>
                  </div>
                </div>

                {/* Separation */}
                {isEmployee && (
                  <div className="p-4 rounded-lg border">
                    <div className="flex items-start gap-3">
                      <Shield className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div className="flex-1">
                        <p className="font-medium text-sm">Role Separation</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Your employment and investment roles are separate. Work performance 
                          does not affect returns, and investment status does not affect employment.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mt-3">
                      <Checkbox
                        id="separation"
                        checked={data.acceptedSeparation}
                        onCheckedChange={(checked) => updateData({ acceptedSeparation: checked === true })}
                      />
                      <Label htmlFor="separation" className="text-sm cursor-pointer">
                        I understand role separation
                      </Label>
                    </div>
                  </div>
                )}

                {!isEmployee && (
                  <div className="p-4 rounded-lg border">
                    <div className="flex items-start gap-3">
                      <Shield className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div className="flex-1">
                        <p className="font-medium text-sm">No Operational Control</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Investment does not grant authority over employees, teams, or daily operations 
                          unless explicitly stated in a separate written agreement.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mt-3">
                      <Checkbox
                        id="separation"
                        checked={data.acceptedSeparation}
                        onCheckedChange={(checked) => updateData({ acceptedSeparation: checked === true })}
                      />
                      <Label htmlFor="separation" className="text-sm cursor-pointer">
                        I understand I have no operational control
                      </Label>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between pt-4 border-t">
            <div>
              {step > 1 ? (
                <Button variant="ghost" onClick={handleBack}>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
              ) : onSkip ? (
                <Button variant="ghost" onClick={onSkip}>
                  Skip for now
                </Button>
              ) : null}
            </div>

            {step < totalSteps ? (
              <Button onClick={handleNext} disabled={!canProceed()}>
                Continue
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            ) : (
              <Button 
                onClick={handleComplete} 
                disabled={!canProceed() || isSubmitting}
                className="bg-green-600 hover:bg-green-700"
              >
                {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                <CheckCircle className="h-4 w-4 mr-2" />
                Complete Setup
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}