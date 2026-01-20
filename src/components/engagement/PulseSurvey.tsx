import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Smile, Meh, Frown, Send, CheckCircle, MessageCircle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface MoodOption {
  id: string;
  icon: React.ElementType;
  label: string;
  color: string;
  bgColor: string;
}

const moodOptions: MoodOption[] = [
  { id: "great", icon: Smile, label: "Great", color: "text-success", bgColor: "bg-success/10 hover:bg-success/20" },
  { id: "okay", icon: Meh, label: "Okay", color: "text-warning", bgColor: "bg-warning/10 hover:bg-warning/20" },
  { id: "struggling", icon: Frown, label: "Struggling", color: "text-destructive", bgColor: "bg-destructive/10 hover:bg-destructive/20" },
];

interface PulseSurveyProps {
  question?: string;
  onSubmit?: (mood: string, feedback?: string) => void;
  onDismiss?: () => void;
  compact?: boolean;
}

export function PulseSurvey({
  question = "How are you feeling about work today?",
  onSubmit,
  onDismiss,
  compact = false,
}: PulseSurveyProps) {
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [feedback, setFeedback] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const { toast } = useToast();

  const handleMoodSelect = (moodId: string) => {
    setSelectedMood(moodId);
    if (moodId === "struggling") {
      setShowFeedback(true);
    } else {
      setShowFeedback(false);
    }
  };

  const handleSubmit = () => {
    if (!selectedMood) return;

    onSubmit?.(selectedMood, feedback || undefined);
    setSubmitted(true);
    
    toast({
      title: "Thanks for sharing!",
      description: "Your feedback helps us improve the workplace.",
    });
  };

  if (submitted) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className={cn(
          "bg-success/10 rounded-lg p-4 text-center",
          compact ? "py-3" : "py-6"
        )}
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.1, type: "spring" }}
        >
          <CheckCircle className="h-8 w-8 text-success mx-auto mb-2" />
        </motion.div>
        <p className="font-medium">Thanks for your feedback!</p>
        <p className="text-sm text-muted-foreground">
          We appreciate you taking the time to share.
        </p>
      </motion.div>
    );
  }

  return (
    <Card className={cn(compact && "border-0 shadow-none bg-transparent")}>
      {!compact && (
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-base">
                <MessageCircle className="h-5 w-5 text-primary" />
                Quick Check-in
              </CardTitle>
              <CardDescription className="text-sm">Takes just a few seconds</CardDescription>
            </div>
            {onDismiss && (
              <Button variant="ghost" size="icon" onClick={onDismiss}>
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </CardHeader>
      )}

      <CardContent className={compact ? "p-0" : undefined}>
        <div className="space-y-4">
          <p className="text-sm font-medium">{question}</p>

          {/* Mood selection */}
          <div className="flex gap-3 justify-center">
            {moodOptions.map((mood) => {
              const Icon = mood.icon;
              const isSelected = selectedMood === mood.id;

              return (
                <motion.button
                  key={mood.id}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleMoodSelect(mood.id)}
                  className={cn(
                    "flex flex-col items-center gap-2 p-4 rounded-lg transition-all border-2",
                    mood.bgColor,
                    isSelected 
                      ? "border-current ring-2 ring-offset-2 ring-offset-background" 
                      : "border-transparent",
                    mood.color
                  )}
                >
                  <Icon className="h-8 w-8" />
                  <span className="text-sm font-medium">{mood.label}</span>
                </motion.button>
              );
            })}
          </div>

          {/* Optional feedback for struggling */}
          <AnimatePresence>
            {showFeedback && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-2"
              >
                <label className="text-sm text-muted-foreground">
                  Want to share what's on your mind? (optional)
                </label>
                <Textarea
                  placeholder="Your feedback is confidential..."
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  rows={2}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Submit button */}
          <AnimatePresence>
            {selectedMood && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
              >
                <Button 
                  onClick={handleSubmit} 
                  className="w-full gap-2"
                  size={compact ? "sm" : "default"}
                >
                  <Send className="h-4 w-4" />
                  Submit
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </CardContent>
    </Card>
  );
}

// Banner variant that can be shown at the top of pages
export function PulseSurveyBanner({ onDismiss }: { onDismiss: () => void }) {
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const { toast } = useToast();

  const handleQuickSubmit = (moodId: string) => {
    setSelectedMood(moodId);
    setSubmitted(true);
    toast({
      title: "Thanks! 👍",
      description: "Your pulse check has been recorded.",
    });
    setTimeout(onDismiss, 2000);
  };

  if (submitted) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-success/10 border border-success/20 rounded-lg p-3 flex items-center justify-center gap-2"
      >
        <CheckCircle className="h-4 w-4 text-success" />
        <span className="text-sm font-medium">Thanks for sharing!</span>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-muted/50 border rounded-lg p-3 flex items-center justify-between gap-4"
    >
      <div className="flex items-center gap-3">
        <MessageCircle className="h-5 w-5 text-primary" />
        <span className="text-sm">Quick check: How's your week going?</span>
      </div>
      <div className="flex items-center gap-2">
        {moodOptions.map((mood) => {
          const Icon = mood.icon;
          return (
            <Button
              key={mood.id}
              variant="ghost"
              size="icon"
              onClick={() => handleQuickSubmit(mood.id)}
              className={cn("hover:bg-transparent", mood.color)}
            >
              <Icon className="h-5 w-5" />
            </Button>
          );
        })}
        <Button variant="ghost" size="icon" onClick={onDismiss}>
          <X className="h-4 w-4" />
        </Button>
      </div>
    </motion.div>
  );
}
