"use client";

import React, { useState } from "react";
import { Menu, X } from "lucide-react";
import { clsx } from "clsx";

interface MobileMenuProps {
  isOpen?: boolean;
  onToggle?: (isOpen: boolean) => void;
  children?: React.ReactNode;
}

/**
 * Mobile menu toggle button
 * Opens/closes sidebar on mobile devices
 */
export function MobileMenuButton({ isOpen = false, onToggle }: MobileMenuProps) {
  return (
    <button
      onClick={() => onToggle?.(!isOpen)}
      className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-lg hover:bg-gray-50 transition-colors"
      aria-label={isOpen ? "Close menu" : "Open menu"}
      aria-expanded={isOpen}
    >
      {isOpen ? (
        <X className="w-6 h-6 text-gray-900" />
      ) : (
        <Menu className="w-6 h-6 text-gray-900" />
      )}
    </button>
  );
}

/**
 * Mobile menu overlay backdrop
 */
export function MobileMenuBackdrop({ isOpen = false, onClick }: { isOpen?: boolean; onClick?: () => void }) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden transition-opacity"
      onClick={onClick}
      role="presentation"
      aria-hidden="true"
    />
  );
}

/**
 * Complete mobile menu component
 * Manages both button and backdrop
 */
export default function MobileMenu({ children }: MobileMenuProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleClose = () => setIsOpen(false);

  return (
    <>
      <MobileMenuButton isOpen={isOpen} onToggle={setIsOpen} />
      <MobileMenuBackdrop isOpen={isOpen} onClick={handleClose} />
      {isOpen && <>{children}</>}
    </>
  );
}
