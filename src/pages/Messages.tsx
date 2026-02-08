import { useState, useEffect } from "react";
import { Hash, Users, Megaphone, MessageCircle, Settings, Users2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ChannelList } from "@/components/messaging/ChannelList";
import { MessageList } from "@/components/messaging/MessageList";
import { MessageComposer } from "@/components/messaging/MessageComposer";
import { CreateChannelDialog } from "@/components/messaging/CreateChannelDialog";
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

const channelTypeIcons = {
  team: Users,
  department: Hash,
  announcement: Megaphone,
  direct: MessageCircle,
};

export default function Messages() {
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

  // Auto-select first channel
  useEffect(() => {
    if (channels.length > 0 && !selectedChannel) {
      setSelectedChannel(channels[0]);
    }
  }, [channels, selectedChannel]);

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
    <div className="h-[calc(100vh-4rem)] flex">
      {/* Channel sidebar */}
      <div className="w-64 border-r flex flex-col bg-muted/30">
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
            <div className="h-14 px-4 border-b flex items-center justify-between gap-4 bg-background">
              <div className="flex items-center gap-3 min-w-0">
                <ChannelIcon className="h-5 w-5 text-muted-foreground shrink-0" />
                <div className="min-w-0">
                  <h3 className="font-semibold truncate">{selectedChannel.name}</h3>
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
              <MessageCircle className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-medium">Welcome to Messages</h3>
              <p className="text-sm mt-1 max-w-sm">
                Select a channel from the sidebar or create a new one to start messaging
              </p>
              {canCreateChannel && (
                <Button className="mt-4" onClick={() => setCreateDialogOpen(true)}>
                  Create Channel
                </Button>
              )}
            </div>
          </div>
        )}
      </div>

      <CreateChannelDialog open={createDialogOpen} onOpenChange={setCreateDialogOpen} />
    </div>
  );
}
