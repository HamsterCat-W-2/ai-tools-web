import { getToolsData } from "@/lib/data";
import { Sidebar } from "@/components/layout/sidebar";
import { HomeWithHero } from "@/components/tools/home-with-hero";

interface PageProps {
  params: Promise<{ locale: string }>;
}

export default async function Home({ params }: PageProps) {
  await params;
  const data = await getToolsData();

  return (
    <HomeWithHero
      tools={data.tools}
      categories={data.categories}
      sidebar={<Sidebar />}
    />
  );
}
