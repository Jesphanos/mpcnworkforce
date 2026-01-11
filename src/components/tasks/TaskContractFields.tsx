import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileCheck, Target, Gauge, UserCheck, DollarSign, AlertTriangle } from "lucide-react";
import {
  EffortBand,
  ReviewType,
  PaymentLogicType,
  FailureHandlingPolicy,
  EFFORT_BAND_CONFIG,
  REVIEW_TYPE_CONFIG,
  PAYMENT_LOGIC_CONFIG,
} from "@/hooks/useTaskContracts";

interface TaskContractFieldsProps {
  taskPurpose: string;
  setTaskPurpose: (value: string) => void;
  successCriteria: string;
  setSuccessCriteria: (value: string) => void;
  effortBand: EffortBand;
  setEffortBand: (value: EffortBand) => void;
  reviewType: ReviewType;
  setReviewType: (value: ReviewType) => void;
  paymentLogicType: PaymentLogicType;
  setPaymentLogicType: (value: PaymentLogicType) => void;
  failureHandlingPolicy: FailureHandlingPolicy;
  setFailureHandlingPolicy: (value: FailureHandlingPolicy) => void;
  showAdvanced?: boolean;
}

/**
 * Task Contract Fields Component
 * Defines explicit responsibility contracts for tasks
 */
export function TaskContractFields({
  taskPurpose,
  setTaskPurpose,
  successCriteria,
  setSuccessCriteria,
  effortBand,
  setEffortBand,
  reviewType,
  setReviewType,
  paymentLogicType,
  setPaymentLogicType,
  failureHandlingPolicy,
  setFailureHandlingPolicy,
  showAdvanced = false,
}: TaskContractFieldsProps) {
  return (
    <Card className="border-dashed">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <FileCheck className="h-4 w-4" />
          Task Contract
        </CardTitle>
        <CardDescription className="text-xs">
          Define the responsibility and success criteria for this task
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Purpose */}
        <div className="space-y-2">
          <Label className="text-xs flex items-center gap-1.5">
            <Target className="h-3.5 w-3.5" />
            Purpose (Why MPCN needs this)
          </Label>
          <Textarea
            placeholder="Describe why this task matters to MPCN..."
            value={taskPurpose}
            onChange={(e) => setTaskPurpose(e.target.value)}
            className="text-sm min-h-[60px]"
          />
        </div>

        {/* Success Criteria */}
        <div className="space-y-2">
          <Label className="text-xs flex items-center gap-1.5">
            <Gauge className="h-3.5 w-3.5" />
            Success Criteria
          </Label>
          <Textarea
            placeholder="What defines successful completion?"
            value={successCriteria}
            onChange={(e) => setSuccessCriteria(e.target.value)}
            className="text-sm min-h-[60px]"
          />
        </div>

        {/* Effort Band & Review Type */}
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label className="text-xs">Effort Level</Label>
            <Select value={effortBand} onValueChange={(v) => setEffortBand(v as EffortBand)}>
              <SelectTrigger className="h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(EFFORT_BAND_CONFIG).map(([key, config]) => (
                  <SelectItem key={key} value={key}>
                    <span className="flex items-center gap-2">
                      <span className={`h-2 w-2 rounded-full ${config.color.split(" ")[0]}`} />
                      {config.label}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-xs flex items-center gap-1.5">
              <UserCheck className="h-3.5 w-3.5" />
              Review Type
            </Label>
            <Select value={reviewType} onValueChange={(v) => setReviewType(v as ReviewType)}>
              <SelectTrigger className="h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(REVIEW_TYPE_CONFIG).map(([key, config]) => (
                  <SelectItem key={key} value={key}>
                    {config.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Advanced Options */}
        {showAdvanced && (
          <div className="grid gap-4 md:grid-cols-2 pt-2 border-t">
            <div className="space-y-2">
              <Label className="text-xs flex items-center gap-1.5">
                <DollarSign className="h-3.5 w-3.5" />
                Payment Logic
              </Label>
              <Select
                value={paymentLogicType}
                onValueChange={(v) => setPaymentLogicType(v as PaymentLogicType)}
              >
                <SelectTrigger className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(PAYMENT_LOGIC_CONFIG).map(([key, config]) => (
                    <SelectItem key={key} value={key}>
                      {config.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-xs flex items-center gap-1.5">
                <AlertTriangle className="h-3.5 w-3.5" />
                If Task Fails
              </Label>
              <Select
                value={failureHandlingPolicy}
                onValueChange={(v) => setFailureHandlingPolicy(v as FailureHandlingPolicy)}
              >
                <SelectTrigger className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="revision">Request Revision</SelectItem>
                  <SelectItem value="partial_approval">Partial Approval</SelectItem>
                  <SelectItem value="escalation">Escalate to Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
