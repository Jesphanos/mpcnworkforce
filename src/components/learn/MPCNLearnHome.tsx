import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  BookOpen, 
  Building, 
  Shield, 
  UserCheck, 
  Heart,
  ChevronRight,
  Award,
  Clock,
  Sparkles,
  Download,
  CheckCircle2,
  Play,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useLearningProgress } from "@/hooks/useLearningProgress";
import { 
  MODULE_GROUPS, 
  MPCN_LEARN_CHARTER,
  getModulesForRole,
  getModulesByGroup,
  type ModuleGroup,
  type LearningModule,
} from "@/config/mpcnLearnConfig";
import { ModuleViewer } from "./ModuleViewer";
import { WealthCompendiumDialog } from "./WealthCompendiumDialog";
import { motion } from "framer-motion";

const iconMap = {
  BookOpen,
  Building,
  Shield,
  UserCheck,
  Heart,
} as const;

const colorMap = {
  blue: "bg-primary/10 text-primary",
  purple: "bg-secondary/20 text-secondary-foreground",
  orange: "bg-warning/10 text-warning",
  green: "bg-accent/20 text-accent-foreground",
  rose: "bg-destructive/10 text-destructive",
} as const;

export function MPCNLearnHome() {
  const { role } = useAuth();
  const { progress, certificates, getProgressStats, getModuleProgress } = useLearningProgress();
  const [selectedModule, setSelectedModule] = useState<LearningModule | null>(null);
  const [showCompendium, setShowCompendium] = useState(false);
  
  // Get modules available for the current role
  const availableModules = getModulesForRole(role as any);
  const groupedModules = getModulesByGroup(availableModules);
  
  // Calculate progress from actual data
  const stats = getProgressStats();
  const progressPercent = stats.completionRate;

  if (selectedModule) {
    return (
      <ModuleViewer 
        module={selectedModule} 
        onBack={() => setSelectedModule(null)}
        onComplete={() => setSelectedModule(null)}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Charter Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="border-primary/20 bg-gradient-to-br from-primary/5 via-background to-primary/10">
          <CardHeader className="text-center pb-4">
            <div className="flex justify-center mb-4">
              <div className="p-3 rounded-full bg-primary/10">
                <Sparkles className="h-8 w-8 text-primary" />
              </div>
            </div>
            <CardTitle className="text-2xl">{MPCN_LEARN_CHARTER.title}</CardTitle>
            <CardDescription className="text-base">
              {MPCN_LEARN_CHARTER.subtitle}
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center pb-6">
            <p className="text-muted-foreground max-w-2xl mx-auto mb-4">
              {MPCN_LEARN_CHARTER.mission}
            </p>
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Heart className="h-4 w-4 text-destructive" />
              <span className="italic">"Anchored in faith. Governed with integrity. Built for growth."</span>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Progress Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Award className="h-5 w-5 text-primary" />
                  Your Learning Journey
                </CardTitle>
                <CardDescription>
                  {stats.completedModules} of {stats.totalModules} modules completed
                  {stats.inProgressModules > 0 && ` • ${stats.inProgressModules} in progress`}
                </CardDescription>
              </div>
              <div className="flex gap-2">
                {certificates.length > 0 && (
                  <Badge variant="secondary" className="gap-1">
                    <Award className="h-3 w-3" />
                    {certificates.length} Certificate{certificates.length > 1 ? "s" : ""}
                  </Badge>
                )}
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setShowCompendium(true)}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Wealth Compendium
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Overall Progress</span>
                <span className="text-muted-foreground">{Math.round(progressPercent)}%</span>
              </div>
              <Progress value={progressPercent} className="h-2" />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Module Groups */}
      <div className="space-y-6">
        {(Object.keys(groupedModules) as ModuleGroup[]).map((groupId, groupIndex) => {
          const modules = groupedModules[groupId];
          if (modules.length === 0) return null;
          
          const group = MODULE_GROUPS[groupId];
          const Icon = iconMap[group.icon as keyof typeof iconMap] || BookOpen;
          const colorClass = colorMap[group.color as keyof typeof colorMap] || colorMap.blue;
          
          // Calculate group progress
          const groupCompleted = modules.filter(m => {
            const mp = getModuleProgress(m.id);
            return mp?.completed_at !== null;
          }).length;
          
          return (
            <motion.div
              key={groupId}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 + groupIndex * 0.1 }}
            >
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${colorClass}`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{group.title}</CardTitle>
                        <CardDescription>{group.description}</CardDescription>
                      </div>
                    </div>
                    <Badge variant="outline">
                      {groupCompleted}/{modules.length}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="max-h-[400px]">
                    <div className="space-y-2">
                      {modules.map((module, index) => {
                        const moduleProgress = getModuleProgress(module.id);
                        const isStarted = !!moduleProgress;
                        const isCompleted = moduleProgress?.completed_at !== null;
                        const progressPct = moduleProgress?.progress_percentage || 0;
                        
                        return (
                          <div key={module.id}>
                            {index > 0 && <Separator className="my-2" />}
                            <div 
                              className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                              onClick={() => setSelectedModule(module)}
                            >
                              <div className="flex-1">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <Badge variant="outline" className="text-xs font-mono">
                                    {module.code}
                                  </Badge>
                                  <span className="font-medium">{module.title}</span>
                                  {module.isOptional && (
                                    <Badge variant="secondary" className="text-xs">
                                      Optional
                                    </Badge>
                                  )}
                                  {isCompleted && (
                                    <Badge className="text-xs bg-green-500/10 text-green-600 border-green-500/20">
                                      <CheckCircle2 className="h-3 w-3 mr-1" />
                                      Done
                                    </Badge>
                                  )}
                                  {isStarted && !isCompleted && (
                                    <Badge className="text-xs bg-primary/10 text-primary border-primary/20">
                                      <Play className="h-3 w-3 mr-1" />
                                      {progressPct}%
                                    </Badge>
                                  )}
                                </div>
                                <p className="text-sm text-muted-foreground mt-1">
                                  {module.objective}
                                </p>
                                <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                                  <span className="flex items-center gap-1">
                                    <Clock className="h-3 w-3" />
                                    {module.estimatedMinutes} min
                                  </span>
                                  {module.scriptures && module.scriptures.length > 0 && (
                                    <span className="flex items-center gap-1">
                                      <Heart className="h-3 w-3 text-destructive" />
                                      {module.scriptures.length} scriptures
                                    </span>
                                  )}
                                </div>
                              </div>
                              <ChevronRight className="h-5 w-5 text-muted-foreground" />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Charter Principles */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
      >
        <Card className="border-muted">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Charter Principles
            </CardTitle>
            <CardDescription>
              The governance framework that guides all MPCN Learn operations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {MPCN_LEARN_CHARTER.principles.map((principle) => (
                <div key={principle.id} className="p-4 rounded-lg border bg-card">
                  <h4 className="font-medium mb-2">{principle.title}</h4>
                  <p className="text-sm text-muted-foreground">{principle.description}</p>
                </div>
              ))}
            </div>
            <Separator className="my-6" />
            <div className="text-center">
              <p className="text-sm text-muted-foreground italic max-w-2xl mx-auto">
                {MPCN_LEARN_CHARTER.faithStatement}
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <WealthCompendiumDialog 
        open={showCompendium} 
        onOpenChange={setShowCompendium} 
      />
    </div>
  );
}
