"use client";

import { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "./AuthProvider";
import { LogOut, Menu, X } from "lucide-react";
import { useState } from "react";
import { clsx } from "clsx";
import CommandPalette from "./CommandPalette";

interface PortalLayoutProps {
    children: ReactNode;
}

export default function PortalLayout({ children }: PortalLayoutProps) {
    const pathname = usePathname();
    const { signOut } = useAuth() || {};
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    // Hide header on login page
    if (pathname === "/login" || pathname?.includes("login")) {
        return children;
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-white via-slate-50 to-blue-50">
            {/* Top Navigation */}
            <nav className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-slate-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg flex items-center justify-center">
                            <span className="text-white font-bold">P</span>
                        </div>
                        <span className="text-xl font-bold text-white hidden sm:inline">
                            I-PROJECT Portal
                        </span>
                    </Link>

                    {/* Desktop Command Palette */}
                    <div className="hidden md:flex flex-1 max-w-xs mx-8">
                        <CommandPalette />
                    </div>

                    {/* Desktop Menu */}
                    <div className="hidden md:flex items-center gap-4">
                        <button
                            onClick={signOut}
                            className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                        >
                            <LogOut className="w-4 h-4" />
                            Sign Out
                        </button>
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        className="md:hidden p-2 text-slate-600 hover:text-slate-900"
                    >
                        {mobileMenuOpen ? (
                            <X className="w-6 h-6" />
                        ) : (
                            <Menu className="w-6 h-6" />
                        )}
                    </button>
                </div>

                {/* Mobile Menu */}
                {mobileMenuOpen && (
                    <div className="md:hidden border-t border-slate-200 bg-slate-100 p-4 space-y-3">
                        <div className="mb-4">
                            <CommandPalette />
                        </div>
                        <button
                            onClick={signOut}
                            className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                        >
                            <LogOut className="w-4 h-4" />
                            Sign Out
                        </button>
                    </div>
                )}
            </nav>

            {/* Content */}
            <main className="min-h-screen">{children}</main>

            {/* Footer */}
            <footer className="border-t border-slate-200 bg-slate-50/50 backdrop-blur">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-slate-600">
                        <p>&copy; 2024 I-PROJECT. All rights reserved.</p>
                        <div className="flex gap-6">
                            <Link href="/help" className="hover:text-slate-900">
                                Help & Support
                            </Link>
                            <Link href="/settings" className="hover:text-slate-900">
                                Settings
                            </Link>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}
