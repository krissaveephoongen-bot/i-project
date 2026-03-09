"use client";

import React, { createContext, useContext, useMemo, useState, useCallback } from "react";
import { createPortal } from "react-dom";
import { Button } from "@/app/components/ui/button";

type Step = {
  selector: string;
  title: string;
  content: string;
  placement?: "top" | "bottom" | "left" | "right" | "center";
};

type Ctx = {
  start: (steps: Step[]) => void;
  stop: () => void;
  next: () => void;
  prev: () => void;
  active: boolean;
};

const WalkthroughContext = createContext<Ctx | null>(null);

export const useWalkthrough = () => {
  const ctx = useContext(WalkthroughContext);
  if (!ctx) throw new Error("useWalkthrough must be used within WalkthroughProvider");
  return ctx;
};

export default function WalkthroughProvider({ children }: { children: React.ReactNode }) {
  const [steps, setSteps] = useState<Step[]>([]);
  const [index, setIndex] = useState(0);
  const active = steps.length > 0;

  const start = useCallback((s: Step[]) => {
    setSteps(s || []);
    setIndex(0);
    document.body.style.overflow = "hidden";
  }, []);

  const stop = useCallback(() => {
    setSteps([]);
    setIndex(0);
    document.body.style.overflow = "";
  }, []);

  const next = useCallback(() => {
    setIndex((i) => (i + 1 >= steps.length ? i : i + 1));
  }, [steps.length]);

  const prev = useCallback(() => {
    setIndex((i) => (i - 1 < 0 ? i : i - 1));
  }, []);

  const value = useMemo(() => ({ start, stop, next, prev, active }), [start, stop, next, prev, active]);

  const current = active ? steps[index] : null;
  const target = current ? (document.querySelector(current.selector) as HTMLElement | null) : null;

  const rect = target ? target.getBoundingClientRect() : null;
  if (target && rect) {
    target.scrollIntoView({ block: "center", behavior: "smooth" });
  }

  const Tooltip = () => {
    if (!current || !rect) return null;
    const padding = 8;
    let top = rect.bottom + padding;
    let left = rect.left;
    if (current.placement === "top") top = rect.top - 120 - padding;
    if (current.placement === "left") {
      top = rect.top;
      left = rect.left - 320 - padding;
    }
    if (current.placement === "right") {
      top = rect.top;
      left = rect.right + padding;
    }
    return (
      <div
        style={{
          position: "fixed",
          top,
          left,
          zIndex: 1000001,
          width: 300,
        }}
        className="bg-white border border-slate-200 rounded-lg shadow-lg p-4"
      >
        <div className="text-sm font-semibold text-slate-900">{current.title}</div>
        <div className="text-sm text-slate-600 mt-1">{current.content}</div>
        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" onClick={prev} disabled={index === 0}>
            Prev
          </Button>
          {index < steps.length - 1 ? (
            <Button onClick={next}>Next</Button>
          ) : (
            <Button onClick={stop}>Done</Button>
          )}
        </div>
      </div>
    );
  };

  const Highlight = () => {
    if (!rect) return null;
    return (
      <>
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.4)",
            zIndex: 1000000,
          }}
        />
        <div
          style={{
            position: "fixed",
            top: rect.top - 6,
            left: rect.left - 6,
            width: rect.width + 12,
            height: rect.height + 12,
            border: "2px solid #3b82f6",
            borderRadius: 8,
            boxShadow: "0 0 0 9999px rgba(0,0,0,0.4)",
            zIndex: 1000002,
            pointerEvents: "none",
          }}
        />
      </>
    );
  };

  return (
    <WalkthroughContext.Provider value={value}>
      {children}
      {active && typeof window !== "undefined"
        ? createPortal(
            <>
              <Highlight />
              <Tooltip />
            </>,
            document.body,
          )
        : null}
    </WalkthroughContext.Provider>
  );
}
