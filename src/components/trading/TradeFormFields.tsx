import { memo } from "react";
import { UseFormReturn } from "react-hook-form";
import {
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
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown } from "lucide-react";

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

interface TradeFormFieldsProps {
  form: UseFormReturn<any>;
  strategies: Array<{ id: string; name: string; version: string }> | undefined;
  maxRisk: number;
  liveTradingEnabled: boolean;
}

export const TradeFormFields = memo(function TradeFormFields({
  form,
  strategies,
  maxRisk,
  liveTradingEnabled,
}: TradeFormFieldsProps) {
  return (
    <>
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
                disabled={!liveTradingEnabled}
              />
            </FormControl>
            <FormLabel className="!mt-0">This is a demo/paper trade</FormLabel>
          </FormItem>
        )}
      />
    </>
  );
});
