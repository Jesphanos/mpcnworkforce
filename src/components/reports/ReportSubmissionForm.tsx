import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { CalendarIcon, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { useCreateWorkReport } from "@/hooks/useWorkReports";
import { PlatformIcon } from "@/components/ui/PlatformIcon";

const platforms = [
  "Upwork",
  "Fiverr",
  "Swagbucks",
  "Freelancer",
  "Trading",
  "Other",
];

const formSchema = z.object({
  platform: z.string().min(1, "Platform is required"),
  work_date: z.date({ required_error: "Work date is required" }),
  hours_worked: z.coerce.number().min(0.1, "Hours must be at least 0.1"),
  earnings: z.coerce.number().min(0, "Earnings cannot be negative"),
  description: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export function ReportSubmissionForm() {
  const [open, setOpen] = useState(false);
  const createReport = useCreateWorkReport();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      platform: "",
      hours_worked: 0,
      earnings: 0,
      description: "",
    },
  });

  const onSubmit = async (values: FormValues) => {
    await createReport.mutateAsync({
      platform: values.platform,
      hours_worked: values.hours_worked,
      earnings: values.earnings,
      description: values.description,
      work_date: format(values.work_date, "yyyy-MM-dd"),
    });
    form.reset();
    setOpen(false);
  };

  if (!open) {
    return (
      <Button onClick={() => setOpen(true)} className="gap-2">
        <Plus className="h-4 w-4" />
        Submit New Report
      </Button>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Submit Work Report</CardTitle>
        <CardDescription>Log your work for a specific day. All fields marked with * are required.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="platform"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Platform *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select platform" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {platforms.map((p) => (
                          <SelectItem key={p} value={p}>
                            <PlatformIcon platform={p} size="sm" showLabel />
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">
                      Select the platform where you performed this work
                    </p>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="work_date"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Work Date *</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? format(field.value, "PPP") : "Pick a date"}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) => date > new Date()}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <p className="text-xs text-muted-foreground">
                      The date when the work was performed
                    </p>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="hours_worked"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Hours Worked *</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.5" {...field} />
                    </FormControl>
                    <p className="text-xs text-muted-foreground">
                      Total hours spent on this work (minimum 0.1)
                    </p>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="earnings"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Earnings ($) *</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" {...field} />
                    </FormControl>
                    <p className="text-xs text-muted-foreground">
                      Your earnings for this work in USD
                    </p>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (Optional)</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Describe your work, milestones achieved, or tasks completed..." 
                      {...field} 
                    />
                  </FormControl>
                  <p className="text-xs text-muted-foreground">
                    Provide details about tasks, achievements, or notes for reviewers
                  </p>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="bg-muted/50 p-3 rounded-lg">
              <p className="text-xs text-muted-foreground">
                After submission, your report will be reviewed by your team lead. 
                You'll receive a notification once it's approved or if revisions are needed.
              </p>
            </div>

            <div className="flex gap-2">
              <Button type="submit" disabled={createReport.isPending}>
                {createReport.isPending ? "Submitting..." : "Submit Report"}
              </Button>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
