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
    <aside className="w-64 bg-white border-r border-gray-200 min-h-screen p-4">
      <nav>
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
          {t("categoryNav")}
        </h3>
        <ul className="space-y-1">
          <li>
            <Link
              href="/"
              className={`block px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                !currentCategory
                  ? "bg-blue-50 text-blue-700"
                  : "text-gray-700 hover:bg-gray-50"
              }`}
            >
              {t("allTools")}
            </Link>
          </li>
          {categories.map((category) => (
            <li key={category}>
              <Link
                href={`/category/${category}`}
                className={`block px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  currentCategory === category
                    ? "bg-blue-50 text-blue-700"
                    : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                {getCategoryLabel(category, locale)}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}
