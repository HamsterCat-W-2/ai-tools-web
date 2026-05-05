"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useLocale } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { getCategoryLabel } from "@/lib/categories";

interface MobileMenuProps {
  categories: string[];
  allToolsLabel: string;
  categoryNavLabel: string;
}

export function MobileMenu({ categories, allToolsLabel, categoryNavLabel }: MobileMenuProps) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const locale = useLocale();
  const pathname = usePathname();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  const overlay = mounted ? createPortal(
    <div
      className="fixed inset-0 z-[9999]"
      style={{ display: open ? "block" : "none" }}
    >
      <div
        className="absolute inset-0 bg-black/70"
        onClick={() => setOpen(false)}
      />
      <div className="absolute top-0 left-0 h-full w-72 bg-surface border-r border-border shadow-2xl flex flex-col">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border shrink-0">
          <span className="text-sm font-semibold text-foreground tracking-wide">
            {categoryNavLabel}
          </span>
          <button
            onClick={() => setOpen(false)}
            className="p-1 -mr-1 text-text-muted hover:text-foreground"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <nav className="flex-1 overflow-y-auto py-3 px-3">
          <ul className="space-y-0.5">
            <li>
              <Link
                href="/"
                className={`flex items-center gap-3 px-3 py-3 text-sm rounded-md ${
                  pathname === "/"
                    ? "bg-sidebar-active text-accent font-medium"
                    : "text-text-secondary active:bg-sidebar-active"
                }`}
              >
                <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${pathname === "/" ? "bg-accent" : "bg-text-muted"}`} />
                {allToolsLabel}
              </Link>
            </li>
            {categories.map((category) => (
              <li key={category}>
                <Link
                  href={`/category/${category}`}
                  className={`flex items-center gap-3 px-3 py-3 text-sm rounded-md ${
                    pathname === `/category/${category}`
                      ? "bg-sidebar-active text-accent font-medium"
                      : "text-text-secondary active:bg-sidebar-active"
                  }`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${pathname === `/category/${category}` ? "bg-accent" : "bg-text-muted"}`} />
                  {getCategoryLabel(category, locale)}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </div>,
    document.body
  ) : null;

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="md:hidden p-1.5 -ml-1 text-text-secondary hover:text-foreground transition-colors"
        aria-label="Open menu"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>
      {overlay}
    </>
  );
}
