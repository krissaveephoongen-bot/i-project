"use client";

import { useAuth } from "./AuthProvider";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import Sidebar from "./Sidebar";
import { SidebarProvider, useSidebar } from "./SidebarContext";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import PortalLayout from "./PortalLayout";
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

function AuthenticatedLayout({ children, isPortalView }: { children: React.ReactNode; isPortalView: boolean }) {
  // Use portal layout for dashboard, sidebar layout for other pages
  if (isPortalView) {
    return <PortalLayout>{children}</PortalLayout>;
  }

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
  const publicRoutes = ["/login"];
  
  // Portal view routes (use portal layout instead of sidebar)
  const isPortalView = pathname === "/" || pathname === "";

  useEffect(() => {
    if (!loading) {
      const normalizedPathname = pathname.replace(/\/$/, "") || "/";
      const isPublicRoute = publicRoutes.includes(normalizedPathname);

      if (!user && !isPublicRoute) {
        router.push("/login");
      } else if (
        user &&
        normalizedPathname === "/login"
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
    return <AuthenticatedLayout isPortalView={isPortalView}>{children}</AuthenticatedLayout>;
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
