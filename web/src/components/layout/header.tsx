import { LanguageSwitcher } from "./language-switcher";
import { Link } from "@/i18n/navigation";

export async function Header() {
  return (
    <header className="bg-surface/80 border-b border-border backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 py-3">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <img src="/logo.svg" alt="AI Tools" className="h-9" />
          </Link>
          <LanguageSwitcher />
        </div>
      </div>
    </header>
  );
}
