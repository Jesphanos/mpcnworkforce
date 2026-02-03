import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { 
  ArrowLeft, 
  Clock, 
  BookOpen,
  CheckCircle2,
  Heart,
  AlertTriangle,
  Info,
  Shield,
  Quote,
  Lightbulb,
  Play,
  Loader2,
} from "lucide-react";
import { type LearningModule, type ModuleContent } from "@/config/mpcnLearnConfig";
import { useLearningProgress } from "@/hooks/useLearningProgress";
import { motion } from "framer-motion";

interface ModuleViewerProps {
  module: LearningModule;
  onBack: () => void;
  onComplete?: () => void;
}

const variantStyles = {
  info: { bg: "bg-info/10", border: "border-info/20", icon: Info, iconColor: "text-info" },
  warning: { bg: "bg-warning/10", border: "border-warning/20", icon: AlertTriangle, iconColor: "text-warning" },
  faith: { bg: "bg-destructive/5", border: "border-destructive/20", icon: Heart, iconColor: "text-destructive" },
  governance: { bg: "bg-primary/5", border: "border-primary/20", icon: Shield, iconColor: "text-primary" },
};

function ContentBlock({ content }: { content: ModuleContent }) {
  switch (content.type) {
    case "text":
      return (
        <p className="text-foreground leading-relaxed">
          {content.content}
        </p>
      );
    
    case "list":
      return (
        <div className="space-y-2">
          <p className="font-medium text-foreground">{content.content}</p>
          <ul className="space-y-2 ml-4">
            {content.items?.map((item, index) => (
              <li key={index} className="flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                <span className="text-muted-foreground">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      );
    
    case "scripture":
      return (
        <div className="relative pl-6 py-4 border-l-4 border-destructive/30 bg-destructive/5 rounded-r-lg">
          <Quote className="absolute left-2 top-4 h-4 w-4 text-destructive/50" />
          <p className="italic text-foreground">{content.content}</p>
        </div>
      );
    
    case "reflection":
      return (
        <div className="p-4 rounded-lg bg-muted/50 border border-muted">
          <div className="flex items-start gap-3">
            <Lightbulb className="h-5 w-5 text-warning mt-0.5 shrink-0" />
            <p className="text-muted-foreground italic">{content.content}</p>
          </div>
        </div>
      );
    
    case "callout":
      const variant = content.variant || "info";
      const style = variantStyles[variant];
      const Icon = style.icon;
      return (
        <Alert className={`${style.bg} ${style.border}`}>
          <Icon className={`h-4 w-4 ${style.iconColor}`} />
          <AlertDescription className="text-foreground">
            {content.content}
          </AlertDescription>
        </Alert>
      );
    
    default:
      return null;
  }
}

export function ModuleViewer({ module, onBack, onComplete }: ModuleViewerProps) {
  const { 
    getModuleProgress, 
    startModule, 
    completeModule, 
    updateProgress,
    isLoading 
  } = useLearningProgress();

  const moduleProgress = getModuleProgress(module.id);
  const isStarted = !!moduleProgress;
  const isCompleted = moduleProgress?.completed_at !== null;
  const progressPercent = moduleProgress?.progress_percentage || 0;

  const handleStart = async () => {
    await startModule.mutateAsync({ 
      moduleId: module.id, 
      moduleGroup: module.groupId 
    });
  };

  const handleComplete = async () => {
    await completeModule.mutateAsync({ moduleId: module.id });
    onComplete?.();
  };

  const handleUpdateProgress = async (percent: number) => {
    await updateProgress.mutateAsync({ 
      moduleId: module.id, 
      progress: percent 
    });
  };

  return (
    <div className="flex flex-col h-full max-h-[calc(100vh-12rem)]">
      {/* Header - Fixed */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex-shrink-0 pb-4"
      >
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="outline" className="font-mono">
                {module.code}
              </Badge>
              {module.isOptional && (
                <Badge variant="secondary">Optional</Badge>
              )}
              {isCompleted && (
                <Badge className="bg-green-500/10 text-green-600 border-green-500/20">
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                  Completed
                </Badge>
              )}
              {isStarted && !isCompleted && (
                <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
                  <Play className="h-3 w-3 mr-1" />
                  In Progress
                </Badge>
              )}
            </div>
            <h1 className="text-xl sm:text-2xl font-bold mt-1 truncate">{module.title}</h1>
          </div>
        </div>
      </motion.div>

      {/* Scrollable Content */}
      <ScrollArea className="flex-1 pr-4">
        <div className="space-y-6 pb-6">
          {/* Progress Bar (if started) */}
          {isStarted && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.05 }}
            >
              <Card className="border-primary/20">
                <CardContent className="pt-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Your Progress</span>
                    <span className="text-sm text-muted-foreground">{progressPercent}%</span>
                  </div>
                  <Progress value={progressPercent} className="h-2" />
                  {!isCompleted && progressPercent > 0 && progressPercent < 100 && (
                    <div className="flex gap-2 mt-3">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleUpdateProgress(Math.min(progressPercent + 25, 100))}
                        disabled={updateProgress.isPending}
                      >
                        +25%
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleUpdateProgress(100)}
                        disabled={updateProgress.isPending}
                      >
                        Mark 100%
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Module Info Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <Card className="border-primary/20">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-primary" />
                    Learning Objective
                  </CardTitle>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    {module.estimatedMinutes} minutes
                  </div>
                </div>
                <CardDescription className="text-base">
                  {module.objective}
                </CardDescription>
              </CardHeader>
            </Card>
          </motion.div>

          {/* Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-6">
                  {module.content.map((content, index) => (
                    <ContentBlock key={index} content={content} />
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Key Takeaway */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.3 }}
          >
            <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-primary" />
                  Key Takeaway
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-lg font-medium text-foreground">
                  {module.keyTakeaway}
                </p>
              </CardContent>
            </Card>
          </motion.div>

          {/* Scriptures Reference */}
          {module.scriptures && module.scriptures.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.4 }}
            >
              <Card className="border-destructive/20">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Heart className="h-5 w-5 text-destructive" />
                    Scripture References
                  </CardTitle>
                  <CardDescription>
                    Biblical foundations for this module's teachings
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {module.scriptures.map((scripture, index) => (
                      <div key={index}>
                        {index > 0 && <Separator className="my-4" />}
                        <div className="space-y-2">
                          <p className="font-medium text-destructive">
                            {scripture.reference}
                          </p>
                          <p className="italic text-foreground">"{scripture.text}"</p>
                          {scripture.application && (
                            <p className="text-sm text-muted-foreground">
                              <strong>Application:</strong> {scripture.application}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.5 }}
            className="flex items-center justify-between flex-wrap gap-4 pt-4"
          >
            <Button variant="outline" onClick={onBack}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Modules
            </Button>
            
            {!isStarted ? (
              <Button 
                onClick={handleStart}
                disabled={startModule.isPending}
              >
                {startModule.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                <Play className="h-4 w-4 mr-2" />
                Start Module
              </Button>
            ) : isCompleted ? (
              <Button variant="outline" disabled>
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Completed
              </Button>
            ) : (
              <Button 
                onClick={handleComplete}
                disabled={completeModule.isPending}
              >
                {completeModule.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Mark as Complete
              </Button>
            )}
          </motion.div>
        </div>
      </ScrollArea>
    </div>
  );
}
