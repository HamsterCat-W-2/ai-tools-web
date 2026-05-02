import { getToolsData } from "@/lib/data";
import { Sidebar } from "@/components/layout/sidebar";
import { HomeContent } from "@/components/tools/home-content";

export default async function Home() {
  const data = await getToolsData();

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 p-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">全部工具</h1>
          <HomeContent tools={data.tools} categories={data.categories} />
        </div>
      </main>
    </div>
  );
}
