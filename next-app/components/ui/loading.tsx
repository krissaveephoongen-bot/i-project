import React from "react";
import { cn } from "@/lib/utils";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  text?: string;
}

const LoadingSpinner = ({
  size = "md",
  className = "",
  text = "",
}: LoadingSpinnerProps) => {
  const sizes = {
    sm: "w-4 h-4",
    md: "w-6 h-6",
    lg: "w-8 h-8",
    xl: "w-12 h-12",
  };

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div
        className={`${sizes[size as keyof typeof sizes]} animate-spin rounded-full border-2 border-gray-300 border-t-blue-600`}
      ></div>
      {text && <span className="ml-2 text-sm text-gray-600">{text}</span>}
    </div>
  );
};

const Skeleton = ({ className = "", lines = 1, height = "h-4" }) => {
  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: lines }).map((_, index) => (
        <div
          key={index}
          className={`${height} bg-gray-200 rounded animate-pulse`}
          style={{
            width: index === lines - 1 ? "60%" : "100%",
          }}
        ></div>
      ))}
    </div>
  );
};

export { LoadingSpinner, Skeleton };
