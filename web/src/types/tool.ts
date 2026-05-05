export interface AITool {
  id: string;
  name: string;
  description: string;
  url: string;
  detail_url?: string;
  category: string;
  tags: string[];
  icon: string;
  pricing?: string;
  features: string[];
  crawledAt: string;
}

export interface FAQItem {
  question: string;
  answer: string;
}

export interface ToolDetail {
  toolId: string;
  contentHtml: string;
  screenshots: string[];
  pricing: string;
  faq: FAQItem[];
  likeCount: number;
  commentCount: number;
  publishedAt: string;
}

export interface ToolWithDetail extends AITool {
  detail?: ToolDetail;
}

export interface ToolsData {
  tools: AITool[];
  categories: string[];
  lastUpdated: string;
}

export interface FilterState {
  search: string;
  category: string;
}
