import { Skeleton } from "@/components/ui/skeleton";
import Header from "../../components/Header";

export default function Loading() {
  return (
    <div className="min-h-screen bg-slate-50/50">
      <Header
        title="Loading..."
        breadcrumbs={[
          { label: "Dashboard", href: "/" },
          { label: "Projects", href: "/projects" },
          { label: "Loading..." },
        ]}
      />
      <div className="pt-24 px-6 pb-6">
        {/* Project Header Skeleton */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Skeleton className="h-12 w-12 rounded-lg" />
              <div>
                <div className="flex items-center gap-3">
                  <Skeleton className="h-7 w-48" />
                  <Skeleton className="h-5 w-20 rounded-full" />
                </div>
                <Skeleton className="h-4 w-64 mt-2" />
              </div>
            </div>
            <div className="flex gap-3">
              <Skeleton className="h-10 w-24 rounded-lg" />
              <Skeleton className="h-10 w-24 rounded-lg" />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-4">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 flex-1 rounded-full" />
            <Skeleton className="h-4 w-12" />
          </div>
        </div>

        {/* Stats Grid Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
              <div className="flex items-center gap-3">
                <Skeleton className="h-8 w-8 rounded-full" />
                <div>
                  <Skeleton className="h-3 w-16 mb-1" />
                  <Skeleton className="h-6 w-24" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Tabs Skeleton */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200">
          <div className="border-b border-slate-200 p-0">
            <div className="flex gap-4 px-4 py-3">
              {[...Array(6)].map((_, i) => (
                <Skeleton key={i} className="h-5 w-24" />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
