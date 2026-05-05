import { LanguageSwitcher } from "./language-switcher";
import { MobileMenu } from "./mobile-menu";
import { Link } from "@/i18n/navigation";
import { getCategories } from "@/lib/data";
import { getTranslations } from "next-intl/server";

export async function Header() {
  const categories = await getCategories();
  const t = await getTranslations("Sidebar");

  return (
    <header className="bg-surface/80 border-b border-border backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MobileMenu
              categories={categories}
              allToolsLabel={t("allTools")}
              categoryNavLabel={t("categoryNav")}
            />
            <Link href="/" className="flex items-center gap-2">
              <img src="/logo.svg" alt="AI Tools" className="h-8 md:h-9" />
            </Link>
          </div>
          <LanguageSwitcher />
        </div>
      </div>
    </header>
  );
}
