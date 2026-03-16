"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { clsx } from "clsx";

interface CollapsibleMenuSectionProps {
  title: string;
  children: React.ReactNode;
  defaultExpanded?: boolean;
}

export default function CollapsibleMenuSection({
  title,
  children,
  defaultExpanded = false,
}: CollapsibleMenuSectionProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  return (
    <div className="mb-4">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={clsx(
          "group w-full px-3 py-1.5 flex items-center justify-between",
          "text-[10px] font-semibold tracking-[0.14em] uppercase select-none",
          "rounded-lg transition-all duration-200",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/60 focus-visible:ring-offset-1 focus-visible:ring-offset-[#0A0F1E]",
          isExpanded
            ? "text-slate-400 bg-white/[0.04]"
            : "text-slate-600 hover:text-slate-400 hover:bg-white/[0.04]",
        )}
        aria-expanded={isExpanded}
      >
        <span>{title}</span>
        <ChevronDown
          className={clsx(
            "w-3.5 h-3.5 transition-all duration-200",
            isExpanded
              ? "rotate-180 text-indigo-400/70"
              : "text-slate-600 group-hover:text-slate-400",
          )}
          aria-hidden="true"
        />
      </button>

      {/* Animated expand/collapse */}
      <div
        className={clsx(
          "overflow-hidden transition-all duration-200 ease-in-out",
          isExpanded ? "max-h-[600px] opacity-100 mt-1" : "max-h-0 opacity-0",
        )}
      >
        {children}
      </div>
    </div>
  );
}
