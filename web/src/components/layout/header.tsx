import { getTranslations } from "next-intl/server";
import { LanguageSwitcher } from "./language-switcher";

export async function Header() {
  const t = await getTranslations("Header");

  return (
    <header className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{t("title")}</h1>
            <p className="mt-1 text-sm text-gray-500">{t("subtitle")}</p>
          </div>
          <div className="flex items-center gap-4">
            <LanguageSwitcher />
            <div className="text-sm text-gray-400">{t("poweredBy")}</div>
          </div>
        </div>
      </div>
    </header>
  );
}
