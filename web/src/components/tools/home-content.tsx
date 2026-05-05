"use client";

import { useMemo } from "react";
import { useTranslations, useLocale } from "next-intl";
import { Link } from "@/i18n/navigation";
import { AITool } from "@/types/tool";
import { getCategoryLabel } from "@/lib/categories";
import { ToolsGrid } from "@/components/tools/tools-grid";

interface HomeContentProps {
  tools: AITool[];
  categories: string[];
  search: string;
}

export function HomeContent({ tools, categories, search }: HomeContentProps) {
  const t = useTranslations("HomeContent");
  const tSearch = useTranslations("Search");
  const locale = useLocale();

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
        <p className="text-text-muted text-sm">
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
    <div className="space-y-14">
      {groupedTools.map(({ category, label, tools: categoryTools }) => (
        <section key={category}>
          <div className="flex items-baseline justify-between mb-5">
            <h2 className="heading-section text-xl text-foreground">{label}</h2>
            <Link
              href={`/category/${category}`}
              className="text-[12px] text-text-muted hover:text-accent transition-colors tracking-wide uppercase"
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
