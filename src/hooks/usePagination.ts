import { useState, useMemo, useCallback } from "react";
import { PAGINATION } from "@/lib/constants";

export interface PaginationState {
  page: number;
  pageSize: number;
  totalItems: number;
}

export interface PaginationResult {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  startIndex: number;
  endIndex: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  setPage: (page: number) => void;
  setPageSize: (size: number) => void;
  setTotalItems: (total: number) => void;
  nextPage: () => void;
  previousPage: () => void;
  firstPage: () => void;
  lastPage: () => void;
  getRange: () => { from: number; to: number };
}

export function usePagination(
  initialPage: number = 1,
  initialPageSize: number = PAGINATION.DEFAULT_PAGE_SIZE
): PaginationResult {
  const [page, setPage] = useState(initialPage);
  const [pageSize, setPageSizeState] = useState(initialPageSize);
  const [totalItems, setTotalItems] = useState(0);

  const totalPages = useMemo(() => 
    Math.ceil(totalItems / pageSize) || 1,
    [totalItems, pageSize]
  );

  const startIndex = useMemo(() => 
    (page - 1) * pageSize,
    [page, pageSize]
  );

  const endIndex = useMemo(() => 
    Math.min(startIndex + pageSize, totalItems),
    [startIndex, pageSize, totalItems]
  );

  const hasNextPage = page < totalPages;
  const hasPreviousPage = page > 1;

  const setPageSafe = useCallback((newPage: number) => {
    setPage(Math.max(1, Math.min(newPage, totalPages)));
  }, [totalPages]);

  const setPageSize = useCallback((size: number) => {
    setPageSizeState(size);
    setPage(1); // Reset to first page when changing page size
  }, []);

  const nextPage = useCallback(() => {
    if (hasNextPage) setPage(p => p + 1);
  }, [hasNextPage]);

  const previousPage = useCallback(() => {
    if (hasPreviousPage) setPage(p => p - 1);
  }, [hasPreviousPage]);

  const firstPage = useCallback(() => setPage(1), []);
  
  const lastPage = useCallback(() => setPage(totalPages), [totalPages]);

  // Get range for Supabase queries
  const getRange = useCallback(() => ({
    from: startIndex,
    to: startIndex + pageSize - 1,
  }), [startIndex, pageSize]);

  return {
    page,
    pageSize,
    totalItems,
    totalPages,
    startIndex,
    endIndex,
    hasNextPage,
    hasPreviousPage,
    setPage: setPageSafe,
    setPageSize,
    setTotalItems,
    nextPage,
    previousPage,
    firstPage,
    lastPage,
    getRange,
  };
}

// Pagination UI component helper
export function getPaginationRange(
  currentPage: number,
  totalPages: number,
  maxVisible = 5
): (number | "ellipsis")[] {
  if (totalPages <= maxVisible) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const result: (number | "ellipsis")[] = [];
  const half = Math.floor(maxVisible / 2);

  let start = Math.max(1, currentPage - half);
  let end = Math.min(totalPages, currentPage + half);

  if (currentPage <= half) {
    end = maxVisible - 1;
  }
  if (currentPage >= totalPages - half) {
    start = totalPages - maxVisible + 2;
  }

  if (start > 1) {
    result.push(1);
    if (start > 2) result.push("ellipsis");
  }

  for (let i = start; i <= end; i++) {
    result.push(i);
  }

  if (end < totalPages) {
    if (end < totalPages - 1) result.push("ellipsis");
    result.push(totalPages);
  }

  return result;
}
