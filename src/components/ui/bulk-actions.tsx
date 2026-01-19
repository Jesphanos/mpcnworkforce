import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, X } from "lucide-react";
import { cn } from "@/lib/utils";

export interface BulkAction<T> {
  label: string;
  icon?: React.ReactNode;
  action: (items: T[]) => void | Promise<void>;
  variant?: "default" | "destructive";
  requiresConfirmation?: boolean;
}

interface BulkActionsProps<T> {
  items: T[];
  selectedItems: T[];
  onSelectionChange: (items: T[]) => void;
  getItemId: (item: T) => string;
  actions: BulkAction<T>[];
  className?: string;
}

export function useBulkSelection<T>(getItemId: (item: T) => string) {
  const [selectedItems, setSelectedItems] = useState<T[]>([]);

  const isSelected = (item: T) => 
    selectedItems.some(selected => getItemId(selected) === getItemId(item));

  const toggleItem = (item: T) => {
    if (isSelected(item)) {
      setSelectedItems(selectedItems.filter(s => getItemId(s) !== getItemId(item)));
    } else {
      setSelectedItems([...selectedItems, item]);
    }
  };

  const selectAll = (items: T[]) => {
    setSelectedItems(items);
  };

  const clearSelection = () => {
    setSelectedItems([]);
  };

  const toggleAll = (items: T[]) => {
    if (selectedItems.length === items.length) {
      clearSelection();
    } else {
      selectAll(items);
    }
  };

  return {
    selectedItems,
    isSelected,
    toggleItem,
    selectAll,
    clearSelection,
    toggleAll,
    setSelectedItems,
  };
}

export function BulkActionsBar<T>({
  items,
  selectedItems,
  onSelectionChange,
  getItemId,
  actions,
  className,
}: BulkActionsProps<T>) {
  const [isLoading, setIsLoading] = useState<string | null>(null);

  if (selectedItems.length === 0) return null;

  const handleAction = async (action: BulkAction<T>) => {
    setIsLoading(action.label);
    try {
      await action.action(selectedItems);
      onSelectionChange([]);
    } finally {
      setIsLoading(null);
    }
  };

  return (
    <div
      className={cn(
        "flex items-center gap-3 p-3 bg-primary/5 border border-primary/20 rounded-lg animate-in slide-in-from-top-2",
        className
      )}
    >
      <Badge variant="secondary" className="gap-1">
        {selectedItems.length} selected
      </Badge>

      <div className="flex items-center gap-2">
        {actions.slice(0, 2).map((action) => (
          <Button
            key={action.label}
            size="sm"
            variant={action.variant === "destructive" ? "destructive" : "default"}
            onClick={() => handleAction(action)}
            disabled={isLoading !== null}
          >
            {action.icon}
            {action.label}
          </Button>
        ))}

        {actions.length > 2 && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="sm" variant="outline">
                More
                <ChevronDown className="ml-1 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {actions.slice(2).map((action, index) => (
                <DropdownMenuItem
                  key={action.label}
                  onClick={() => handleAction(action)}
                  className={action.variant === "destructive" ? "text-destructive" : ""}
                >
                  {action.icon}
                  <span className="ml-2">{action.label}</span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      <div className="flex-1" />

      <Button
        size="sm"
        variant="ghost"
        onClick={() => onSelectionChange([])}
        className="text-muted-foreground"
      >
        <X className="h-4 w-4 mr-1" />
        Clear
      </Button>
    </div>
  );
}

// Checkbox for table rows
interface BulkCheckboxProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  indeterminate?: boolean;
}

export function BulkCheckbox({ checked, onCheckedChange, indeterminate }: BulkCheckboxProps) {
  return (
    <Checkbox
      checked={indeterminate ? "indeterminate" : checked}
      onCheckedChange={onCheckedChange}
      className="data-[state=checked]:bg-primary"
    />
  );
}
