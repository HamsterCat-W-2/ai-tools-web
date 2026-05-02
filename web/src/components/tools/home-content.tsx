"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { AITool } from "@/types/tool";
import { getCategoryLabel } from "@/lib/categories";
import { SearchInput } from "@/components/ui/search-input";
import { ToolsGrid } from "@/components/tools/tools-grid";

interface HomeContentProps {
  tools: AITool[];
  categories: string[];
}

export function HomeContent({ tools, categories }: HomeContentProps) {
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

  // 搜索模式：显示匹配的工具
  if (search) {
    return (
      <div className="space-y-6">
        <SearchInput value={search} onChange={setSearch} className="max-w-xl" />
        <p className="text-gray-500">
          搜索 &quot;{search}&quot; - 共 {filteredTools.length} 个结果
        </p>
        <ToolsGrid tools={filteredTools} />
      </div>
    );
  }

  // 默认模式：按分类展示
  const groupedTools = categories.map((category) => ({
    category,
    label: getCategoryLabel(category),
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
              查看全部 &rarr;
            </Link>
          </div>
          <ToolsGrid tools={categoryTools.slice(0, 6)} />
        </section>
      ))}
    </div>
  );
}
