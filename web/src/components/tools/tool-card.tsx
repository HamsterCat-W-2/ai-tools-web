"use client";

import { useLocale } from "next-intl";
import { AITool } from "@/types/tool";
import { cn } from "@/lib/utils";
import { getCategoryLabel } from "@/lib/categories";
import { Link } from "@/i18n/navigation";

interface ToolCardProps {
  tool: AITool;
  className?: string;
}

export function ToolCard({ tool, className }: ToolCardProps) {
  const locale = useLocale();

  return (
    <Link
      href={`/tools/${tool.id}`}
      className={cn(
        "glass-card group block p-5 h-full",
        className
      )}
    >
      <div className="flex items-start gap-3.5">
        {tool.icon && (
          <img
            src={tool.icon}
            alt={tool.name}
            className="w-10 h-10 rounded-lg object-cover flex-shrink-0 border border-border"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none";
            }}
          />
        )}
        <div className="flex-1 min-w-0">
          <h3 className="text-[15px] font-semibold text-foreground truncate group-hover:text-accent transition-colors duration-200">
            {tool.name}
          </h3>
          <p className="mt-1 text-[13px] text-text-secondary leading-relaxed line-clamp-2">
            {tool.description}
          </p>
        </div>
      </div>

      <div className="mt-3.5 flex flex-wrap gap-1.5">
        <span className="inline-flex items-center px-2 py-0.5 text-[10px] font-semibold bg-category-badge-bg text-category-badge-text tracking-wider uppercase">
          {getCategoryLabel(tool.category, locale)}
        </span>
        {tool.tags.slice(0, 3).map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center px-2 py-0.5 text-[10px] bg-badge-bg text-badge-text tracking-wide"
          >
            {tag}
          </span>
        ))}
      </div>

      {tool.features.length > 0 && (
        <div className="mt-3.5 pt-3 border-t border-border">
          <div className="flex flex-wrap gap-x-3 gap-y-1">
            {tool.features.slice(0, 3).map((feature) => (
              <span key={feature} className="text-[11px] text-text-muted">
                {feature}
              </span>
            ))}
          </div>
        </div>
      )}
    </Link>
  );
}
