export interface AITool {
  id: string;
  name: string;
  description: string;
  url: string;
  category: string;
  tags: string[];
  icon: string;
  price: string;
  features: string[];
  crawledAt: string;
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
