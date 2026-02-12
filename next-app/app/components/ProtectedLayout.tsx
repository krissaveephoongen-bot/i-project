'use client';

import { useAuth } from './AuthProvider';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';
import Sidebar from './Sidebar';
import dynamic from 'next/dynamic';

const DataSyncProvider = dynamic(() => import('./DataSyncProvider'), { ssr: false });

interface ProtectedLayoutProps {
  children: React.ReactNode;
}

export default function ProtectedLayout({ children }: ProtectedLayoutProps) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathnameHook = usePathname() ?? '';
  const pathname = pathnameHook || (typeof window !== 'undefined' ? window.location.pathname : '');

  // Public routes that don't require authentication (normalized without trailing slashes)
  const publicRoutes = ['/staff/login', '/vendor/login'];

  useEffect(() => {
    if (!loading) {
      // Normalize pathname by removing trailing slash for comparison
      const normalizedPathname = pathname.replace(/\/$/, '') || '/';
      const isPublicRoute = publicRoutes.includes(normalizedPathname);

      if (!user && !isPublicRoute) {
        // Redirect to login if not authenticated and not on public route
        router.push('/staff/login');
      } else if (user && (normalizedPathname === '/staff/login' || normalizedPathname === '/vendor/login')) {
        // Redirect to dashboard if authenticated and on login page
        router.push('/');
      }
    }
  }, [user, loading, pathname, router]);

  // Show login page without layout wrapper for unauthenticated users on public routes
  const normalizedPathname = pathname.replace(/\/$/, '') || '/';
  if (!user && pathname && publicRoutes.includes(normalizedPathname)) {
    return <>{children}</>;
  }
  
  // Show main app layout for authenticated users
  if (user) {
    return (
      <DataSyncProvider>
        <Sidebar />
        <main className="ml-[260px] min-h-screen">
          {children}
        </main>
      </DataSyncProvider>
    );
  }
  
  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2563EB] mx-auto mb-4"></div>
          <p className="text-slate-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Fallback: on unknown state, render children to avoid blank screen
  return <>{children}</>;
}
