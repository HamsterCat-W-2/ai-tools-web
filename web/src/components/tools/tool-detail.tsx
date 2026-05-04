"use client";

import { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { ToolWithDetail } from "@/types/tool";
import { getCategoryLabel } from "@/lib/categories";

interface ToolDetailProps {
  tool: ToolWithDetail;
}

export function ToolDetailPage({ tool }: ToolDetailProps) {
  const t = useTranslations("ToolDetail");
  const locale = useLocale();
  const detail = tool.detail;
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div className="max-w-4xl mx-auto">
      {/* 工具头部信息 */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          {tool.icon && (
            <img
              src={tool.icon}
              alt={tool.name}
              className="w-16 h-16 rounded-xl object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none";
              }}
            />
          )}
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{tool.name}</h1>
            <div className="flex items-center gap-3 mt-1">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                {getCategoryLabel(tool.category, locale)}
              </span>
              {detail?.pricing && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  {detail.pricing}
                </span>
              )}
            </div>
          </div>
        </div>

        <p className="text-gray-600 leading-relaxed">{tool.description}</p>

        {tool.tags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {tool.tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-gray-100 text-gray-600"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        <a
          href={tool.url}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 inline-block px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm"
        >
          {t("visitWebsite")} &rarr;
        </a>
      </div>

      {/* 截图 */}
      {detail?.screenshots && detail.screenshots.length > 0 && (
        <section className="mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {detail.screenshots.map((src, i) => (
              <img
                key={i}
                src={src}
                alt={t("screenshotAlt", { name: tool.name, index: i + 1 })}
                className="rounded-lg border border-gray-200 w-full object-cover"
                loading="lazy"
              />
            ))}
          </div>
        </section>
      )}

      {/* 详细介绍 */}
      {detail?.contentHtml && (
        <section className="mb-8">
          <div className="text-gray-700 leading-relaxed space-y-4">
            {(() => {
              try {
                const blocks =
                  typeof detail.contentHtml === "string"
                    ? JSON.parse(detail.contentHtml)
                    : detail.contentHtml;
                return blocks.map(
                  (
                    block: {
                      type: string;
                      style?: string;
                      content: string;
                    },
                    i: number
                  ) =>
                    block.type === "image" ? (
                      <img
                        key={i}
                        src={block.content}
                        alt=""
                        className="rounded-lg border border-gray-200 w-full"
                        loading="lazy"
                      />
                    ) : block.style === "heading" ? (
                      <h3
                        key={i}
                        className="text-base font-semibold text-gray-900 mt-6 first:mt-0"
                      >
                        {block.content}
                      </h3>
                    ) : (
                      <p key={i} className="text-sm leading-relaxed">
                        {block.content}
                      </p>
                    )
                );
              } catch {
                return (
                  <div
                    className="prose prose-sm max-w-none"
                    dangerouslySetInnerHTML={{
                      __html: detail.contentHtml,
                    }}
                  />
                );
              }
            })()}
          </div>
        </section>
      )}

      {/* FAQ */}
      {detail?.faq && detail.faq.length > 0 && (
        <section className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            {t("faq")}
          </h2>
          <div className="space-y-2">
            {detail.faq.map((item, i) => (
              <div
                key={i}
                className="border border-gray-200 rounded-lg overflow-hidden"
              >
                <button
                  className="w-full text-left px-4 py-3 flex justify-between items-center hover:bg-gray-50 transition-colors"
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                >
                  <span className="font-medium text-sm text-gray-900">
                    {item.question}
                  </span>
                  <span className="text-gray-400 ml-2 text-lg">
                    {openFaq === i ? "−" : "+"}
                  </span>
                </button>
                {openFaq === i && (
                  <div className="px-4 pb-3 text-sm text-gray-600 border-t border-gray-100 pt-3">
                    {item.answer}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 无详情时的提示 */}
      {!detail && (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center text-gray-500">
          {t("noDetail")}
        </div>
      )}
    </div>
  );
}
