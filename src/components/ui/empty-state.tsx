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

// Pre-configured empty states for common scenarios
export function NoReportsEmptyState({ onAction }: { onAction?: () => void }) {
  return (
    <EmptyState
      icon={FileText}
      title="No reports yet"
      description="Start tracking your work by submitting your first report."
      actionLabel="Submit Report"
      onAction={onAction}
    />
  );
}

export function NoTeamMembersEmptyState() {
  return (
    <EmptyState
      icon={Users}
      title="No team members"
      description="Your team is empty. Team members will appear here once assigned."
    />
  );
}

export function NoTasksEmptyState({ onAction }: { onAction?: () => void }) {
  return (
    <EmptyState
      icon={Calendar}
      title="No tasks assigned"
      description="You don't have any tasks at the moment. Tasks assigned to you will appear here."
      actionLabel={onAction ? "View Available Tasks" : undefined}
      onAction={onAction}
    />
  );
}

export function NoNotificationsEmptyState() {
  return (
    <EmptyState
      icon={Bell}
      title="All caught up!"
      description="You have no new notifications. We'll let you know when something needs your attention."
      variant="compact"
    />
  );
}

export function NoSearchResultsEmptyState({ query }: { query: string }) {
  return (
    <EmptyState
      icon={Search}
      title="No results found"
      description={`We couldn't find anything matching "${query}". Try a different search term.`}
    />
  );
}

export function NoMessagesEmptyState() {
  return (
    <EmptyState
      icon={MessageCircle}
      title="No messages"
      description="Start a conversation with your team or supervisor."
    />
  );
}

export function NoActivityEmptyState() {
  return (
    <EmptyState
      icon={TrendingUp}
      title="No activity yet"
      description="Your activity history will appear here as you use the platform."
    />
  );
}
