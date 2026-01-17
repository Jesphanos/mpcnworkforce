import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  User, 
  Shield, 
  CheckCircle, 
  Clock, 
  XCircle,
  Building,
  UserCircle,
} from "lucide-react";
import { useInvestorProfile, type InvestorType, type InvestorVerificationStatus } from "@/hooks/useInvestorProfile";
import { cn } from "@/lib/utils";

const investorTypeLabels: Record<InvestorType, { label: string; color: string }> = {
  financial: { label: "Financial Investor", color: "bg-success/10 text-success border-success/20" },
  strategic: { label: "Strategic Investor", color: "bg-info/10 text-info border-info/20" },
  employee_investor: { label: "Employee–Investor", color: "bg-primary/10 text-primary border-primary/20" },
  founding: { label: "Founding Investor", color: "bg-warning/10 text-warning border-warning/20" },
};

const verificationStatusIcons: Record<InvestorVerificationStatus, { icon: typeof CheckCircle; color: string }> = {
  pending: { icon: Clock, color: "text-warning" },
  verified: { icon: CheckCircle, color: "text-success" },
  rejected: { icon: XCircle, color: "text-destructive" },
};

export function InvestorProfileCard() {
  const { data: profile, isLoading } = useInvestorProfile();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-4 w-24 mt-1" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-20 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (!profile || !profile.is_investor) {
    return null;
  }

  const investorType = profile.investor_type ? investorTypeLabels[profile.investor_type] : null;
  const verificationStatus = profile.investor_verification_status 
    ? verificationStatusIcons[profile.investor_verification_status] 
    : null;
  const VerificationIcon = verificationStatus?.icon || Clock;
  const isOrganization = profile.investor_entity_type === "organization";

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              {isOrganization ? (
                <Building className="h-6 w-6 text-primary" />
              ) : (
                <UserCircle className="h-6 w-6 text-primary" />
              )}
            </div>
            <div>
              <CardTitle className="text-lg">{profile.full_name || "Investor"}</CardTitle>
              <CardDescription className="flex items-center gap-2">
                <span>Investor ID: {profile.id.slice(0, 8)}...</span>
                {verificationStatus && (
                  <span className={cn("flex items-center gap-1", verificationStatus.color)}>
                    <VerificationIcon className="h-3 w-3" />
                    <span className="text-xs capitalize">
                      {profile.investor_verification_status}
                    </span>
                  </span>
                )}
              </CardDescription>
            </div>
          </div>
          {investorType && (
            <Badge variant="outline" className={investorType.color}>
              {investorType.label}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-3 rounded-lg bg-muted/50">
            <p className="text-xs text-muted-foreground">Account Type</p>
            <p className="font-medium capitalize">
              {profile.investor_entity_type || "Individual"}
            </p>
          </div>
          <div className="p-3 rounded-lg bg-muted/50">
            <p className="text-xs text-muted-foreground">Country</p>
            <p className="font-medium">{profile.country || "Not set"}</p>
          </div>
          <div className="p-3 rounded-lg bg-muted/50">
            <p className="text-xs text-muted-foreground">Currency</p>
            <p className="font-medium">{profile.currency_preference || "USD"}</p>
          </div>
          <div className="p-3 rounded-lg bg-muted/50">
            <p className="text-xs text-muted-foreground">Total Invested</p>
            <p className="font-medium">
              ${(Number(profile.initial_investment) || 0).toLocaleString()}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
