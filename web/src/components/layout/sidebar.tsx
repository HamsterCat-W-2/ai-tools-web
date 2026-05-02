import Link from "next/link";
import { getCategories } from "@/lib/data";
import { getCategoryLabel } from "@/lib/categories";

interface SidebarProps {
  currentCategory?: string;
}

export async function Sidebar({ currentCategory }: SidebarProps) {
  const categories = await getCategories();

  return (
    <aside className="w-64 bg-white border-r border-gray-200 min-h-screen p-4">
      <div className="mb-6">
        <Link href="/" className="text-xl font-bold text-gray-900">
          AI Tools
        </Link>
        <p className="text-sm text-gray-500 mt-1">AI工具集导航</p>
      </div>

      <nav>
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
          分类导航
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
              全部工具
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
                {getCategoryLabel(category)}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}
