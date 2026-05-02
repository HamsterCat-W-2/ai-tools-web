"use client";

import { cn } from "@/lib/utils";

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
  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      <button
        onClick={() => onChange("")}
        className={cn(
          "px-4 py-2 rounded-full text-sm font-medium transition-colors",
          selected === ""
            ? "bg-blue-600 text-white"
            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
        )}
      >
        全部
      </button>
      {categories.map((category) => (
        <button
          key={category}
          onClick={() => onChange(category)}
          className={cn(
            "px-4 py-2 rounded-full text-sm font-medium transition-colors",
            selected === category
              ? "bg-blue-600 text-white"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          )}
        >
          {category}
        </button>
      ))}
    </div>
  );
}
