import { useState } from "react";
import { format } from "date-fns";
import { CalendarIcon, Plus, Upload, Link2, Users } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { useCreateTask } from "@/hooks/useTasks";
import { CollaboratorsPicker } from "./CollaboratorsPicker";
import { TaskContractFields } from "./TaskContractFields";
import { EffortBand, ReviewType, PaymentLogicType, FailureHandlingPolicy } from "@/hooks/useTaskContracts";

const platforms = ["Remotasks", "Outlier", "Scale AI", "Appen", "Clickworker", "Upwork", "Fiverr", "Other"];

const taskTypes = [
  { value: "research", label: "Research" },
  { value: "coding", label: "Coding" },
  { value: "design", label: "Design" },
  { value: "support", label: "Support" },
  { value: "writing", label: "Writing" },
  { value: "data_entry", label: "Data Entry" },
  { value: "quality_assurance", label: "Quality Assurance" },
  { value: "project_management", label: "Project Management" },
  { value: "other", label: "Other" },
];

export function TaskForm() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [platform, setPlatform] = useState("");
  const [taskType, setTaskType] = useState("other");
  const [workDate, setWorkDate] = useState<Date>();
  const [dueDate, setDueDate] = useState<Date>();
  const [hoursWorked, setHoursWorked] = useState("");
  const [estimatedHours, setEstimatedHours] = useState("");
  const [baseRate, setBaseRate] = useState("");
  const [progressPercent, setProgressPercent] = useState("0");
  const [externalTaskId, setExternalTaskId] = useState("");
  const [evidenceUrl, setEvidenceUrl] = useState("");
  const [evidenceRequired, setEvidenceRequired] = useState(true);
  const [collaborators, setCollaborators] = useState<string[]>([]);
  
  // Task contract fields
  const [taskPurpose, setTaskPurpose] = useState("");
  const [successCriteria, setSuccessCriteria] = useState("");
  const [effortBand, setEffortBand] = useState<EffortBand>("medium");
  const [reviewType, setReviewType] = useState<ReviewType>("team_lead");
  const [paymentLogicType, setPaymentLogicType] = useState<PaymentLogicType>("fixed");
  const [failureHandlingPolicy, setFailureHandlingPolicy] = useState<FailureHandlingPolicy>("revision");
  
  const createTask = useCreateTask();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title || !platform || !workDate || !hoursWorked || !baseRate) {
      return;
    }

    // Validate evidence if required
    if (evidenceRequired && !evidenceUrl) {
      return;
    }

    await createTask.mutateAsync({
      title,
      description: description || undefined,
      platform,
      task_type: taskType as any,
      work_date: format(workDate, "yyyy-MM-dd"),
      due_date: dueDate ? format(dueDate, "yyyy-MM-dd") : undefined,
      hours_worked: parseFloat(hoursWorked),
      estimated_hours: estimatedHours ? parseFloat(estimatedHours) : undefined,
      base_rate: parseFloat(baseRate),
      progress_percent: parseInt(progressPercent),
      external_task_id: externalTaskId || undefined,
      evidence_url: evidenceUrl || undefined,
      evidence_required: evidenceRequired,
      collaborators: collaborators.length > 0 ? collaborators : undefined,
      // Task contract fields
      task_purpose: taskPurpose || undefined,
      success_criteria: successCriteria || undefined,
      effort_band: effortBand,
      review_type: reviewType,
      payment_logic_type: paymentLogicType,
      failure_handling_policy: failureHandlingPolicy,
    });

    // Reset form
    setTitle("");
    setDescription("");
    setPlatform("");
    setTaskType("other");
    setWorkDate(undefined);
    setDueDate(undefined);
    setHoursWorked("");
    setEstimatedHours("");
    setBaseRate("");
    setProgressPercent("0");
    setExternalTaskId("");
    setEvidenceUrl("");
    setEvidenceRequired(true);
    setCollaborators([]);
    setTaskPurpose("");
    setSuccessCriteria("");
    setEffortBand("medium");
    setReviewType("team_lead");
    setPaymentLogicType("fixed");
    setFailureHandlingPolicy("revision");
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Plus className="h-5 w-5" />
          Submit New Task
        </CardTitle>
        <CardDescription>
          Create a task with rate-based earnings calculation. Evidence is mandatory for verification.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="title">Task Title *</Label>
              <Input
                id="title"
                placeholder="Enter task title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="platform">Platform *</Label>
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
              <Label htmlFor="taskType">Task Type *</Label>
              <Select value={taskType} onValueChange={setTaskType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {taskTypes.map((t) => (
                    <SelectItem key={t.value} value={t.value}>
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="externalTaskId">External Task ID (Optional)</Label>
              <Input
                id="externalTaskId"
                placeholder="ID from external platform"
                value={externalTaskId}
                onChange={(e) => setExternalTaskId(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Link this to an external platform task
              </p>
            </div>
          </div>

          {/* Dates */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Work Date *</Label>
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
              <Label>Due Date (Optional)</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !dueDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dueDate ? format(dueDate, "PPP") : "Pick a due date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={dueDate}
                    onSelect={setDueDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Hours & Rate */}
          <div className="grid gap-4 md:grid-cols-4">
            <div className="space-y-2">
              <Label htmlFor="hours">Hours Worked *</Label>
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
              <Label htmlFor="estimatedHours">Estimated Hours</Label>
              <Input
                id="estimatedHours"
                type="number"
                step="0.5"
                min="0"
                placeholder="0"
                value={estimatedHours}
                onChange={(e) => setEstimatedHours(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="rate">Base Rate ($/hr) *</Label>
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

          {/* Progress */}
          <div className="space-y-2">
            <Label htmlFor="progress">Progress: {progressPercent}%</Label>
            <Input
              id="progress"
              type="range"
              min="0"
              max="100"
              step="5"
              value={progressPercent}
              onChange={(e) => setProgressPercent(e.target.value)}
              className="cursor-pointer"
            />
          </div>

          {/* Evidence Section */}
          <div className="space-y-4 p-4 border rounded-lg bg-muted/30">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="flex items-center gap-2">
                  <Upload className="h-4 w-4" />
                  Evidence / Proof of Work
                </Label>
                <p className="text-xs text-muted-foreground">
                  Provide a link to proof of completion (screenshot, file, or external link)
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Label htmlFor="evidenceRequired" className="text-sm">Required</Label>
                <Switch
                  id="evidenceRequired"
                  checked={evidenceRequired}
                  onCheckedChange={setEvidenceRequired}
                />
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Link2 className="h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="https://drive.google.com/file/... or proof link"
                value={evidenceUrl}
                onChange={(e) => setEvidenceUrl(e.target.value)}
                required={evidenceRequired}
              />
            </div>
            {evidenceRequired && !evidenceUrl && (
              <p className="text-xs text-destructive">
                Evidence is required for this task to be submitted for review
              </p>
            )}
          </div>

          {/* Collaborators Section */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Collaborators (Optional)
            </Label>
            <p className="text-xs text-muted-foreground mb-2">
              Add team members who contributed to this task
            </p>
            <CollaboratorsPicker
              value={collaborators}
              onChange={setCollaborators}
            />
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

          {/* Task Contract Fields */}
          <Separator />
          <TaskContractFields 
            taskPurpose={taskPurpose}
            setTaskPurpose={setTaskPurpose}
            successCriteria={successCriteria}
            setSuccessCriteria={setSuccessCriteria}
            effortBand={effortBand}
            setEffortBand={setEffortBand}
            reviewType={reviewType}
            setReviewType={setReviewType}
            paymentLogicType={paymentLogicType}
            setPaymentLogicType={setPaymentLogicType}
            failureHandlingPolicy={failureHandlingPolicy}
            setFailureHandlingPolicy={setFailureHandlingPolicy}
          />

          <Button 
            type="submit" 
            className="w-full" 
            disabled={createTask.isPending || (evidenceRequired && !evidenceUrl)}
          >
            {createTask.isPending ? "Submitting..." : "Submit Task"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
