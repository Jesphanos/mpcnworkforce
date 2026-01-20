import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertDescription } from "@/components/ui/alert";
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
} from "lucide-react";
import { type LearningModule, type ModuleContent } from "@/config/mpcnLearnConfig";
import { motion } from "framer-motion";

interface ModuleViewerProps {
  module: LearningModule;
  onBack: () => void;
  onComplete: () => void;
}

const variantStyles = {
  info: { bg: "bg-blue-50 dark:bg-blue-950/30", border: "border-blue-200 dark:border-blue-800", icon: Info, iconColor: "text-blue-600" },
  warning: { bg: "bg-amber-50 dark:bg-amber-950/30", border: "border-amber-200 dark:border-amber-800", icon: AlertTriangle, iconColor: "text-amber-600" },
  faith: { bg: "bg-rose-50 dark:bg-rose-950/30", border: "border-rose-200 dark:border-rose-800", icon: Heart, iconColor: "text-rose-600" },
  governance: { bg: "bg-purple-50 dark:bg-purple-950/30", border: "border-purple-200 dark:border-purple-800", icon: Shield, iconColor: "text-purple-600" },
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
        <div className="relative pl-6 py-4 border-l-4 border-rose-300 dark:border-rose-700 bg-rose-50/50 dark:bg-rose-950/20 rounded-r-lg">
          <Quote className="absolute left-2 top-4 h-4 w-4 text-rose-400" />
          <p className="italic text-foreground">{content.content}</p>
        </div>
      );
    
    case "reflection":
      return (
        <div className="p-4 rounded-lg bg-muted/50 border border-muted">
          <div className="flex items-start gap-3">
            <Lightbulb className="h-5 w-5 text-amber-500 mt-0.5 shrink-0" />
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
  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="font-mono">
                {module.code}
              </Badge>
              {module.isOptional && (
                <Badge variant="secondary">Optional</Badge>
              )}
            </div>
            <h1 className="text-2xl font-bold mt-1">{module.title}</h1>
          </div>
        </div>
      </motion.div>

      {/* Module Info Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <Card className="border-primary/20">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
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
            <ScrollArea className="max-h-[60vh]">
              <div className="space-y-6 pr-4">
                {module.content.map((content, index) => (
                  <ContentBlock key={index} content={content} />
                ))}
              </div>
            </ScrollArea>
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
          <Card className="border-rose-200 dark:border-rose-800">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Heart className="h-5 w-5 text-rose-500" />
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
                      <p className="font-medium text-rose-600 dark:text-rose-400">
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
        className="flex items-center justify-between"
      >
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Modules
        </Button>
        <Button onClick={onComplete}>
          <CheckCircle2 className="h-4 w-4 mr-2" />
          Mark as Complete
        </Button>
      </motion.div>
    </div>
  );
}
