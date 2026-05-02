"use client";

import { useState, useEffect, useMemo } from "react";
import { Header } from "@/components/layout/header";
import { SearchInput } from "@/components/ui/search-input";
import { CategoryFilter } from "@/components/ui/category-filter";
import { ToolsGrid } from "@/components/tools/tools-grid";
import { AITool, ToolsData } from "@/types/tool";

export default function Home() {
  const [data, setData] = useState<ToolsData | null>(null);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/data/tools.json")
      .then((res) => res.json())
      .then((data: ToolsData) => {
        setData(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load data:", err);
        setLoading(false);
      });
  }, []);

  const filteredTools = useMemo(() => {
    if (!data) return [];

    return data.tools.filter((tool: AITool) => {
      const matchesSearch =
        search === "" ||
        tool.name.toLowerCase().includes(search.toLowerCase()) ||
        tool.description.toLowerCase().includes(search.toLowerCase()) ||
        tool.tags.some((tag) =>
          tag.toLowerCase().includes(search.toLowerCase())
        );

      const matchesCategory = category === "" || tool.category === category;

      return matchesSearch && matchesCategory;
    });
  }, [data, search, category]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <p className="text-gray-500">加载中...</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          <SearchInput
            value={search}
            onChange={setSearch}
            className="max-w-xl"
          />

          <CategoryFilter
            categories={data?.categories || []}
            selected={category}
            onChange={setCategory}
          />

          <div className="text-sm text-gray-500">
            共 {filteredTools.length} 个工具
          </div>

          <ToolsGrid tools={filteredTools} />
        </div>
      </main>
    </div>
  );
}
