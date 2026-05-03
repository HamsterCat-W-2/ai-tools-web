import { getToolDetail } from "@/lib/data";
import { ToolDetailPage } from "@/components/tools/tool-detail";
import { notFound } from "next/navigation";

interface PageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ lang?: string }>;
}

export default async function ToolPage({ params, searchParams }: PageProps) {
  const { id } = await params;
  const { lang } = await searchParams;
  const tool = await getToolDetail(id, lang);

  if (!tool) {
    notFound();
  }

  return <ToolDetailPage tool={tool} />;
}
