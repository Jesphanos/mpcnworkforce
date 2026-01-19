import { useMemo } from "react";
import { Progress } from "@/components/ui/progress";
import { Check, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { AUTH } from "@/lib/constants";

interface PasswordStrengthProps {
  password: string;
  showRequirements?: boolean;
}

interface PasswordRequirement {
  label: string;
  met: boolean;
}

export function usePasswordStrength(password: string) {
  return useMemo(() => {
    const requirements: PasswordRequirement[] = [
      { label: `At least ${AUTH.MIN_PASSWORD_LENGTH} characters`, met: password.length >= AUTH.MIN_PASSWORD_LENGTH },
      { label: "Contains uppercase letter", met: /[A-Z]/.test(password) },
      { label: "Contains lowercase letter", met: /[a-z]/.test(password) },
      { label: "Contains number", met: /[0-9]/.test(password) },
      { label: "Contains special character", met: /[^A-Za-z0-9]/.test(password) },
    ];

    const score = requirements.filter(r => r.met).length;
    
    let strength: "empty" | "weak" | "medium" | "strong" | "very-strong";
    let color: string;
    let label: string;

    if (password.length === 0) {
      strength = "empty";
      color = "bg-muted";
      label = "";
    } else if (score <= AUTH.PASSWORD_STRENGTH_THRESHOLDS.WEAK) {
      strength = "weak";
      color = "bg-destructive";
      label = "Weak";
    } else if (score <= AUTH.PASSWORD_STRENGTH_THRESHOLDS.MEDIUM) {
      strength = "medium";
      color = "bg-warning";
      label = "Medium";
    } else if (score <= AUTH.PASSWORD_STRENGTH_THRESHOLDS.STRONG) {
      strength = "strong";
      color = "bg-success";
      label = "Strong";
    } else {
      strength = "very-strong";
      color = "bg-success";
      label = "Very Strong";
    }

    return {
      requirements,
      score,
      maxScore: requirements.length,
      strength,
      color,
      label,
      percentage: (score / requirements.length) * 100,
    };
  }, [password]);
}

export function PasswordStrength({ password, showRequirements = true }: PasswordStrengthProps) {
  const { requirements, strength, color, label, percentage } = usePasswordStrength(password);

  if (password.length === 0) {
    return null;
  }

  return (
    <div className="space-y-2">
      {/* Strength Bar */}
      <div className="space-y-1">
        <div className="flex justify-between items-center">
          <span className="text-xs text-muted-foreground">Password strength</span>
          <span className={cn(
            "text-xs font-medium",
            strength === "weak" && "text-destructive",
            strength === "medium" && "text-warning",
            (strength === "strong" || strength === "very-strong") && "text-success"
          )}>
            {label}
          </span>
        </div>
        <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
          <div 
            className={cn("h-full transition-all duration-300", color)}
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>

      {/* Requirements List */}
      {showRequirements && (
        <ul className="space-y-1">
          {requirements.map((req, index) => (
            <li
              key={index}
              className={cn(
                "flex items-center gap-2 text-xs transition-colors",
                req.met ? "text-success" : "text-muted-foreground"
              )}
            >
              {req.met ? (
                <Check className="h-3 w-3" />
              ) : (
                <X className="h-3 w-3" />
              )}
              {req.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
