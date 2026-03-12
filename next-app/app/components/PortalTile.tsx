"use client";

import Link from "next/link";
import { ReactNode } from "react";
import { ArrowRight } from "lucide-react";
import { clsx } from "clsx";

interface PortalTileProps {
    title: string;
    description: string;
    href: string;
    icon: ReactNode;
    badge?: string;
    badgeColor?: "blue" | "green" | "red" | "yellow" | "purple";
    stats?: Array<{ label: string; value: string | number }>;
    variant?: "default" | "featured";
}

export default function PortalTile({
    title,
    description,
    href,
    icon,
    badge,
    badgeColor = "blue",
    stats,
    variant = "default",
}: PortalTileProps) {
    const badgeColors = {
        blue: "bg-blue-500/20 text-blue-200 border-blue-400/30",
        green: "bg-green-500/20 text-green-200 border-green-400/30",
        red: "bg-red-500/20 text-red-200 border-red-400/30",
        yellow: "bg-yellow-500/20 text-yellow-200 border-yellow-400/30",
        purple: "bg-purple-500/20 text-purple-200 border-purple-400/30",
    };

    return (
        <Link href={href}>
            <div
                className={clsx(
                    "group relative overflow-hidden rounded-xl border transition-all duration-300 hover:scale-105 cursor-pointer",
                    variant === "featured"
                        ? "col-span-1 md:col-span-2 lg:col-span-2 bg-gradient-to-br from-blue-50 to-blue-100/50 border-blue-200 hover:from-blue-100 hover:to-blue-200 hover:border-blue-300"
                        : "bg-white/70 border-slate-200 hover:bg-slate-50 hover:border-slate-300"
                )}
            >
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-transparent group-hover:from-slate-900/0 group-hover:via-slate-800/0 group-hover:to-slate-900/10 transition-all duration-300" />

                <div className="relative p-6 h-full flex flex-col">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-slate-200/50 rounded-lg group-hover:bg-slate-200 transition-colors">
                                {icon}
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-slate-900">
                                    {title}
                                </h3>
                                {badge && (
                                    <span
                                        className={clsx(
                                            "inline-block mt-1 px-2.5 py-0.5 text-xs font-medium rounded-full border",
                                            badgeColors[badgeColor]
                                        )}
                                    >
                                        {badge}
                                    </span>
                                )}
                            </div>
                        </div>
                        <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-slate-600 transition-colors transform group-hover:translate-x-1" />
                    </div>

                    {/* Description */}
                    <p className="text-slate-600 text-sm mb-4 flex-grow">
                        {description}
                    </p>

                    {/* Stats (optional) */}
                    {stats && stats.length > 0 && (
                        <div className="grid grid-cols-2 gap-3 pt-4 border-t border-slate-200">
                            {stats.map((stat, idx) => (
                                <div key={idx}>
                                    <p className="text-xs text-slate-500">
                                        {stat.label}
                                    </p>
                                    <p className="text-lg font-semibold text-slate-900">
                                        {stat.value}
                                    </p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </Link>
    );
}
