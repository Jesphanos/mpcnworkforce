import { useState } from "react";
import { format, formatDistanceToNow, isPast } from "date-fns";
import { 
  MessageCircle, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Users,
  ChevronRight,
  Plus,
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
  DialogTrigger 
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useMyResolutionRequests,
  useCreateResolutionRequest,
  RESOLUTION_CATEGORIES,
  RESOLUTION_STATUS_CONFIG,
  ResolutionRequest,
} from "@/hooks/useResolutionRequests";
import { cn } from "@/lib/utils";

function RequestItem({ request }: { request: ResolutionRequest }) {
  const statusConfig = RESOLUTION_STATUS_CONFIG[request.status];
  const category = RESOLUTION_CATEGORIES[request.category] || { label: request.category };
  const isOverdue = request.sla_due_at && isPast(new Date(request.sla_due_at)) && request.status !== "resolved";
  
  return (
    <div className="p-4 rounded-lg bg-muted/50 space-y-2 hover:bg-muted/70 transition-colors">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className="font-medium text-sm truncate">{request.title}</p>
          <Badge variant="secondary" className="text-xs mt-1">
            {category.label}
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          {isOverdue && (
            <Badge variant="destructive" className="text-xs">
              Overdue
            </Badge>
          )}
          <Badge variant="outline" className={cn("text-xs", statusConfig.color, statusConfig.bgColor)}>
            {statusConfig.label}
          </Badge>
        </div>
      </div>
      
      <p className="text-sm text-muted-foreground line-clamp-2">
        {request.description}
      </p>
      
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>{format(new Date(request.created_at), "MMM d, yyyy")}</span>
        {request.sla_due_at && request.status !== "resolved" && (
          <span className={isOverdue ? "text-destructive" : ""}>
            Due {formatDistanceToNow(new Date(request.sla_due_at), { addSuffix: true })}
          </span>
        )}
      </div>
      
      {request.resolution && (
        <div className="pt-2 border-t border-border/50">
          <p className="text-xs text-muted-foreground">
            <span className="font-medium">Resolution:</span> {request.resolution}
          </p>
        </div>
      )}
    </div>
  );
}

function CreateRequestDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const [form, setForm] = useState({
    category: "",
    title: "",
    description: "",
    priority: "normal",
  });
  
  const createRequest = useCreateResolutionRequest();
  
  const handleSubmit = () => {
    createRequest.mutate(form, {
      onSuccess: () => {
        setIsOpen(false);
        setForm({ category: "", title: "", description: "", priority: "normal" });
      },
    });
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus className="h-4 w-4 mr-1" />
          New Request
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Submit Resolution Request</DialogTitle>
          <DialogDescription>
            Raise a concern or request clarification. Your request will be handled privately and tracked until resolved.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <Label>Category</Label>
            <Select
              value={form.category}
              onValueChange={(value) => setForm({ ...form, category: value })}
            >
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(RESOLUTION_CATEGORIES).map(([key, { label }]) => (
                  <SelectItem key={key} value={key}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label>Title</Label>
            <Input
              placeholder="Brief summary of your request"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="mt-1"
            />
          </div>
          
          <div>
            <Label>Description</Label>
            <Textarea
              placeholder="Provide details about your concern or request..."
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="mt-1"
              rows={4}
            />
          </div>
          
          <div>
            <Label>Priority</Label>
            <Select
              value={form.priority}
              onValueChange={(value) => setForm({ ...form, priority: value })}
            >
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low (14 days)</SelectItem>
                <SelectItem value="normal">Normal (7 days)</SelectItem>
                <SelectItem value="high">High (3 days)</SelectItem>
                <SelectItem value="urgent">Urgent (24 hours)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!form.category || !form.title || !form.description || createRequest.isPending}
          >
            Submit Request
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function ResolutionRequestsPanel() {
  const { data: requests, isLoading } = useMyResolutionRequests();
  
  const activeCount = requests?.filter(r => r.status !== "resolved").length || 0;
  
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent className="space-y-3">
          {[1, 2].map((i) => (
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
            Resolution Requests
            {activeCount > 0 && (
              <Badge variant="secondary" className="ml-1">
                {activeCount} active
              </Badge>
            )}
          </CardTitle>
          <CardDescription>
            Raise concerns or request clarification on decisions
          </CardDescription>
        </div>
        <CreateRequestDialog />
      </CardHeader>
      <CardContent>
        {requests && requests.length > 0 ? (
          <ScrollArea className="max-h-[400px]">
            <div className="space-y-3">
              {requests.map((request) => (
                <RequestItem key={request.id} request={request} />
              ))}
            </div>
          </ScrollArea>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <CheckCircle2 className="h-10 w-10 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No resolution requests</p>
            <p className="text-xs">Use the button above if you have concerns</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
