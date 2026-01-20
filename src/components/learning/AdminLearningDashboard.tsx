import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  GraduationCap, 
  Search, 
  Award, 
  BookOpen, 
  Clock, 
  Users,
  ChevronRight,
  TrendingUp
} from "lucide-react";
import { useAdminLearningData, UserLearningProgress } from "@/hooks/useAdminLearningData";
import { UserLearningDetailDialog } from "./UserLearningDetailDialog";
import { format } from "date-fns";

export function AdminLearningDashboard() {
  const { usersProgress, isLoading, certificationPaths } = useAdminLearningData();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState<UserLearningProgress | null>(null);

  const filteredUsers = usersProgress.filter(user =>
    user.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calculate stats
  const totalLearners = usersProgress.length;
  const totalCertificates = usersProgress.reduce((acc, u) => acc + u.certifications.length, 0);
  const avgCompletion = totalLearners > 0 
    ? Math.round(usersProgress.reduce((acc, u) => acc + u.completion_percentage, 0) / totalLearners) 
    : 0;
  const activeThisWeek = usersProgress.filter(u => {
    if (!u.last_activity) return false;
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return new Date(u.last_activity) > weekAgo;
  }).length;

  const getInitials = (name: string | null) => {
    if (!name) return "U";
    return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <Card key={i}>
              <CardContent className="pt-6">
                <Skeleton className="h-8 w-20 mb-2" />
                <Skeleton className="h-4 w-32" />
              </CardContent>
            </Card>
          ))}
        </div>
        <Card>
          <CardContent className="pt-6">
            <Skeleton className="h-64 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalLearners}</p>
                <p className="text-sm text-muted-foreground">Active Learners</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-500/10">
                <Award className="h-5 w-5 text-amber-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalCertificates}</p>
                <p className="text-sm text-muted-foreground">Certificates Issued</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-500/10">
                <TrendingUp className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{avgCompletion}%</p>
                <p className="text-sm text-muted-foreground">Avg Completion</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/10">
                <Clock className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{activeThisWeek}</p>
                <p className="text-sm text-muted-foreground">Active This Week</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* User Progress Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <GraduationCap className="h-5 w-5" />
                Learning Progress Overview
              </CardTitle>
              <CardDescription>
                View and manage all users' learning progress and certifications
              </CardDescription>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 w-64"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredUsers.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <BookOpen className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No users have started learning yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredUsers.map((user) => (
                <div
                  key={user.user_id}
                  className="flex items-center gap-4 p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors cursor-pointer"
                  onClick={() => setSelectedUser(user)}
                >
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={user.avatar_url || undefined} />
                    <AvatarFallback>{getInitials(user.full_name)}</AvatarFallback>
                  </Avatar>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium truncate">{user.full_name || "Unknown User"}</p>
                      {user.certifications.length > 0 && (
                        <Badge variant="secondary" className="gap-1">
                          <Award className="h-3 w-3" />
                          {user.certifications.length}
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-4 mt-1">
                      <span className="text-sm text-muted-foreground">
                        {user.modules_completed}/{user.total_modules} modules
                      </span>
                      {user.last_activity && (
                        <span className="text-xs text-muted-foreground">
                          Last active: {format(new Date(user.last_activity), "MMM d, yyyy")}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-4 w-48">
                    <div className="flex-1">
                      <Progress value={user.completion_percentage} className="h-2" />
                    </div>
                    <span className="text-sm font-medium w-12 text-right">
                      {user.completion_percentage}%
                    </span>
                  </div>

                  <Button variant="ghost" size="icon">
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Certification Paths Reference */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5" />
            Certification Paths
          </CardTitle>
          <CardDescription>
            Available certification tracks and their requirements
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {certificationPaths.map((path) => (
              <div key={path.id} className="p-4 rounded-lg border bg-muted/30">
                <div className="flex items-center gap-2 mb-2">
                  <Award className="h-4 w-4 text-primary" />
                  <span className="font-medium">{path.name}</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  {path.requiredModules.length} modules required
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* User Detail Dialog */}
      <UserLearningDetailDialog
        user={selectedUser}
        open={!!selectedUser}
        onOpenChange={(open) => !open && setSelectedUser(null)}
      />
    </div>
  );
}
