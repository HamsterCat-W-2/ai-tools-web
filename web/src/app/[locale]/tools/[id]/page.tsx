import { getToolDetail } from "@/lib/data";
import { ToolDetailPage } from "@/components/tools/tool-detail";
import { Sidebar } from "@/components/layout/sidebar";
import { notFound } from "next/navigation";

interface PageProps {
  params: Promise<{ locale: string; id: string }>;
}

export default async function ToolPage({ params }: PageProps) {
  const { id } = await params;
  const tool = await getToolDetail(id);

  if (!tool) {
    notFound();
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 p-8">
        <ToolDetailPage tool={tool} />
      </main>
    </div>
  );
}
