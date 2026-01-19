import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Search, Filter, X, CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { DateRange } from "react-day-picker";

export interface FilterConfig {
  key: string;
  label: string;
  type: "text" | "select" | "date" | "dateRange";
  options?: { value: string; label: string }[];
  placeholder?: string;
}

export interface FilterValue {
  [key: string]: string | DateRange | undefined;
}

interface AdvancedFilterProps {
  filters: FilterConfig[];
  values: FilterValue;
  onChange: (values: FilterValue) => void;
  searchPlaceholder?: string;
  className?: string;
}

export function AdvancedFilter({
  filters,
  values,
  onChange,
  searchPlaceholder = "Search...",
  className,
}: AdvancedFilterProps) {
  const [isOpen, setIsOpen] = useState(false);

  const activeFilters = Object.entries(values).filter(
    ([key, value]) => value !== undefined && value !== "" && key !== "search"
  );

  const handleChange = (key: string, value: string | DateRange | undefined) => {
    onChange({ ...values, [key]: value });
  };

  const clearFilter = (key: string) => {
    const newValues = { ...values };
    delete newValues[key];
    onChange(newValues);
  };

  const clearAllFilters = () => {
    onChange({ search: values.search });
  };

  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex flex-col sm:flex-row gap-2">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={searchPlaceholder}
            value={(values.search as string) || ""}
            onChange={(e) => handleChange("search", e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Filter Button */}
        <Popover open={isOpen} onOpenChange={setIsOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" className="gap-2">
              <Filter className="h-4 w-4" />
              Filters
              {activeFilters.length > 0 && (
                <Badge variant="secondary" className="h-5 px-1.5">
                  {activeFilters.length}
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80" align="end">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">Filters</h4>
                {activeFilters.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearAllFilters}
                    className="text-muted-foreground"
                  >
                    Clear all
                  </Button>
                )}
              </div>

              {filters.map((filter) => (
                <div key={filter.key} className="space-y-2">
                  <label className="text-sm font-medium">{filter.label}</label>
                  <FilterInput
                    filter={filter}
                    value={values[filter.key]}
                    onChange={(value) => handleChange(filter.key, value)}
                  />
                </div>
              ))}
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {/* Active Filter Chips */}
      {activeFilters.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {activeFilters.map(([key, value]) => {
            const filter = filters.find((f) => f.key === key);
            if (!filter) return null;

            let displayValue = "";
            if (filter.type === "select" && filter.options) {
              displayValue =
                filter.options.find((o) => o.value === value)?.label ||
                String(value);
            } else if (filter.type === "dateRange" && value && typeof value === "object") {
              const range = value as DateRange;
              displayValue = `${range.from ? format(range.from, "MMM d") : "?"} - ${
                range.to ? format(range.to, "MMM d") : "?"
              }`;
            } else {
              displayValue = String(value);
            }

            return (
              <Badge
                key={key}
                variant="secondary"
                className="gap-1 pr-1 cursor-pointer hover:bg-secondary/80"
              >
                <span className="text-muted-foreground">{filter.label}:</span>
                {displayValue}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-4 w-4 ml-1 hover:bg-transparent"
                  onClick={() => clearFilter(key)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            );
          })}
        </div>
      )}
    </div>
  );
}

function FilterInput({
  filter,
  value,
  onChange,
}: {
  filter: FilterConfig;
  value: string | DateRange | undefined;
  onChange: (value: string | DateRange | undefined) => void;
}) {
  if (filter.type === "select" && filter.options) {
    return (
      <Select
        value={(value as string) || ""}
        onValueChange={(v) => onChange(v || undefined)}
      >
        <SelectTrigger>
          <SelectValue placeholder={filter.placeholder || "Select..."} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="">All</SelectItem>
          {filter.options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    );
  }

  if (filter.type === "dateRange") {
    return (
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" className="w-full justify-start text-left font-normal">
            <CalendarIcon className="mr-2 h-4 w-4" />
            {value && typeof value === "object" && (value as DateRange).from ? (
              <>
                {format((value as DateRange).from!, "LLL dd, y")} -{" "}
                {(value as DateRange).to
                  ? format((value as DateRange).to!, "LLL dd, y")
                  : "..."}
              </>
            ) : (
              <span className="text-muted-foreground">Pick a date range</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="range"
            selected={value as DateRange}
            onSelect={(range) => onChange(range)}
            numberOfMonths={2}
          />
        </PopoverContent>
      </Popover>
    );
  }

  return (
    <Input
      type={filter.type === "text" ? "text" : "text"}
      value={(value as string) || ""}
      onChange={(e) => onChange(e.target.value || undefined)}
      placeholder={filter.placeholder}
    />
  );
}
