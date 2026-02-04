import { useState, createContext, useContext, useCallback, ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Check, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";

interface Step {
  id: string;
  title: string;
  description?: string;
  optional?: boolean;
  validate?: () => Promise<boolean> | boolean;
}

interface FormWizardContextType {
  currentStep: number;
  totalSteps: number;
  isFirstStep: boolean;
  isLastStep: boolean;
  goToStep: (step: number) => void;
  nextStep: () => Promise<void>;
  prevStep: () => void;
  isValidating: boolean;
  steps: Step[];
  completedSteps: Set<number>;
}

const FormWizardContext = createContext<FormWizardContextType | undefined>(undefined);

export function useFormWizard() {
  const context = useContext(FormWizardContext);
  if (!context) {
    throw new Error("useFormWizard must be used within FormWizardProvider");
  }
  return context;
}

interface FormWizardProps {
  steps: Step[];
  children: ReactNode[];
  onComplete: () => void | Promise<void>;
  className?: string;
  showProgress?: boolean;
  allowSkipOptional?: boolean;
}

export function FormWizard({
  steps,
  children,
  onComplete,
  className,
  showProgress = true,
  allowSkipOptional = false,
}: FormWizardProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isValidating, setIsValidating] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());

  const totalSteps = steps.length;
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === totalSteps - 1;
  const progress = ((currentStep + 1) / totalSteps) * 100;

  const goToStep = useCallback((step: number) => {
    if (step >= 0 && step < totalSteps) {
      setCurrentStep(step);
    }
  }, [totalSteps]);

  const nextStep = useCallback(async () => {
    const step = steps[currentStep];
    
    // Validate current step if validator exists
    if (step.validate) {
      setIsValidating(true);
      try {
        const isValid = await step.validate();
        if (!isValid) {
          setIsValidating(false);
          return;
        }
      } catch (error) {
        console.error("Validation error:", error);
        setIsValidating(false);
        return;
      }
      setIsValidating(false);
    }
    
    // Mark step as completed
    setCompletedSteps(prev => new Set([...prev, currentStep]));
    
    if (isLastStep) {
      setIsCompleting(true);
      try {
        await onComplete();
      } finally {
        setIsCompleting(false);
      }
    } else {
      setCurrentStep(prev => Math.min(prev + 1, totalSteps - 1));
    }
  }, [currentStep, steps, isLastStep, onComplete, totalSteps]);

  const prevStep = useCallback(() => {
    setCurrentStep(prev => Math.max(prev - 1, 0));
  }, []);

  const value: FormWizardContextType = {
    currentStep,
    totalSteps,
    isFirstStep,
    isLastStep,
    goToStep,
    nextStep,
    prevStep,
    isValidating,
    steps,
    completedSteps,
  };

  return (
    <FormWizardContext.Provider value={value}>
      <div className={cn("space-y-6", className)}>
        {/* Progress indicator */}
        {showProgress && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                Step {currentStep + 1} of {totalSteps}
              </span>
              <span className="font-medium">{steps[currentStep].title}</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        )}

        {/* Step indicators */}
        <div className="flex items-center justify-center gap-2">
          {steps.map((step, index) => {
            const isCompleted = completedSteps.has(index);
            const isCurrent = index === currentStep;
            const isPast = index < currentStep;
            
            return (
              <button
                key={step.id}
                onClick={() => isPast && goToStep(index)}
                disabled={!isPast && !isCurrent}
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-full border-2 text-sm font-medium transition-colors",
                  isCompleted && "border-success bg-success text-success-foreground",
                  isCurrent && !isCompleted && "border-primary bg-primary text-primary-foreground",
                  !isCurrent && !isCompleted && "border-muted bg-muted text-muted-foreground",
                  isPast && "cursor-pointer hover:bg-muted/80"
                )}
                aria-current={isCurrent ? "step" : undefined}
              >
                {isCompleted ? (
                  <Check className="h-4 w-4" />
                ) : (
                  index + 1
                )}
              </button>
            );
          })}
        </div>

        {/* Step content */}
        <div className="min-h-[200px]">
          {children[currentStep]}
        </div>

        {/* Navigation buttons */}
        <div className="flex items-center justify-between pt-4 border-t">
          <Button
            variant="outline"
            onClick={prevStep}
            disabled={isFirstStep || isValidating || isCompleting}
          >
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back
          </Button>

          <div className="flex gap-2">
            {allowSkipOptional && steps[currentStep].optional && !isLastStep && (
              <Button
                variant="ghost"
                onClick={() => setCurrentStep(prev => prev + 1)}
                disabled={isValidating || isCompleting}
              >
                Skip
              </Button>
            )}
            
            <Button
              onClick={nextStep}
              disabled={isValidating || isCompleting}
            >
              {(isValidating || isCompleting) && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {isLastStep ? "Complete" : "Continue"}
              {!isLastStep && <ChevronRight className="ml-2 h-4 w-4" />}
            </Button>
          </div>
        </div>
      </div>
    </FormWizardContext.Provider>
  );
}

// Individual step wrapper component
interface FormWizardStepProps {
  children: ReactNode;
  className?: string;
}

export function FormWizardStep({ children, className }: FormWizardStepProps) {
  return (
    <div className={cn("space-y-4", className)}>
      {children}
    </div>
  );
}
