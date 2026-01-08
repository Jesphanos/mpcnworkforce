import { useState } from "react";
import { format, formatDistanceToNow, isPast } from "date-fns";
import { 
  MessageCircle, 
  Clock, 
  CheckCircle2, 
  AlertTriangle,
  User,
  Filter,
  ChevronDown,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  useResolutionRequests,
  useUpdateResolutionRequest,
  RESOLUTION_CATEGORIES,
  RESOLUTION_STATUS_CONFIG,
  ResolutionRequest,
  ResolutionStatus,
} from "@/hooks/useResolutionRequests";
import { cn } from "@/lib/utils";

const PRIORITY_CONFIG: Record<string, { label: string; color: string }> = {
  urgent: { label: "Urgent", color: "text-destructive" },
  high: { label: "High", color: "text-warning" },
  normal: { label: "Normal", color: "text-muted-foreground" },
  low: { label: "Low", color: "text-muted-foreground/70" },
};

function RequestDetailDialog({ 
  request, 
  isOpen, 
  onClose 
}: { 
  request: ResolutionRequest; 
  isOpen: boolean;
  onClose: () => void;
}) {
  const [resolution, setResolution] = useState(request.resolution || "");
  const [status, setStatus] = useState<ResolutionStatus>(request.status);
  const updateRequest = useUpdateResolutionRequest();
  
  const handleSubmit = () => {
    const updates: Partial<ResolutionRequest> = { status };
    
    if (status === "resolved") {
      updates.resolution = resolution;
      updates.resolved_at = new Date().toISOString();
    }
    
    updateRequest.mutate(
      { requestId: request.id, updates },
      { onSuccess: onClose }
    );
  };
  
  const statusConfig = RESOLUTION_STATUS_CONFIG[request.status];
  const category = RESOLUTION_CATEGORIES[request.category] || { label: request.category };
  const isOverdue = request.sla_due_at && isPast(new Date(request.sla_due_at)) && request.status !== "resolved";
  
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 flex-wrap">
            {request.title}
            {isOverdue && (
              <Badge variant="destructive" className="text-xs">
                SLA Breached
              </Badge>
            )}
          </DialogTitle>
          <DialogDescription>
            Submitted {formatDistanceToNow(new Date(request.created_at), { addSuffix: true })}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="secondary">{category.label}</Badge>
            <Badge variant="outline" className={PRIORITY_CONFIG[request.priority]?.color}>
              {PRIORITY_CONFIG[request.priority]?.label || request.priority}
            </Badge>
            <Badge variant="outline" className={cn(statusConfig.color, statusConfig.bgColor)}>
              {statusConfig.label}
            </Badge>
          </div>
          
          <div className="p-3 rounded-lg bg-muted/50">
            <p className="text-sm">{request.description}</p>
          </div>
          
          {request.sla_due_at && request.status !== "resolved" && (
            <div className={cn(
              "flex items-center gap-2 text-sm p-2 rounded-lg",
              isOverdue ? "bg-destructive/10 text-destructive" : "bg-warning/10 text-warning-foreground"
            )}>
              <Clock className="h-4 w-4" />
              <span>
                Due {format(new Date(request.sla_due_at), "MMM d, yyyy 'at' h:mm a")}
                {isOverdue ? " (overdue)" : ` (${formatDistanceToNow(new Date(request.sla_due_at))} remaining)`}
              </span>
            </div>
          )}
          
          <div className="space-y-2">
            <Label>Update Status</Label>
            <Select value={status} onValueChange={(v) => setStatus(v as ResolutionStatus)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(RESOLUTION_STATUS_CONFIG).map(([key, config]) => (
                  <SelectItem key={key} value={key}>
                    {config.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {status === "resolved" && (
            <div className="space-y-2">
              <Label>Resolution Notes</Label>
              <Textarea
                placeholder="Describe how this was resolved..."
                value={resolution}
                onChange={(e) => setResolution(e.target.value)}
                rows={3}
              />
            </div>
          )}
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={updateRequest.isPending || (status === "resolved" && !resolution.trim())}
          >
            Update Request
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function RequestRow({ request }: { request: ResolutionRequest }) {
  const [isOpen, setIsOpen] = useState(false);
  const statusConfig = RESOLUTION_STATUS_CONFIG[request.status];
  const category = RESOLUTION_CATEGORIES[request.category] || { label: request.category };
  const isOverdue = request.sla_due_at && isPast(new Date(request.sla_due_at)) && request.status !== "resolved";
  
  return (
    <>
      <div 
        className={cn(
          "p-4 rounded-lg border space-y-2 cursor-pointer hover:bg-muted/50 transition-colors",
          isOverdue && "border-destructive/50 bg-destructive/5"
        )}
        onClick={() => setIsOpen(true)}
      >
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="font-medium text-sm">{request.title}</p>
              {isOverdue && (
                <Badge variant="destructive" className="text-xs">
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  Overdue
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
              {request.description}
            </p>
          </div>
          <Badge variant="outline" className={cn("text-xs shrink-0", statusConfig.color, statusConfig.bgColor)}>
            {statusConfig.label}
          </Badge>
        </div>
        
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-3">
            <Badge variant="secondary" className="text-xs">
              {category.label}
            </Badge>
            <span className={PRIORITY_CONFIG[request.priority]?.color}>
              {PRIORITY_CONFIG[request.priority]?.label || request.priority}
            </span>
          </div>
          <span>{format(new Date(request.created_at), "MMM d, yyyy")}</span>
        </div>
      </div>
      
      <RequestDetailDialog 
        request={request} 
        isOpen={isOpen} 
        onClose={() => setIsOpen(false)} 
      />
    </>
  );
}

export function AdminResolutionPanel() {
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const { data: requests, isLoading } = useResolutionRequests();
  
  const filteredRequests = requests?.filter(r => {
    if (statusFilter === "all") return true;
    if (statusFilter === "overdue") {
      return r.sla_due_at && isPast(new Date(r.sla_due_at)) && r.status !== "resolved";
    }
    return r.status === statusFilter;
  }) || [];
  
  const overdueCount = requests?.filter(
    r => r.sla_due_at && isPast(new Date(r.sla_due_at)) && r.status !== "resolved"
  ).length || 0;
  
  const openCount = requests?.filter(r => r.status !== "resolved").length || 0;
  
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            All Resolution Requests
            {openCount > 0 && (
              <Badge variant="secondary" className="ml-1">
                {openCount} open
              </Badge>
            )}
            {overdueCount > 0 && (
              <Badge variant="destructive" className="ml-1">
                {overdueCount} overdue
              </Badge>
            )}
          </CardTitle>
          <CardDescription>
            Review and manage resolution requests from all users
          </CardDescription>
        </div>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-1" />
              {statusFilter === "all" ? "All" : statusFilter === "overdue" ? "Overdue" : RESOLUTION_STATUS_CONFIG[statusFilter as ResolutionStatus]?.label}
              <ChevronDown className="h-3 w-3 ml-1" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setStatusFilter("all")}>
              All Requests
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setStatusFilter("overdue")}>
              <AlertTriangle className="h-4 w-4 mr-2 text-destructive" />
              Overdue Only
            </DropdownMenuItem>
            {Object.entries(RESOLUTION_STATUS_CONFIG).map(([key, config]) => (
              <DropdownMenuItem key={key} onClick={() => setStatusFilter(key)}>
                {config.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>
      <CardContent>
        {filteredRequests.length > 0 ? (
          <ScrollArea className="max-h-[500px]">
            <div className="space-y-3">
              {filteredRequests.map((request) => (
                <RequestRow key={request.id} request={request} />
              ))}
            </div>
          </ScrollArea>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <CheckCircle2 className="h-10 w-10 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No requests matching filter</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
