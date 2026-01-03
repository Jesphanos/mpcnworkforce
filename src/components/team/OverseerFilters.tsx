import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Filter, X } from "lucide-react";
import { useAvailablePlatforms, OverseerFilters as FilterType } from "@/hooks/useOverseerData";

const roleLabels: Record<string, string> = {
  employee: "Employee",
  team_lead: "Team Lead",
  report_admin: "Report Admin",
  finance_hr_admin: "Finance/HR Admin",
  investment_admin: "Investment Admin",
  user_admin: "User Admin",
  general_overseer: "General Overseer",
};

const statusOptions = [
  { value: "pending", label: "Pending" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
];

interface OverseerFiltersProps {
  filters: FilterType;
  onFiltersChange: (filters: FilterType) => void;
}

export function OverseerFilters({ filters, onFiltersChange }: OverseerFiltersProps) {
  const { data: platforms } = useAvailablePlatforms();
  
  const handleClearFilters = () => {
    onFiltersChange({});
  };

  const hasActiveFilters = Object.values(filters).some((v) => v !== undefined && v !== "");

  return (
    <Card>
      <CardContent className="pt-4">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">Filters</span>
          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={handleClearFilters} className="ml-auto h-7 text-xs">
              <X className="h-3 w-3 mr-1" />
              Clear
            </Button>
          )}
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <div className="space-y-2">
            <Label className="text-xs">Role / Team</Label>
            <Select
              value={filters.role || "all"}
              onValueChange={(value) =>
                onFiltersChange({ ...filters, role: value === "all" ? undefined : value })
              }
            >
              <SelectTrigger className="h-9">
                <SelectValue placeholder="All roles" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                {Object.entries(roleLabels).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-xs">Platform</Label>
            <Select
              value={filters.platform || "all"}
              onValueChange={(value) =>
                onFiltersChange({ ...filters, platform: value === "all" ? undefined : value })
              }
            >
              <SelectTrigger className="h-9">
                <SelectValue placeholder="All platforms" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Platforms</SelectItem>
                {platforms?.map((platform) => (
                  <SelectItem key={platform} value={platform}>
                    {platform}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-xs">Status</Label>
            <Select
              value={filters.status || "all"}
              onValueChange={(value) =>
                onFiltersChange({ ...filters, status: value === "all" ? undefined : value })
              }
            >
              <SelectTrigger className="h-9">
                <SelectValue placeholder="All statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                {statusOptions.map((status) => (
                  <SelectItem key={status.value} value={status.value}>
                    {status.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-xs">From Date</Label>
            <Input
              type="date"
              className="h-9"
              value={filters.dateFrom || ""}
              onChange={(e) =>
                onFiltersChange({ ...filters, dateFrom: e.target.value || undefined })
              }
            />
          </div>

          <div className="space-y-2">
            <Label className="text-xs">To Date</Label>
            <Input
              type="date"
              className="h-9"
              value={filters.dateTo || ""}
              onChange={(e) =>
                onFiltersChange({ ...filters, dateTo: e.target.value || undefined })
              }
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
