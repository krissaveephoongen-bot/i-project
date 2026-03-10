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
                    "w-full px-4 py-2 flex items-center justify-between text-xs font-semibold tracking-wider uppercase text-muted-foreground hover:text-foreground transition-colors rounded-lg",
                    isExpanded && "bg-muted"
                )}
                aria-expanded={isExpanded}
            >
                <span>{title}</span>
                <ChevronDown
                    className={clsx(
                        "w-4 h-4 transition-transform duration-200",
                        isExpanded && "rotate-180"
                    )}
                    aria-hidden="true"
                />
            </button>
            {isExpanded && <div className="mt-2">{children}</div>}
        </div>
    );
}
