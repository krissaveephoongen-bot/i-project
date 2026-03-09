import { Skeleton } from "@/components/ui/skeleton";
import Header from "../components/Header";

export default function Loading() {
  return (
    <div className="min-h-screen bg-slate-50/50">
      <Header
        title="การจัดการผู้ใช้งาน"
        breadcrumbs={[
          { label: "แดชบอร์ด", href: "/" },
          { label: "ผู้ใช้งาน" },
        ]}
      />
      <div className="container mx-auto px-6 py-8 pt-24 space-y-6">
        {/* Top Controls Skeleton */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="space-y-2">
            <Skeleton className="h-9 w-48" />
            <Skeleton className="h-5 w-64" />
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-10 w-32" />
          </div>
        </div>

        {/* Filters Skeleton */}
        <div className="rounded-xl border bg-card text-card-foreground shadow-sm">
          <div className="p-4 grid grid-cols-1 md:grid-cols-4 gap-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        </div>

        {/* Table Skeleton */}
        <div className="rounded-xl border bg-card text-card-foreground shadow-sm overflow-hidden">
          <div className="p-0">
            <div className="w-full">
              <div className="border-b bg-slate-50 p-4 grid grid-cols-6 gap-4">
                {[...Array(6)].map((_, i) => (
                  <Skeleton key={i} className="h-6 w-full" />
                ))}
              </div>
              {[...Array(5)].map((_, i) => (
                <div key={i} className="p-4 border-b last:border-0 grid grid-cols-6 gap-4 items-center">
                  <div className="flex gap-3 items-center">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="space-y-2 flex-1">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-3 w-32" />
                    </div>
                  </div>
                  <Skeleton className="h-6 w-20 rounded-full" />
                  <Skeleton className="h-6 w-24 rounded-full" />
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-4 w-24" />
                  <div className="flex justify-end">
                    <Skeleton className="h-8 w-8 rounded-md" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
