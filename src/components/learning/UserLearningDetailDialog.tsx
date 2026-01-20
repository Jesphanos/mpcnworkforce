import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Award, 
  BookOpen, 
  CheckCircle2, 
  Clock, 
  Plus,
  Trash2,
  AlertCircle
} from "lucide-react";
import { useAdminLearningData, UserLearningProgress } from "@/hooks/useAdminLearningData";
import { IssueCertificateDialog } from "./IssueCertificateDialog";
import { format } from "date-fns";
import { LEARNING_MODULES } from "@/config/mpcnLearnConfig";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface UserLearningDetailDialogProps {
  user: UserLearningProgress | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function UserLearningDetailDialog({ user, open, onOpenChange }: UserLearningDetailDialogProps) {
  const { useUserDetailedProgress, revokeCertificate, certificationPaths } = useAdminLearningData();
  const { data: detailedData, isLoading } = useUserDetailedProgress(user?.user_id || null);
  const [showIssueCertDialog, setShowIssueCertDialog] = useState(false);
  const [certToRevoke, setCertToRevoke] = useState<{
    id: string;
    type: string;
    name: string;
  } | null>(null);

  if (!user) return null;

  const getModuleName = (moduleId: string) => {
    const module = LEARNING_MODULES.find(m => m.id === moduleId);
    return module?.title || moduleId;
  };

  const getModuleGroup = (moduleId: string) => {
    const module = LEARNING_MODULES.find(m => m.id === moduleId);
    return module?.groupId || "unknown";
  };

  const getInitials = (name: string | null) => {
    if (!name) return "U";
    return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
  };

  // Check which certifications user is eligible for
  const getEligibleCertifications = () => {
    if (!detailedData?.progress) return [];
    
    const completedModules = detailedData.progress
      .filter(p => p.completed_at !== null)
      .map(p => p.module_id);

    const existingCertTypes = detailedData.certificates?.map(c => c.certificate_type) || [];

    return certificationPaths.filter(path => {
      // Check if user already has this cert
      if (existingCertTypes.includes(path.id)) return false;
      // Check if user has completed all required modules
      return path.requiredModules.every(m => completedModules.includes(m));
    });
  };

  const handleRevokeCertificate = async () => {
    if (!certToRevoke || !user) return;
    
    await revokeCertificate.mutateAsync({
      certificateId: certToRevoke.id,
      userId: user.user_id,
      certificateType: certToRevoke.type,
    });
    setCertToRevoke(null);
  };

  const eligibleCerts = getEligibleCertifications();

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl max-h-[90vh]">
          <DialogHeader>
            <div className="flex items-center gap-4">
              <Avatar className="h-12 w-12">
                <AvatarImage src={user.avatar_url || undefined} />
                <AvatarFallback>{getInitials(user.full_name)}</AvatarFallback>
              </Avatar>
              <div>
                <DialogTitle>{user.full_name || "Unknown User"}</DialogTitle>
                <DialogDescription>
                  Learning progress and certifications
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          {/* Progress Summary */}
          <div className="grid grid-cols-3 gap-4 py-4">
            <div className="text-center p-3 rounded-lg bg-muted/50">
              <p className="text-2xl font-bold">{user.modules_completed}</p>
              <p className="text-xs text-muted-foreground">Completed</p>
            </div>
            <div className="text-center p-3 rounded-lg bg-muted/50">
              <p className="text-2xl font-bold">{user.modules_started - user.modules_completed}</p>
              <p className="text-xs text-muted-foreground">In Progress</p>
            </div>
            <div className="text-center p-3 rounded-lg bg-muted/50">
              <p className="text-2xl font-bold">{user.certifications.length}</p>
              <p className="text-xs text-muted-foreground">Certificates</p>
            </div>
          </div>

          {/* Eligible Certifications Alert */}
          {eligibleCerts.length > 0 && (
            <div className="flex items-center gap-3 p-3 rounded-lg bg-green-500/10 border border-green-500/20">
              <AlertCircle className="h-5 w-5 text-green-600" />
              <div className="flex-1">
                <p className="text-sm font-medium text-green-700">
                  Eligible for {eligibleCerts.length} certification{eligibleCerts.length > 1 ? "s" : ""}
                </p>
                <p className="text-xs text-green-600">
                  {eligibleCerts.map(c => c.name).join(", ")}
                </p>
              </div>
              <Button size="sm" onClick={() => setShowIssueCertDialog(true)}>
                <Plus className="h-4 w-4 mr-1" />
                Issue
              </Button>
            </div>
          )}

          <Tabs defaultValue="progress" className="mt-2">
            <TabsList className="w-full">
              <TabsTrigger value="progress" className="flex-1 gap-2">
                <BookOpen className="h-4 w-4" />
                Progress
              </TabsTrigger>
              <TabsTrigger value="certificates" className="flex-1 gap-2">
                <Award className="h-4 w-4" />
                Certificates
              </TabsTrigger>
            </TabsList>

            <TabsContent value="progress" className="mt-4">
              <ScrollArea className="h-[300px]">
                {isLoading ? (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-muted-foreground">Loading...</p>
                  </div>
                ) : detailedData?.progress.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                    <BookOpen className="h-12 w-12 mb-3 opacity-50" />
                    <p>No modules started yet</p>
                  </div>
                ) : (
                  <div className="space-y-3 pr-4">
                    {detailedData?.progress.map((p) => (
                      <div key={p.id} className="flex items-center gap-3 p-3 rounded-lg border">
                        {p.completed_at ? (
                          <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0" />
                        ) : (
                          <Clock className="h-5 w-5 text-amber-500 flex-shrink-0" />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{getModuleName(p.module_id)}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline" className="text-xs">
                              {getModuleGroup(p.module_id)}
                            </Badge>
                            {p.completed_at ? (
                              <span className="text-xs text-muted-foreground">
                                Completed {format(new Date(p.completed_at), "MMM d, yyyy")}
                              </span>
                            ) : (
                              <span className="text-xs text-muted-foreground">
                                Started {format(new Date(p.started_at), "MMM d, yyyy")}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="w-20 flex items-center gap-2">
                          <Progress value={p.progress_percentage} className="h-1.5 flex-1" />
                          <span className="text-xs w-8 text-right">{p.progress_percentage}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </TabsContent>

            <TabsContent value="certificates" className="mt-4">
              <ScrollArea className="h-[300px]">
                {detailedData?.certificates?.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                    <Award className="h-12 w-12 mb-3 opacity-50" />
                    <p>No certificates issued yet</p>
                    {eligibleCerts.length > 0 && (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="mt-3"
                        onClick={() => setShowIssueCertDialog(true)}
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Issue Certificate
                      </Button>
                    )}
                  </div>
                ) : (
                  <div className="space-y-3 pr-4">
                    {detailedData?.certificates?.map((cert) => (
                      <Card key={cert.id}>
                        <CardHeader className="p-4 pb-2">
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-2">
                              <Award className="h-5 w-5 text-amber-500" />
                              <CardTitle className="text-base">{cert.certificate_name}</CardTitle>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-destructive hover:text-destructive"
                              onClick={() => setCertToRevoke({
                                id: cert.id,
                                type: cert.certificate_type,
                                name: cert.certificate_name,
                              })}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </CardHeader>
                        <CardContent className="p-4 pt-0">
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span>Issued: {format(new Date(cert.issued_at), "MMM d, yyyy")}</span>
                            <span>{cert.modules_completed.length} modules</span>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </TabsContent>
          </Tabs>

          {/* Issue Certificate Button (always visible) */}
          <div className="flex justify-end pt-4 border-t">
            <Button onClick={() => setShowIssueCertDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Issue Certificate
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Issue Certificate Dialog */}
      <IssueCertificateDialog
        user={user}
        open={showIssueCertDialog}
        onOpenChange={setShowIssueCertDialog}
        eligibleCertifications={eligibleCerts}
        completedModules={detailedData?.progress.filter(p => p.completed_at).map(p => p.module_id) || []}
      />

      {/* Revoke Confirmation */}
      <AlertDialog open={!!certToRevoke} onOpenChange={(open) => !open && setCertToRevoke(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Revoke Certificate</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to revoke "{certToRevoke?.name}"? This action will remove the certification from the user's profile.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRevokeCertificate}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Revoke Certificate
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
