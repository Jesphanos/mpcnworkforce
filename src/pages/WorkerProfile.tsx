import { useParams } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useWorkerProfile } from "@/hooks/useWorkerProfile";
import { useCapabilities } from "@/hooks/useCapabilities";
import { 
  User, 
  Briefcase, 
  Star, 
  Clock, 
  DollarSign, 
  TrendingUp, 
  Lightbulb, 
  CheckCircle2, 
  AlertCircle,
  Download,
  MapPin,
  Calendar,
  Users,
  Award,
} from "lucide-react";
import { format } from "date-fns";
import { jsPDF } from "jspdf";

export default function WorkerProfile() {
  const { userId } = useParams<{ userId: string }>();
  const { data, isLoading, error } = useWorkerProfile(userId);
  const { isTeamLead, isAdmin, isOverseer } = useCapabilities();

  const canViewDetails = isTeamLead() || isAdmin() || isOverseer();

  const handleDownloadReport = () => {
    if (!data) return;

    const doc = new jsPDF();
    const profile = data.profile;
    
    // Title
    doc.setFontSize(20);
    doc.text("Worker Performance Report", 20, 20);
    
    // Worker info
    doc.setFontSize(12);
    doc.text(`Name: ${profile?.full_name || "Unknown"}`, 20, 35);
    doc.text(`Country: ${profile?.country || "Not specified"}`, 20, 42);
    doc.text(`Member Since: ${profile?.created_at ? format(new Date(profile.created_at), "MMM d, yyyy") : "Unknown"}`, 20, 49);
    
    if (data.teamInfo) {
      doc.text(`Team: ${data.teamInfo.team_name}`, 20, 56);
      doc.text(`Role: ${data.teamInfo.role}`, 20, 63);
    }
    
    // Stats
    doc.setFontSize(14);
    doc.text("Performance Summary", 20, 78);
    doc.setFontSize(12);
    doc.text(`Total Tasks: ${data.taskStats.total_tasks}`, 20, 88);
    doc.text(`Completed Tasks: ${data.taskStats.completed_tasks}`, 20, 95);
    doc.text(`Total Hours: ${data.taskStats.total_hours.toFixed(1)}`, 20, 102);
    doc.text(`Total Earnings: $${data.taskStats.total_earnings.toFixed(2)}`, 20, 109);
    if (data.taskStats.average_rating) {
      doc.text(`Average Rating: ${data.taskStats.average_rating.toFixed(1)}/5`, 20, 116);
    }
    
    // Skills
    doc.setFontSize(14);
    doc.text("Skills Developed", 20, 131);
    doc.setFontSize(12);
    let yPos = 141;
    data.skillProgression.slice(0, 10).forEach((skill) => {
      doc.text(`• ${skill.skill} (${skill.count} signals)`, 20, yPos);
      yPos += 7;
    });
    
    // Learning insights summary
    doc.setFontSize(14);
    doc.text("Learning Insights Summary", 20, yPos + 10);
    doc.setFontSize(12);
    doc.text(`Total Insights: ${data.learningInsights.length}`, 20, yPos + 20);
    doc.text(`Approved Work: ${data.learningInsights.filter(i => i.resolution_status === "approved").length}`, 20, yPos + 27);
    doc.text(`Revision Requests: ${data.learningInsights.filter(i => i.resolution_status === "needs_revision").length}`, 20, yPos + 34);
    
    // Footer
    doc.setFontSize(10);
    doc.text(`Generated on ${format(new Date(), "MMM d, yyyy 'at' h:mm a")}`, 20, 280);
    
    doc.save(`worker-report-${profile?.full_name?.replace(/\s+/g, "-") || userId}.pdf`);
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <Skeleton className="h-8 w-48" />
          <div className="grid gap-6 md:grid-cols-3">
            <Skeleton className="h-[200px]" />
            <Skeleton className="h-[200px] md:col-span-2" />
          </div>
          <Skeleton className="h-[400px]" />
        </div>
      </DashboardLayout>
    );
  }

  if (error || !data) {
    return (
      <DashboardLayout>
        <Card>
          <CardContent className="py-12">
            <div className="flex flex-col items-center text-center">
              <AlertCircle className="h-12 w-12 text-destructive mb-4" />
              <h2 className="text-xl font-semibold">Unable to Load Profile</h2>
              <p className="text-muted-foreground mt-2">
                {error?.message || "The worker profile could not be found."}
              </p>
            </div>
          </CardContent>
        </Card>
      </DashboardLayout>
    );
  }

  const { profile, learningInsights, taskStats, skillProgression, teamInfo } = data;

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={profile?.avatar_url || undefined} />
              <AvatarFallback className="bg-primary/10 text-primary text-xl">
                {profile?.full_name?.charAt(0) || "W"}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-2xl font-bold">{profile?.full_name || "Worker"}</h1>
              <div className="flex items-center gap-2 text-muted-foreground text-sm">
                {profile?.country && (
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {profile.country}
                  </span>
                )}
                {profile?.created_at && (
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    Joined {format(new Date(profile.created_at), "MMM yyyy")}
                  </span>
                )}
              </div>
              {teamInfo && (
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="secondary">
                    <Users className="h-3 w-3 mr-1" />
                    {teamInfo.team_name}
                  </Badge>
                  <Badge variant="outline">{teamInfo.role}</Badge>
                </div>
              )}
            </div>
          </div>
          {canViewDetails && (
            <Button onClick={handleDownloadReport} variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Download Report
            </Button>
          )}
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Briefcase className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{taskStats.total_tasks}</p>
                  <p className="text-sm text-muted-foreground">Total Tasks</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-green-500/10">
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{taskStats.completed_tasks}</p>
                  <p className="text-sm text-muted-foreground">Completed</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-yellow-500/10">
                  <Clock className="h-5 w-5 text-yellow-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{taskStats.total_hours.toFixed(1)}</p>
                  <p className="text-sm text-muted-foreground">Hours Worked</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-500/10">
                  <Star className="h-5 w-5 text-blue-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {taskStats.average_rating ? taskStats.average_rating.toFixed(1) : "N/A"}
                  </p>
                  <p className="text-sm text-muted-foreground">Avg Rating</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="skills" className="space-y-4">
          <TabsList>
            <TabsTrigger value="skills">
              <Award className="h-4 w-4 mr-2" />
              Skills
            </TabsTrigger>
            <TabsTrigger value="insights">
              <Lightbulb className="h-4 w-4 mr-2" />
              Learning History
            </TabsTrigger>
            {canViewDetails && (
              <TabsTrigger value="metrics">
                <TrendingUp className="h-4 w-4 mr-2" />
                Metrics
              </TabsTrigger>
            )}
          </TabsList>

          {/* Skills Tab */}
          <TabsContent value="skills">
            <Card>
              <CardHeader>
                <CardTitle>Skills Developed</CardTitle>
                <CardDescription>
                  Skills gained through approved work and feedback
                </CardDescription>
              </CardHeader>
              <CardContent>
                {skillProgression.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Award className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No skills recorded yet</p>
                    <p className="text-sm">Skills are gained through completed work reviews</p>
                  </div>
                ) : (
                  <div className="grid gap-4 md:grid-cols-2">
                    {skillProgression.map((skill) => (
                      <div
                        key={skill.skill}
                        className="flex items-center justify-between p-4 rounded-lg border"
                      >
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-full bg-primary/10">
                            <TrendingUp className="h-4 w-4 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium">{skill.skill}</p>
                            <p className="text-xs text-muted-foreground">
                              First recorded: {format(new Date(skill.first_seen), "MMM d, yyyy")}
                            </p>
                          </div>
                        </div>
                        <Badge variant="secondary">{skill.count} signals</Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Learning History Tab */}
          <TabsContent value="insights">
            <Card>
              <CardHeader>
                <CardTitle>Learning Insights History</CardTitle>
                <CardDescription>
                  Complete feedback and growth records
                </CardDescription>
              </CardHeader>
              <CardContent>
                {learningInsights.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Lightbulb className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No learning insights yet</p>
                  </div>
                ) : (
                  <div className="space-y-4 max-h-[600px] overflow-y-auto">
                    {learningInsights.map((insight) => (
                      <div
                        key={insight.id}
                        className="p-4 rounded-lg border space-y-3"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Badge variant={insight.resolution_status === "approved" ? "default" : "secondary"}>
                              {insight.resolution_status}
                            </Badge>
                            <Badge variant="outline">{insight.entity_type}</Badge>
                            {insight.skill_signal && (
                              <Badge variant="outline" className="text-primary border-primary">
                                {insight.skill_signal}
                              </Badge>
                            )}
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {format(new Date(insight.created_at), "MMM d, yyyy")}
                          </span>
                        </div>
                        
                        {insight.what_went_well && (
                          <div className="bg-green-50 dark:bg-green-950/20 p-3 rounded">
                            <p className="text-xs font-medium text-green-700 dark:text-green-400 mb-1">
                              What went well
                            </p>
                            <p className="text-sm">{insight.what_went_well}</p>
                          </div>
                        )}
                        
                        {insight.what_to_improve && (
                          <div className="bg-amber-50 dark:bg-amber-950/20 p-3 rounded">
                            <p className="text-xs font-medium text-amber-700 dark:text-amber-400 mb-1">
                              What to improve
                            </p>
                            <p className="text-sm">{insight.what_to_improve}</p>
                          </div>
                        )}
                        
                        {insight.suggestions && insight.suggestions.length > 0 && (
                          <div className="bg-blue-50 dark:bg-blue-950/20 p-3 rounded">
                            <p className="text-xs font-medium text-blue-700 dark:text-blue-400 mb-1">
                              Suggestions
                            </p>
                            <ul className="text-sm list-disc list-inside">
                              {insight.suggestions.map((s, i) => (
                                <li key={i}>{s}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Metrics Tab (Admin only) */}
          {canViewDetails && (
            <TabsContent value="metrics">
              <div className="grid gap-6 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Performance Metrics</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Total Earnings</span>
                      <span className="font-semibold text-lg">
                        ${taskStats.total_earnings.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Completion Rate</span>
                      <span className="font-semibold">
                        {taskStats.total_tasks > 0
                          ? ((taskStats.completed_tasks / taskStats.total_tasks) * 100).toFixed(0)
                          : 0}%
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Avg Hours per Task</span>
                      <span className="font-semibold">
                        {taskStats.total_tasks > 0
                          ? (taskStats.total_hours / taskStats.total_tasks).toFixed(1)
                          : 0}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Pending Tasks</span>
                      <span className="font-semibold">{taskStats.pending_tasks}</span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Profile Skills</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {profile?.skills && profile.skills.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {profile.skills.map((skill) => (
                          <Badge key={skill} variant="outline">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    ) : (
                      <p className="text-muted-foreground">No profile skills set</p>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          )}
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
