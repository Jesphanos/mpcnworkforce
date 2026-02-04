import { useState, useCallback, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useCapabilities } from "@/hooks/useCapabilities";

interface SearchResult {
  id: string;
  type: "user" | "task" | "report" | "investment";
  title: string;
  subtitle?: string;
  path: string;
  icon?: string;
  relevance: number;
}

interface UseGlobalSearchOptions {
  debounceMs?: number;
  maxResults?: number;
}

export function useGlobalSearch(options: UseGlobalSearchOptions = {}) {
  const { maxResults = 10 } = options;
  const [query, setQuery] = useState("");
  const { user } = useAuth();
  const { can, isAdmin, isOverseer } = useCapabilities();

  const searchQuery = useQuery({
    queryKey: ["global-search", query],
    queryFn: async () => {
      if (!query || query.length < 2) return [];
      
      const results: SearchResult[] = [];
      const searchTerm = `%${query.toLowerCase()}%`;

      // Search users (if admin/overseer)
      if (can("canManageUsers") || isOverseer()) {
        const { data: users } = await supabase
          .from("profiles")
          .select("id, full_name, avatar_url")
          .ilike("full_name", searchTerm)
          .limit(5);
        
        users?.forEach(u => {
          results.push({
            id: u.id,
            type: "user",
            title: u.full_name || "Unknown User",
            subtitle: "User Profile",
            path: `/worker/${u.id}`,
            relevance: calculateRelevance(u.full_name || "", query),
          });
        });
      }

      // Search tasks
      const { data: tasks } = await supabase
        .from("tasks")
        .select("id, title, platform, work_date")
        .ilike("title", searchTerm)
        .limit(5);
      
      tasks?.forEach(t => {
        results.push({
          id: t.id,
          type: "task",
          title: t.title,
          subtitle: `${t.platform} • ${t.work_date}`,
          path: `/tasks?highlight=${t.id}`,
          relevance: calculateRelevance(t.title, query),
        });
      });

      // Search reports
      const { data: reports } = await supabase
        .from("work_reports")
        .select("id, platform, work_date, description")
        .or(`platform.ilike.${searchTerm},description.ilike.${searchTerm}`)
        .limit(5);
      
      reports?.forEach(r => {
        results.push({
          id: r.id,
          type: "report",
          title: `${r.platform} Report`,
          subtitle: r.work_date,
          path: `/reports?highlight=${r.id}`,
          relevance: calculateRelevance(r.platform + (r.description || ""), query),
        });
      });

      // Search investments (if has access)
      if (can("canManageInvestments") || isOverseer()) {
        const { data: investments } = await supabase
          .from("investments")
          .select("id, name, platform")
          .ilike("name", searchTerm)
          .limit(5);
        
        investments?.forEach(i => {
          results.push({
            id: i.id,
            type: "investment",
            title: i.name,
            subtitle: i.platform,
            path: `/investments?highlight=${i.id}`,
            relevance: calculateRelevance(i.name, query),
          });
        });
      }

      // Sort by relevance and limit results
      return results
        .sort((a, b) => b.relevance - a.relevance)
        .slice(0, maxResults);
    },
    enabled: !!user && query.length >= 2,
    staleTime: 30000, // Cache for 30 seconds
  });

  const search = useCallback((term: string) => {
    setQuery(term);
  }, []);

  const clearSearch = useCallback(() => {
    setQuery("");
  }, []);

  return {
    query,
    search,
    clearSearch,
    results: searchQuery.data || [],
    isSearching: searchQuery.isLoading,
    hasResults: (searchQuery.data?.length || 0) > 0,
  };
}

// Simple relevance scoring
function calculateRelevance(text: string, query: string): number {
  const lowerText = text.toLowerCase();
  const lowerQuery = query.toLowerCase();
  
  if (lowerText === lowerQuery) return 100;
  if (lowerText.startsWith(lowerQuery)) return 80;
  if (lowerText.includes(lowerQuery)) return 60;
  
  // Check for partial word matches
  const words = lowerText.split(/\s+/);
  for (const word of words) {
    if (word.startsWith(lowerQuery)) return 40;
  }
  
  return 20;
}

// Hook for managing recent searches
export function useRecentSearches() {
  const { user } = useAuth();
  
  const { data: recentSearches = [] } = useQuery({
    queryKey: ["recent-searches", user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data } = await supabase
        .from("user_preferences")
        .select("recent_searches")
        .eq("user_id", user.id)
        .single();
      
      return data?.recent_searches || [];
    },
    enabled: !!user,
  });

  const addRecentSearch = useCallback(async (term: string) => {
    if (!user || !term.trim()) return;
    
    const updated = [term, ...recentSearches.filter(s => s !== term)].slice(0, 5);
    
    await supabase
      .from("user_preferences")
      .upsert({
        user_id: user.id,
        recent_searches: updated,
      }, {
        onConflict: "user_id",
      });
  }, [user, recentSearches]);

  const clearRecentSearches = useCallback(async () => {
    if (!user) return;
    
    await supabase
      .from("user_preferences")
      .upsert({
        user_id: user.id,
        recent_searches: [],
      }, {
        onConflict: "user_id",
      });
  }, [user]);

  return {
    recentSearches,
    addRecentSearch,
    clearRecentSearches,
  };
}
