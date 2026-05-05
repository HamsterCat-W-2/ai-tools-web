"use client";

import { useLocale } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";

const languages = [
  { code: "en", label: "EN" },
  { code: "zh", label: "中文" },
];

export function LanguageSwitcher() {
  const router = useRouter();
  const pathname = usePathname();
  const locale = useLocale();

  const handleSwitch = (newLocale: string) => {
    router.replace(pathname, { locale: newLocale });
  };

  return (
    <div className="flex items-center gap-0">
      {languages.map((lang, i) => (
        <button
          key={lang.code}
          onClick={() => handleSwitch(lang.code)}
          className={`px-2.5 py-1 text-[11px] tracking-wide transition-colors ${
            locale === lang.code
              ? "text-accent font-semibold"
              : "text-text-muted hover:text-text-secondary"
          } ${i > 0 ? "border-l border-border" : ""}`}
        >
          {lang.label}
        </button>
      ))}
    </div>
  );
}
