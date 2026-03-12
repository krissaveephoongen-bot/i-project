"use client";

import { ReactNode } from "react";
import { ChevronRight } from "lucide-react";
import Link from "next/link";

interface Breadcrumb {
  label: string;
  href?: string;
}

interface PageContainerProps {
  title: string;
  description?: string;
  breadcrumbs?: Breadcrumb[];
  children: ReactNode;
  className?: string;
}

export default function PageContainer({
  title,
  description,
  breadcrumbs,
  children,
  className = "",
}: PageContainerProps) {
  return (
    <div className={`min-h-screen bg-gradient-to-b from-white via-slate-50 to-blue-50 ${className}`}>
      {/* Breadcrumbs */}
      {breadcrumbs && breadcrumbs.length > 0 && (
        <div className="border-b border-slate-200 bg-white/50 backdrop-blur sticky top-16 z-30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
            <div className="flex items-center gap-2 text-sm">
              {breadcrumbs.map((crumb, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  {crumb.href ? (
                    <Link
                      href={crumb.href}
                      className="text-slate-600 hover:text-slate-900 transition-colors"
                    >
                      {crumb.label}
                    </Link>
                  ) : (
                    <span className="text-slate-700">{crumb.label}</span>
                  )}
                  {idx < breadcrumbs.length - 1 && (
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Page Header */}
      <div className="border-b border-slate-200 bg-white/50 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2">
            {title}
          </h1>
          {description && (
            <p className="text-slate-600 text-lg">{description}</p>
          )}
        </div>
      </div>

      {/* Page Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </div>
    </div>
  );
}
