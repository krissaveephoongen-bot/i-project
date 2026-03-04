import { Skeleton } from "@/app/components/ui/skeleton";

export default function ExpensesLoading() {
  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header placeholder */}
      <div className="h-16 border-b border-border bg-card" />

      <div className="container mx-auto px-6 py-8 pt-24 space-y-6">
        {/* Title and actions */}
        <div className="flex justify-between items-center">
          <div className="space-y-2">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-64" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-10 w-32" />
          </div>
        </div>

        {/* Main table card */}
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="p-4 border-b border-border bg-card">
            <div className="grid grid-cols-7 gap-4">
              {Array.from({ length: 7 }).map((_, i) => (
                <Skeleton key={i} className="h-4 w-full" />
              ))}
            </div>
          </div>

          {/* Table rows */}
          <div className="divide-y divide-border">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="p-4 grid grid-cols-7 gap-4 items-center">
                <div className="col-span-1">
                  <Skeleton className="h-4 w-24" />
                </div>
                <div className="col-span-1">
                  <Skeleton className="h-4 w-32" />
                </div>
                <div className="col-span-1">
                  <Skeleton className="h-5 w-20 rounded-full" />
                </div>
                <div className="col-span-1">
                  <Skeleton className="h-4 w-40" />
                </div>
                <div className="col-span-1 text-right">
                  <Skeleton className="h-4 w-20 ml-auto" />
                </div>
                <div className="col-span-1 flex justify-center">
                  <Skeleton className="h-5 w-16 rounded-full" />
                </div>
                <div className="col-span-1 flex justify-end gap-2">
                  <Skeleton className="h-8 w-8 rounded-md" />
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
