"use client";

import { AITool } from "@/types/tool";
import { useTranslations } from "next-intl";
import { ToolCard } from "./tool-card";
import { cn } from "@/lib/utils";

interface ToolsGridProps {
  tools: AITool[];
  className?: string;
}

export function ToolsGrid({ tools, className }: ToolsGridProps) {
  const t = useTranslations("ToolsGrid");

  if (tools.length === 0) {
    return (
      <div className="text-center py-20">
        <div className="text-4xl mb-3 opacity-20">&#9965;</div>
        <p className="text-text-muted text-sm">{t("noResults")}</p>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4",
        className
      )}
    >
      {tools.map((tool, i) => (
        <div
          key={tool.id}
          className="h-full"
          style={{
            animation: `fadeInUp 0.4s ease-out ${Math.min(i * 0.05, 0.3)}s both`,
          }}
        >
          <ToolCard tool={tool} />
        </div>
      ))}
    </div>
  );
}
