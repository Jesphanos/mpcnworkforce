-- Create channel type enum
CREATE TYPE public.channel_type AS ENUM ('team', 'department', 'announcement', 'direct');

-- Create channels table
CREATE TABLE public.channels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  channel_type public.channel_type NOT NULL,
  team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE,
  department_id UUID REFERENCES public.departments(id) ON DELETE CASCADE,
  created_by UUID NOT NULL,
  is_archived BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create channel participants table
CREATE TABLE public.channel_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  channel_id UUID REFERENCES public.channels(id) ON DELETE CASCADE NOT NULL,
  user_id UUID NOT NULL,
  role TEXT DEFAULT 'member' CHECK (role IN ('admin', 'moderator', 'member')),
  last_read_at TIMESTAMPTZ DEFAULT now(),
  joined_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(channel_id, user_id)
);

-- Create messages table
CREATE TABLE public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  channel_id UUID REFERENCES public.channels(id) ON DELETE CASCADE NOT NULL,
  sender_id UUID NOT NULL,
  content TEXT NOT NULL,
  attachment_url TEXT,
  attachment_type TEXT,
  is_pinned BOOLEAN DEFAULT false,
  pinned_by UUID,
  pinned_at TIMESTAMPTZ,
  is_edited BOOLEAN DEFAULT false,
  edited_at TIMESTAMPTZ,
  reply_to_id UUID REFERENCES public.messages(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create message read receipts for unread tracking
CREATE TABLE public.message_read_receipts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id UUID REFERENCES public.messages(id) ON DELETE CASCADE NOT NULL,
  user_id UUID NOT NULL,
  read_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(message_id, user_id)
);

-- Enable RLS
ALTER TABLE public.channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.channel_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.message_read_receipts ENABLE ROW LEVEL SECURITY;

-- Enable realtime for messages
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.channel_participants;

-- Indexes for performance
CREATE INDEX idx_messages_channel_id ON public.messages(channel_id);
CREATE INDEX idx_messages_created_at ON public.messages(created_at DESC);
CREATE INDEX idx_channel_participants_user_id ON public.channel_participants(user_id);
CREATE INDEX idx_channel_participants_channel_id ON public.channel_participants(channel_id);

-- RLS Policies for channels
CREATE POLICY "Users can view channels they participate in"
ON public.channels FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.channel_participants
    WHERE channel_id = channels.id AND user_id = auth.uid()
  )
  OR channel_type = 'announcement'
  OR has_role(auth.uid(), 'general_overseer')
  OR has_role(auth.uid(), 'user_admin')
);

CREATE POLICY "Admins can create channels"
ON public.channels FOR INSERT
TO authenticated
WITH CHECK (
  has_role(auth.uid(), 'general_overseer')
  OR has_role(auth.uid(), 'user_admin')
  OR has_role(auth.uid(), 'department_head')
  OR has_role(auth.uid(), 'team_lead')
);

CREATE POLICY "Channel creators and admins can update"
ON public.channels FOR UPDATE
TO authenticated
USING (
  created_by = auth.uid()
  OR has_role(auth.uid(), 'general_overseer')
  OR has_role(auth.uid(), 'user_admin')
);

-- RLS Policies for participants
CREATE POLICY "Users can view participants in their channels"
ON public.channel_participants FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.channel_participants cp
    WHERE cp.channel_id = channel_participants.channel_id AND cp.user_id = auth.uid()
  )
);

CREATE POLICY "Channel admins can manage participants"
ON public.channel_participants FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.channel_participants cp
    WHERE cp.channel_id = channel_participants.channel_id 
    AND cp.user_id = auth.uid()
    AND cp.role IN ('admin', 'moderator')
  )
  OR has_role(auth.uid(), 'general_overseer')
  OR has_role(auth.uid(), 'user_admin')
);

CREATE POLICY "Users can leave channels"
ON public.channel_participants FOR DELETE
TO authenticated
USING (user_id = auth.uid());

-- RLS Policies for messages
CREATE POLICY "Participants can view messages in their channels"
ON public.messages FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.channel_participants
    WHERE channel_id = messages.channel_id AND user_id = auth.uid()
  )
  OR EXISTS (
    SELECT 1 FROM public.channels
    WHERE id = messages.channel_id AND channel_type = 'announcement'
  )
);

CREATE POLICY "Participants can send messages"
ON public.messages FOR INSERT
TO authenticated
WITH CHECK (
  sender_id = auth.uid()
  AND EXISTS (
    SELECT 1 FROM public.channel_participants
    WHERE channel_id = messages.channel_id AND user_id = auth.uid()
  )
);

CREATE POLICY "Users can edit their own messages"
ON public.messages FOR UPDATE
TO authenticated
USING (sender_id = auth.uid());

CREATE POLICY "Users can delete their own messages"
ON public.messages FOR DELETE
TO authenticated
USING (
  sender_id = auth.uid()
  OR has_role(auth.uid(), 'general_overseer')
  OR EXISTS (
    SELECT 1 FROM public.channel_participants
    WHERE channel_id = messages.channel_id 
    AND user_id = auth.uid()
    AND role IN ('admin', 'moderator')
  )
);

-- RLS for read receipts
CREATE POLICY "Users can manage their own read receipts"
ON public.message_read_receipts FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Update trigger
CREATE TRIGGER update_channels_updated_at
  BEFORE UPDATE ON public.channels
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_messages_updated_at
  BEFORE UPDATE ON public.messages
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();