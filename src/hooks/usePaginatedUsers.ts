import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { usePagination, PaginationResult } from "./usePagination";
import { PAGINATION } from "@/lib/constants";
import type { Database } from "@/integrations/supabase/types";

type AppRole = Database["public"]["Enums"]["app_role"];

export interface UserWithRole {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  created_at: string;
  role: AppRole | null;
}

interface UsePaginatedUsersOptions {
  searchQuery?: string;
  roleFilter?: AppRole | "all";
}

interface PaginatedUsersResult {
  data: UserWithRole[];
  pagination: PaginationResult;
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}

export function usePaginatedUsers(
  options: UsePaginatedUsersOptions = {}
): PaginatedUsersResult {
  const pagination = usePagination(1, PAGINATION.DEFAULT_PAGE_SIZE);

  // Count query for total items
  const { data: countData } = useQuery({
    queryKey: ["users-count", options.searchQuery],
    queryFn: async () => {
      let query = supabase
        .from("profiles")
        .select("id", { count: "exact", head: true });

      if (options.searchQuery) {
        query = query.ilike("full_name", `%${options.searchQuery}%`);
      }

      const { count, error } = await query;
      if (error) throw error;
      return count || 0;
    },
  });

  // Update total items when count changes
  if (countData !== undefined && countData !== pagination.totalItems) {
    pagination.setTotalItems(countData);
  }

  // Data query with pagination
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: [
      "users-paginated",
      pagination.page,
      pagination.pageSize,
      options.searchQuery,
      options.roleFilter,
    ],
    queryFn: async () => {
      const { from, to } = pagination.getRange();

      // Fetch profiles with pagination
      let profilesQuery = supabase
        .from("profiles")
        .select("id, full_name, avatar_url, created_at")
        .order("created_at", { ascending: false })
        .range(from, to);

      if (options.searchQuery) {
        profilesQuery = profilesQuery.ilike("full_name", `%${options.searchQuery}%`);
      }

      const { data: profiles, error: profilesError } = await profilesQuery;
      if (profilesError) throw profilesError;

      // Fetch all roles
      const { data: roles, error: rolesError } = await supabase
        .from("user_roles")
        .select("user_id, role");

      if (rolesError) throw rolesError;

      // Combine profiles with roles
      const usersWithRoles: UserWithRole[] = (profiles || []).map((profile) => {
        const userRole = roles?.find((r) => r.user_id === profile.id);
        return {
          ...profile,
          role: (userRole?.role as AppRole) || "employee",
        };
      });

      // Filter by role if specified
      if (options.roleFilter && options.roleFilter !== "all") {
        return usersWithRoles.filter((u) => u.role === options.roleFilter);
      }

      return usersWithRoles;
    },
  });

  return {
    data: data || [],
    pagination,
    isLoading,
    error: error as Error | null,
    refetch,
  };
}
