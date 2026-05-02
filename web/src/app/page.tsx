import Link from "next/link";
import { getToolsData } from "@/lib/data";
import { getCategoryLabel } from "@/lib/categories";
import { Sidebar } from "@/components/layout/sidebar";
import { ToolsGrid } from "@/components/tools/tools-grid";

export default async function Home() {
  const data = await getToolsData();

  // 按分类分组
  const groupedTools = data.categories.map((category) => ({
    category,
    label: getCategoryLabel(category),
    tools: data.tools.filter((tool) => tool.category === category),
  }));

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 p-8">
        <div className="max-w-7xl mx-auto space-y-10">
          {groupedTools.map(({ category, label, tools }) => (
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
              <ToolsGrid tools={tools.slice(0, 6)} />
            </section>
          ))}
        </div>
      </main>
    </div>
  );
}
