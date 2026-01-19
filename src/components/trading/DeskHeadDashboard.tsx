import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Users, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  CheckCircle2,
  XCircle,
  Clock,
  Shield,
  Award,
  BarChart3,
  UserCheck,
  ArrowUpRight,
  ArrowDownRight
} from "lucide-react";
import { useDeskHeadData, useApproveStrategy, useUpdateTraderClassification, useSetRiskLimits } from "@/hooks/useDeskHeadData";
import { format } from "date-fns";
import { toast } from "sonner";

export function DeskHeadDashboard() {
  const { 
    allTraders, 
    pendingStrategies, 
    aggregatedStats, 
    recentAlerts,
    promotionCandidates,
    isLoading 
  } = useDeskHeadData();
  
  const approveStrategy = useApproveStrategy();
  const updateClassification = useUpdateTraderClassification();
  const setRiskLimits = useSetRiskLimits();

  const [selectedTrader, setSelectedTrader] = useState<any>(null);
  const [promotionDialogOpen, setPromotionDialogOpen] = useState(false);
  const [strategyDialogOpen, setStrategyDialogOpen] = useState(false);
  const [selectedStrategy, setSelectedStrategy] = useState<any>(null);
  const [reviewNotes, setReviewNotes] = useState("");
  const [newClassification, setNewClassification] = useState<string>("");

  const handleApproveStrategy = async (approve: boolean) => {
    if (!selectedStrategy) return;
    
    await approveStrategy.mutateAsync({
      strategy_id: selectedStrategy.id,
      approved: approve,
    });
    
    setStrategyDialogOpen(false);
    setSelectedStrategy(null);
    setReviewNotes("");
  };

  const handlePromotionRecommendation = async (approve: boolean) => {
    if (!selectedTrader || !newClassification) return;
    
    await updateClassification.mutateAsync({
      trader_id: selectedTrader.id,
      new_classification: newClassification as any,
      notes: reviewNotes,
    });
    
    setPromotionDialogOpen(false);
    setSelectedTrader(null);
    setReviewNotes("");
    setNewClassification("");
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Department Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active Traders</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{aggregatedStats?.activeTraders || 0}</div>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="outline" className="text-xs">
                {aggregatedStats?.liveTraders || 0} Live
              </Badge>
              <Badge variant="secondary" className="text-xs">
                {aggregatedStats?.demoTraders || 0} Demo
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Weekly P/L</CardTitle>
            {(aggregatedStats?.weeklyPnl || 0) >= 0 ? (
              <TrendingUp className="h-4 w-4 text-green-500" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-500" />
            )}
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${(aggregatedStats?.weeklyPnl || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {(aggregatedStats?.weeklyPnl || 0) >= 0 ? '+' : ''}{(aggregatedStats?.weeklyPnl || 0).toFixed(2)}%
            </div>
            <p className="text-xs text-muted-foreground">
              Aggregated desk performance
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Avg. Win Rate</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(aggregatedStats?.avgWinRate || 0).toFixed(1)}%</div>
            <Progress value={aggregatedStats?.avgWinRate || 0} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Risk Alerts</CardTitle>
            <AlertTriangle className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{aggregatedStats?.activeAlerts || 0}</div>
            <p className="text-xs text-muted-foreground">
              {aggregatedStats?.criticalAlerts || 0} critical, {aggregatedStats?.warningAlerts || 0} warnings
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="traders" className="space-y-4">
        <TabsList>
          <TabsTrigger value="traders">All Traders</TabsTrigger>
          <TabsTrigger value="strategies">Strategy Approval</TabsTrigger>
          <TabsTrigger value="promotions">Promotion Queue</TabsTrigger>
          <TabsTrigger value="alerts">Risk Alerts</TabsTrigger>
        </TabsList>

        {/* Traders Tab */}
        <TabsContent value="traders" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Trading Desk Members</CardTitle>
              <CardDescription>
                Monitor trader performance and status. Read-only view of risk controls.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Trader</TableHead>
                    <TableHead>Classification</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Weekly P/L</TableHead>
                    <TableHead>Win Rate</TableHead>
                    <TableHead>Risk Score</TableHead>
                    <TableHead>Open Trades</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {allTraders?.map((trader) => (
                    <TableRow key={trader.id}>
                      <TableCell className="font-medium">
                        {trader.profile?.full_name || "Unknown"}
                      </TableCell>
                      <TableCell>
                        <Badge variant={
                          trader.classification === "lead" ? "default" :
                          trader.classification === "senior" ? "secondary" : "outline"
                        }>
                          {trader.classification}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {trader.suspended_at ? (
                          <Badge variant="destructive">Suspended</Badge>
                        ) : trader.live_trading_enabled ? (
                          <Badge variant="default" className="bg-green-600">Live</Badge>
                        ) : (
                          <Badge variant="secondary">Demo</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <span className={trader.weeklyPnl >= 0 ? "text-green-600" : "text-red-600"}>
                          {trader.weeklyPnl >= 0 ? "+" : ""}{trader.weeklyPnl?.toFixed(2) || "0.00"}%
                        </span>
                      </TableCell>
                      <TableCell>{trader.winRate?.toFixed(1) || 0}%</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Progress value={trader.riskScore || 0} className="w-16" />
                          <span className="text-xs">{trader.riskScore?.toFixed(0) || 0}</span>
                        </div>
                      </TableCell>
                      <TableCell>{trader.openTrades || 0}</TableCell>
                    </TableRow>
                  ))}
                  {(!allTraders || allTraders.length === 0) && (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                        No traders registered yet
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Strategy Approval Tab */}
        <TabsContent value="strategies" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Pending Strategy Approvals</CardTitle>
              <CardDescription>
                Review and approve trading strategies before traders can use them.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Strategy Name</TableHead>
                    <TableHead>Version</TableHead>
                    <TableHead>Markets</TableHead>
                    <TableHead>Min. Classification</TableHead>
                    <TableHead>Submitted By</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pendingStrategies?.map((strategy) => (
                    <TableRow key={strategy.id}>
                      <TableCell className="font-medium">{strategy.name}</TableCell>
                      <TableCell>v{strategy.version}</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {strategy.markets?.map((market: string) => (
                            <Badge key={market} variant="outline" className="text-xs">
                              {market}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{strategy.min_classification}</Badge>
                      </TableCell>
                      <TableCell>{strategy.created_by}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedStrategy(strategy);
                              setStrategyDialogOpen(true);
                            }}
                          >
                            Review
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {(!pendingStrategies || pendingStrategies.length === 0) && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                        No pending strategies to review
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Promotions Tab */}
        <TabsContent value="promotions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Promotion Recommendations</CardTitle>
              <CardDescription>
                Traders eligible for classification upgrade based on KPI scores.
                Department Head can recommend; system governance applies final decision.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Trader</TableHead>
                    <TableHead>Current Level</TableHead>
                    <TableHead>Recommended</TableHead>
                    <TableHead>KPI Score</TableHead>
                    <TableHead>Win Rate</TableHead>
                    <TableHead>Consistency</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {promotionCandidates?.map((candidate) => (
                    <TableRow key={candidate.id}>
                      <TableCell className="font-medium">
                        {candidate.profile?.full_name || "Unknown"}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{candidate.classification}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="default" className="bg-green-600">
                          <ArrowUpRight className="h-3 w-3 mr-1" />
                          {candidate.recommendedClassification}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{candidate.kpiScore?.toFixed(0)}</span>
                          <span className="text-xs text-muted-foreground">/100</span>
                        </div>
                      </TableCell>
                      <TableCell>{candidate.winRate?.toFixed(1)}%</TableCell>
                      <TableCell>
                        <Progress value={candidate.consistencyScore || 0} className="w-16" />
                      </TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          onClick={() => {
                            setSelectedTrader(candidate);
                            setNewClassification(candidate.recommendedClassification);
                            setPromotionDialogOpen(true);
                          }}
                        >
                          <UserCheck className="h-4 w-4 mr-1" />
                          Review
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {(!promotionCandidates || promotionCandidates.length === 0) && (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                        No promotion candidates at this time
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Alerts Tab */}
        <TabsContent value="alerts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Risk Alerts</CardTitle>
              <CardDescription>
                Active risk violations and system alerts across all traders.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Trader</TableHead>
                    <TableHead>Alert Type</TableHead>
                    <TableHead>Severity</TableHead>
                    <TableHead>Message</TableHead>
                    <TableHead>Time</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentAlerts?.map((alert) => (
                    <TableRow key={alert.id}>
                      <TableCell className="font-medium">
                        {alert.trader?.profile?.full_name || "Unknown"}
                      </TableCell>
                      <TableCell>{alert.alert_type}</TableCell>
                      <TableCell>
                        <Badge variant={
                          alert.severity === "critical" ? "destructive" :
                          alert.severity === "suspension" ? "destructive" :
                          "secondary"
                        }>
                          {alert.severity}
                        </Badge>
                      </TableCell>
                      <TableCell className="max-w-xs truncate">{alert.message}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {format(new Date(alert.created_at), "MMM d, HH:mm")}
                      </TableCell>
                      <TableCell>
                        {alert.resolved ? (
                          <Badge variant="outline" className="text-green-600">
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            Resolved
                          </Badge>
                        ) : alert.acknowledged ? (
                          <Badge variant="secondary">
                            <Clock className="h-3 w-3 mr-1" />
                            Acknowledged
                          </Badge>
                        ) : (
                          <Badge variant="destructive">
                            <AlertTriangle className="h-3 w-3 mr-1" />
                            Active
                          </Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                  {(!recentAlerts || recentAlerts.length === 0) && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                        No active alerts
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Strategy Review Dialog */}
      <Dialog open={strategyDialogOpen} onOpenChange={setStrategyDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Review Strategy: {selectedStrategy?.name}</DialogTitle>
            <DialogDescription>
              Approve or reject this trading strategy. Approved strategies become available to traders.
            </DialogDescription>
          </DialogHeader>
          
          {selectedStrategy && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Version:</span>
                  <span className="ml-2 font-medium">v{selectedStrategy.version}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Min. Level:</span>
                  <span className="ml-2">
                    <Badge variant="outline">{selectedStrategy.min_classification}</Badge>
                  </span>
                </div>
              </div>
              
              <div>
                <span className="text-sm text-muted-foreground">Markets:</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {selectedStrategy.markets?.map((market: string) => (
                    <Badge key={market} variant="secondary">{market}</Badge>
                  ))}
                </div>
              </div>
              
              {selectedStrategy.description && (
                <div>
                  <span className="text-sm text-muted-foreground">Description:</span>
                  <p className="mt-1 text-sm">{selectedStrategy.description}</p>
                </div>
              )}
              
              <div>
                <label className="text-sm font-medium">Review Notes</label>
                <Textarea
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  placeholder="Optional notes for this decision..."
                  className="mt-1"
                />
              </div>
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button
              variant="destructive"
              onClick={() => handleApproveStrategy(false)}
              disabled={approveStrategy.isPending}
            >
              <XCircle className="h-4 w-4 mr-1" />
              Reject
            </Button>
            <Button
              onClick={() => handleApproveStrategy(true)}
              disabled={approveStrategy.isPending}
            >
              <CheckCircle2 className="h-4 w-4 mr-1" />
              Approve
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Promotion Review Dialog */}
      <Dialog open={promotionDialogOpen} onOpenChange={setPromotionDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Promotion Recommendation</DialogTitle>
            <DialogDescription>
              Review and recommend this trader for promotion. Final approval follows governance rules.
            </DialogDescription>
          </DialogHeader>
          
          {selectedTrader && (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <span className="text-sm text-muted-foreground">Trader:</span>
                  <p className="font-medium">{selectedTrader.profile?.full_name}</p>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">Current:</span>
                  <Badge variant="outline" className="ml-2">{selectedTrader.classification}</Badge>
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-4 text-center py-4 bg-muted/30 rounded-lg">
                <div>
                  <p className="text-2xl font-bold">{selectedTrader.kpiScore?.toFixed(0)}</p>
                  <p className="text-xs text-muted-foreground">KPI Score</p>
                </div>
                <div>
                  <p className="text-2xl font-bold">{selectedTrader.winRate?.toFixed(1)}%</p>
                  <p className="text-xs text-muted-foreground">Win Rate</p>
                </div>
                <div>
                  <p className="text-2xl font-bold">{selectedTrader.consistencyScore?.toFixed(0)}</p>
                  <p className="text-xs text-muted-foreground">Consistency</p>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">New Classification</label>
                <Select value={newClassification} onValueChange={setNewClassification}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="junior">Junior Trader</SelectItem>
                    <SelectItem value="senior">Senior Trader</SelectItem>
                    <SelectItem value="lead">Lead Trader</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="text-sm font-medium">Recommendation Notes</label>
                <Textarea
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  placeholder="Provide justification for this promotion..."
                  className="mt-1"
                />
              </div>
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setPromotionDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => handlePromotionRecommendation(true)}
              disabled={updateClassification.isPending || !newClassification}
            >
              <Award className="h-4 w-4 mr-1" />
              Submit Recommendation
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
