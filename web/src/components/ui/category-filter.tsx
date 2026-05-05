"use client";

import { useTranslations, useLocale } from "next-intl";
import { cn } from "@/lib/utils";
import { getCategoryLabel } from "@/lib/categories";

interface CategoryFilterProps {
  categories: string[];
  selected: string;
  onChange: (category: string) => void;
  className?: string;
}

export function CategoryFilter({
  categories,
  selected,
  onChange,
  className,
}: CategoryFilterProps) {
  const t = useTranslations("CategoryFilter");
  const locale = useLocale();

  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      <button
        onClick={() => onChange("")}
        className={cn(
          "px-3.5 py-1.5 text-xs font-medium tracking-wide transition-all duration-200",
          selected === ""
            ? "bg-accent text-background shadow-[0_0_12px_rgba(0,212,255,0.3)]"
            : "bg-surface-elevated text-text-secondary border border-border hover:border-border-hover hover:text-foreground"
        )}
      >
        {t("all")}
      </button>
      {categories.map((category) => (
        <button
          key={category}
          onClick={() => onChange(category)}
          className={cn(
            "px-3.5 py-1.5 text-xs font-medium tracking-wide transition-all duration-200",
            selected === category
              ? "bg-accent text-background shadow-[0_0_12px_rgba(0,212,255,0.3)]"
              : "bg-surface-elevated text-text-secondary border border-border hover:border-border-hover hover:text-foreground"
          )}
        >
          {getCategoryLabel(category, locale)}
        </button>
      ))}
    </div>
  );
}
