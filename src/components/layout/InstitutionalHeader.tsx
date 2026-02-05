/**
 * Institutional Header Component
 * 
 * Displays the MPCN brand mark with institutional authority.
 * Used on Auth pages and key landing surfaces.
 */
import { Building2 } from "lucide-react";
import { PLATFORM_IDENTITY } from "@/config/institutionalIdentity";

interface InstitutionalHeaderProps {
  variant?: "full" | "compact" | "minimal";
  className?: string;
}

export function InstitutionalHeader({ 
  variant = "full",
  className = "" 
}: InstitutionalHeaderProps) {
  if (variant === "minimal") {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
          <Building2 className="h-4 w-4 text-primary-foreground" />
        </div>
        <span className="font-semibold text-foreground">{PLATFORM_IDENTITY.name}</span>
      </div>
    );
  }

  if (variant === "compact") {
    return (
      <div className={`flex flex-col items-center ${className}`}>
        <div className="h-12 w-12 rounded-xl bg-primary flex items-center justify-center shadow-md">
          <Building2 className="h-6 w-6 text-primary-foreground" />
        </div>
        <h1 className="mt-3 text-xl font-bold text-foreground tracking-tight">
          {PLATFORM_IDENTITY.name}
        </h1>
      </div>
    );
  }

  // Full variant - used on Auth page
  return (
    <div className={`flex flex-col items-center ${className}`}>
      <div className="h-16 w-16 rounded-2xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
        <Building2 className="h-8 w-8 text-primary-foreground" />
      </div>
      <h1 className="mt-4 text-2xl font-bold text-foreground tracking-tight">
        {PLATFORM_IDENTITY.name}
      </h1>
      <p className="mt-1 text-sm text-muted-foreground">
        {PLATFORM_IDENTITY.tagline}
      </p>
    </div>
  );
}
