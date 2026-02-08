import { useState, useEffect } from "react";
import { Hash, Users, Megaphone, MessageCircle, Settings, X, Users2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { ChannelList } from "./ChannelList";
import { MessageList } from "./MessageList";
import { MessageComposer } from "./MessageComposer";
import { CreateChannelDialog } from "./CreateChannelDialog";
import {
  useChannels,
  useChannelMessages,
  useSendMessage,
  useUnreadCounts,
  useRealtimeMessages,
  useMarkChannelRead,
  Channel,
} from "@/hooks/useMessaging";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";

const channelTypeIcons = {
  team: Users,
  department: Hash,
  announcement: Megaphone,
  direct: MessageCircle,
};

interface MessagingPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function MessagingPanel({ open, onOpenChange }: MessagingPanelProps) {
  const { user, role } = useAuth();
  const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  const { data: channels = [], isLoading: channelsLoading } = useChannels();
  const { data: messages = [], isLoading: messagesLoading } = useChannelMessages(
    selectedChannel?.id || null
  );
  const { data: unreadCounts = {} } = useUnreadCounts();
  const sendMessage = useSendMessage();
  const markRead = useMarkChannelRead();

  // Enable realtime for selected channel
  useRealtimeMessages(selectedChannel?.id || null);

  // Mark channel as read when selected
  useEffect(() => {
    if (selectedChannel?.id) {
      markRead.mutate(selectedChannel.id);
    }
  }, [selectedChannel?.id]);

  const canCreateChannel =
    role === "general_overseer" ||
    role === "user_admin" ||
    role === "department_head" ||
    role === "team_lead";

  const handleSendMessage = (content: string, attachmentUrl?: string, attachmentType?: string) => {
    if (!selectedChannel) return;
    sendMessage.mutate({
      channelId: selectedChannel.id,
      content,
      attachmentUrl,
      attachmentType,
    });
  };

  const ChannelIcon = selectedChannel
    ? channelTypeIcons[selectedChannel.channel_type]
    : Hash;

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="right" className="w-full sm:max-w-2xl p-0 flex">
          {/* Channel sidebar */}
          <div className="w-56 border-r flex flex-col bg-muted/30">
            <ChannelList
              channels={channels}
              selectedChannelId={selectedChannel?.id || null}
              unreadCounts={unreadCounts}
              onSelectChannel={setSelectedChannel}
              onCreateChannel={() => setCreateDialogOpen(true)}
              canCreateChannel={canCreateChannel}
            />
          </div>

          {/* Message area */}
          <div className="flex-1 flex flex-col min-w-0">
            {selectedChannel ? (
              <>
                {/* Channel header */}
                <div className="h-14 px-4 border-b flex items-center justify-between gap-4">
                  <div className="flex items-center gap-2 min-w-0">
                    <ChannelIcon className="h-5 w-5 text-muted-foreground shrink-0" />
                    <div className="min-w-0">
                      <h3 className="font-semibold text-sm truncate">
                        {selectedChannel.name}
                      </h3>
                      {selectedChannel.description && (
                        <p className="text-xs text-muted-foreground truncate">
                          {selectedChannel.description}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Users2 className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Settings className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Messages */}
                <MessageList
                  messages={messages}
                  isLoading={messagesLoading}
                  currentUserId={user?.id}
                />

                {/* Composer */}
                <MessageComposer
                  onSend={handleSendMessage}
                  disabled={sendMessage.isPending}
                  placeholder={`Message #${selectedChannel.name}`}
                />
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <h3 className="font-medium">Select a channel</h3>
                  <p className="text-sm mt-1">
                    Choose a channel to start messaging
                  </p>
                </div>
              </div>
            )}
          </div>
        </SheetContent>
      </Sheet>

      <CreateChannelDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
      />
    </>
  );
}
