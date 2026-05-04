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
      <div className="text-center py-12">
        <p className="text-gray-500">{t("noResults")}</p>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6",
        className
      )}
    >
      {tools.map((tool) => (
        <ToolCard key={tool.id} tool={tool} />
      ))}
    </div>
  );
}
