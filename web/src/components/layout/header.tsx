export function Header() {
  return (
    <header className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">AI Tools</h1>
            <p className="mt-1 text-sm text-gray-500">
              发现最好用的AI工具
            </p>
          </div>
          <div className="text-sm text-gray-400">
            Powered by AI-Bot.cn
          </div>
        </div>
      </div>
    </header>
  );
}
