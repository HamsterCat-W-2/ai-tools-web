export const categoryLabels: Record<string, string> = {
  chatbot: "AI聊天",
  image: "AI绘画",
  coding: "AI编程",
  writing: "AI写作",
  video: "AI视频",
  audio: "AI音频",
  design: "AI设计",
  office: "AI办公",
  search: "AI搜索",
  other: "其他",
};

export function getCategoryLabel(key: string): string {
  return categoryLabels[key] || key;
}
