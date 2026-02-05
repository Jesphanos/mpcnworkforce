import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  User, Briefcase, Bell, CheckCircle, ArrowRight, ArrowLeft, 
  Sparkles, Building, Users, FileText, TrendingUp
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Celebration } from "@/components/ui/celebration";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  content: React.ReactNode;
}

interface OnboardingWizardProps {
  onComplete: () => void;
}

export function OnboardingWizard({ onComplete }: OnboardingWizardProps) {
  const { profile, role } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const [showCelebration, setShowCelebration] = useState(false);
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);

  const steps: OnboardingStep[] = [
    {
      id: "welcome",
      title: "Welcome to MPCN",
      description: "Your orientation to the organization",
      icon: Building,
      content: (
        <div className="space-y-6 text-center">
          <div className="w-16 h-16 rounded-2xl bg-primary mx-auto flex items-center justify-center shadow-lg">
            <Building className="h-8 w-8 text-primary-foreground" />
          </div>
          <div>
            <h3 className="text-xl font-bold">{profile?.full_name || "Team Member"}</h3>
            <p className="text-muted-foreground mt-2">
              You are now part of a structured organization. This brief orientation will help you understand your place within it.
            </p>
          </div>
          <div className="grid grid-cols-3 gap-3 pt-4">
            <div className="p-3 rounded-lg border bg-card text-center">
              <FileText className="h-5 w-5 mx-auto mb-2 text-primary" />
              <span className="text-xs font-medium">Document Work</span>
            </div>
            <div className="p-3 rounded-lg border bg-card text-center">
              <Users className="h-5 w-5 mx-auto mb-2 text-primary" />
              <span className="text-xs font-medium">Collaborate</span>
            </div>
            <div className="p-3 rounded-lg border bg-card text-center">
              <TrendingUp className="h-5 w-5 mx-auto mb-2 text-primary" />
              <span className="text-xs font-medium">Grow</span>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "profile",
      title: "Complete Your Profile",
      description: "Add your skills and preferences",
      icon: User,
      content: (
        <div className="space-y-6">
          <div className="flex items-start gap-4 p-4 rounded-lg bg-muted/50">
            <User className="h-8 w-8 text-primary flex-shrink-0 mt-1" />
            <div>
              <h4 className="font-semibold">Your Profile</h4>
              <p className="text-sm text-muted-foreground mt-1">
                A complete profile helps your team lead assign suitable tasks and helps you 
                get discovered for opportunities that match your skills.
              </p>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 rounded-lg border">
              <CheckCircle className="h-5 w-5 text-success" />
              <span className="text-sm">Add your skills and expertise</span>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg border">
              <CheckCircle className="h-5 w-5 text-success" />
              <span className="text-sm">Set your timezone and language preference</span>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg border">
              <CheckCircle className="h-5 w-5 text-success" />
              <span className="text-sm">Link external freelancing accounts</span>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "workspace",
      title: "Your Workspace",
      description: "Navigate and manage your work",
      icon: Briefcase,
      content: (
        <div className="space-y-6">
          <div className="grid gap-4">
            <div className="flex items-start gap-4 p-4 rounded-lg border hover:bg-muted/50 transition-colors">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Building className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h4 className="font-semibold">Dashboard</h4>
                <p className="text-sm text-muted-foreground">
                  Your personal command center with stats, tasks, and quick actions.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4 p-4 rounded-lg border hover:bg-muted/50 transition-colors">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <FileText className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h4 className="font-semibold">Reports</h4>
                <p className="text-sm text-muted-foreground">
                  Submit daily work reports and track approval status.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4 p-4 rounded-lg border hover:bg-muted/50 transition-colors">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h4 className="font-semibold">Activity & Learning</h4>
                <p className="text-sm text-muted-foreground">
                  View your performance history and growth insights.
                </p>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "notifications",
      title: "Stay Updated",
      description: "Configure your notification preferences",
      icon: Bell,
      content: (
        <div className="space-y-6">
          <div className="flex items-start gap-4 p-4 rounded-lg bg-muted/50">
            <Bell className="h-8 w-8 text-primary flex-shrink-0 mt-1" />
            <div>
              <h4 className="font-semibold">Real-time Notifications</h4>
              <p className="text-sm text-muted-foreground mt-1">
                Get instant updates when your reports are reviewed, tasks are assigned, 
                or when you receive team announcements.
              </p>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-lg border">
              <span className="text-sm">Report status updates</span>
              <Badge variant="secondary">Enabled</Badge>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg border">
              <span className="text-sm">Task assignments</span>
              <Badge variant="secondary">Enabled</Badge>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg border">
              <span className="text-sm">Team announcements</span>
              <Badge variant="secondary">Enabled</Badge>
            </div>
          </div>
          <p className="text-xs text-muted-foreground text-center">
            You can customize these in Settings anytime.
          </p>
        </div>
      ),
    },
  ];

  const progress = ((currentStep + 1) / steps.length) * 100;

  const handleNext = () => {
    setCompletedSteps([...completedSteps, steps[currentStep].id]);
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = async () => {
    setShowCelebration(true);
    try {
      // Mark onboarding as complete in user metadata
      await supabase.auth.updateUser({
        data: { onboarding_completed: true },
      });
    } catch (error) {
      console.error("Failed to save onboarding status:", error);
    }
  };

  return (
    <>
      <Celebration
        show={showCelebration}
        title="Orientation Complete"
        message="You are ready to begin. Your work contributes to something larger."
        type="completion"
        onComplete={onComplete}
      />

      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/20 p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-2xl"
        >
          <Card className="border-2">
            <CardHeader className="text-center pb-2">
              {/* Step indicators */}
              <div className="flex justify-center gap-2 mb-6">
                {steps.map((step, index) => {
                  const Icon = step.icon;
                  const isCompleted = completedSteps.includes(step.id);
                  const isCurrent = index === currentStep;
                  
                  return (
                    <div
                      key={step.id}
                      className={cn(
                        "w-10 h-10 rounded-full flex items-center justify-center transition-all",
                        isCompleted && "bg-success text-success-foreground",
                        isCurrent && !isCompleted && "bg-primary text-primary-foreground",
                        !isCompleted && !isCurrent && "bg-muted text-muted-foreground"
                      )}
                    >
                      {isCompleted ? (
                        <CheckCircle className="h-5 w-5" />
                      ) : (
                        <Icon className="h-5 w-5" />
                      )}
                    </div>
                  );
                })}
              </div>

              <Progress value={progress} className="h-1 mb-4" />
              
              <CardTitle className="text-xl">{steps[currentStep].title}</CardTitle>
              <CardDescription>{steps[currentStep].description}</CardDescription>
            </CardHeader>

            <CardContent className="pt-6">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentStep}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                >
                  {steps[currentStep].content}
                </motion.div>
              </AnimatePresence>

              <div className="flex justify-between mt-8">
                <Button
                  variant="ghost"
                  onClick={handleBack}
                  disabled={currentStep === 0}
                  className="gap-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back
                </Button>
                <Button onClick={handleNext} className="gap-2">
                  {currentStep === steps.length - 1 ? "Get Started" : "Continue"}
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>

          <p className="text-center text-xs text-muted-foreground mt-4">
            Press <kbd className="px-1.5 py-0.5 rounded bg-muted text-muted-foreground">⌘K</kbd> anytime to search & navigate
          </p>
        </motion.div>
      </div>
    </>
  );
}
