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
    <div className="flex bg-background">
      <Sidebar currentCategory={slug} />
      <main className="flex-1 p-4 md:p-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="heading-display text-2xl text-foreground mb-8">
            {label}
          </h1>
          <ToolsWithSearch tools={tools} />
        </div>
      </main>
    </div>
  );
}
