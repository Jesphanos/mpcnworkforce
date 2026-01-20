import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, User, ArrowLeft, KeyRound } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";

interface MpcnIdLoginFormProps {
  onSuccess?: () => void;
  onBack?: () => void;
}

export function MpcnIdLoginForm({ onSuccess, onBack }: MpcnIdLoginFormProps) {
  const [mpcnId, setMpcnId] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState<string | null>(null);
  const [step, setStep] = useState<"id" | "password">("id");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleResolveId = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!mpcnId) {
      toast({
        title: "Invalid ID",
        description: "Please enter your MPCN ID",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      // Resolve MPCN ID to email via edge function
      const { data, error } = await supabase.functions.invoke("resolve-mpcn-id", {
        body: { mpcn_id: mpcnId.toUpperCase() },
      });

      if (error) throw error;

      if (!data?.email) {
        throw new Error("No account found with this MPCN ID");
      }

      setEmail(data.email);
      setStep("password");
      
      toast({
        title: "ID Verified",
        description: `Account found: ${data.masked_email}`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to resolve MPCN ID",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) return;

    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "You have been signed in successfully",
      });
      onSuccess?.();
    } catch (error: any) {
      toast({
        title: "Login Failed",
        description: error.message === "Invalid login credentials"
          ? "Incorrect password. Please try again."
          : error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Format MPCN ID as user types
  const handleIdChange = (value: string) => {
    let formatted = value.toUpperCase().replace(/[^A-Z0-9-]/g, "");
    
    // Auto-add MPCN- prefix if not present
    if (formatted && !formatted.startsWith("MPCN-") && !formatted.startsWith("MPCN")) {
      if (formatted.length > 0) {
        formatted = `MPCN-${formatted}`;
      }
    } else if (formatted.startsWith("MPCN") && !formatted.startsWith("MPCN-") && formatted.length > 4) {
      formatted = `MPCN-${formatted.slice(4)}`;
    }
    
    setMpcnId(formatted);
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
    >
      {onBack && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="mb-4 -ml-2 text-muted-foreground"
          onClick={() => {
            if (step === "password") {
              setStep("id");
              setEmail(null);
              setPassword("");
            } else {
              onBack();
            }
          }}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          {step === "password" ? "Change ID" : "Back"}
        </Button>
      )}

      {step === "id" ? (
        <form onSubmit={handleResolveId} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="mpcn-id">MPCN Employee ID</Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="mpcn-id"
                type="text"
                placeholder="MPCN-XXXXXX"
                value={mpcnId}
                onChange={(e) => handleIdChange(e.target.value)}
                className="pl-10 font-mono"
                required
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Enter your unique MPCN employee identifier
            </p>
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Continue
          </Button>
        </form>
      ) : (
        <form onSubmit={handleLogin} className="space-y-4">
          <div className="p-3 rounded-lg bg-muted/50 mb-4">
            <p className="text-sm text-muted-foreground">Signing in as</p>
            <p className="font-medium font-mono">{mpcnId}</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10"
                required
              />
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Sign In
          </Button>
        </form>
      )}
    </motion.div>
  );
}
