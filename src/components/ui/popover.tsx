import * as React from "react";
import { cn } from "../../lib/utils";

export interface PopoverProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export interface PopoverTriggerProps extends React.HTMLAttributes<HTMLDivElement> {
  asChild?: boolean;
  children: React.ReactNode;
}

export interface PopoverContentProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  align?: "start" | "center" | "end";
  children: React.ReactNode;
}

const Popover = ({ children, className, ...props }: PopoverProps) => {
  return (
    <div className={cn("relative", className)} {...props}>
      {children}
    </div>
  );
};

const PopoverTrigger = ({ children, className, asChild, ...props }: PopoverTriggerProps) => {
  return (
    <div className={cn("inline-block", className)} {...props}>
      {children}
    </div>
  );
};

const PopoverContent = ({ 
  className, 
  align = "center", 
  children, 
  ...props 
}: PopoverContentProps) => {
  return (
    <div
      className={cn(
        "absolute z-50 w-72 rounded-md border bg-white p-4 shadow-md outline-none",
        align === "end" && "right-0",
        align === "start" && "left-0",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

export { Popover, PopoverTrigger, PopoverContent };