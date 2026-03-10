"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { clsx } from "clsx";

interface NavCommand {
    name: string;
    href: string;
    category: string;
}

const NAVIGATION_COMMANDS: NavCommand[] = [
    // Analytics
    { name: "Dashboard", href: "/", category: "Navigation" },

    // Projects & Operations
    { name: "Projects", href: "/projects", category: "Navigation" },
    { name: "Weekly Activities", href: "/projects/weekly-activities", category: "Navigation" },
    { name: "Tasks", href: "/tasks", category: "Navigation" },
    { name: "Timesheet", href: "/timesheet", category: "Navigation" },

    // Financials
    { name: "Expenses", href: "/expenses", category: "Financials" },
    { name: "Vendor Payments", href: "/expenses/vendor-payments", category: "Financials" },
    { name: "Reports", href: "/reports", category: "Financials" },

    // Support
    { name: "Warranty Dashboard", href: "/warranty", category: "Support" },
    { name: "SLA Tickets", href: "/warranty/tickets", category: "Support" },
    { name: "PM Schedule", href: "/warranty/pm-schedule", category: "Support" },

    // Workspace
    { name: "Clients", href: "/clients", category: "Workspace" },
    { name: "Approvals", href: "/approvals", category: "Workspace" },
    { name: "Delivery", href: "/delivery", category: "Workspace" },
    { name: "Resources", href: "/resources", category: "Workspace" },

    // Admin
    { name: "Master Data", href: "/admin/master-data", category: "Administration" },
    { name: "User Management", href: "/admin/users", category: "Administration" },
    { name: "Project Assignment", href: "/admin/project-assign", category: "Administration" },
    { name: "Vendors", href: "/admin/vendors", category: "Administration" },
    { name: "System Health", href: "/admin/health", category: "Administration" },
];

export default function CommandPalette() {
    const router = useRouter();
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState("");

    const filtered = query === ""
        ? []
        : NAVIGATION_COMMANDS.filter((cmd) =>
            cmd.name.toLowerCase().includes(query.toLowerCase()) ||
            cmd.category.toLowerCase().includes(query.toLowerCase())
        );

    const grouped = filtered.reduce((acc, cmd) => {
        const category = cmd.category;
        if (!acc[category]) acc[category] = [];
        acc[category].push(cmd);
        return acc;
    }, {} as Record<string, NavCommand[]>);

    // Listen for Cmd+K or Ctrl+K
    useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === "k") {
                e.preventDefault();
                setOpen((open) => !open);
            }
        };

        document.addEventListener("keydown", down);
        return () => document.removeEventListener("keydown", down);
    }, []);

    const handleNavigate = (href: string) => {
        router.push(href);
        setOpen(false);
        setQuery("");
    };

    return (
        <>
            {/* Trigger Button (in sidebar or header) */}
            <button
                onClick={() => setOpen(true)}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors mb-4"
                title="Cmd+K / Ctrl+K"
            >
                <Search className="w-4 h-4" />
                <span>Quick search...</span>
            </button>

            {/* Modal */}
            {open && (
                <div
                    className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
                    onClick={() => setOpen(false)}
                >
                    <div className="fixed left-1/2 top-1/3 -translate-x-1/2 w-full max-w-md">
                        <div
                            className="bg-background border border-border rounded-lg shadow-lg overflow-hidden"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Search Input */}
                            <div className="p-4 border-b border-border">
                                <input
                                    autoFocus
                                    type="text"
                                    placeholder="Search pages, features..."
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === "Escape") setOpen(false);
                                        if (e.key === "Enter" && filtered.length > 0) {
                                            handleNavigate(filtered[0].href);
                                        }
                                    }}
                                    className="w-full bg-transparent outline-none text-foreground placeholder-muted-foreground"
                                />
                            </div>

                            {/* Results */}
                            <div className="max-h-64 overflow-y-auto p-4 space-y-4">
                                {Object.entries(grouped).map(([category, commands]) => (
                                    <div key={category}>
                                        <h4 className="text-xs font-semibold text-muted-foreground uppercase mb-2 px-2">
                                            {category}
                                        </h4>
                                        <div className="space-y-1">
                                            {commands.map((cmd) => (
                                                <button
                                                    key={cmd.href}
                                                    onClick={() => handleNavigate(cmd.href)}
                                                    className="w-full text-left px-3 py-2 rounded-lg text-sm hover:bg-muted transition-colors"
                                                >
                                                    {cmd.name}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                                {query && filtered.length === 0 && (
                                    <p className="text-sm text-muted-foreground text-center py-4">
                                        No results found
                                    </p>
                                )}
                                {!query && (
                                    <p className="text-xs text-muted-foreground text-center py-4">
                                        Type to search...
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
