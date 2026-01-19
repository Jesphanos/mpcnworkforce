import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, Clock, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { formatDistanceToNow } from "date-fns";

interface SlaBreachAlertProps {
  breaches: Array<{
    id: string;
    title: string;
    sla_due_at: string;
    priority: string;
  }>;
  onDismiss?: () => void;
  onViewAll?: () => void;
}

export function SlaBreachAlert({ breaches, onDismiss, onViewAll }: SlaBreachAlertProps) {
  const [isVisible, setIsVisible] = useState(true);

  if (!breaches.length || !isVisible) return null;

  const criticalBreaches = breaches.filter(b => b.priority === "urgent" || b.priority === "high");
  const isCritical = criticalBreaches.length > 0;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -20, height: 0 }}
          animate={{ opacity: 1, y: 0, height: "auto" }}
          exit={{ opacity: 0, y: -20, height: 0 }}
          className={`rounded-lg border p-4 mb-6 ${
            isCritical 
              ? "bg-destructive/10 border-destructive/30" 
              : "bg-warning/10 border-warning/30"
          }`}
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className={`h-10 w-10 rounded-full flex items-center justify-center ${
                  isCritical ? "bg-destructive/20" : "bg-warning/20"
                }`}
              >
                <AlertTriangle className={`h-5 w-5 ${
                  isCritical ? "text-destructive" : "text-warning"
                }`} />
              </motion.div>
              <div>
                <h3 className={`font-semibold ${
                  isCritical ? "text-destructive" : "text-warning"
                }`}>
                  {breaches.length} SLA {breaches.length === 1 ? "Breach" : "Breaches"} Detected
                </h3>
                <ul className="mt-2 space-y-1">
                  {breaches.slice(0, 3).map((breach) => (
                    <motion.li
                      key={breach.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex items-center gap-2 text-sm text-muted-foreground"
                    >
                      <Clock className="h-3 w-3" />
                      <span className="font-medium">{breach.title}</span>
                      <span className="text-xs">
                        (overdue {formatDistanceToNow(new Date(breach.sla_due_at))})
                      </span>
                    </motion.li>
                  ))}
                  {breaches.length > 3 && (
                    <li className="text-sm text-muted-foreground">
                      and {breaches.length - 3} more...
                    </li>
                  )}
                </ul>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {onViewAll && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={onViewAll}
                >
                  View All
                </Button>
              )}
              {onDismiss && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => {
                    setIsVisible(false);
                    onDismiss();
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
