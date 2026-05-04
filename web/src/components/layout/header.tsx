import { LanguageSwitcher } from "./language-switcher";
import { Link } from "@/i18n/navigation";

export async function Header() {
  return (
    <header className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 py-2">
        <div className="flex items-center justify-between">
          <Link href="/">
            <img src="/logo.svg" alt="AI Tools" className="h-8" />
          </Link>
          <LanguageSwitcher />
        </div>
      </div>
    </header>
  );
}
