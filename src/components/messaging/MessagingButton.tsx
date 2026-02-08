import { useState } from "react";
import { MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MessagingPanel } from "./MessagingPanel";
import { useUnreadCounts } from "@/hooks/useMessaging";
import { cn } from "@/lib/utils";

interface MessagingButtonProps {
  variant?: "sidebar" | "header";
  className?: string;
}

export function MessagingButton({ variant = "header", className }: MessagingButtonProps) {
  const [open, setOpen] = useState(false);
  const { data: unreadCounts = {} } = useUnreadCounts();

  const totalUnread = Object.values(unreadCounts).reduce((sum, count) => sum + count, 0);

  if (variant === "sidebar") {
    return (
      <>
        <button
          onClick={() => setOpen(true)}
          className={cn(
            "flex w-full items-center gap-3 px-3 py-2 text-sm hover:bg-sidebar-accent rounded-md transition-colors",
            className
          )}
        >
          <MessageCircle className="h-4 w-4" />
          <span className="flex-1 text-left">Messages</span>
          {totalUnread > 0 && (
            <Badge variant="default" className="h-5 min-w-5 px-1.5 text-xs">
              {totalUnread > 99 ? "99+" : totalUnread}
            </Badge>
          )}
        </button>
        <MessagingPanel open={open} onOpenChange={setOpen} />
      </>
    );
  }

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setOpen(true)}
        className={cn("relative", className)}
      >
        <MessageCircle className="h-5 w-5" />
        {totalUnread > 0 && (
          <Badge
            variant="destructive"
            className="absolute -top-1 -right-1 h-5 min-w-5 px-1 text-xs"
          >
            {totalUnread > 99 ? "99+" : totalUnread}
          </Badge>
        )}
      </Button>
      <MessagingPanel open={open} onOpenChange={setOpen} />
    </>
  );
}
