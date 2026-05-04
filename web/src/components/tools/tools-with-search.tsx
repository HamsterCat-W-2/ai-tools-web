"use client";

import { useState, useMemo } from "react";
import { useTranslations } from "next-intl";
import { AITool } from "@/types/tool";
import { SearchInput } from "@/components/ui/search-input";
import { ToolsGrid } from "@/components/tools/tools-grid";

interface ToolsWithSearchProps {
  tools: AITool[];
}

export function ToolsWithSearch({ tools }: ToolsWithSearchProps) {
  const t = useTranslations("Search");
  const [search, setSearch] = useState("");

  const filteredTools = useMemo(() => {
    if (!search) return tools;

    const searchLower = search.toLowerCase();
    return tools.filter(
      (tool) =>
        tool.name.toLowerCase().includes(searchLower) ||
        tool.description.toLowerCase().includes(searchLower) ||
        tool.tags.some((tag) => tag.toLowerCase().includes(searchLower))
    );
  }, [tools, search]);

  return (
    <div className="space-y-6">
      <SearchInput value={search} onChange={setSearch} className="max-w-xl" />
      <p className="text-gray-500">
        {search ? t("searchPrefix", { query: search }) : ""}
        {t("toolCount", { count: filteredTools.length })}
      </p>
      <ToolsGrid tools={filteredTools} />
    </div>
  );
}
