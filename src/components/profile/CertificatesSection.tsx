import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Award, GraduationCap, Calendar, BookOpen, ChevronRight } from "lucide-react";
import { useLearningProgress, getCertificationPaths } from "@/hooks/useLearningProgress";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";

export function CertificatesSection() {
  const navigate = useNavigate();
  const { certificates, progress, isLoading, getProgressStats, checkCertificationEligibility } = useLearningProgress();
  const certPaths = getCertificationPaths();
  const stats = getProgressStats();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5" />
            Learning & Certifications
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  // Get eligible certifications
  const eligibleCerts = certPaths.filter(path => 
    checkCertificationEligibility(path.id) && 
    !certificates.some(c => c.certificate_type === path.id)
  );

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5 text-primary" />
              Learning & Certifications
            </CardTitle>
            <CardDescription>
              Your MPCN Learn progress and earned certifications
            </CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={() => navigate("/learn")}>
            <GraduationCap className="h-4 w-4 mr-2" />
            Go to Learn
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Progress Summary */}
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-3 rounded-lg bg-muted/50">
            <p className="text-2xl font-bold text-primary">{stats.completedModules}</p>
            <p className="text-xs text-muted-foreground">Completed</p>
          </div>
          <div className="text-center p-3 rounded-lg bg-muted/50">
            <p className="text-2xl font-bold">{stats.inProgressModules}</p>
            <p className="text-xs text-muted-foreground">In Progress</p>
          </div>
          <div className="text-center p-3 rounded-lg bg-muted/50">
            <p className="text-2xl font-bold">{certificates.length}</p>
            <p className="text-xs text-muted-foreground">Certificates</p>
          </div>
        </div>

        {/* Earned Certificates */}
        {certificates.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-sm font-medium flex items-center gap-2">
              <Award className="h-4 w-4 text-warning" />
              Earned Certificates
            </h4>
            <div className="space-y-2">
              {certificates.map((cert) => (
                <div 
                  key={cert.id} 
                  className="flex items-center gap-3 p-3 rounded-lg border bg-gradient-to-r from-warning/5 to-transparent"
                >
                  <div className="h-10 w-10 rounded-full bg-warning/10 flex items-center justify-center">
                    <Award className="h-5 w-5 text-warning" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{cert.certificate_name}</p>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {format(new Date(cert.issued_at), "MMM d, yyyy")}
                      </span>
                      <span className="flex items-center gap-1">
                        <BookOpen className="h-3 w-3" />
                        {cert.modules_completed.length} modules
                      </span>
                    </div>
                  </div>
                  <Badge variant="outline" className="bg-warning/10 text-warning border-warning/20">
                    Certified
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Eligible Certifications */}
        {eligibleCerts.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-sm font-medium flex items-center gap-2 text-green-600">
              <Award className="h-4 w-4" />
              Ready to Claim
            </h4>
            <div className="space-y-2">
              {eligibleCerts.map((path) => (
                <div 
                  key={path.id} 
                  className="flex items-center gap-3 p-3 rounded-lg border border-green-500/20 bg-green-500/5"
                >
                  <div className="h-10 w-10 rounded-full bg-green-500/10 flex items-center justify-center">
                    <Award className="h-5 w-5 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{path.name}</p>
                    <p className="text-xs text-muted-foreground">
                      All {path.requiredModules.length} required modules completed!
                    </p>
                  </div>
                  <Badge className="bg-green-500/10 text-green-600 border-green-500/20">
                    Eligible
                  </Badge>
                </div>
              ))}
              <p className="text-xs text-muted-foreground">
                Contact an administrator to issue your certificates.
              </p>
            </div>
          </div>
        )}

        {/* Available Paths (if no certificates yet) */}
        {certificates.length === 0 && eligibleCerts.length === 0 && (
          <div className="space-y-3">
            <h4 className="text-sm font-medium">Available Certification Paths</h4>
            <div className="grid gap-2">
              {certPaths.slice(0, 3).map((path) => {
                const completedModules = progress.filter(p => 
                  p.completed_at !== null && path.requiredModules.includes(p.module_id)
                ).length;
                const progressPct = Math.round((completedModules / path.requiredModules.length) * 100);
                
                return (
                  <div 
                    key={path.id} 
                    className="flex items-center gap-3 p-3 rounded-lg border hover:bg-muted/50 cursor-pointer transition-colors"
                    onClick={() => navigate("/learn")}
                  >
                    <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                      <Award className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-sm">{path.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {completedModules}/{path.requiredModules.length} modules
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">{progressPct}%</span>
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Empty state */}
        {stats.completedModules === 0 && stats.inProgressModules === 0 && (
          <div className="text-center py-4">
            <GraduationCap className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
            <p className="text-muted-foreground">Start your learning journey today!</p>
            <Button 
              variant="outline" 
              size="sm" 
              className="mt-3"
              onClick={() => navigate("/learn")}
            >
              Explore MPCN Learn
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
