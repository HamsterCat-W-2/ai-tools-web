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
    <div className="max-w-3xl">
      {/* Tool header */}
      <div className="mb-10">
        <div className="flex items-start gap-4 mb-5">
          {tool.icon && (
            <img
              src={tool.icon}
              alt={tool.name}
              className="w-14 h-14 rounded-xl object-cover border border-border"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none";
              }}
            />
          )}
          <div>
            <h1 className="heading-display text-2xl text-foreground">
              {tool.name}
            </h1>
            <div className="flex items-center gap-2.5 mt-2">
              <span className="inline-flex items-center px-2 py-0.5 text-[10px] font-semibold bg-category-badge-bg text-category-badge-text tracking-wider uppercase">
                {getCategoryLabel(tool.category, locale)}
              </span>
              {detail?.pricing && (
                <span className="inline-flex items-center px-2 py-0.5 text-[10px] font-semibold bg-accent-glow text-accent tracking-wider uppercase">
                  {detail.pricing}
                </span>
              )}
            </div>
          </div>
        </div>

        <p className="text-text-secondary leading-relaxed text-[15px]">
          {tool.description}
        </p>

        {tool.tags.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-1.5">
            {tool.tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center px-2 py-0.5 text-[10px] bg-badge-bg text-badge-text tracking-wide"
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
          className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 bg-accent text-background text-sm font-semibold tracking-wide hover:bg-accent/90 transition-all duration-200 hover:shadow-[0_0_20px_rgba(0,212,255,0.3)]"
        >
          {t("visitWebsite")}
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        </a>
      </div>

      {/* Screenshots */}
      {detail?.screenshots && detail.screenshots.length > 0 && (
        <section className="mb-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {detail.screenshots.map((src, i) => (
              <img
                key={i}
                src={src}
                alt={t("screenshotAlt", { name: tool.name, index: i + 1 })}
                className="border border-border rounded-lg w-full object-cover"
                loading="lazy"
              />
            ))}
          </div>
        </section>
      )}

      {/* Content */}
      {detail?.contentHtml && (
        <section className="mb-10">
          <div className="text-text-secondary leading-relaxed space-y-4">
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
                        className="border border-border rounded-lg w-full"
                        loading="lazy"
                      />
                    ) : block.style === "heading" ? (
                      <h3
                        key={i}
                        className="heading-section text-base text-foreground mt-8 first:mt-0"
                      >
                        {block.content}
                      </h3>
                    ) : (
                      <p
                        key={i}
                        className="text-[14px] leading-[1.8] text-text-secondary"
                      >
                        {block.content}
                      </p>
                    )
                );
              } catch {
                return (
                  <div
                    className="prose prose-sm prose-invert max-w-none"
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
        <section className="mb-10">
          <h2 className="heading-section text-lg text-foreground mb-5">
            {t("faq")}
          </h2>
          <div className="border border-border rounded-lg overflow-hidden divide-y divide-border">
            {detail.faq.map((item, i) => (
              <div key={i} className="bg-surface">
                <button
                  className="w-full text-left px-5 py-4 flex justify-between items-start gap-4 group"
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                >
                  <span className="text-[14px] font-medium text-foreground group-hover:text-accent transition-colors">
                    {item.question}
                  </span>
                  <span
                    className={`text-text-muted text-sm mt-0.5 shrink-0 transition-transform duration-200 ${
                      openFaq === i ? "rotate-45" : ""
                    }`}
                  >
                    +
                  </span>
                </button>
                {openFaq === i && (
                  <div className="px-5 pb-4 text-[14px] text-text-secondary leading-relaxed">
                    {item.answer}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* No detail */}
      {!detail && (
        <div className="glass-card p-16 text-center text-text-muted text-sm">
          {t("noDetail")}
        </div>
      )}
    </div>
  );
}
