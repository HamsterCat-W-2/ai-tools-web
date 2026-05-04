"use client";

import { useState, useMemo } from "react";
import { useTranslations, useLocale } from "next-intl";
import { Link } from "@/i18n/navigation";
import { AITool } from "@/types/tool";
import { getCategoryLabel } from "@/lib/categories";
import { SearchInput } from "@/components/ui/search-input";
import { ToolsGrid } from "@/components/tools/tools-grid";

interface HomeContentProps {
  tools: AITool[];
  categories: string[];
}

export function HomeContent({ tools, categories }: HomeContentProps) {
  const t = useTranslations("HomeContent");
  const tSearch = useTranslations("Search");
  const locale = useLocale();
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

  if (search) {
    return (
      <div className="space-y-6">
        <SearchInput value={search} onChange={setSearch} className="max-w-xl" />
        <p className="text-gray-500">
          {tSearch("searchPrefix", { query: search })}
          {tSearch("resultCount", { count: filteredTools.length })}
        </p>
        <ToolsGrid tools={filteredTools} />
      </div>
    );
  }

  const groupedTools = categories.map((category) => ({
    category,
    label: getCategoryLabel(category, locale),
    tools: tools.filter((tool) => tool.category === category),
  }));

  return (
    <div className="space-y-10">
      <SearchInput value={search} onChange={setSearch} className="max-w-xl" />
      {groupedTools.map(({ category, label, tools: categoryTools }) => (
        <section key={category}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">{label}</h2>
            <Link
              href={`/category/${category}`}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              {t("viewAll")} &rarr;
            </Link>
          </div>
          <ToolsGrid tools={categoryTools.slice(0, 6)} />
        </section>
      ))}
    </div>
  );
}
