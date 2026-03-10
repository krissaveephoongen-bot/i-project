"use client";

import { useAuth } from "./AuthProvider";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";
import PortalLayoutFull from "./PortalLayoutFull";
import dynamic from "next/dynamic";

const DataSyncProvider = dynamic(() => import("./DataSyncProvider"), {
  ssr: false,
});

interface ProtectedLayoutProps {
  children: React.ReactNode;
}

function AuthenticatedLayout({ children }: { children: React.ReactNode }) {
  // Wrap content with portal layout (now used for all authenticated pages)
  return (
    <DataSyncProvider>
      <PortalLayoutFull>{children}</PortalLayoutFull>
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

  useEffect(() => {
    if (!loading) {
      const normalizedPathname = pathname.replace(/\/$/, "") || "/";
      const isPublicRoute = publicRoutes.includes(normalizedPathname);

      if (!user && !isPublicRoute) {
        router.push("/login");
      } else if (user && normalizedPathname === "/login") {
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
