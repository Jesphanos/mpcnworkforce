import { cn } from "@/lib/utils";

// Platform brand colors and logos configuration
const platformConfig: Record<string, { 
  logo: string; 
  color: string; 
  bgColor: string;
  textColor?: string;
}> = {
  // Freelancing platforms
  upwork: {
    logo: "U",
    color: "#14A800",
    bgColor: "bg-[#14A800]",
    textColor: "text-white",
  },
  fiverr: {
    logo: "F",
    color: "#1DBF73",
    bgColor: "bg-[#1DBF73]",
    textColor: "text-white",
  },
  freelancer: {
    logo: "FL",
    color: "#29B2FE",
    bgColor: "bg-[#29B2FE]",
    textColor: "text-white",
  },
  toptal: {
    logo: "T",
    color: "#204ECF",
    bgColor: "bg-[#204ECF]",
    textColor: "text-white",
  },
  "99designs": {
    logo: "99",
    color: "#FF7C49",
    bgColor: "bg-[#FF7C49]",
    textColor: "text-white",
  },
  guru: {
    logo: "G",
    color: "#36B37E",
    bgColor: "bg-[#36B37E]",
    textColor: "text-white",
  },
  peopleperhour: {
    logo: "PP",
    color: "#00BCD4",
    bgColor: "bg-[#00BCD4]",
    textColor: "text-white",
  },

  // Microtask platforms
  swagbucks: {
    logo: "S",
    color: "#0078D7",
    bgColor: "bg-[#0078D7]",
    textColor: "text-white",
  },
  remotasks: {
    logo: "R",
    color: "#7C3AED",
    bgColor: "bg-[#7C3AED]",
    textColor: "text-white",
  },
  outlier: {
    logo: "O",
    color: "#2563EB",
    bgColor: "bg-[#2563EB]",
    textColor: "text-white",
  },
  "scale ai": {
    logo: "SA",
    color: "#6366F1",
    bgColor: "bg-[#6366F1]",
    textColor: "text-white",
  },
  appen: {
    logo: "A",
    color: "#0EA5E9",
    bgColor: "bg-[#0EA5E9]",
    textColor: "text-white",
  },
  clickworker: {
    logo: "C",
    color: "#F97316",
    bgColor: "bg-[#F97316]",
    textColor: "text-white",
  },

  // Trading platforms
  trading: {
    logo: "T",
    color: "#F59E0B",
    bgColor: "bg-[#F59E0B]",
    textColor: "text-white",
  },
  "trading platform": {
    logo: "TP",
    color: "#F59E0B",
    bgColor: "bg-[#F59E0B]",
    textColor: "text-white",
  },
  binance: {
    logo: "B",
    color: "#F3BA2F",
    bgColor: "bg-[#F3BA2F]",
    textColor: "text-black",
  },
  coinbase: {
    logo: "CB",
    color: "#0052FF",
    bgColor: "bg-[#0052FF]",
    textColor: "text-white",
  },
  metatrader: {
    logo: "MT",
    color: "#0066CC",
    bgColor: "bg-[#0066CC]",
    textColor: "text-white",
  },

  // Default
  other: {
    logo: "?",
    color: "#6B7280",
    bgColor: "bg-muted",
    textColor: "text-muted-foreground",
  },
};

interface PlatformIconProps {
  platform: string;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
  className?: string;
}

export function PlatformIcon({ 
  platform, 
  size = "md", 
  showLabel = false,
  className 
}: PlatformIconProps) {
  const normalizedPlatform = platform.toLowerCase().trim();
  const config = platformConfig[normalizedPlatform] || platformConfig.other;

  const sizeClasses = {
    sm: "h-5 w-5 text-[10px]",
    md: "h-7 w-7 text-xs",
    lg: "h-9 w-9 text-sm",
  };

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div
        className={cn(
          "rounded-md flex items-center justify-center font-bold shrink-0",
          sizeClasses[size],
          config.bgColor,
          config.textColor || "text-white"
        )}
        title={platform}
      >
        {config.logo}
      </div>
      {showLabel && (
        <span className="text-sm font-medium">{platform}</span>
      )}
    </div>
  );
}

export function getPlatformColor(platform: string): string {
  const normalizedPlatform = platform.toLowerCase().trim();
  const config = platformConfig[normalizedPlatform];
  return config?.color || "#6B7280";
}

export { platformConfig };
