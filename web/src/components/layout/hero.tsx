"use client";

import { useTranslations } from "next-intl";

interface HeroProps {
  search: string;
  onSearchChange: (value: string) => void;
}

export function Hero({ search, onSearchChange }: HeroProps) {
  const t = useTranslations("Home");
  const tSearch = useTranslations("Search");

  return (
    <section className="hero px-4 md:px-6">
      <div className="max-w-3xl mx-auto text-center">
        {/* Accent line */}
        <div className="flex justify-center mb-6">
          <div className="h-px w-16 bg-gradient-to-r from-transparent via-accent to-transparent" />
        </div>

        {/* Title */}
        <h1
          className="heading-display text-4xl md:text-5xl text-foreground mb-4"
          style={{ animation: "fadeInUp 0.6s ease-out both" }}
        >
          Discover the Best
          <br />
          <span className="bg-gradient-to-r from-[#00d4ff] via-[#7c3aed] to-[#06b6d4] bg-clip-text text-transparent">
            AI Tools
          </span>
        </h1>

        {/* Subtitle */}
        <p
          className="text-text-secondary text-base md:text-lg max-w-xl mx-auto mb-8 leading-relaxed"
          style={{ animation: "fadeInUp 0.6s ease-out 0.1s both" }}
        >
          {t("allTools")}
        </p>

        {/* Search bar */}
        <div
          className="relative max-w-lg mx-auto"
          style={{ animation: "fadeInUp 0.6s ease-out 0.2s both" }}
        >
          <svg
            className="absolute left-4 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-text-muted"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={tSearch("placeholder")}
            className="hero-search w-full pl-11 pr-4 py-3.5 text-sm rounded-none"
          />
        </div>

        {/* Stats */}
        <div
          className="flex justify-center gap-4 md:gap-8 mt-10"
          style={{ animation: "fadeInUp 0.6s ease-out 0.3s both" }}
        >
          <div className="text-center">
            <div className="text-2xl font-semibold text-foreground font-serif">200+</div>
            <div className="text-[11px] text-text-muted tracking-widest uppercase mt-1">Tools</div>
          </div>
          <div className="w-px bg-border" />
          <div className="text-center">
            <div className="text-2xl font-semibold text-foreground font-serif">10+</div>
            <div className="text-[11px] text-text-muted tracking-widest uppercase mt-1">Categories</div>
          </div>
          <div className="w-px bg-border" />
          <div className="text-center">
            <div className="text-2xl font-semibold text-foreground font-serif">Daily</div>
            <div className="text-[11px] text-text-muted tracking-widest uppercase mt-1">Updated</div>
          </div>
        </div>
      </div>
    </section>
  );
}
