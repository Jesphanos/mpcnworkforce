import { format, formatDistanceToNow } from "date-fns";
import { AlertCircle, CheckCircle2, Info, Eye, Shield, MessageCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { useState } from "react";
import {
  useAttentionSignals,
  useResolveAttentionSignal,
  SIGNAL_TYPE_LABELS,
  ATTENTION_LEVEL_CONFIG,
  AttentionSignal,
} from "@/hooks/useAttentionSignals";
import { cn } from "@/lib/utils";

interface AttentionSignalsListProps {
  showResolved?: boolean;
}

function SignalItem({ signal, onResolve }: { signal: AttentionSignal; onResolve: (id: string, notes: string) => void }) {
  const [resolutionNotes, setResolutionNotes] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  
  const typeConfig = SIGNAL_TYPE_LABELS[signal.signal_type] || {
    label: signal.signal_type,
    description: "Attention signal requiring review",
  };
  
  const levelConfig = ATTENTION_LEVEL_CONFIG[signal.level];
  const isResolved = !!signal.resolved_at;
  
  const LevelIcon = signal.level === "review_required" 
    ? AlertCircle 
    : signal.level === "support_needed" 
    ? MessageCircle 
    : Info;

  return (
    <div className={cn(
      "p-4 rounded-lg border space-y-3",
      isResolved ? "bg-muted/30 border-border/50" : levelConfig.bgColor + " border-" + levelConfig.color.replace("text-", "")
    )}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className={cn("p-2 rounded-lg", levelConfig.bgColor)}>
            <LevelIcon className={cn("h-4 w-4", levelConfig.color)} />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-medium text-sm">{typeConfig.label}</span>
              <Badge variant="outline" className={cn("text-xs", levelConfig.color)}>
                {levelConfig.label}
              </Badge>
              {signal.trigger_count > 1 && (
                <Badge variant="secondary" className="text-xs">
                  {signal.trigger_count}× triggered
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {typeConfig.description}
            </p>
          </div>
        </div>
        
        {!isResolved && (
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button size="sm" variant="outline" className="shrink-0">
                <CheckCircle2 className="h-3 w-3 mr-1" />
                Resolve
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Resolve Attention Signal</DialogTitle>
                <DialogDescription>
                  Provide notes on how this was addressed. This is logged for governance records.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Resolution Notes</Label>
                  <Textarea
                    placeholder="Describe the action taken or why this signal was resolved..."
                    value={resolutionNotes}
                    onChange={(e) => setResolutionNotes(e.target.value)}
                    className="mt-1"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsOpen(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={() => {
                    onResolve(signal.id, resolutionNotes);
                    setIsOpen(false);
                    setResolutionNotes("");
                  }}
                  disabled={!resolutionNotes.trim()}
                >
                  Mark Resolved
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>
      
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>{format(new Date(signal.created_at), "MMM d, yyyy 'at' h:mm a")}</span>
        <span>{formatDistanceToNow(new Date(signal.created_at), { addSuffix: true })}</span>
      </div>
      
      {isResolved && signal.resolution_notes && (
        <div className="pt-2 border-t border-border/50">
          <p className="text-xs text-muted-foreground">
            <span className="font-medium">Resolution:</span> {signal.resolution_notes}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Resolved {formatDistanceToNow(new Date(signal.resolved_at!), { addSuffix: true })}
          </p>
        </div>
      )}
      
      {signal.is_private && !isResolved && (
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Eye className="h-3 w-3" />
          <span>Private - visible only to relevant parties</span>
        </div>
      )}
    </div>
  );
}

export function AttentionSignalsList({ showResolved = false }: AttentionSignalsListProps) {
  const { data: signals, isLoading } = useAttentionSignals({ unresolvedOnly: !showResolved });
  const resolveSignal = useResolveAttentionSignal();
  
  const handleResolve = (signalId: string, notes: string) => {
    resolveSignal.mutate({ signalId, resolutionNotes: notes });
  };
  
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-40" />
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
  
  const unresolvedCount = signals?.filter(s => !s.resolved_at).length || 0;
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Attention Signals
          {unresolvedCount > 0 && (
            <Badge variant="destructive" className="ml-2">
              {unresolvedCount} active
            </Badge>
          )}
        </CardTitle>
        <CardDescription>
          Automated governance signals that require review or acknowledgement
        </CardDescription>
      </CardHeader>
      <CardContent>
        {signals && signals.length > 0 ? (
          <div className="space-y-3">
            {signals.map((signal) => (
              <SignalItem 
                key={signal.id} 
                signal={signal} 
                onResolve={handleResolve}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <CheckCircle2 className="h-10 w-10 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No active attention signals</p>
            <p className="text-xs">The system is operating within normal parameters</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
