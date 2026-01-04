import { useState, useEffect } from "react";
import { Check, ChevronsUpDown, X, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface Employee {
  id: string;
  full_name: string | null;
  email: string;
}

interface CollaboratorsPickerProps {
  value: string[];
  onChange: (value: string[]) => void;
  excludeCurrentUser?: boolean;
}

export function CollaboratorsPicker({ 
  value, 
  onChange, 
  excludeCurrentUser = true 
}: CollaboratorsPickerProps) {
  const [open, setOpen] = useState(false);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchEmployees = async () => {
      setLoading(true);
      
      // Get profiles with user emails
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("id, full_name");

      if (profilesError) {
        console.error("Error fetching profiles:", profilesError);
        setLoading(false);
        return;
      }

      // We need to map profiles - use full_name or ID as display
      const employeeList: Employee[] = (profiles || [])
        .filter(p => !excludeCurrentUser || p.id !== user?.id)
        .map(p => ({
          id: p.id,
          full_name: p.full_name,
          email: "", // We don't have direct access to email in profiles
        }));

      setEmployees(employeeList);
      setLoading(false);
    };

    fetchEmployees();
  }, [user?.id, excludeCurrentUser]);

  const toggleEmployee = (employeeId: string) => {
    if (value.includes(employeeId)) {
      onChange(value.filter(id => id !== employeeId));
    } else {
      onChange([...value, employeeId]);
    }
  };

  const removeEmployee = (employeeId: string) => {
    onChange(value.filter(id => id !== employeeId));
  };

  const getEmployeeName = (id: string) => {
    const emp = employees.find(e => e.id === id);
    return emp?.full_name || id.slice(0, 8);
  };

  return (
    <div className="space-y-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between"
            disabled={loading}
          >
            <span className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              {value.length === 0
                ? "Select collaborators..."
                : `${value.length} collaborator${value.length > 1 ? "s" : ""} selected`}
            </span>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0" align="start">
          <Command>
            <CommandInput placeholder="Search employees..." />
            <CommandList>
              <CommandEmpty>No employees found.</CommandEmpty>
              <CommandGroup>
                {employees.map((employee) => (
                  <CommandItem
                    key={employee.id}
                    value={employee.full_name || employee.id}
                    onSelect={() => toggleEmployee(employee.id)}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        value.includes(employee.id) ? "opacity-100" : "opacity-0"
                      )}
                    />
                    <span>{employee.full_name || `User ${employee.id.slice(0, 8)}`}</span>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {/* Selected collaborators badges */}
      {value.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {value.map((id) => (
            <Badge key={id} variant="secondary" className="gap-1">
              {getEmployeeName(id)}
              <button
                type="button"
                onClick={() => removeEmployee(id)}
                className="ml-1 ring-offset-background rounded-full outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              >
                <X className="h-3 w-3" />
                <span className="sr-only">Remove</span>
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}
