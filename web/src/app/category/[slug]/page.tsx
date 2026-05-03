import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCategories, getToolsByCategory } from "@/lib/data";
import { getCategoryLabel } from "@/lib/categories";
import { Sidebar } from "@/components/layout/sidebar";
import { ToolsWithSearch } from "@/components/tools/tools-with-search";

interface CategoryPageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ lang?: string }>;
}

export async function generateStaticParams() {
  const categories = await getCategories();
  return categories.map((category) => ({
    slug: category,
  }));
}

export async function generateMetadata({
  params,
}: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params;
  const label = getCategoryLabel(slug);

  return {
    title: `${label} - AI工具集导航`,
    description: `发现最好用的${label}工具，收录热门AI应用`,
  };
}

export default async function CategoryPage({ params, searchParams }: CategoryPageProps) {
  const { slug } = await params;
  const { lang } = await searchParams;
  const categories = await getCategories();

  if (!categories.includes(slug)) {
    notFound();
  }

  const tools = await getToolsByCategory(slug, lang);
  const label = getCategoryLabel(slug);

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
