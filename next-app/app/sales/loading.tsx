import { Skeleton } from "@/app/components/ui/skeleton";

export default function SalesLoading() {
  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header placeholder */}
      <div className="h-16 border-b border-border bg-card" />

      <div className="container mx-auto px-6 py-8 pt-24 space-y-8">
        {/* Title and actions */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="space-y-2">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-64" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-10 w-32" />
          </div>
        </div>

        {/* Stats cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="rounded-xl border border-border bg-card p-6 space-y-3"
            >
              <div className="flex justify-between items-center">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-4" />
              </div>
              <Skeleton className="h-8 w-24" />
              <Skeleton className="h-3 w-32" />
            </div>
          ))}
        </div>

        {/* Filter bar */}
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-10 w-full" />
              </div>
            ))}
          </div>
        </div>

        {/* Main table card */}
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="p-4 border-b border-border bg-card">
            <div className="grid grid-cols-8 gap-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} className="h-4 w-full" />
              ))}
            </div>
          </div>

          {/* Table rows */}
          <div className="divide-y divide-border">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="p-4 grid grid-cols-8 gap-4 items-center">
                <div className="col-span-1 space-y-1">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-3 w-12" />
                </div>
                <div className="col-span-1 space-y-1">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-16" />
                </div>
                <div className="col-span-1 text-right">
                  <Skeleton className="h-4 w-24 ml-auto" />
                </div>
                <div className="col-span-1 flex justify-center">
                  <Skeleton className="h-5 w-12 rounded-full" />
                </div>
                <div className="col-span-1 flex items-center gap-2">
                  <Skeleton className="h-6 w-6 rounded-full" />
                  <Skeleton className="h-4 w-20" />
                </div>
                <div className="col-span-1">
                  <Skeleton className="h-4 w-24" />
                </div>
                <div className="col-span-1 flex justify-center">
                  <Skeleton className="h-5 w-16 rounded-full" />
                </div>
                <div className="col-span-1 flex justify-end">
                  <Skeleton className="h-8 w-8 rounded-md" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
