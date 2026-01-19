import { Skeleton } from "@/components/ui/skeleton";
import { DISPLAY } from "@/lib/constants";

interface PageSkeletonProps {
  type?: "dashboard" | "table" | "form" | "profile" | "cards";
}

export function PageSkeleton({ type = "dashboard" }: PageSkeletonProps) {
  return (
    <div className="space-y-6 animate-in fade-in-50 duration-500">
      {/* Header */}
      <div className="space-y-2">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-64" />
      </div>

      {type === "dashboard" && <DashboardSkeleton />}
      {type === "table" && <TableSkeleton />}
      {type === "form" && <FormSkeleton />}
      {type === "profile" && <ProfileSkeleton />}
      {type === "cards" && <CardsSkeleton />}
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <>
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="p-6 rounded-lg border bg-card">
            <div className="flex items-center justify-between mb-4">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-8 w-8 rounded-lg" />
            </div>
            <Skeleton className="h-8 w-16" />
            <Skeleton className="h-3 w-20 mt-2" />
          </div>
        ))}
      </div>

      {/* Chart */}
      <div className="p-6 rounded-lg border bg-card">
        <Skeleton className="h-5 w-32 mb-4" />
        <Skeleton className="h-64 w-full" />
      </div>
    </>
  );
}

function TableSkeleton() {
  return (
    <div className="rounded-lg border bg-card">
      {/* Table Header */}
      <div className="p-4 border-b">
        <div className="flex items-center justify-between">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-10 w-24" />
        </div>
      </div>

      {/* Table Rows */}
      <div className="divide-y">
        {Array.from({ length: DISPLAY.SKELETON_COUNT.TABLE_ROWS }).map((_, i) => (
          <div key={i} className="p-4 flex items-center gap-4">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-48" />
              <Skeleton className="h-3 w-32" />
            </div>
            <Skeleton className="h-6 w-20 rounded-full" />
            <Skeleton className="h-8 w-8" />
          </div>
        ))}
      </div>

      {/* Pagination */}
      <div className="p-4 border-t flex items-center justify-between">
        <Skeleton className="h-4 w-32" />
        <div className="flex gap-2">
          <Skeleton className="h-8 w-8" />
          <Skeleton className="h-8 w-8" />
          <Skeleton className="h-8 w-8" />
        </div>
      </div>
    </div>
  );
}

function FormSkeleton() {
  return (
    <div className="max-w-2xl space-y-6">
      <div className="p-6 rounded-lg border bg-card space-y-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-10 w-full" />
          </div>
        ))}
        <div className="flex justify-end gap-2 pt-4">
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-10 w-24" />
        </div>
      </div>
    </div>
  );
}

function ProfileSkeleton() {
  return (
    <>
      {/* Profile Card */}
      <div className="p-6 rounded-lg border bg-card">
        <div className="flex items-center gap-6">
          <Skeleton className="h-24 w-24 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-6 w-20 rounded-full" />
          </div>
          <Skeleton className="h-10 w-28" />
        </div>
      </div>

      {/* Info Cards */}
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="p-6 rounded-lg border bg-card space-y-4">
          <Skeleton className="h-5 w-40" />
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-5 w-32" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-5 w-32" />
            </div>
          </div>
        </div>
      ))}
    </>
  );
}

function CardsSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="p-6 rounded-lg border bg-card space-y-4">
          <div className="flex items-center justify-between">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-6 w-16 rounded-full" />
          </div>
          <Skeleton className="h-16 w-full" />
          <div className="flex items-center justify-between">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-8 w-8" />
          </div>
        </div>
      ))}
    </div>
  );
}

// Section-level skeleton for lazy loading
export function SectionSkeleton({ rows = 3 }: { rows?: number }) {
  return (
    <div className="space-y-3 animate-pulse">
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton key={i} className="h-12 w-full" />
      ))}
    </div>
  );
}
