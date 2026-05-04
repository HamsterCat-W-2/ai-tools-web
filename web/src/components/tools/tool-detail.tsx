"use client";

import { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { ToolWithDetail } from "@/types/tool";
import { getCategoryLabel } from "@/lib/categories";
import { Link } from "@/i18n/navigation";

interface ToolDetailProps {
  tool: ToolWithDetail;
}

export function ToolDetailPage({ tool }: ToolDetailProps) {
  const t = useTranslations("ToolDetail");
  const locale = useLocale();
  const detail = tool.detail;
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <Link
            href="/"
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            &larr; {t("backToHome")}
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="lg:w-80 flex-shrink-0">
            <div className="bg-white rounded-xl border border-gray-200 p-6 sticky top-8">
              <div className="flex items-center gap-4">
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
                  <h1 className="text-xl font-bold text-gray-900">
                    {tool.name}
                  </h1>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 mt-1">
                    {getCategoryLabel(tool.category, locale)}
                  </span>
                </div>
              </div>

              <p className="mt-4 text-sm text-gray-600">{tool.description}</p>

              {detail?.pricing && (
                <div className="mt-4">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                    {detail.pricing}
                  </span>
                </div>
              )}

              {tool.tags.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
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

              {detail && (
                <div className="mt-4 flex gap-4 text-sm text-gray-500">
                  {detail.likeCount > 0 && (
                    <span>&#x2764; {detail.likeCount}</span>
                  )}
                  {detail.commentCount > 0 && (
                    <span>&#x1f4ac; {detail.commentCount}</span>
                  )}
                </div>
              )}

              <a
                href={tool.url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-6 block w-full text-center px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                {t("visitWebsite")} &rarr;
              </a>
            </div>
          </div>

          <div className="flex-1 min-w-0">
            {detail?.screenshots && detail.screenshots.length > 0 && (
              <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  {t("screenshots")}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {detail.screenshots.map((src, i) => (
                    <img
                      key={i}
                      src={src}
                      alt={t("screenshotAlt", { name: tool.name, index: i + 1 })}
                      className="rounded-lg border border-gray-100 w-full object-cover"
                      loading="lazy"
                    />
                  ))}
                </div>
              </div>
            )}

            {detail?.contentHtml && (
              <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  {t("detailedIntro")}
                </h2>
                <div className="space-y-4">
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
                              className="rounded-lg border border-gray-100 w-full"
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
                            <p
                              key={i}
                              className="text-sm text-gray-700 leading-relaxed"
                            >
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
              </div>
            )}

            {detail?.faq && detail.faq.length > 0 && (
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  {t("faq")}
                </h2>
                <div className="space-y-2">
                  {detail.faq.map((item, i) => (
                    <div
                      key={i}
                      className="border border-gray-100 rounded-lg overflow-hidden"
                    >
                      <button
                        className="w-full text-left px-4 py-3 flex justify-between items-center hover:bg-gray-50"
                        onClick={() => setOpenFaq(openFaq === i ? null : i)}
                      >
                        <span className="font-medium text-sm text-gray-900">
                          {item.question}
                        </span>
                        <span className="text-gray-400 ml-2">
                          {openFaq === i ? "−" : "+"}
                        </span>
                      </button>
                      {openFaq === i && (
                        <div className="px-4 pb-3 text-sm text-gray-600">
                          {item.answer}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {!detail && (
              <div className="bg-white rounded-xl border border-gray-200 p-12 text-center text-gray-500">
                {t("noDetail")}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
