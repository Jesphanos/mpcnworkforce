import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Hash, Users, Megaphone, MessageCircle, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ChannelType, useCreateChannel } from "@/hooks/useMessaging";
import { cn } from "@/lib/utils";

const channelSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(50),
  description: z.string().max(200).optional(),
  channelType: z.enum(["team", "department", "announcement", "direct"]),
});

type ChannelFormValues = z.infer<typeof channelSchema>;

interface CreateChannelDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const channelTypes: { value: ChannelType; label: string; icon: React.ElementType; description: string }[] = [
  { value: "team", label: "Team Channel", icon: Users, description: "For team collaboration" },
  { value: "department", label: "Department", icon: Hash, description: "Department-wide discussions" },
  { value: "announcement", label: "Announcement", icon: Megaphone, description: "Broadcast important updates" },
  { value: "direct", label: "Direct Message", icon: MessageCircle, description: "Private conversation" },
];

export function CreateChannelDialog({ open, onOpenChange }: CreateChannelDialogProps) {
  const createChannel = useCreateChannel();

  const form = useForm<ChannelFormValues>({
    resolver: zodResolver(channelSchema),
    defaultValues: {
      name: "",
      description: "",
      channelType: "team",
    },
  });

  const onSubmit = async (values: ChannelFormValues) => {
    try {
      await createChannel.mutateAsync({
        name: values.name,
        description: values.description,
        channelType: values.channelType,
      });
      form.reset();
      onOpenChange(false);
    } catch (error) {
      // Error handled in hook
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create Channel</DialogTitle>
          <DialogDescription>
            Create a new channel for team communication
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="channelType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Channel Type</FormLabel>
                  <div className="grid grid-cols-2 gap-2">
                    {channelTypes.map((type) => {
                      const Icon = type.icon;
                      const isSelected = field.value === type.value;

                      return (
                        <button
                          key={type.value}
                          type="button"
                          onClick={() => field.onChange(type.value)}
                          className={cn(
                            "flex flex-col items-center gap-2 p-3 rounded-lg border-2 transition-all",
                            isSelected
                              ? "border-primary bg-primary/5"
                              : "border-muted hover:border-muted-foreground/30"
                          )}
                        >
                          <Icon className={cn("h-5 w-5", isSelected && "text-primary")} />
                          <span className="text-xs font-medium">{type.label}</span>
                        </button>
                      );
                    })}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Channel Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. general, announcements" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="What's this channel about?"
                      className="resize-none"
                      rows={2}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Help others understand the purpose of this channel
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={createChannel.isPending}>
                {createChannel.isPending && (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                )}
                Create Channel
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
