import { getToolDetail } from "@/lib/data";
import { ToolDetailPage } from "@/components/tools/tool-detail";
import { notFound } from "next/navigation";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ToolPage({ params }: PageProps) {
  const { id } = await params;
  const tool = await getToolDetail(id);

  if (!tool) {
    notFound();
  }

  return <ToolDetailPage tool={tool} />;
}
