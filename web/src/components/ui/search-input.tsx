"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

interface SearchInputProps {
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export function SearchInput({
  placeholder,
  value,
  onChange,
  className,
}: SearchInputProps) {
  const t = useTranslations("Search");
  const [localValue, setLocalValue] = useState(value);
  const effectivePlaceholder = placeholder ?? t("placeholder");

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  useEffect(() => {
    const timer = setTimeout(() => {
      onChange(localValue);
    }, 300);

    return () => clearTimeout(timer);
  }, [localValue, onChange]);

  return (
    <div className={cn("relative", className)}>
      <svg
        className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
        />
      </svg>
      <input
        type="text"
        value={localValue}
        onChange={(e) => setLocalValue(e.target.value)}
        placeholder={effectivePlaceholder}
        className="search-input w-full pl-10 pr-4 py-2.5 text-sm"
      />
    </div>
  );
}
