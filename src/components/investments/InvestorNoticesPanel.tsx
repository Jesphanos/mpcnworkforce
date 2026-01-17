import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Bell, 
  Info, 
  AlertTriangle, 
  CheckCircle, 
  DollarSign,
} from "lucide-react";
import { format } from "date-fns";
import { useInvestorNotices } from "@/hooks/useInvestorProfile";
import { cn } from "@/lib/utils";

const noticeTypeConfig: Record<string, { icon: typeof Info; color: string; bgColor: string }> = {
  info: { icon: Info, color: "text-info", bgColor: "bg-info/10" },
  warning: { icon: AlertTriangle, color: "text-warning", bgColor: "bg-warning/10" },
  success: { icon: CheckCircle, color: "text-success", bgColor: "bg-success/10" },
  distribution: { icon: DollarSign, color: "text-primary", bgColor: "bg-primary/10" },
};

export function InvestorNoticesPanel() {
  const { data: notices, isLoading } = useInvestorNotices();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-40" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-40 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Bell className="h-5 w-5 text-muted-foreground" />
          <CardTitle>Investment Notices</CardTitle>
        </div>
        <CardDescription>
          Updates about MPCN performance and distributions
        </CardDescription>
      </CardHeader>
      <CardContent>
        {notices && notices.length > 0 ? (
          <ScrollArea className="h-[300px] pr-4">
            <div className="space-y-3">
              {notices.map((notice) => {
                const config = noticeTypeConfig[notice.notice_type] || noticeTypeConfig.info;
                const NoticeIcon = config.icon;

                return (
                  <div 
                    key={notice.id}
                    className={cn(
                      "p-4 rounded-lg border",
                      config.bgColor
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <NoticeIcon className={cn("h-5 w-5 shrink-0 mt-0.5", config.color)} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium text-sm">{notice.title}</h4>
                          <Badge variant="outline" className="text-xs capitalize">
                            {notice.notice_type}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {notice.message}
                        </p>
                        <p className="text-xs text-muted-foreground mt-2">
                          {format(new Date(notice.published_at), "MMM d, yyyy")}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No new notices at this time</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
