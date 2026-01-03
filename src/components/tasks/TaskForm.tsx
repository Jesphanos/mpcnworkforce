import { useState } from "react";
import { format } from "date-fns";
import { CalendarIcon, Plus } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { useCreateTask } from "@/hooks/useTasks";

const platforms = ["Remotasks", "Outlier", "Scale AI", "Appen", "Clickworker", "Other"];

export function TaskForm() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [platform, setPlatform] = useState("");
  const [workDate, setWorkDate] = useState<Date>();
  const [hoursWorked, setHoursWorked] = useState("");
  const [baseRate, setBaseRate] = useState("");
  
  const createTask = useCreateTask();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title || !platform || !workDate || !hoursWorked || !baseRate) {
      return;
    }

    await createTask.mutateAsync({
      title,
      description: description || undefined,
      platform,
      work_date: format(workDate, "yyyy-MM-dd"),
      hours_worked: parseFloat(hoursWorked),
      base_rate: parseFloat(baseRate),
    });

    // Reset form
    setTitle("");
    setDescription("");
    setPlatform("");
    setWorkDate(undefined);
    setHoursWorked("");
    setBaseRate("");
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Plus className="h-5 w-5" />
          Submit New Task
        </CardTitle>
        <CardDescription>
          Create a task with rate-based earnings calculation
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="title">Task Title</Label>
              <Input
                id="title"
                placeholder="Enter task title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="platform">Platform</Label>
              <Select value={platform} onValueChange={setPlatform} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select platform" />
                </SelectTrigger>
                <SelectContent>
                  {platforms.map((p) => (
                    <SelectItem key={p} value={p}>
                      {p}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Work Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !workDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {workDate ? format(workDate, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={workDate}
                    onSelect={setWorkDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label htmlFor="hours">Hours Worked</Label>
              <Input
                id="hours"
                type="number"
                step="0.5"
                min="0"
                placeholder="0"
                value={hoursWorked}
                onChange={(e) => setHoursWorked(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="rate">Base Rate ($/hr)</Label>
              <Input
                id="rate"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={baseRate}
                onChange={(e) => setBaseRate(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Estimated Earnings</Label>
              <div className="h-10 flex items-center px-3 border rounded-md bg-muted/50">
                <span className="text-muted-foreground">
                  ${((parseFloat(hoursWorked) || 0) * (parseFloat(baseRate) || 0)).toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description (optional)</Label>
            <Textarea
              id="description"
              placeholder="Brief description of the task..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <Button type="submit" className="w-full" disabled={createTask.isPending}>
            {createTask.isPending ? "Submitting..." : "Submit Task"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
