import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Calculator, TrendingUp, Calendar, DollarSign } from "lucide-react";

export function InvestmentCalculator() {
  const [principal, setPrincipal] = useState(10000);
  const [monthlyReturn, setMonthlyReturn] = useState(2.5);
  const [durationMonths, setDurationMonths] = useState(12);

  const projections = useMemo(() => {
    const results = [];
    let balance = principal;
    
    for (let month = 1; month <= durationMonths; month++) {
      const monthlyGain = balance * (monthlyReturn / 100);
      balance += monthlyGain;
      
      if (month === 3 || month === 6 || month === 12 || month === durationMonths) {
        results.push({
          month,
          balance: Math.round(balance * 100) / 100,
          totalGain: Math.round((balance - principal) * 100) / 100,
          percentGain: Math.round(((balance - principal) / principal) * 10000) / 100,
        });
      }
    }
    
    return results;
  }, [principal, monthlyReturn, durationMonths]);

  const finalProjection = projections[projections.length - 1];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calculator className="h-5 w-5" />
          Investment Projection Calculator
        </CardTitle>
        <CardDescription>
          Estimate your potential returns based on historical performance
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Inputs */}
        <div className="grid gap-6 md:grid-cols-3">
          <div className="space-y-3">
            <Label htmlFor="principal" className="flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Initial Investment
            </Label>
            <Input
              id="principal"
              type="number"
              value={principal}
              onChange={(e) => setPrincipal(Number(e.target.value))}
              min={100}
              step={100}
            />
          </div>

          <div className="space-y-3">
            <Label className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Monthly Return: {monthlyReturn}%
            </Label>
            <Slider
              value={[monthlyReturn]}
              onValueChange={([v]) => setMonthlyReturn(v)}
              min={0.5}
              max={5}
              step={0.1}
            />
            <p className="text-xs text-muted-foreground">
              Historical average: 2-3% monthly
            </p>
          </div>

          <div className="space-y-3">
            <Label className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Duration: {durationMonths} months
            </Label>
            <Slider
              value={[durationMonths]}
              onValueChange={([v]) => setDurationMonths(v)}
              min={3}
              max={36}
              step={1}
            />
          </div>
        </div>

        {/* Projections */}
        <div className="grid gap-4 md:grid-cols-4">
          {projections.map((p, idx) => (
            <motion.div
              key={p.month}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="p-4 rounded-lg bg-muted/50 text-center"
            >
              <p className="text-sm text-muted-foreground mb-1">
                Month {p.month}
              </p>
              <p className="text-2xl font-bold text-foreground">
                ${p.balance.toLocaleString()}
              </p>
              <p className="text-sm text-green-600">
                +${p.totalGain.toLocaleString()} ({p.percentGain}%)
              </p>
            </motion.div>
          ))}
        </div>

        {/* Summary */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="p-4 rounded-lg bg-primary/5 border border-primary/20"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">
                Projected Value after {durationMonths} months
              </p>
              <p className="text-3xl font-bold text-primary">
                ${finalProjection?.balance.toLocaleString() || 0}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Total Return</p>
              <p className="text-xl font-semibold text-green-600">
                +{finalProjection?.percentGain || 0}%
              </p>
            </div>
          </div>
        </motion.div>

        <p className="text-xs text-muted-foreground text-center">
          ⚠️ This calculator provides estimates only. Past performance does not guarantee future results.
          Actual returns may vary based on market conditions and trading performance.
        </p>
      </CardContent>
    </Card>
  );
}
