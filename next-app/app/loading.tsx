import { Skeleton } from "@/app/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950/50">
      {/* Header */}
      <div className="w-full bg-background border-b h-16 flex items-center px-4 md:px-6">
        <div className="space-y-2">
           {/* Simulate breadcrumbs */}
           <Skeleton className="h-4 w-24" />
        </div>
      </div>

      <div className="pt-8 px-4 md:px-6 pb-6 container mx-auto max-w-7xl space-y-6">
        {/* Top Actions */}
        <div className="flex justify-between items-center">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-10 w-32" />
        </div>

        {/* Main KPI Section (4 cards) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={`kpi-${i}`}
              className="rounded-xl border border-border bg-card p-6 space-y-3 shadow-sm"
            >
              <div className="flex justify-between items-start">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-4 rounded-full" />
              </div>
              <Skeleton className="h-8 w-32" />
            </div>
          ))}
        </div>

        {/* Vendor Section Header */}
        <Skeleton className="h-7 w-64" />

        {/* Vendor Section (4 cards) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={`vendor-${i}`}
              className="rounded-xl border border-border bg-card p-6 space-y-3 shadow-sm"
            >
              <div className="flex justify-between items-start">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-4 rounded-full" />
              </div>
              <Skeleton className="h-8 w-32" />
            </div>
          ))}
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column (2/3) */}
          <div className="lg:col-span-2 space-y-6">
            {/* Portfolio Matrix */}
            <Skeleton className="h-[400px] w-full rounded-xl" />
            {/* Financial Chart */}
            <div className="bg-card rounded-xl shadow-sm border p-6 space-y-4">
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-[300px] w-full" />
            </div>
          </div>

          {/* Right Column (1/3) */}
          <div className="space-y-6">
            {/* Recent Activities */}
            <div className="bg-card rounded-xl shadow-sm border p-6 space-y-4">
                <Skeleton className="h-6 w-40" />
                <div className="space-y-4">
                    {Array.from({ length: 5 }).map((_, i) => (
                        <div key={i} className="flex gap-3">
                            <Skeleton className="h-8 w-8 rounded-full flex-shrink-0" />
                            <div className="space-y-2 flex-1">
                                <Skeleton className="h-4 w-full" />
                                <Skeleton className="h-3 w-2/3" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            {/* Team Load Chart */}
            <div className="bg-card rounded-xl shadow-sm border p-6 space-y-4">
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-[200px] w-full" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
