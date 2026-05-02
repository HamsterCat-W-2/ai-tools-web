import { AITool } from "@/types/tool";
import { cn } from "@/lib/utils";
import { getCategoryLabel } from "@/lib/categories";

interface ToolCardProps {
  tool: AITool;
  className?: string;
}

export function ToolCard({ tool, className }: ToolCardProps) {
  return (
    <a
      href={tool.url}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "block bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg hover:border-blue-300 transition-all duration-200",
        className
      )}
    >
      <div className="flex items-start gap-4">
        {tool.icon && (
          <img
            src={tool.icon}
            alt={tool.name}
            className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none";
            }}
          />
        )}
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-gray-900 truncate">
            {tool.name}
          </h3>
          <p className="mt-1 text-sm text-gray-500 line-clamp-2">
            {tool.description}
          </p>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
          {getCategoryLabel(tool.category)}
        </span>
        {tool.tags.slice(0, 3).map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700"
          >
            {tag}
          </span>
        ))}
      </div>

      {tool.features.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          <div className="flex flex-wrap gap-2">
            {tool.features.slice(0, 3).map((feature) => (
              <span
                key={feature}
                className="text-xs text-gray-500"
              >
                {feature}
              </span>
            ))}
          </div>
        </div>
      )}
    </a>
  );
}
