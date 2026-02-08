import { useEffect, useRef } from "react";
import { format, isToday, isYesterday } from "date-fns";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Pin, MoreHorizontal, Reply, FileIcon, Link2 } from "lucide-react";
import { Message } from "@/hooks/useMessaging";
import { cn } from "@/lib/utils";

interface MessageListProps {
  messages: Message[];
  isLoading: boolean;
  currentUserId: string | undefined;
}

function formatMessageDate(dateString: string): string {
  const date = new Date(dateString);
  if (isToday(date)) return format(date, "h:mm a");
  if (isYesterday(date)) return `Yesterday at ${format(date, "h:mm a")}`;
  return format(date, "MMM d, h:mm a");
}

function getInitials(name: string | null | undefined): string {
  if (!name) return "?";
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function renderContent(content: string) {
  // Simple link detection
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const parts = content.split(urlRegex);

  return parts.map((part, index) => {
    if (part.match(urlRegex)) {
      return (
        <a
          key={index}
          href={part}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary underline hover:text-primary/80 inline-flex items-center gap-1"
        >
          <Link2 className="h-3 w-3" />
          {part.length > 50 ? `${part.slice(0, 50)}...` : part}
        </a>
      );
    }
    return <span key={index}>{part}</span>;
  });
}

export function MessageList({ messages, isLoading, currentUserId }: MessageListProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Scroll to bottom when messages change
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  if (isLoading) {
    return (
      <div className="flex-1 p-4 space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex gap-3">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-full" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center text-muted-foreground p-4">
        <div className="text-center">
          <p className="text-sm">No messages yet</p>
          <p className="text-xs mt-1">Be the first to send a message!</p>
        </div>
      </div>
    );
  }

  return (
    <ScrollArea className="flex-1" ref={scrollRef}>
      <div className="p-4 space-y-4">
        {messages.map((message, index) => {
          const isOwnMessage = message.sender_id === currentUserId;
          const senderName = message.sender?.full_name || "Unknown User";
          const avatarUrl = message.sender?.avatar_url;

          // Group messages from same sender within 5 minutes
          const prevMessage = messages[index - 1];
          const showHeader =
            !prevMessage ||
            prevMessage.sender_id !== message.sender_id ||
            new Date(message.created_at).getTime() -
              new Date(prevMessage.created_at).getTime() >
              5 * 60 * 1000;

          return (
            <div
              key={message.id}
              className={cn(
                "group relative",
                !showHeader && "pl-12"
              )}
            >
              {showHeader && (
                <div className="flex items-start gap-3">
                  <Avatar className="h-9 w-9">
                    <AvatarImage src={avatarUrl || undefined} />
                    <AvatarFallback className="text-xs bg-primary/10 text-primary">
                      {getInitials(senderName)}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">{senderName}</span>
                      <span className="text-xs text-muted-foreground">
                        {formatMessageDate(message.created_at)}
                      </span>
                      {message.is_edited && (
                        <span className="text-xs text-muted-foreground">(edited)</span>
                      )}
                      {message.is_pinned && (
                        <Badge variant="secondary" className="h-5 gap-1 text-xs">
                          <Pin className="h-3 w-3" />
                          Pinned
                        </Badge>
                      )}
                    </div>

                    <div className="text-sm mt-0.5 text-foreground/90">
                      {renderContent(message.content)}
                    </div>

                    {message.attachment_url && (
                      <div className="mt-2">
                        {message.attachment_type?.startsWith("image/") ? (
                          <img
                            src={message.attachment_url}
                            alt="Attachment"
                            className="max-w-sm rounded-lg border"
                          />
                        ) : (
                          <a
                            href={message.attachment_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 text-sm text-primary hover:underline"
                          >
                            <FileIcon className="h-4 w-4" />
                            View attachment
                          </a>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {!showHeader && (
                <div className="text-sm text-foreground/90">
                  {renderContent(message.content)}
                </div>
              )}

              {/* Hover actions */}
              <div className="absolute right-0 top-0 opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="flex items-center gap-1 bg-background border rounded-md shadow-sm p-0.5">
                  <Button variant="ghost" size="icon" className="h-7 w-7">
                    <Reply className="h-3.5 w-3.5" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7">
                    <MoreHorizontal className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>
    </ScrollArea>
  );
}
