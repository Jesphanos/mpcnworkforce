import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useRecentActivity } from "@/hooks/useRecentActivity";
import { formatDistanceToNow, format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { FileText, ClipboardList, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ActivityHistory() {
  const navigate = useNavigate();
  const { data: activities, isLoading } = useRecentActivity(50);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved": return "bg-success text-success-foreground";
      case "rejected": return "bg-destructive text-destructive-foreground";
      case "pending": return "bg-warning text-warning-foreground";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const getActivityIcon = (type: string) => {
    return type === "task" ? ClipboardList : FileText;
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/dashboard")}
            className="shrink-0"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Activity History</h1>
            <p className="text-muted-foreground">View all your recent tasks and reports</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Activity</CardTitle>
            <CardDescription>
              Complete history of your tasks and reports
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {isLoading ? (
                Array.from({ length: 10 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-4 p-4 rounded-lg border">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-1/3" />
                      <Skeleton className="h-3 w-1/2" />
                    </div>
                    <Skeleton className="h-6 w-20" />
                  </div>
                ))
              ) : activities && activities.length > 0 ? (
                activities.map((activity) => {
                  const Icon = getActivityIcon(activity.type);
                  return (
                    <div
                      key={activity.id}
                      className="flex items-center gap-4 p-4 rounded-lg border hover:bg-muted/50 cursor-pointer transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                      onClick={() => navigate(activity.url)}
                      onKeyDown={(e) => e.key === "Enter" && navigate(activity.url)}
                      tabIndex={0}
                      role="button"
                    >
                      <div className="h-10 w-10 rounded-full flex items-center justify-center bg-muted">
                        <Icon className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium text-foreground truncate">
                            {activity.title}
                          </p>
                          <Badge variant="outline" className="text-xs capitalize">
                            {activity.type}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {activity.description}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {format(new Date(activity.timestamp), "PPP 'at' p")}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <Badge className={getStatusColor(activity.status)}>
                          {activity.status}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                        </span>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <ClipboardList className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium">No activity yet</p>
                  <p className="text-sm">Your tasks and reports will appear here</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
