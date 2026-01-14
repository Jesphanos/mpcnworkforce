import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useTeamMembers } from "@/hooks/useTeamData";
import { useCreateTask } from "@/hooks/useTasks";
import { useActivePlatforms } from "@/hooks/useSettings";
import { UserPlus, Loader2 } from "lucide-react";
import { TaskContractFields } from "./TaskContractFields";
import { 
  EffortBand, 
  ReviewType, 
  PaymentLogicType, 
  FailureHandlingPolicy 
} from "@/hooks/useTaskContracts";
import { toast } from "sonner";

interface TaskAssignmentDialogProps {
  trigger?: React.ReactNode;
  onSuccess?: () => void;
}

export function TaskAssignmentDialog({ trigger, onSuccess }: TaskAssignmentDialogProps) {
  const [open, setOpen] = useState(false);
  const [selectedWorker, setSelectedWorker] = useState<string>("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [platform, setPlatform] = useState("");
  const [workDate, setWorkDate] = useState(new Date().toISOString().split("T")[0]);
  const [hoursWorked, setHoursWorked] = useState("");
  
  // Contract fields state - using string types for flexibility
  const [taskPurpose, setTaskPurpose] = useState("");
  const [successCriteria, setSuccessCriteria] = useState("");
  const [effortBand, setEffortBand] = useState<EffortBand>("low");
  const [reviewType, setReviewType] = useState<ReviewType>("team_lead");
  const [paymentLogicType, setPaymentLogicType] = useState<PaymentLogicType>("fixed");
  const [failureHandlingPolicy, setFailureHandlingPolicy] = useState<FailureHandlingPolicy>("revision");

  const { data: teamMembers, isLoading: loadingMembers } = useTeamMembers();
  const { data: platforms } = useActivePlatforms();
  const createTask = useCreateTask();

  const handleSubmit = async () => {
    if (!selectedWorker || !title || !platform || !workDate) {
      toast.error("Please fill in all required fields");
      return;
    }

    createTask.mutate(
      {
        assigned_to: selectedWorker,
        title,
        description: description || undefined,
        platform,
        work_date: workDate,
        hours_worked: hoursWorked ? parseFloat(hoursWorked) : 0,
        status: "assigned",
        task_purpose: taskPurpose || undefined,
        success_criteria: successCriteria || undefined,
        effort_band: effortBand,
        review_type: reviewType,
        payment_logic_type: paymentLogicType,
        failure_handling_policy: failureHandlingPolicy,
      },
      {
        onSuccess: () => {
          setOpen(false);
          resetForm();
          onSuccess?.();
        },
        onError: (error) => {
          toast.error("Failed to assign task: " + error.message);
        },
      }
    );
  };

  const resetForm = () => {
    setSelectedWorker("");
    setTitle("");
    setDescription("");
    setPlatform("");
    setWorkDate(new Date().toISOString().split("T")[0]);
    setHoursWorked("");
    setTaskPurpose("");
    setSuccessCriteria("");
    setEffortBand("low");
    setReviewType("team_lead");
    setPaymentLogicType("fixed");
    setFailureHandlingPolicy("revision");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button className="gap-2">
            <UserPlus className="h-4 w-4" />
            Assign Task
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Assign Task to Worker</DialogTitle>
          <DialogDescription>
            Create a new task assignment with pre-filled contract fields for clear expectations
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {/* Worker Selection */}
          <div className="grid gap-2">
            <Label htmlFor="worker">Assign To *</Label>
            <Select value={selectedWorker} onValueChange={setSelectedWorker}>
              <SelectTrigger>
                <SelectValue placeholder={loadingMembers ? "Loading..." : "Select a team member"} />
              </SelectTrigger>
              <SelectContent>
                {teamMembers?.map((member) => (
                  <SelectItem key={member.id} value={member.id}>
                    {member.full_name || "Unknown User"}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Basic Task Info */}
          <div className="grid gap-2">
            <Label htmlFor="title">Task Title *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter task title"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the task requirements"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="platform">Platform *</Label>
              <Select value={platform} onValueChange={setPlatform}>
                <SelectTrigger>
                  <SelectValue placeholder="Select platform" />
                </SelectTrigger>
                <SelectContent>
                  {platforms?.map((p) => (
                    <SelectItem key={p.id} value={p.name}>
                      {p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="workDate">Work Date *</Label>
              <Input
                id="workDate"
                type="date"
                value={workDate}
                onChange={(e) => setWorkDate(e.target.value)}
              />
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="hours">Estimated Hours</Label>
            <Input
              id="hours"
              type="number"
              step="0.5"
              min="0"
              value={hoursWorked}
              onChange={(e) => setHoursWorked(e.target.value)}
              placeholder="0"
            />
          </div>

          {/* Contract Fields */}
          <div className="border-t pt-4 mt-2">
            <h4 className="font-medium mb-4">Task Contract Details</h4>
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
              showAdvanced
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={createTask.isPending}>
            {createTask.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Assign Task
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
