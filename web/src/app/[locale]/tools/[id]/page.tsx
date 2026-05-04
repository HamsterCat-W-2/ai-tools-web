import { getToolDetail } from "@/lib/data";
import { ToolDetailPage } from "@/components/tools/tool-detail";
import { notFound } from "next/navigation";

interface PageProps {
  params: Promise<{ locale: string; id: string }>;
}

export default async function ToolPage({ params }: PageProps) {
  const { locale, id } = await params;
  const tool = await getToolDetail(id, locale);

  if (!tool) {
    notFound();
  }

  return <ToolDetailPage tool={tool} />;
}
