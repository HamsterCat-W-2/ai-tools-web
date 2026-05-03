import { ToolsData, AITool, ToolWithDetail } from "@/types/tool";

const API_URL = process.env.API_URL || "http://localhost:8081";

export async function getToolsData(lang?: string): Promise<ToolsData> {
  try {
    const params = new URLSearchParams();
    if (lang) params.set("lang", lang);
    const query = params.toString();
    const url = query ? `${API_URL}/api/tools?${query}` : `${API_URL}/api/tools`;

    const response = await fetch(url, {
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Failed to load tools data from API:", error);
    // 回退到本地JSON文件
    return loadFromLocalFile();
  }
}

async function loadFromLocalFile(): Promise<ToolsData> {
  const fs = await import("fs");
  const path = await import("path");
  const dataPath = path.join(process.cwd(), "..", "data", "tools.json");

  try {
    const fileContent = fs.readFileSync(dataPath, "utf-8");
    return JSON.parse(fileContent);
  } catch (error) {
    console.error("Failed to load tools data from file:", error);
    return {
      tools: [],
      categories: [],
      lastUpdated: new Date().toISOString(),
    };
  }
}

export async function getCategories(): Promise<string[]> {
  try {
    const response = await fetch(`${API_URL}/api/categories`);
    const data = await response.json();
    return data.categories || [];
  } catch (error) {
    console.error("Failed to load categories:", error);
    const toolsData = await getToolsData();
    return toolsData.categories;
  }
}

export async function getToolsByCategory(category: string, lang?: string): Promise<AITool[]> {
  try {
    const params = new URLSearchParams({ category });
    if (lang) params.set("lang", lang);
    const response = await fetch(`${API_URL}/api/tools?${params.toString()}`);
    const data = await response.json();
    return data.tools || [];
  } catch (error) {
    console.error("Failed to load tools by category:", error);
    const toolsData = await getToolsData(lang);
    return toolsData.tools.filter((tool) => tool.category === category);
  }
}

export async function searchTools(keyword: string, lang?: string): Promise<AITool[]> {
  try {
    const params = new URLSearchParams({ keyword });
    if (lang) params.set("lang", lang);
    const response = await fetch(
      `${API_URL}/api/tools/search?${params.toString()}`
    );
    const data = await response.json();
    return data.tools || [];
  } catch (error) {
    console.error("Failed to search tools:", error);
    return [];
  }
}

export async function getToolDetail(id: string, lang?: string): Promise<ToolWithDetail | null> {
  try {
    const params = new URLSearchParams();
    if (lang) params.set("lang", lang);
    const query = params.toString();
    const url = query
      ? `${API_URL}/api/tools/${id}/detail?${query}`
      : `${API_URL}/api/tools/${id}/detail`;

    const response = await fetch(url, {
      cache: "no-store",
    });
    if (!response.ok) {
      return null;
    }
    const data = await response.json();
    // API 返回 {tool: {...}, detail: {...}}，合并为扁平结构
    return { ...data.tool, detail: data.detail } as ToolWithDetail;
  } catch (error) {
    console.error("Failed to load tool detail:", error);
    return null;
  }
}
