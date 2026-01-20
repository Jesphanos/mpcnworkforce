import { useState } from "react";
import { motion } from "framer-motion";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { useToast } from "@/hooks/use-toast";
import { Shield, Smartphone, Key, QrCode, CheckCircle2, AlertTriangle, Loader2 } from "lucide-react";

interface TwoFactorSetupDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onComplete?: () => void;
}

export function TwoFactorSetupDialog({ open, onOpenChange, onComplete }: TwoFactorSetupDialogProps) {
  const { toast } = useToast();
  const [step, setStep] = useState<"choose" | "app" | "sms" | "verify">("choose");
  const [method, setMethod] = useState<"app" | "sms" | null>(null);
  const [verificationCode, setVerificationCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");

  // Mock QR code secret - in production, generate from backend
  const mockSecret = "JBSWY3DPEHPK3PXP";
  const mockQRUrl = `otpauth://totp/MPCN%20Workforce:user@example.com?secret=${mockSecret}&issuer=MPCN%20Workforce`;

  const handleMethodSelect = (selectedMethod: "app" | "sms") => {
    setMethod(selectedMethod);
    setStep(selectedMethod);
  };

  const handleSendSMSCode = async () => {
    if (!phoneNumber) {
      toast({
        title: "Phone Required",
        description: "Please enter your phone number.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    // Simulate sending SMS - in production, call edge function
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsLoading(false);
    setStep("verify");
    toast({
      title: "Code Sent",
      description: "A verification code has been sent to your phone.",
    });
  };

  const handleVerify = async () => {
    if (verificationCode.length !== 6) {
      toast({
        title: "Invalid Code",
        description: "Please enter the 6-digit verification code.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    // Simulate verification - in production, verify with backend
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsLoading(false);

    // Mock success (in production, check the actual code)
    if (verificationCode === "123456" || true) {
      toast({
        title: "2FA Enabled",
        description: "Two-factor authentication has been successfully enabled.",
      });
      onComplete?.();
      onOpenChange(false);
      resetState();
    } else {
      toast({
        title: "Invalid Code",
        description: "The verification code is incorrect. Please try again.",
        variant: "destructive",
      });
    }
  };

  const resetState = () => {
    setStep("choose");
    setMethod(null);
    setVerificationCode("");
    setPhoneNumber("");
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      if (!isOpen) resetState();
      onOpenChange(isOpen);
    }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            Two-Factor Authentication
          </DialogTitle>
          <DialogDescription>
            Add an extra layer of security to your account
          </DialogDescription>
        </DialogHeader>

        {step === "choose" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <Card 
              className="cursor-pointer hover:border-primary transition-colors"
              onClick={() => handleMethodSelect("app")}
            >
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <QrCode className="h-5 w-5 text-primary" />
                  Authenticator App
                  <Badge variant="secondary" className="ml-auto">Recommended</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Use an app like Google Authenticator or Authy to generate codes
                </CardDescription>
              </CardContent>
            </Card>

            <Card 
              className="cursor-pointer hover:border-primary transition-colors"
              onClick={() => handleMethodSelect("sms")}
            >
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <Smartphone className="h-5 w-5 text-primary" />
                  SMS Verification
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Receive verification codes via text message
                </CardDescription>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {step === "app" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <div className="flex flex-col items-center p-4 bg-muted rounded-lg">
              {/* QR Code placeholder - in production, render actual QR */}
              <div className="w-40 h-40 bg-white rounded-lg flex items-center justify-center border mb-4">
                <QrCode className="h-24 w-24 text-muted-foreground" />
              </div>
              <p className="text-xs text-muted-foreground text-center">
                Scan this QR code with your authenticator app
              </p>
            </div>

            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">
                Or enter this code manually:
              </Label>
              <code className="block p-2 bg-muted rounded text-sm font-mono text-center break-all">
                {mockSecret}
              </code>
            </div>

            <Button className="w-full" onClick={() => setStep("verify")}>
              I've Added the Code
            </Button>
            <Button variant="ghost" className="w-full" onClick={() => setStep("choose")}>
              Back
            </Button>
          </motion.div>
        )}

        {step === "sms" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="+1 (555) 000-0000"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                We'll send a verification code to this number
              </p>
            </div>

            <Button 
              className="w-full" 
              onClick={handleSendSMSCode}
              disabled={isLoading}
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Send Verification Code
            </Button>
            <Button variant="ghost" className="w-full" onClick={() => setStep("choose")}>
              Back
            </Button>
          </motion.div>
        )}

        {step === "verify" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <div className="text-center space-y-2">
              <Key className="h-10 w-10 mx-auto text-primary" />
              <p className="text-sm text-muted-foreground">
                Enter the 6-digit code from your {method === "app" ? "authenticator app" : "phone"}
              </p>
            </div>

            <div className="flex justify-center">
              <InputOTP
                maxLength={6}
                value={verificationCode}
                onChange={setVerificationCode}
              >
                <InputOTPGroup>
                  <InputOTPSlot index={0} />
                  <InputOTPSlot index={1} />
                  <InputOTPSlot index={2} />
                  <InputOTPSlot index={3} />
                  <InputOTPSlot index={4} />
                  <InputOTPSlot index={5} />
                </InputOTPGroup>
              </InputOTP>
            </div>

            <Button 
              className="w-full" 
              onClick={handleVerify}
              disabled={isLoading || verificationCode.length !== 6}
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Verify & Enable 2FA
            </Button>
            <Button 
              variant="ghost" 
              className="w-full" 
              onClick={() => setStep(method || "choose")}
            >
              Back
            </Button>
          </motion.div>
        )}
      </DialogContent>
    </Dialog>
  );
}

// Card component for showing 2FA status on security page
export function TwoFactorStatusCard() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isEnabled, setIsEnabled] = useState(false);

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Two-Factor Authentication
          </CardTitle>
          <CardDescription>
            Add an extra layer of security to your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
            <div className="flex items-center gap-3">
              <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                isEnabled 
                  ? "bg-green-100 dark:bg-green-900/30" 
                  : "bg-yellow-100 dark:bg-yellow-900/30"
              }`}>
                {isEnabled ? (
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                ) : (
                  <AlertTriangle className="h-5 w-5 text-yellow-600" />
                )}
              </div>
              <div>
                <p className="font-medium">
                  {isEnabled ? "2FA is enabled" : "2FA is not enabled"}
                </p>
                <p className="text-sm text-muted-foreground">
                  {isEnabled 
                    ? "Your account is protected with 2FA" 
                    : "Enable 2FA for enhanced security"}
                </p>
              </div>
            </div>
            <Button 
              variant={isEnabled ? "outline" : "default"}
              onClick={() => setDialogOpen(true)}
            >
              {isEnabled ? "Manage" : "Enable 2FA"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <TwoFactorSetupDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onComplete={() => setIsEnabled(true)}
      />
    </>
  );
}
