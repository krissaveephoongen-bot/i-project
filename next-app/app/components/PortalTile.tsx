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

const badgeStyles: Record<
  NonNullable<PortalTileProps["badgeColor"]>,
  string
> = {
  blue: "bg-blue-50 text-blue-700",
  green: "bg-emerald-50 text-emerald-700",
  yellow: "bg-amber-50 text-amber-700",
  red: "bg-red-50 text-red-700",
  purple: "bg-violet-50 text-violet-700",
};

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
  return (
    <Link
      href={href}
      className={clsx(
        "group block bg-white rounded-xl border border-slate-200",
        "shadow-sm hover:shadow-md",
        "hover:-translate-y-0.5 transition-all duration-200",
        "cursor-pointer",
        variant === "featured" && "md:col-span-2 lg:col-span-2",
      )}
    >
      <div className="p-5">
        {/* ── Header row ─────────────────────────────────── */}
        <div className="flex items-start gap-3">
          {/* Icon container — 48 × 48 */}
          <div className="shrink-0 flex items-center justify-center w-12 h-12 rounded-xl bg-slate-100">
            {icon}
          </div>

          {/* Title + badge */}
          <div className="flex-1 min-w-0 pt-0.5">
            <h3 className="text-base font-semibold text-slate-900 truncate leading-snug">
              {title}
            </h3>
            {badge && (
              <span
                className={clsx(
                  "inline-block mt-1 px-2.5 py-0.5 rounded-full",
                  "text-xs font-medium",
                  badgeStyles[badgeColor],
                )}
              >
                {badge}
              </span>
            )}
          </div>

          {/* Arrow — slides right on hover */}
          <ArrowRight
            className={clsx(
              "shrink-0 mt-0.5 w-4 h-4 text-slate-400",
              "transition-transform duration-200",
              "group-hover:translate-x-1 group-hover:text-slate-600",
            )}
            aria-hidden
          />
        </div>

        {/* ── Description ────────────────────────────────── */}
        <p className="text-slate-500 text-sm mt-3 leading-relaxed">
          {description}
        </p>

        {/* ── Stats section (optional) ────────────────────── */}
        {stats && stats.length > 0 && (
          <div
            className={clsx(
              "mt-4 pt-4 border-t border-slate-100",
              "grid gap-x-4 gap-y-2",
              stats.length === 1
                ? "grid-cols-1"
                : stats.length === 2
                  ? "grid-cols-2"
                  : stats.length === 3
                    ? "grid-cols-3"
                    : "grid-cols-2",
            )}
          >
            {stats.map((stat, idx) => (
              <div key={idx} className="flex flex-col">
                <span className="font-semibold text-slate-900 text-lg leading-tight">
                  {stat.value}
                </span>
                <span className="text-xs text-slate-500 mt-0.5">
                  {stat.label}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </Link>
  );
}
