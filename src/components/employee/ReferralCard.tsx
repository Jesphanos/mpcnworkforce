import { Users, UserPlus, Copy, Check } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useState } from "react";
import { useReferralStats, useMyReferrals } from "@/hooks/useReferrals";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export function ReferralCard() {
  const { profile } = useAuth();
  const { totalReferrals, completedReferrals, pendingReferrals } = useReferralStats();
  const { isLoading } = useMyReferrals();
  const [copied, setCopied] = useState(false);

  const referralCode = profile?.referral_code || "Not available";

  const handleCopyCode = async () => {
    if (referralCode && referralCode !== "Not available") {
      await navigator.clipboard.writeText(referralCode);
      setCopied(true);
      toast.success("Referral code copied!");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-4 w-48" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-20" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <UserPlus className="h-5 w-5 text-primary" />
          <CardTitle className="text-base">Referrals</CardTitle>
        </div>
        <CardDescription>Invite colleagues to join the platform</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="p-2 rounded-lg bg-muted/50">
            <p className="text-lg font-semibold">{totalReferrals}</p>
            <p className="text-xs text-muted-foreground">Total</p>
          </div>
          <div className="p-2 rounded-lg bg-success/10">
            <p className="text-lg font-semibold text-success">{completedReferrals}</p>
            <p className="text-xs text-muted-foreground">Completed</p>
          </div>
          <div className="p-2 rounded-lg bg-warning/10">
            <p className="text-lg font-semibold text-warning">{pendingReferrals}</p>
            <p className="text-xs text-muted-foreground">Pending</p>
          </div>
        </div>

        {/* Referral Code */}
        {referralCode && referralCode !== "Not available" && (
          <div className="p-3 rounded-lg bg-muted/50 flex items-center justify-between gap-2">
            <div>
              <p className="text-xs text-muted-foreground">Your Referral Code</p>
              <p className="font-mono font-medium">{referralCode}</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCopyCode}
              className="h-8 w-8 p-0"
            >
              {copied ? (
                <Check className="h-4 w-4 text-success" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          </div>
        )}

        {/* Suggestion */}
        <div className="p-3 rounded-lg bg-primary/5 border border-primary/10">
          <p className="text-xs text-muted-foreground leading-relaxed">
            <Users className="h-3 w-3 inline mr-1" />
            Consider referring someone with complementary skills to strengthen your team.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
