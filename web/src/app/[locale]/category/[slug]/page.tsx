import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCategories, getToolsByCategory } from "@/lib/data";
import { getCategoryLabel } from "@/lib/categories";
import { getTranslations } from "next-intl/server";
import { Sidebar } from "@/components/layout/sidebar";
import { ToolsWithSearch } from "@/components/tools/tools-with-search";

export const dynamic = "force-dynamic";

interface CategoryPageProps {
  params: Promise<{ locale: string; slug: string }>;
}

export async function generateMetadata({
  params,
}: CategoryPageProps): Promise<Metadata> {
  const { locale, slug } = await params;
  const label = getCategoryLabel(slug, locale);

  return {
    title: `${label} - AI Tools`,
    description: `Discover the best ${label} tools`,
  };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { locale, slug } = await params;
  const categories = await getCategories();

  if (!categories.includes(slug)) {
    notFound();
  }

  const tools = await getToolsByCategory(slug);
  const label = getCategoryLabel(slug, locale);

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar currentCategory={slug} />
      <main className="flex-1 p-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">{label}</h1>
          <ToolsWithSearch tools={tools} />
        </div>
      </main>
    </div>
  );
}
