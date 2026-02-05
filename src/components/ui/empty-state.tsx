import { motion } from "framer-motion";
import { LucideIcon, FileText, Users, TrendingUp, MessageCircle, Bell, Inbox, Search, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  variant?: "default" | "compact" | "card";
  className?: string;
}

export function EmptyState({
  icon: Icon = Inbox,
  title,
  description,
  actionLabel,
  onAction,
  variant = "default",
  className,
}: EmptyStateProps) {
  const isCompact = variant === "compact";

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "flex flex-col items-center justify-center text-center",
        isCompact ? "py-8 px-4" : "py-16 px-6",
        variant === "card" && "bg-muted/30 rounded-lg border border-dashed",
        className
      )}
    >
      <motion.div
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
        className={cn(
          "rounded-full bg-muted flex items-center justify-center mb-4",
          isCompact ? "w-12 h-12" : "w-16 h-16"
        )}
      >
        <Icon className={cn(
          "text-muted-foreground",
          isCompact ? "h-6 w-6" : "h-8 w-8"
        )} />
      </motion.div>

      <motion.h3
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className={cn(
          "font-semibold text-foreground mb-1",
          isCompact ? "text-sm" : "text-lg"
        )}
      >
        {title}
      </motion.h3>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className={cn(
          "text-muted-foreground max-w-sm",
          isCompact ? "text-xs" : "text-sm"
        )}
      >
        {description}
      </motion.p>

      {actionLabel && onAction && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-4"
        >
          <Button onClick={onAction} size={isCompact ? "sm" : "default"}>
            {actionLabel}
          </Button>
        </motion.div>
      )}
    </motion.div>
  );
}

// Pre-configured empty states for common scenarios — institutional language
export function NoReportsEmptyState({ onAction }: { onAction?: () => void }) {
  return (
    <EmptyState
      icon={FileText}
      title="No reports submitted"
      description="Document your completed work here. Reports are reviewed and contribute to your record."
      actionLabel="Submit Report"
      onAction={onAction}
    />
  );
}

export function NoTeamMembersEmptyState() {
  return (
    <EmptyState
      icon={Users}
      title="No team members assigned"
      description="Team members will appear here once assigned by an administrator."
    />
  );
}

export function NoTasksEmptyState({ onAction }: { onAction?: () => void }) {
  return (
    <EmptyState
      icon={Calendar}
      title="No assigned tasks"
      description="Check with your team lead for new assignments. Assigned tasks will appear here."
      actionLabel={onAction ? "View Available Tasks" : undefined}
      onAction={onAction}
    />
  );
}

export function NoNotificationsEmptyState() {
  return (
    <EmptyState
      icon={Bell}
      title="No notifications"
      description="You'll be notified when something requires your attention."
      variant="compact"
    />
  );
}

export function NoSearchResultsEmptyState({ query }: { query: string }) {
  return (
    <EmptyState
      icon={Search}
      title="No results found"
      description={`No matches for "${query}". Try a different search term.`}
    />
  );
}

export function NoMessagesEmptyState() {
  return (
    <EmptyState
      icon={MessageCircle}
      title="No messages"
      description="Communicate with your team or supervisor here."
    />
  );
}

export function NoActivityEmptyState() {
  return (
    <EmptyState
      icon={TrendingUp}
      title="No recent activity"
      description="Your activity history will appear here as you use the platform."
    />
  );
}

export function NoTeamAssignmentEmptyState() {
  return (
    <EmptyState
      icon={Users}
      title="No team assignment"
      description="You have not been assigned to a team yet. Contact your administrator."
    />
  );
}
