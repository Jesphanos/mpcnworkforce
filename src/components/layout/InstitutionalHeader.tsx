/**
 * Institutional Header Component
 * 
 * Displays the MPCN brand mark with institutional authority.
 * Uses the official logo with green (growth) and blue (trust) colors.
 */
import mpcnLogo from "@/assets/mpcn-logo.png";
import { PLATFORM_IDENTITY } from "@/config/institutionalIdentity";

interface InstitutionalHeaderProps {
  variant?: "full" | "compact" | "minimal";
  className?: string;
  showTagline?: boolean;
}

export function InstitutionalHeader({ 
  variant = "full",
  className = "",
  showTagline = true
}: InstitutionalHeaderProps) {
  if (variant === "minimal") {
    return (
      <div className={`flex items-center gap-3 ${className}`}>
        <img 
          src={mpcnLogo} 
          alt="MPCN Logo" 
          className="h-8 w-auto"
        />
      </div>
    );
  }

  if (variant === "compact") {
    return (
      <div className={`flex flex-col items-center ${className}`}>
        <img 
          src={mpcnLogo} 
          alt="MPCN Logo" 
          className="h-16 w-auto"
        />
        {showTagline && (
          <p className="mt-2 text-sm text-muted-foreground">
            Collaborative Network
          </p>
        )}
      </div>
    );
  }

  // Full variant - used on Auth page
  return (
    <div className={`flex flex-col items-center ${className}`}>
      <img 
        src={mpcnLogo} 
        alt="MPCN - Collaborative Network" 
        className="h-24 w-auto drop-shadow-md"
      />
      {showTagline && (
        <p className="mt-3 text-sm text-muted-foreground font-medium">
          {PLATFORM_IDENTITY.tagline}
        </p>
      )}
    </div>
  );
}