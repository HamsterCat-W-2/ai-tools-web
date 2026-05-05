"use client";

import { useState, ReactNode } from "react";
import { AITool } from "@/types/tool";
import { Hero } from "@/components/layout/hero";
import { HomeContent } from "@/components/tools/home-content";

interface HomeWithHeroProps {
  tools: AITool[];
  categories: string[];
  sidebar: ReactNode;
}

export function HomeWithHero({ tools, categories, sidebar }: HomeWithHeroProps) {
  const [search, setSearch] = useState("");

  return (
    <>
      <Hero search={search} onSearchChange={setSearch} />
      <div className="flex bg-background">
        {sidebar}
        <main className="flex-1 p-4 md:p-8" id="main-content">
          <div className="max-w-6xl mx-auto">
            <HomeContent tools={tools} categories={categories} search={search} />
          </div>
        </main>
      </div>
    </>
  );
}
