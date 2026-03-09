import { Skeleton } from "@/components/ui/skeleton";
import Header from "../components/Header";

export default function Loading() {
  return (
    <div className="min-h-screen bg-slate-50/50">
      <Header
        title="งาน (Tasks)"
        breadcrumbs={[
          { label: "แดชบอร์ด", href: "/" },
          { label: "งาน" },
        ]}
      />
      <div className="pt-24 px-6 pb-6 container mx-auto space-y-6 w-full max-w-full">
        {/* Header Skeleton */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="space-y-2">
            <Skeleton className="h-9 w-48" />
            <Skeleton className="h-5 w-64" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar Skeleton */}
          <div className="order-2 lg:order-1 rounded-xl border bg-card text-card-foreground shadow-sm">
            <div className="p-4 border-b">
              <Skeleton className="h-6 w-24" />
            </div>
            <div className="p-0">
              <div className="flex flex-col">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="px-4 py-3 border-b space-y-2">
                    <div className="flex justify-between">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-5 w-10 rounded-full" />
                    </div>
                    <Skeleton className="h-3 w-40" />
                    <Skeleton className="h-2 w-full mt-2" />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Table Skeleton */}
          <div className="lg:col-span-3 order-1 lg:order-2 rounded-xl border bg-card text-card-foreground shadow-sm">
            <div className="p-4 border-b">
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-4 w-24 mt-1" />
            </div>
            <div className="p-0">
              <div className="w-full">
                <div className="border-b bg-slate-50 p-4 grid grid-cols-6 gap-4">
                  {[...Array(6)].map((_, i) => (
                    <Skeleton key={i} className="h-5 w-full" />
                  ))}
                </div>
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="p-4 border-b last:border-0 grid grid-cols-6 gap-4 items-center">
                    <div className="space-y-1">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-24" />
                    <div className="flex justify-center">
                        <Skeleton className="h-6 w-20 rounded-full" />
                    </div>
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
    </div>
  );
}
