import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
  InputOTPSeparator,
} from "@/components/ui/input-otp";
import { Loader2, Phone, ArrowLeft, RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";

interface PhoneLoginFormProps {
  onSuccess?: () => void;
  onBack?: () => void;
}

export function PhoneLoginForm({ onSuccess, onBack }: PhoneLoginFormProps) {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [step, setStep] = useState<"phone" | "verify">("phone");
  const [isLoading, setIsLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const { toast } = useToast();

  const startResendTimer = () => {
    setResendTimer(60);
    const interval = setInterval(() => {
      setResendTimer((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!phoneNumber || phoneNumber.length < 10) {
      toast({
        title: "Invalid Phone",
        description: "Please enter a valid phone number with country code",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const formattedPhone = phoneNumber.startsWith("+") ? phoneNumber : `+${phoneNumber}`;
      
      const { error } = await supabase.auth.signInWithOtp({
        phone: formattedPhone,
      });

      if (error) throw error;

      setStep("verify");
      startResendTimer();
      toast({
        title: "Code Sent",
        description: "Check your phone for the verification code",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to send verification code",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (otpCode.length !== 6) return;

    setIsLoading(true);
    try {
      const formattedPhone = phoneNumber.startsWith("+") ? phoneNumber : `+${phoneNumber}`;
      
      const { error } = await supabase.auth.verifyOtp({
        phone: formattedPhone,
        token: otpCode,
        type: "sms",
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "You have been signed in successfully",
      });
      onSuccess?.();
    } catch (error: any) {
      toast({
        title: "Verification Failed",
        description: error.message || "Invalid or expired code",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendTimer > 0) return;
    await handleSendOtp({ preventDefault: () => {} } as React.FormEvent);
  };

  return (
    <AnimatePresence mode="wait">
      {step === "phone" ? (
        <motion.div
          key="phone-step"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
        >
          {onBack && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="mb-4 -ml-2 text-muted-foreground"
              onClick={onBack}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
          )}

          <form onSubmit={handleSendOtp} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+1 234 567 8900"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value.replace(/[^0-9+]/g, ""))}
                  className="pl-10"
                  required
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Include your country code (e.g., +1 for US)
              </p>
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Send Verification Code
            </Button>
          </form>
        </motion.div>
      ) : (
        <motion.div
          key="verify-step"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="space-y-6"
        >
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="mb-2 -ml-2 text-muted-foreground"
            onClick={() => {
              setStep("phone");
              setOtpCode("");
            }}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Change Number
          </Button>

          <div className="text-center space-y-2">
            <p className="text-sm text-muted-foreground">
              Enter the 6-digit code sent to
            </p>
            <p className="font-medium">{phoneNumber}</p>
          </div>

          <div className="flex justify-center">
            <InputOTP
              maxLength={6}
              value={otpCode}
              onChange={setOtpCode}
            >
              <InputOTPGroup>
                <InputOTPSlot index={0} />
                <InputOTPSlot index={1} />
                <InputOTPSlot index={2} />
              </InputOTPGroup>
              <InputOTPSeparator />
              <InputOTPGroup>
                <InputOTPSlot index={3} />
                <InputOTPSlot index={4} />
                <InputOTPSlot index={5} />
              </InputOTPGroup>
            </InputOTP>
          </div>

          <Button
            onClick={handleVerifyOtp}
            className="w-full"
            disabled={isLoading || otpCode.length !== 6}
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Verify & Sign In
          </Button>

          <div className="text-center">
            <Button
              type="button"
              variant="link"
              size="sm"
              onClick={handleResend}
              disabled={resendTimer > 0}
              className="text-muted-foreground"
            >
              {resendTimer > 0 ? (
                <>Resend in {resendTimer}s</>
              ) : (
                <>
                  <RefreshCw className="mr-1 h-3 w-3" />
                  Resend Code
                </>
              )}
            </Button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
