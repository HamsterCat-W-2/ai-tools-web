export const categoryLabels: Record<string, Record<string, string>> = {
  chatbot: { zh: "AI聊天", en: "AI Chat" },
  image: { zh: "AI绘画", en: "AI Image" },
  coding: { zh: "AI编程", en: "AI Coding" },
  writing: { zh: "AI写作", en: "AI Writing" },
  video: { zh: "AI视频", en: "AI Video" },
  audio: { zh: "AI音频", en: "AI Audio" },
  design: { zh: "AI设计", en: "AI Design" },
  office: { zh: "AI办公", en: "AI Office" },
  search: { zh: "AI搜索", en: "AI Search" },
  other: { zh: "其他", en: "Other" },
};

export function getCategoryLabel(key: string, locale: string = "en"): string {
  const labels = categoryLabels[key];
  if (!labels) return key;
  return labels[locale] || labels["en"] || key;
}
