import { useState } from "react";
import { Phone, Loader2, CheckCircle, MessageSquare } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface PhoneVerificationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  phoneNumber: string;
  onVerified: () => void;
}

export function PhoneVerificationDialog({
  open,
  onOpenChange,
  phoneNumber,
  onVerified,
}: PhoneVerificationDialogProps) {
  const [step, setStep] = useState<"send" | "verify" | "success">("send");
  const [code, setCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSendCode = async () => {
    setIsLoading(true);
    
    const { data, error } = await supabase.functions.invoke("send-verification-sms", {
      body: { phoneNumber, action: "send" },
    });

    setIsLoading(false);

    if (error || !data?.success) {
      toast.error(data?.error || error?.message || "Failed to send verification code");
      return;
    }

    toast.success("Verification code sent!");
    setStep("verify");
  };

  const handleVerifyCode = async () => {
    if (code.length !== 6) {
      toast.error("Please enter a 6-digit code");
      return;
    }

    setIsLoading(true);

    const { data, error } = await supabase.functions.invoke("send-verification-sms", {
      body: { phoneNumber, action: "verify", code },
    });

    setIsLoading(false);

    if (error || !data?.success) {
      toast.error(data?.error || error?.message || "Verification failed");
      return;
    }

    setStep("success");
    toast.success("Phone number verified!");
    
    setTimeout(() => {
      onVerified();
      onOpenChange(false);
      setStep("send");
      setCode("");
    }, 1500);
  };

  const handleClose = () => {
    onOpenChange(false);
    setStep("send");
    setCode("");
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Phone className="h-5 w-5" />
            Verify Phone Number
          </DialogTitle>
          <DialogDescription>
            {step === "send" && "We'll send a verification code to your phone."}
            {step === "verify" && "Enter the 6-digit code sent to your phone."}
            {step === "success" && "Your phone number has been verified!"}
          </DialogDescription>
        </DialogHeader>

        {step === "send" && (
          <div className="space-y-4">
            <div className="p-4 rounded-lg bg-muted/50 border">
              <p className="text-sm font-medium">Phone Number</p>
              <p className="text-lg font-mono">{phoneNumber}</p>
            </div>
            <p className="text-sm text-muted-foreground">
              Standard SMS rates may apply. The code will expire in 10 minutes.
            </p>
          </div>
        )}

        {step === "verify" && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 p-3 rounded-lg bg-primary/10 text-sm">
              <MessageSquare className="h-4 w-4 text-primary" />
              <span>Code sent to {phoneNumber}</span>
            </div>
            <div className="space-y-2">
              <Label htmlFor="code">Verification Code</Label>
              <Input
                id="code"
                type="text"
                inputMode="numeric"
                maxLength={6}
                placeholder="000000"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                className="text-center text-2xl tracking-widest font-mono"
              />
            </div>
            <Button
              variant="link"
              className="w-full"
              onClick={() => setStep("send")}
              disabled={isLoading}
            >
              Didn't receive the code? Send again
            </Button>
          </div>
        )}

        {step === "success" && (
          <div className="flex flex-col items-center py-6">
            <div className="h-16 w-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-4">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <p className="text-lg font-medium">Verified!</p>
          </div>
        )}

        {step !== "success" && (
          <DialogFooter>
            <Button variant="outline" onClick={handleClose} disabled={isLoading}>
              Cancel
            </Button>
            {step === "send" && (
              <Button onClick={handleSendCode} disabled={isLoading}>
                {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Send Code
              </Button>
            )}
            {step === "verify" && (
              <Button onClick={handleVerifyCode} disabled={isLoading || code.length !== 6}>
                {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Verify
              </Button>
            )}
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
