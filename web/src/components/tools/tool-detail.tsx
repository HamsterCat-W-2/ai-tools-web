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
    <>
      {/* Detail hero banner */}
      <div className="detail-hero -mx-4 md:-mx-8 px-4 md:px-8 py-8 md:py-10 mb-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-start gap-6">
            {/* Icon + Info */}
            <div className="flex items-start gap-4 flex-1 min-w-0">
              {tool.icon && (
                <img
                  src={tool.icon}
                  alt={tool.name}
                  className="w-14 h-14 md:w-16 md:h-16 rounded-xl object-cover border border-border shrink-0"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none";
                  }}
                />
              )}
              <div className="min-w-0">
                <h1 className="heading-display text-2xl md:text-3xl text-foreground">
                  {tool.name}
                </h1>
                <div className="flex items-center gap-2.5 mt-2 flex-wrap">
                  <span className="inline-flex items-center px-2 py-0.5 text-[10px] font-semibold bg-category-badge-bg text-category-badge-text tracking-wider uppercase">
                    {getCategoryLabel(tool.category, locale)}
                  </span>
                  {detail?.pricing && (
                    <span className="inline-flex items-center px-2 py-0.5 text-[10px] font-semibold bg-accent-glow text-accent tracking-wider uppercase">
                      {detail.pricing}
                    </span>
                  )}
                  {detail?.likeCount != null && detail.likeCount > 0 && (
                    <span className="inline-flex items-center gap-1 text-[11px] text-text-muted">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                      {detail.likeCount}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* CTA button — desktop */}
            <a
              href={tool.url}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden md:inline-flex items-center gap-2 px-6 py-3 bg-accent text-background text-sm font-semibold tracking-wide hover:bg-accent/90 transition-all duration-200 hover:shadow-[0_0_24px_rgba(0,212,255,0.3)] shrink-0 self-start"
            >
              {t("visitWebsite")}
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </a>
          </div>

          {/* Description */}
          <p className="mt-5 text-text-secondary leading-relaxed text-[14px] md:text-[15px]">
            {tool.description}
          </p>

          {/* Tags */}
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
        </div>
      </div>

      {/* Content area */}
      <div className="max-w-4xl mx-auto pb-20 md:pb-0">
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
                        <div key={i} className="overflow-hidden rounded-lg border border-border">
                          <img
                            src={block.content}
                            alt=""
                            className="w-full"
                            loading="lazy"
                          />
                        </div>
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

      {/* Mobile fixed CTA bar */}
      <div className="mobile-cta-bar md:hidden">
        <a
          href={tool.url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 w-full py-3 bg-accent text-background text-sm font-semibold tracking-wide active:bg-accent/80 transition-colors"
        >
          {t("visitWebsite")}
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        </a>
      </div>
    </>
  );
}
