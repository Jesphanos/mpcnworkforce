import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Loader2,
  Check,
  X,
} from "lucide-react";
import {
  useTraderProfile,
  useTraderRiskLimits,
  useTradingStrategies,
  useCreateTrade,
  type MarketType,
} from "@/hooks/useTrading";

const EMOTIONAL_STATES = [
  { value: "calm", label: "Calm & Focused" },
  { value: "confident", label: "Confident" },
  { value: "anxious", label: "Anxious" },
  { value: "frustrated", label: "Frustrated" },
  { value: "euphoric", label: "Euphoric (After Win)" },
  { value: "revenge", label: "Revenge Trading Urge" },
  { value: "fomo", label: "FOMO" },
  { value: "neutral", label: "Neutral" },
];

const formSchema = z.object({
  strategy_id: z.string().min(1, "Strategy is required"),
  instrument: z.string().min(1, "Instrument is required"),
  market: z.enum(["forex", "crypto", "stocks", "commodities", "indices", "options"]),
  direction: z.enum(["long", "short"]),
  entry_price: z.coerce.number().positive("Must be positive"),
  position_size: z.coerce.number().positive("Must be positive"),
  risk_percentage: z.coerce.number().min(0.1).max(10),
  stop_loss: z.coerce.number().positive("Stop-loss is mandatory"),
  take_profit: z.coerce.number().optional(),
  trade_rationale: z.string().min(10, "Rationale must be at least 10 characters"),
  emotional_state: z.string().min(1, "Required"),
  is_demo: z.boolean().default(false),
});

type FormValues = z.infer<typeof formSchema>;

export function TradeExecutionForm() {
  const { data: profile } = useTraderProfile();
  const { data: riskLimits } = useTraderRiskLimits(profile?.id);
  const { data: strategies } = useTradingStrategies(profile?.classification);
  const createTrade = useCreateTrade();
  
  const [checklistComplete, setChecklistComplete] = useState({
    strategy: false,
    risk: false,
    stopLoss: false,
  });

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      market: "forex",
      direction: "long",
      risk_percentage: riskLimits?.max_risk_per_trade || 1,
      is_demo: !profile?.live_trading_enabled,
    },
  });

  const allChecklistComplete = Object.values(checklistComplete).every(Boolean);
  const maxRisk = riskLimits?.max_risk_per_trade || 1;

  const onSubmit = async (values: FormValues) => {
    if (!profile) return;
    
    // Validate risk doesn't exceed limit
    if (values.risk_percentage > maxRisk) {
      form.setError("risk_percentage", {
        message: `Risk exceeds maximum allowed (${maxRisk}%)`,
      });
      return;
    }

    await createTrade.mutateAsync({
      trader_id: profile.id,
      strategy_id: values.strategy_id,
      instrument: values.instrument,
      market: values.market as MarketType,
      direction: values.direction,
      entry_price: values.entry_price,
      position_size: values.position_size,
      risk_percentage: values.risk_percentage,
      stop_loss: values.stop_loss,
      take_profit: values.take_profit,
      trade_rationale: values.trade_rationale,
      emotional_state: values.emotional_state,
      is_demo: values.is_demo,
    });

    form.reset();
    setChecklistComplete({ strategy: false, risk: false, stopLoss: false });
  };

  if (!profile?.live_trading_enabled && !profile?.demo_phase_completed) {
    return (
      <Card className="border-warning">
        <CardContent className="py-8 text-center">
          <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-warning" />
          <p className="text-lg font-medium">Trading Locked</p>
          <p className="text-muted-foreground">
            Complete your demo phase to access trade execution.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Log New Trade
        </CardTitle>
        <CardDescription>
          All fields are required. Trades without stop-loss are blocked.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Pre-Trade Checklist */}
        <div className="mb-6 p-4 rounded-lg bg-muted/50 border">
          <h4 className="font-medium mb-3">Pre-Trade Checklist</h4>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Checkbox
                id="check-strategy"
                checked={checklistComplete.strategy}
                onCheckedChange={(checked) =>
                  setChecklistComplete((prev) => ({ ...prev, strategy: !!checked }))
                }
              />
              <Label htmlFor="check-strategy" className="text-sm">
                I have selected an approved strategy
              </Label>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                id="check-risk"
                checked={checklistComplete.risk}
                onCheckedChange={(checked) =>
                  setChecklistComplete((prev) => ({ ...prev, risk: !!checked }))
                }
              />
              <Label htmlFor="check-risk" className="text-sm">
                My risk is within the {maxRisk}% limit
              </Label>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                id="check-stoploss"
                checked={checklistComplete.stopLoss}
                onCheckedChange={(checked) =>
                  setChecklistComplete((prev) => ({ ...prev, stopLoss: !!checked }))
                }
              />
              <Label htmlFor="check-stoploss" className="text-sm">
                I have set a stop-loss
              </Label>
            </div>
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              {/* Strategy */}
              <FormField
                control={form.control}
                name="strategy_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Strategy *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select strategy" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {strategies?.map((s) => (
                          <SelectItem key={s.id} value={s.id}>
                            {s.name} (v{s.version})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Market */}
              <FormField
                control={form.control}
                name="market"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Market *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="forex">Forex</SelectItem>
                        <SelectItem value="crypto">Crypto</SelectItem>
                        <SelectItem value="stocks">Stocks</SelectItem>
                        <SelectItem value="commodities">Commodities</SelectItem>
                        <SelectItem value="indices">Indices</SelectItem>
                        <SelectItem value="options">Options</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Instrument */}
              <FormField
                control={form.control}
                name="instrument"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Instrument *</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., EUR/USD, BTC/USDT" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Direction */}
              <FormField
                control={form.control}
                name="direction"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Direction *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="long">
                          <div className="flex items-center gap-2">
                            <TrendingUp className="h-4 w-4 text-success" />
                            Long
                          </div>
                        </SelectItem>
                        <SelectItem value="short">
                          <div className="flex items-center gap-2">
                            <TrendingDown className="h-4 w-4 text-destructive" />
                            Short
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Entry Price */}
              <FormField
                control={form.control}
                name="entry_price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Entry Price *</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.00000001" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Position Size */}
              <FormField
                control={form.control}
                name="position_size"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Position Size *</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Risk % */}
              <FormField
                control={form.control}
                name="risk_percentage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Risk % *</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.1" max={maxRisk} {...field} />
                    </FormControl>
                    <FormDescription>Max: {maxRisk}%</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Stop Loss */}
              <FormField
                control={form.control}
                name="stop_loss"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Stop Loss * <Badge variant="destructive" className="ml-1">Mandatory</Badge>
                    </FormLabel>
                    <FormControl>
                      <Input type="number" step="0.00000001" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Take Profit */}
              <FormField
                control={form.control}
                name="take_profit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Take Profit</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.00000001" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Emotional State */}
              <FormField
                control={form.control}
                name="emotional_state"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Emotional State *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="How do you feel?" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {EMOTIONAL_STATES.map((state) => (
                          <SelectItem key={state.value} value={state.value}>
                            {state.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Trade Rationale */}
            <FormField
              control={form.control}
              name="trade_rationale"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Trade Rationale *</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Why are you taking this trade? What is your analysis?"
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Document your analysis and reasoning for this trade.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Demo checkbox */}
            <FormField
              control={form.control}
              name="is_demo"
              render={({ field }) => (
                <FormItem className="flex items-center gap-2">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      disabled={!profile?.live_trading_enabled}
                    />
                  </FormControl>
                  <FormLabel className="!mt-0">This is a demo/paper trade</FormLabel>
                </FormItem>
              )}
            />

            <Separator />

            <div className="flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={() => form.reset()}>
                Clear
              </Button>
              <Button
                type="submit"
                disabled={!allChecklistComplete || createTrade.isPending}
              >
                {createTrade.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Log Trade
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
