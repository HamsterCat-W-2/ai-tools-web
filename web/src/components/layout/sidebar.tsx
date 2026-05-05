import { getLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { getCategories } from "@/lib/data";
import { getCategoryLabel } from "@/lib/categories";

interface SidebarProps {
  currentCategory?: string;
}

export async function Sidebar({ currentCategory }: SidebarProps) {
  const locale = await getLocale();
  const t = await getTranslations("Sidebar");
  const categories = await getCategories();

  return (
    <aside className="w-56 bg-sidebar-bg border-r border-border min-h-screen shrink-0">
      <nav className="p-5 pt-6">
        <h3 className="text-[10px] font-semibold text-text-muted uppercase tracking-[0.15em] mb-4 px-3">
          {t("categoryNav")}
        </h3>
        <ul className="space-y-0.5">
          <li>
            <Link
              href="/"
              className={`group flex items-center gap-2.5 px-3 py-2 text-[13px] transition-all duration-200 ${
                !currentCategory
                  ? "bg-sidebar-active text-accent font-medium"
                  : "text-text-secondary hover:text-foreground hover:bg-sidebar-active"
              }`}
            >
              <span
                className={`w-1 h-1 rounded-full transition-colors ${
                  !currentCategory ? "bg-accent" : "bg-text-muted group-hover:bg-text-secondary"
                }`}
              />
              {t("allTools")}
            </Link>
          </li>
          {categories.map((category) => (
            <li key={category}>
              <Link
                href={`/category/${category}`}
                className={`group flex items-center gap-2.5 px-3 py-2 text-[13px] transition-all duration-200 ${
                  currentCategory === category
                    ? "bg-sidebar-active text-accent font-medium"
                    : "text-text-secondary hover:text-foreground hover:bg-sidebar-active"
                }`}
              >
                <span
                  className={`w-1 h-1 rounded-full transition-colors ${
                    currentCategory === category
                      ? "bg-accent"
                      : "bg-text-muted group-hover:bg-text-secondary"
                  }`}
                />
                {getCategoryLabel(category, locale)}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}
