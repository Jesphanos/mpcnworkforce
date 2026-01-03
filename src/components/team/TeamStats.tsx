import { useTeamTasks, useTeamReports, useTeamMembers } from "@/hooks/useTeamData";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, ClipboardList, FileText, Clock, CheckCircle, XCircle } from "lucide-react";

export function TeamStats() {
  const { data: tasks } = useTeamTasks();
  const { data: reports } = useTeamReports();
  const { data: members } = useTeamMembers();

  const pendingTasks = tasks?.filter((t) => t.final_status === "pending").length || 0;
  const approvedTasks = tasks?.filter((t) => t.final_status === "approved").length || 0;
  const pendingReports = reports?.filter((r) => r.final_status === "pending").length || 0;
  const approvedReports = reports?.filter((r) => r.final_status === "approved").length || 0;

  const stats = [
    {
      title: "Team Members",
      value: members?.length || 0,
      icon: Users,
      description: "Active members",
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    },
    {
      title: "Pending Tasks",
      value: pendingTasks,
      icon: Clock,
      description: "Awaiting review",
      color: "text-amber-600",
      bgColor: "bg-amber-100",
    },
    {
      title: "Approved Tasks",
      value: approvedTasks,
      icon: CheckCircle,
      description: "This period",
      color: "text-green-600",
      bgColor: "bg-green-100",
    },
    {
      title: "Pending Reports",
      value: pendingReports,
      icon: FileText,
      description: "Awaiting review",
      color: "text-purple-600",
      bgColor: "bg-purple-100",
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
            <div className={`p-2 rounded-lg ${stat.bgColor}`}>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
            <p className="text-xs text-muted-foreground">{stat.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
