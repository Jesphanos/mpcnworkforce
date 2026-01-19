import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import { PAGINATION } from "@/lib/constants";
import { PaginationResult, getPaginationRange } from "@/hooks/usePagination";

interface DataTablePaginationProps {
  pagination: PaginationResult;
  showPageSizeSelector?: boolean;
  showTotalCount?: boolean;
}

export function DataTablePagination({
  pagination,
  showPageSizeSelector = true,
  showTotalCount = true,
}: DataTablePaginationProps) {
  const {
    page,
    pageSize,
    totalItems,
    totalPages,
    startIndex,
    endIndex,
    hasNextPage,
    hasPreviousPage,
    setPage,
    setPageSize,
    nextPage,
    previousPage,
    firstPage,
    lastPage,
  } = pagination;

  const pageNumbers = getPaginationRange(page, totalPages);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-2 py-4">
      {/* Left side - Page size and count */}
      <div className="flex items-center gap-4 text-sm text-muted-foreground">
        {showPageSizeSelector && (
          <div className="flex items-center gap-2">
            <span>Rows per page</span>
            <Select
              value={String(pageSize)}
              onValueChange={(value) => setPageSize(Number(value))}
            >
              <SelectTrigger className="h-8 w-[70px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PAGINATION.PAGE_SIZE_OPTIONS.map((size) => (
                  <SelectItem key={size} value={String(size)}>
                    {size}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {showTotalCount && totalItems > 0 && (
          <span>
            Showing {startIndex + 1}-{endIndex} of {totalItems}
          </span>
        )}
      </div>

      {/* Right side - Pagination controls */}
      <div className="flex items-center gap-1">
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8"
          onClick={firstPage}
          disabled={!hasPreviousPage}
        >
          <ChevronsLeft className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8"
          onClick={previousPage}
          disabled={!hasPreviousPage}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        <div className="flex items-center gap-1 mx-2">
          {pageNumbers.map((pageNum, index) =>
            pageNum === "ellipsis" ? (
              <span key={`ellipsis-${index}`} className="px-2 text-muted-foreground">
                ...
              </span>
            ) : (
              <Button
                key={pageNum}
                variant={page === pageNum ? "default" : "outline"}
                size="icon"
                className="h-8 w-8"
                onClick={() => setPage(pageNum)}
              >
                {pageNum}
              </Button>
            )
          )}
        </div>

        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8"
          onClick={nextPage}
          disabled={!hasNextPage}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8"
          onClick={lastPage}
          disabled={!hasNextPage}
        >
          <ChevronsRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
