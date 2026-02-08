import { useState } from "react";
import { Hash, Users, Megaphone, MessageCircle, Plus, ChevronDown, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
import { Channel, ChannelType } from "@/hooks/useMessaging";

interface ChannelListProps {
  channels: Channel[];
  selectedChannelId: string | null;
  unreadCounts: Record<string, number>;
  onSelectChannel: (channel: Channel) => void;
  onCreateChannel: () => void;
  canCreateChannel: boolean;
}

const channelTypeConfig: Record<ChannelType, { label: string; icon: React.ElementType }> = {
  team: { label: "Teams", icon: Users },
  department: { label: "Departments", icon: Hash },
  announcement: { label: "Announcements", icon: Megaphone },
  direct: { label: "Direct Messages", icon: MessageCircle },
};

export function ChannelList({
  channels,
  selectedChannelId,
  unreadCounts,
  onSelectChannel,
  onCreateChannel,
  canCreateChannel,
}: ChannelListProps) {
  const [openSections, setOpenSections] = useState<Record<ChannelType, boolean>>({
    team: true,
    department: true,
    announcement: true,
    direct: true,
  });

  const groupedChannels = channels.reduce(
    (acc, channel) => {
      const type = channel.channel_type;
      if (!acc[type]) acc[type] = [];
      acc[type].push(channel);
      return acc;
    },
    {} as Record<ChannelType, Channel[]>
  );

  const toggleSection = (type: ChannelType) => {
    setOpenSections((prev) => ({ ...prev, [type]: !prev[type] }));
  };

  return (
    <div className="flex flex-col h-full">
      <div className="p-3 border-b flex items-center justify-between">
        <h3 className="font-semibold text-sm">Messages</h3>
        {canCreateChannel && (
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onCreateChannel}>
            <Plus className="h-4 w-4" />
          </Button>
        )}
      </div>

      <ScrollArea className="flex-1">
        <div className="p-2 space-y-1">
          {(Object.keys(channelTypeConfig) as ChannelType[]).map((type) => {
            const config = channelTypeConfig[type];
            const typeChannels = groupedChannels[type] || [];
            const Icon = config.icon;
            const totalUnread = typeChannels.reduce(
              (sum, ch) => sum + (unreadCounts[ch.id] || 0),
              0
            );

            if (typeChannels.length === 0 && type !== "direct") return null;

            return (
              <Collapsible
                key={type}
                open={openSections[type]}
                onOpenChange={() => toggleSection(type)}
              >
                <CollapsibleTrigger asChild>
                  <Button
                    variant="ghost"
                    className="w-full justify-between px-2 py-1.5 h-auto text-xs font-medium text-muted-foreground hover:text-foreground"
                  >
                    <span className="flex items-center gap-2">
                      {openSections[type] ? (
                        <ChevronDown className="h-3 w-3" />
                      ) : (
                        <ChevronRight className="h-3 w-3" />
                      )}
                      <Icon className="h-3.5 w-3.5" />
                      {config.label}
                    </span>
                    {totalUnread > 0 && (
                      <Badge variant="default" className="h-5 min-w-5 px-1.5 text-xs">
                        {totalUnread}
                      </Badge>
                    )}
                  </Button>
                </CollapsibleTrigger>

                <CollapsibleContent className="space-y-0.5 mt-0.5">
                  {typeChannels.map((channel) => {
                    const unread = unreadCounts[channel.id] || 0;
                    const isSelected = selectedChannelId === channel.id;

                    return (
                      <Button
                        key={channel.id}
                        variant="ghost"
                        className={cn(
                          "w-full justify-start px-3 py-1.5 h-auto text-sm font-normal",
                          isSelected && "bg-accent text-accent-foreground",
                          unread > 0 && "font-medium"
                        )}
                        onClick={() => onSelectChannel(channel)}
                      >
                        <span className="truncate flex-1 text-left">
                          {type === "direct" ? channel.name : `# ${channel.name}`}
                        </span>
                        {unread > 0 && (
                          <Badge variant="default" className="h-5 min-w-5 px-1.5 text-xs ml-2">
                            {unread}
                          </Badge>
                        )}
                      </Button>
                    );
                  })}

                  {typeChannels.length === 0 && (
                    <p className="text-xs text-muted-foreground px-3 py-2">
                      No {config.label.toLowerCase()} yet
                    </p>
                  )}
                </CollapsibleContent>
              </Collapsible>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
}
