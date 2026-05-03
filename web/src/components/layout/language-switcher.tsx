"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

const languages = [
  { code: "zh", label: "中文" },
  { code: "en", label: "EN" },
];

export function LanguageSwitcher() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const currentLang = searchParams.get("lang") || "zh";

  const handleSwitch = (lang: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (lang === "zh") {
      params.delete("lang");
    } else {
      params.set("lang", lang);
    }
    const query = params.toString();
    router.push(query ? `${pathname}?${query}` : pathname);
  };

  return (
    <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
      {languages.map((lang) => (
        <button
          key={lang.code}
          onClick={() => handleSwitch(lang.code)}
          className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
            currentLang === lang.code
              ? "bg-white text-gray-900 shadow-sm"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          {lang.label}
        </button>
      ))}
    </div>
  );
}
