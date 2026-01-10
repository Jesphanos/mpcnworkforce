/**
 * Support Request Form
 * 
 * Humane framing for raising concerns or requesting support.
 * Uses resolution_requests table (not deprecated complaints).
 */

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { HelpCircle, Send, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useCreateSupportRequest } from "@/hooks/useSupportRequests";

/**
 * Reframed categories with supportive language
 */
const SUPPORT_CATEGORIES = [
  { 
    value: "guidance", 
    label: "Need Guidance",
    description: "Help understanding a process or decision"
  },
  { 
    value: "technical", 
    label: "Technical Support",
    description: "Platform or tool issues"
  },
  { 
    value: "payment", 
    label: "Payment Clarification",
    description: "Questions about earnings or rates"
  },
  { 
    value: "schedule", 
    label: "Workload Discussion",
    description: "Capacity or scheduling concerns"
  },
  { 
    value: "team", 
    label: "Team Coordination",
    description: "Communication or collaboration topics"
  },
  { 
    value: "policy", 
    label: "Policy Question",
    description: "Clarification on guidelines"
  },
  { 
    value: "feedback", 
    label: "General Feedback",
    description: "Suggestions or observations"
  },
];

const formSchema = z.object({
  category: z.string().min(1, "Please select a category"),
  title: z.string()
    .min(5, "Please provide a brief title (at least 5 characters)")
    .max(100, "Title must be less than 100 characters"),
  description: z.string()
    .min(10, "Please provide a bit more detail (at least 10 characters)")
    .max(1000, "Description must be less than 1000 characters"),
});

type FormValues = z.infer<typeof formSchema>;

interface SupportRequestFormProps {
  variant?: "button" | "card";
}

export function SupportRequestForm({ variant = "button" }: SupportRequestFormProps) {
  const [open, setOpen] = useState(false);
  const createRequest = useCreateSupportRequest();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      category: "",
      title: "",
      description: "",
    },
  });

  const onSubmit = async (values: FormValues) => {
    await createRequest.mutateAsync({
      category: values.category,
      title: values.title,
      description: values.description,
    });
    form.reset();
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <HelpCircle className="h-4 w-4" />
          Request Support
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5 text-primary" />
            Request Support
          </DialogTitle>
          <DialogDescription className="text-left">
            Need help or have a concern? Your request will be handled privately. 
            We're here to support you.
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>What do you need help with?</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a topic" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {SUPPORT_CATEGORIES.map((cat) => (
                        <SelectItem key={cat.value} value={cat.value}>
                          <div>
                            <span>{cat.label}</span>
                            <span className="text-muted-foreground ml-2 text-xs">
                              — {cat.description}
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Brief title</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="A short summary of your request..."
                      {...field} 
                    />
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
                  <FormLabel>Tell us more</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Describe what you need help with. The more detail you provide, the better we can assist you..."
                      className="min-h-[120px]"
                      {...field} 
                    />
                  </FormControl>
                  <FormDescription className="flex justify-between">
                    <span>Your request will be handled privately</span>
                    <span>{field.value.length}/1000</span>
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="bg-muted/50 rounded-lg p-3 text-sm text-muted-foreground">
              <p className="flex items-start gap-2">
                <HelpCircle className="h-4 w-4 mt-0.5 shrink-0" />
                <span>
                  Your request will be reviewed by your team lead first. 
                  If needed, it can be escalated to an administrator for additional support.
                </span>
              </p>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={createRequest.isPending}>
                <Send className="h-4 w-4 mr-2" />
                {createRequest.isPending ? "Submitting..." : "Submit Request"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
