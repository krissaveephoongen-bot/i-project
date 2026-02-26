import { Skeleton } from "@/app/components/ui/Skeleton";

export default function TimesheetLoading() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header placeholder */}
      <div className="h-16 border-b border-border bg-card" />

      <div className="container mx-auto px-6 py-8 pt-24 max-w-[1600px] space-y-6">
        {/* Title and actions */}
        <div className="flex justify-between items-center">
          <div className="space-y-2">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-64" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-10 w-28" />
            <Skeleton className="h-10 w-36" />
          </div>
        </div>

        {/* Week selector */}
        <div className="flex items-center gap-4 p-4 rounded-xl border border-border bg-card">
          <Skeleton className="h-10 w-10" />
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-10 w-10" />
          <div className="flex-1" />
          <Skeleton className="h-10 w-32" />
        </div>

        {/* Timesheet grid */}
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          {/* Header row */}
          <div className="grid grid-cols-8 gap-4 p-4 bg-muted/30 border-b border-border">
            <Skeleton className="h-4 w-24" />
            {Array.from({ length: 7 }).map((_, i) => (
              <div key={i} className="text-center space-y-1">
                <Skeleton className="h-4 w-8 mx-auto" />
                <Skeleton className="h-4 w-8 mx-auto" />
              </div>
            ))}
          </div>

          {/* Time entries */}
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="grid grid-cols-8 gap-4 p-4 border-b border-border"
            >
              <div className="space-y-1">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-24" />
              </div>
              {Array.from({ length: 7 }).map((_, j) => (
                <Skeleton key={j} className="h-10 w-full" />
              ))}
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="flex justify-between items-center p-4 rounded-xl border border-border bg-card">
          <div className="space-y-1">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-6 w-16" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>
      </div>
    </div>
  );
}
