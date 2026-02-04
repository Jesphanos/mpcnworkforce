import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface PresenceUser {
  id: string;
  name: string;
  avatar_url?: string;
  status?: "online" | "away" | "busy";
}

interface PresenceAvatarsProps {
  users: PresenceUser[];
  maxVisible?: number;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeClasses = {
  sm: "h-6 w-6 text-xs",
  md: "h-8 w-8 text-sm",
  lg: "h-10 w-10 text-base",
};

const statusColors = {
  online: "bg-success",
  away: "bg-warning",
  busy: "bg-destructive",
};

export function PresenceAvatars({
  users,
  maxVisible = 3,
  size = "sm",
  className,
}: PresenceAvatarsProps) {
  if (!users || users.length === 0) {
    return null;
  }

  const visibleUsers = users.slice(0, maxVisible);
  const overflowCount = Math.max(0, users.length - maxVisible);

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <TooltipProvider>
      <div className={cn("flex items-center -space-x-2", className)}>
        {visibleUsers.map((user) => (
          <Tooltip key={user.id}>
            <TooltipTrigger asChild>
              <div className="relative">
                <Avatar
                  className={cn(
                    sizeClasses[size],
                    "border-2 border-background ring-0"
                  )}
                >
                  <AvatarImage src={user.avatar_url} alt={user.name} />
                  <AvatarFallback className="bg-primary/10 text-primary">
                    {getInitials(user.name)}
                  </AvatarFallback>
                </Avatar>
                {user.status && (
                  <span
                    className={cn(
                      "absolute bottom-0 right-0 h-2 w-2 rounded-full border border-background",
                      statusColors[user.status]
                    )}
                  />
                )}
              </div>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              <p className="text-sm">{user.name}</p>
              {user.status && (
                <p className="text-xs text-muted-foreground capitalize">{user.status}</p>
              )}
            </TooltipContent>
          </Tooltip>
        ))}
        
        {overflowCount > 0 && (
          <Tooltip>
            <TooltipTrigger asChild>
              <div
                className={cn(
                  sizeClasses[size],
                  "flex items-center justify-center rounded-full border-2 border-background bg-muted text-muted-foreground"
                )}
              >
                +{overflowCount}
              </div>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              <div className="space-y-1">
                {users.slice(maxVisible).map((user) => (
                  <p key={user.id} className="text-sm">{user.name}</p>
                ))}
              </div>
            </TooltipContent>
          </Tooltip>
        )}
      </div>
    </TooltipProvider>
  );
}

// Simple presence indicator for single user
interface PresenceIndicatorProps {
  status: "online" | "away" | "busy" | "offline";
  showLabel?: boolean;
  className?: string;
}

export function PresenceIndicator({
  status,
  showLabel = false,
  className,
}: PresenceIndicatorProps) {
  const statusConfig = {
    online: { color: "bg-success", label: "Online" },
    away: { color: "bg-warning", label: "Away" },
    busy: { color: "bg-destructive", label: "Busy" },
    offline: { color: "bg-muted-foreground", label: "Offline" },
  };

  const config = statusConfig[status];

  return (
    <div className={cn("flex items-center gap-1.5", className)}>
      <span
        className={cn("h-2 w-2 rounded-full", config.color)}
        aria-label={config.label}
      />
      {showLabel && (
        <span className="text-xs text-muted-foreground">{config.label}</span>
      )}
    </div>
  );
}
