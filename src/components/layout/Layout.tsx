import { Outlet } from 'react-router-dom';
import { useState, useEffect, useRef, useCallback } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import MobileBottomNav from '../MobileBottomNav';

import { Toaster } from 'react-hot-toast';
import { useAuthContext } from '../../contexts/AuthContext';
import { useGlobalShortcuts } from '../../hooks/use-keyboard-shortcuts';
import { CommandPalette } from '../CommandPalette';
import { ErrorBoundary } from '../ErrorBoundary';

const Layout = () => {
  const { user, logout } = useAuthContext();
  const [isMobile, setIsMobile] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(!isMobile);
  const sidebarRef = useRef<HTMLDivElement>(null);
  
  // Update sidebar state when mobile state changes
  useEffect(() => {
    setIsSidebarOpen(!isMobile);
  }, [isMobile]);

  // Toggle sidebar with useCallback for optimization
  const toggleSidebar = useCallback(() => {
    setIsSidebarOpen(prev => !prev);
  }, []);

  // Close sidebar with useCallback for optimization
  const closeSidebar = useCallback(() => {
    if (isMobile) {
      setIsSidebarOpen(false);
    }
  }, [isMobile]);

  // Check if mobile view with debounce to prevent excessive re-renders
  useEffect(() => {
    let resizeTimeout: ReturnType<typeof setTimeout>;
    
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    
    // Initial check
    checkIfMobile();
    
    // Debounced resize listener
    const handleResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(checkIfMobile, 150);
    };
    
    window.addEventListener('resize', handleResize);
    
    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(resizeTimeout);
    };
  }, []);

  // Auto-close sidebar when clicking outside on mobile using ref instead of querySelector
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isSidebarOpen && isMobile && sidebarRef.current && !sidebarRef.current.contains(event.target as Node)) {
        closeSidebar();
      }
    };

    if (isSidebarOpen && isMobile) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
    
    // Return a no-op function when the condition is not met
    return () => {};
  }, [isSidebarOpen, isMobile, closeSidebar]);

  // Enable keyboard shortcuts
  useGlobalShortcuts();

  // Don't render layout if user is not authenticated
  if (!user) {
    return null;
  }

  return (
    <ErrorBoundary>
      <div className="h-screen flex bg-gray-50 relative">
         {/* Sidebar */}
         <div 
           ref={sidebarRef}
           className={`sidebar fixed inset-y-0 left-0 z-30 transform transition-all duration-300 ease-in-out ${
           isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
         } lg:relative lg:translate-x-0 w-44`}>
           <Sidebar 
             isOpen={isSidebarOpen} 
             onClose={closeSidebar} 
             onToggle={toggleSidebar} 
           />
         </div>

        {/* Backdrop for mobile */}
        {isSidebarOpen && isMobile && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
            onClick={closeSidebar}
          />
        )}

        {/* Main content */}
        <div className={`flex-1 flex flex-col overflow-y-auto transition-all duration-300 ${
          isSidebarOpen && !isMobile ? 'ml-44 w-[calc(100%-11rem)]' : 'w-full'
        }`}>
          <div className="flex-1 flex flex-col">
            <Header 
              user={user} 
              onLogout={logout} 
              onMenuClick={toggleSidebar}
            />
            
            <main className="flex-1 bg-gray-50 p-1 md:p-2 overflow-hidden">
              <div className="w-full h-full overflow-y-auto">
                <ErrorBoundary>
                  <Outlet />
                </ErrorBoundary>
              </div>
            </main>
          </div>
        </div>

        {/* Mobile Bottom Navigation */}
        <MobileBottomNav />


        {/* Command Palette */}
        <CommandPalette />

        {/* Toast notifications */}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: 'white',
              color: '#111827',
              border: '1px solid #e5e7eb',
            },
          }}
        />

        {/* Database Status - Hidden as per user request
        <DatabaseStatus />
        */}
      </div>
    </ErrorBoundary>
  );
};

export default Layout;
