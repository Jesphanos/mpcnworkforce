import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  useInvestorProfile, 
  useInvestorSummary,
  useInvestorAuditLog,
  type InvestorType,
} from "@/hooks/useInvestorProfile";
import { InvestorOnboardingWizard } from "@/components/investments/InvestorOnboardingWizard";
import { InvestorLegalCard } from "@/components/investments/InvestorLegalDisclaimers";
import { InvestorAuditLogPanel } from "@/components/investments/InvestorAuditLogPanel";
import {
  TrendingUp,
  Copy,
  CheckCircle,
  Clock,
  XCircle,
  Shield,
  Building,
  User,
  Settings,
  FileText,
  Loader2,
  Wallet,
  ArrowDownUp,
  Briefcase,
} from "lucide-react";
import { cn } from "@/lib/utils";

const investorTypeLabels: Record<InvestorType, { label: string; color: string; icon: typeof TrendingUp }> = {
  financial: { label: "Financial Investor", color: "bg-success/10 text-success border-success/20", icon: Wallet },
  strategic: { label: "Strategic Investor", color: "bg-info/10 text-info border-info/20", icon: TrendingUp },
  employee_investor: { label: "Employee–Investor", color: "bg-primary/10 text-primary border-primary/20", icon: Briefcase },
  founding: { label: "Founding Investor", color: "bg-warning/10 text-warning border-warning/20", icon: Shield },
};

const CURRENCIES = [
  { code: "USD", name: "US Dollar", symbol: "$" },
  { code: "EUR", name: "Euro", symbol: "€" },
  { code: "GBP", name: "British Pound", symbol: "£" },
  { code: "NGN", name: "Nigerian Naira", symbol: "₦" },
  { code: "KES", name: "Kenyan Shilling", symbol: "KSh" },
  { code: "GHS", name: "Ghanaian Cedi", symbol: "₵" },
  { code: "ZAR", name: "South African Rand", symbol: "R" },
];

export default function InvestorProfile() {
  const { user, role } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { data: profile, isLoading: profileLoading, refetch: refetchProfile } = useInvestorProfile();
  const { data: summary, isLoading: summaryLoading } = useInvestorSummary();
  const [isUpdating, setIsUpdating] = useState(false);

  const isEmployee = role === "employee" || role === "team_lead";

  const getInitials = (name: string | null) => {
    if (!name) return "I";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const copyId = () => {
    if (user?.id) {
      navigator.clipboard.writeText(user.id);
      toast({ title: "Copied!", description: "Investor ID copied to clipboard" });
    }
  };

  const handleCurrencyChange = async (currency: string) => {
    if (!user) return;
    setIsUpdating(true);
    
    const { error } = await supabase
      .from("profiles")
      .update({ currency_preference: currency })
      .eq("id", user.id);
    
    setIsUpdating(false);
    
    if (error) {
      toast({ title: "Error", description: "Failed to update currency", variant: "destructive" });
    } else {
      toast({ title: "Updated", description: "Currency preference saved" });
      refetchProfile();
    }
  };

  const handleOnboardingComplete = () => {
    refetchProfile();
    window.location.reload();
  };

  if (profileLoading) {
    return (
      <DashboardLayout>
        <div className="max-w-4xl mx-auto space-y-6">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-64 w-full" />
        </div>
      </DashboardLayout>
    );
  }

  // Show onboarding wizard if not yet an investor
  if (!profile?.is_investor) {
    return (
      <DashboardLayout>
        <div className="py-8">
          <InvestorOnboardingWizard 
            onComplete={handleOnboardingComplete}
            onSkip={() => navigate("/dashboard")}
          />
        </div>
      </DashboardLayout>
    );
  }

  const investorType = profile.investor_type ? investorTypeLabels[profile.investor_type] : null;
  const TypeIcon = investorType?.icon || TrendingUp;
  const displayId = user?.id?.slice(0, 8).toUpperCase() || "--------";
  const isOrganization = profile.investor_entity_type === "organization";

  const verificationStatus = profile.investor_verification_status;
  const VerificationIcon = verificationStatus === "verified" ? CheckCircle 
    : verificationStatus === "rejected" ? XCircle 
    : Clock;
  const verificationColor = verificationStatus === "verified" ? "text-success" 
    : verificationStatus === "rejected" ? "text-destructive" 
    : "text-warning";

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Investor Profile</h1>
          <p className="text-muted-foreground">Manage your investment identity and preferences</p>
        </div>

        {/* Profile Header Card */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row md:items-center gap-6">
              <Avatar className="h-20 w-20">
                <AvatarFallback className="bg-primary text-primary-foreground text-2xl">
                  {getInitials(profile.full_name)}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1 space-y-2">
                <div className="flex flex-wrap items-center gap-3">
                  <h2 className="text-xl font-semibold">{profile.full_name || "Investor"}</h2>
                  {investorType && (
                    <Badge variant="outline" className={investorType.color}>
                      <TypeIcon className="h-3 w-3 mr-1" />
                      {investorType.label}
                    </Badge>
                  )}
                  <Badge variant="outline" className={cn("flex items-center gap-1", verificationColor)}>
                    <VerificationIcon className="h-3 w-3" />
                    <span className="capitalize">{verificationStatus || "pending"}</span>
                  </Badge>
                </div>
                
                <div className="flex items-center gap-2 text-muted-foreground">
                  {isOrganization ? <Building className="h-4 w-4" /> : <User className="h-4 w-4" />}
                  <span className="capitalize">{profile.investor_entity_type || "Individual"} Account</span>
                </div>

                {isEmployee && (
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <Briefcase className="h-3 w-3" />
                    Also active as Employee in MPCN
                  </p>
                )}
              </div>

              <Button variant="outline" onClick={() => navigate("/investments")}>
                <TrendingUp className="h-4 w-4 mr-2" />
                View Investments
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Investor ID Card */}
        <Card className="border-primary/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Shield className="h-5 w-5 text-primary" />
              Investor ID
            </CardTitle>
            <CardDescription>
              Your unique identifier for all investment tracking
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50 border">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">
                  {isEmployee ? "Employee / Investor ID" : "Investor ID"}
                </p>
                <p className="font-mono text-2xl font-bold text-primary">{displayId}</p>
                {isEmployee && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Unified ID for both workforce and investment tracking
                  </p>
                )}
              </div>
              <Button variant="outline" size="sm" onClick={copyId}>
                <Copy className="h-4 w-4 mr-2" />
                Copy Full ID
              </Button>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="summary" className="space-y-4">
          <TabsList>
            <TabsTrigger value="summary">Summary</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
            <TabsTrigger value="audit">Activity Log</TabsTrigger>
            <TabsTrigger value="legal">Legal</TabsTrigger>
          </TabsList>

          <TabsContent value="summary" className="space-y-4">
            {/* Financial Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wallet className="h-5 w-5" />
                  Investment Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                {summaryLoading ? (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[...Array(4)].map((_, i) => (
                      <Skeleton key={i} className="h-20" />
                    ))}
                  </div>
                ) : summary ? (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="p-4 rounded-lg bg-muted/50 text-center">
                      <p className="text-xs text-muted-foreground">Total Invested</p>
                      <p className="text-xl font-bold">${summary.totalInvested.toLocaleString()}</p>
                    </div>
                    <div className="p-4 rounded-lg bg-muted/50 text-center">
                      <p className="text-xs text-muted-foreground">Current Value</p>
                      <p className="text-xl font-bold">${summary.currentValue.toLocaleString()}</p>
                    </div>
                    <div className="p-4 rounded-lg bg-muted/50 text-center">
                      <p className="text-xs text-muted-foreground">Net Gain/Loss</p>
                      <p className={cn(
                        "text-xl font-bold",
                        summary.netGainLoss >= 0 ? "text-success" : "text-destructive"
                      )}>
                        {summary.netGainLoss >= 0 ? "+" : ""}${summary.netGainLoss.toLocaleString()}
                      </p>
                    </div>
                    <div className="p-4 rounded-lg bg-muted/50 text-center">
                      <p className="text-xs text-muted-foreground">ROI</p>
                      <p className={cn(
                        "text-xl font-bold",
                        summary.roiPercent >= 0 ? "text-success" : "text-destructive"
                      )}>
                        {summary.roiPercent >= 0 ? "+" : ""}{summary.roiPercent.toFixed(2)}%
                      </p>
                    </div>
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-8">No investments yet</p>
                )}
              </CardContent>
            </Card>

            {/* Quick Stats */}
            {summary && (
              <div className="grid md:grid-cols-3 gap-4">
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <TrendingUp className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Active Investments</p>
                        <p className="text-2xl font-bold">{summary.activeInvestments}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-success/10 flex items-center justify-center">
                        <ArrowDownUp className="h-5 w-5 text-success" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Total Withdrawn</p>
                        <p className="text-2xl font-bold">${summary.totalWithdrawn.toLocaleString()}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-info/10 flex items-center justify-center">
                        <Wallet className="h-5 w-5 text-info" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Available Balance</p>
                        <p className="text-2xl font-bold">${summary.availableBalance.toLocaleString()}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>

          <TabsContent value="settings" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Investment Preferences
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Preferred Currency</label>
                    <Select
                      value={profile.currency_preference || "USD"}
                      onValueChange={handleCurrencyChange}
                      disabled={isUpdating}
                    >
                      <SelectTrigger>
                        <SelectValue />
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
                    <label className="text-sm font-medium">Country</label>
                    <p className="text-muted-foreground p-2 bg-muted/50 rounded">
                      {profile.country || "Not set"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="audit">
            <InvestorAuditLogPanel />
          </TabsContent>

          <TabsContent value="legal">
            <InvestorLegalCard />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}