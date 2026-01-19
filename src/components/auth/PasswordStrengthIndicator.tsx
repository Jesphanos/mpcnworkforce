import { useMemo } from "react";
import { motion } from "framer-motion";
import { Check, X } from "lucide-react";
import { AUTH } from "@/lib/constants";
import { cn } from "@/lib/utils";

interface PasswordStrengthIndicatorProps {
  password: string;
  showRequirements?: boolean;
}

interface Requirement {
  label: string;
  met: boolean;
}

export function PasswordStrengthIndicator({ 
  password, 
  showRequirements = true 
}: PasswordStrengthIndicatorProps) {
  const analysis = useMemo(() => {
    const requirements: Requirement[] = [
      { label: "At least 6 characters", met: password.length >= AUTH.MIN_PASSWORD_LENGTH },
      { label: "Contains uppercase letter", met: /[A-Z]/.test(password) },
      { label: "Contains lowercase letter", met: /[a-z]/.test(password) },
      { label: "Contains number", met: /[0-9]/.test(password) },
      { label: "Contains special character", met: /[!@#$%^&*(),.?":{}|<>]/.test(password) },
    ];

    const metCount = requirements.filter(r => r.met).length;
    
    let strength: "weak" | "medium" | "strong" | "very-strong" = "weak";
    let label = "Weak";
    let color = "bg-destructive";

    if (metCount >= 5) {
      strength = "very-strong";
      label = "Very Strong";
      color = "bg-green-500";
    } else if (metCount >= 4) {
      strength = "strong";
      label = "Strong";
      color = "bg-green-400";
    } else if (metCount >= 3) {
      strength = "medium";
      label = "Medium";
      color = "bg-yellow-500";
    }

    return { requirements, metCount, strength, label, color };
  }, [password]);

  if (!password) return null;

  return (
    <div className="space-y-2">
      {/* Strength Bar */}
      <div className="space-y-1">
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">Password strength</span>
          <span className={cn(
            "font-medium",
            analysis.strength === "weak" && "text-destructive",
            analysis.strength === "medium" && "text-yellow-600",
            (analysis.strength === "strong" || analysis.strength === "very-strong") && "text-green-600"
          )}>
            {analysis.label}
          </span>
        </div>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((segment) => (
            <motion.div
              key={segment}
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 0.2, delay: segment * 0.05 }}
              className={cn(
                "h-1.5 flex-1 rounded-full origin-left",
                segment <= analysis.metCount ? analysis.color : "bg-muted"
              )}
            />
          ))}
        </div>
      </div>

      {/* Requirements Checklist */}
      {showRequirements && (
        <motion.ul 
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="space-y-1 text-xs"
        >
          {analysis.requirements.map((req, idx) => (
            <motion.li
              key={req.label}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.05 }}
              className={cn(
                "flex items-center gap-1.5",
                req.met ? "text-green-600" : "text-muted-foreground"
              )}
            >
              {req.met ? (
                <Check className="h-3 w-3" />
              ) : (
                <X className="h-3 w-3" />
              )}
              {req.label}
            </motion.li>
          ))}
        </motion.ul>
      )}
    </div>
  );
}
