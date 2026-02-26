"use client";

import { useAuth } from "./AuthProvider";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";
import Sidebar from "./Sidebar";
import { SidebarProvider, useSidebar } from "./SidebarContext";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import dynamic from "next/dynamic";

const DataSyncProvider = dynamic(() => import("./DataSyncProvider"), {
  ssr: false,
});

interface ProtectedLayoutProps {
  children: React.ReactNode;
}

function MobileSidebar() {
  const { mobileOpen, setMobileOpen } = useSidebar();

  return (
    <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
      <SheetContent
        side="left"
        className="p-0 w-[260px]"
        aria-label="เมนูนำทาง"
      >
        <Sidebar isMobile onNavigate={() => setMobileOpen(false)} />
      </SheetContent>
    </Sheet>
  );
}

function AuthenticatedLayout({ children }: { children: React.ReactNode }) {
  return (
    <DataSyncProvider>
      <SidebarProvider>
        {/* Desktop sidebar */}
        <div className="hidden lg:block">
          <Sidebar />
        </div>

        {/* Mobile sidebar (Sheet) */}
        <MobileSidebar />

        <main className="lg:ml-[260px] min-h-screen">{children}</main>
      </SidebarProvider>
    </DataSyncProvider>
  );
}

export default function ProtectedLayout({ children }: ProtectedLayoutProps) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathnameHook = usePathname() ?? "";
  const pathname =
    pathnameHook ||
    (typeof window !== "undefined" ? window.location.pathname : "");

  // Public routes that don't require authentication
  const publicRoutes = ["/staff/login", "/vendor/login"];

  useEffect(() => {
    if (!loading) {
      const normalizedPathname = pathname.replace(/\/$/, "") || "/";
      const isPublicRoute = publicRoutes.includes(normalizedPathname);

      if (!user && !isPublicRoute) {
        router.push("/staff/login");
      } else if (
        user &&
        (normalizedPathname === "/staff/login" ||
          normalizedPathname === "/vendor/login")
      ) {
        router.push("/");
      }
    }
  }, [user, loading, pathname, router]);

  // Show login page without layout wrapper for unauthenticated users on public routes
  const normalizedPathname = pathname.replace(/\/$/, "") || "/";
  if (!user && pathname && publicRoutes.includes(normalizedPathname)) {
    return <>{children}</>;
  }

  // Show main app layout for authenticated users
  if (user) {
    return <AuthenticatedLayout>{children}</AuthenticatedLayout>;
  }

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        role="status"
        aria-label="กำลังโหลด"
      >
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Fallback
  return <>{children}</>;
}
