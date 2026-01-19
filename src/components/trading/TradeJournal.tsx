import { format } from "date-fns";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  TrendingUp,
  TrendingDown,
  Clock,
  CheckCircle,
  XCircle,
  BookOpen,
} from "lucide-react";
import { useState } from "react";
import {
  useTraderProfile,
  useTraderTrades,
  useCloseTrade,
  type Trade,
} from "@/hooks/useTrading";
import { cn } from "@/lib/utils";

const statusConfig = {
  open: { icon: Clock, color: "text-warning", label: "Open" },
  closed: { icon: CheckCircle, color: "text-success", label: "Closed" },
  cancelled: { icon: XCircle, color: "text-muted-foreground", label: "Cancelled" },
};

function CloseTradeDialog({
  trade,
  isOpen,
  onClose,
}: {
  trade: Trade;
  isOpen: boolean;
  onClose: () => void;
}) {
  const [exitPrice, setExitPrice] = useState("");
  const [notes, setNotes] = useState("");
  const closeTrade = useCloseTrade();

  const handleClose = async () => {
    await closeTrade.mutateAsync({
      trade_id: trade.id,
      exit_price: parseFloat(exitPrice),
      execution_notes: notes || undefined,
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Close Trade</DialogTitle>
          <DialogDescription>
            Enter the exit price to close this {trade.instrument} trade.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="p-3 rounded-lg bg-muted/50">
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="text-muted-foreground">Instrument:</span>{" "}
                <span className="font-medium">{trade.instrument}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Direction:</span>{" "}
                <Badge variant={trade.direction === "long" ? "default" : "destructive"}>
                  {trade.direction.toUpperCase()}
                </Badge>
              </div>
              <div>
                <span className="text-muted-foreground">Entry:</span>{" "}
                <span className="font-medium">{trade.entry_price}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Size:</span>{" "}
                <span className="font-medium">{trade.position_size}</span>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="exit-price">Exit Price *</Label>
            <Input
              id="exit-price"
              type="number"
              step="0.00000001"
              value={exitPrice}
              onChange={(e) => setExitPrice(e.target.value)}
              placeholder="Enter exit price"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Execution Notes</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any notes about this trade execution..."
              rows={2}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={handleClose}
            disabled={!exitPrice || closeTrade.isPending}
          >
            Close Trade
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function TradeJournal() {
  const { data: profile } = useTraderProfile();
  const { data: trades, isLoading } = useTraderTrades(profile?.id);
  const [selectedTrade, setSelectedTrade] = useState<Trade | null>(null);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-4 w-48" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-64 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Trade Journal
          </CardTitle>
          <CardDescription>
            All your logged trades with performance metrics
          </CardDescription>
        </CardHeader>
        <CardContent>
          {trades && trades.length > 0 ? (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Instrument</TableHead>
                    <TableHead>Direction</TableHead>
                    <TableHead>Entry</TableHead>
                    <TableHead>Exit</TableHead>
                    <TableHead>P/L</TableHead>
                    <TableHead>R-Multiple</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {trades.map((trade) => {
                    const status = statusConfig[trade.status];
                    const StatusIcon = status.icon;

                    return (
                      <TableRow key={trade.id}>
                        <TableCell className="font-medium">
                          {format(new Date(trade.entry_time), "MMM d, HH:mm")}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {trade.instrument}
                            {trade.is_demo && (
                              <Badge variant="secondary" className="text-xs">
                                Demo
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            {trade.direction === "long" ? (
                              <TrendingUp className="h-4 w-4 text-success" />
                            ) : (
                              <TrendingDown className="h-4 w-4 text-destructive" />
                            )}
                            <span className="capitalize">{trade.direction}</span>
                          </div>
                        </TableCell>
                        <TableCell>{trade.entry_price}</TableCell>
                        <TableCell>
                          {trade.exit_price || "-"}
                        </TableCell>
                        <TableCell>
                          {trade.pnl_amount !== null ? (
                            <span
                              className={cn(
                                "font-medium",
                                trade.pnl_amount >= 0 ? "text-success" : "text-destructive"
                              )}
                            >
                              {trade.pnl_amount >= 0 ? "+" : ""}
                              ${trade.pnl_amount.toFixed(2)}
                            </span>
                          ) : (
                            "-"
                          )}
                        </TableCell>
                        <TableCell>
                          {trade.r_multiple !== null ? (
                            <span
                              className={cn(
                                "font-medium",
                                trade.r_multiple >= 0 ? "text-success" : "text-destructive"
                              )}
                            >
                              {trade.r_multiple >= 0 ? "+" : ""}
                              {trade.r_multiple.toFixed(2)}R
                            </span>
                          ) : (
                            "-"
                          )}
                        </TableCell>
                        <TableCell>
                          <div className={cn("flex items-center gap-1", status.color)}>
                            <StatusIcon className="h-4 w-4" />
                            <span>{status.label}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {trade.status === "open" && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setSelectedTrade(trade)}
                            >
                              Close
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">No trades yet</p>
              <p>Start logging your trades to build your journal.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {selectedTrade && (
        <CloseTradeDialog
          trade={selectedTrade}
          isOpen={!!selectedTrade}
          onClose={() => setSelectedTrade(null)}
        />
      )}
    </>
  );
}
