import { ToolsData, AITool, ToolWithDetail } from "@/types/tool";
import { getLocale } from "next-intl/server";
import { rewriteImageUrl } from "@/lib/url";

const API_URL = process.env.API_URL || "http://localhost:8081";

function rewriteTool(tool: AITool): AITool {
  return { ...tool, icon: rewriteImageUrl(tool.icon) };
}

function rewriteToolWithDetail(tool: ToolWithDetail): ToolWithDetail {
  const rewritten = rewriteTool(tool) as ToolWithDetail;
  if (rewritten.detail?.contentHtml) {
    rewritten.detail = {
      ...rewritten.detail,
      contentHtml: rewriteImageUrl(rewritten.detail.contentHtml),
    };
  }
  return rewritten;
}

async function fetchWithLocale(url: string): Promise<Response> {
  const locale = await getLocale();
  return fetch(url, {
    cache: "no-store",
    headers: { "x-locale": locale },
  });
}

export async function getToolsData(): Promise<ToolsData> {
  try {
    const response = await fetchWithLocale(`${API_URL}/api/tools`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data: ToolsData = await response.json();
    return { ...data, tools: data.tools.map(rewriteTool) };
  } catch (error) {
    console.error("Failed to load tools data from API:", error);
    return loadFromLocalFile();
  }
}

async function loadFromLocalFile(): Promise<ToolsData> {
  const fs = await import("fs");
  const path = await import("path");
  const dataPath = path.join(process.cwd(), "..", "data", "tools.json");

  try {
    const fileContent = fs.readFileSync(dataPath, "utf-8");
    const data: ToolsData = JSON.parse(fileContent);
    return { ...data, tools: data.tools.map(rewriteTool) };
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
    const response = await fetchWithLocale(`${API_URL}/api/categories`);
    const data = await response.json();
    return data.categories || [];
  } catch (error) {
    console.error("Failed to load categories:", error);
    const toolsData = await getToolsData();
    return toolsData.categories;
  }
}

export async function getToolsByCategory(category: string): Promise<AITool[]> {
  try {
    const params = new URLSearchParams({ category });
    const response = await fetchWithLocale(
      `${API_URL}/api/tools?${params.toString()}`
    );
    const data = await response.json();
    return (data.tools || []).map(rewriteTool);
  } catch (error) {
    console.error("Failed to load tools by category:", error);
    const toolsData = await getToolsData();
    return toolsData.tools.filter((tool) => tool.category === category);
  }
}

export async function searchTools(keyword: string): Promise<AITool[]> {
  try {
    const params = new URLSearchParams({ keyword });
    const response = await fetchWithLocale(
      `${API_URL}/api/tools/search?${params.toString()}`
    );
    const data = await response.json();
    return (data.tools || []).map(rewriteTool);
  } catch (error) {
    console.error("Failed to search tools:", error);
    return [];
  }
}

export async function getToolDetail(id: string): Promise<ToolWithDetail | null> {
  try {
    const response = await fetchWithLocale(`${API_URL}/api/tools/${id}/detail`);
    if (!response.ok) {
      return null;
    }
    const data = await response.json();
    return rewriteToolWithDetail({ ...data.tool, detail: data.detail } as ToolWithDetail);
  } catch (error) {
    console.error("Failed to load tool detail:", error);
    return null;
  }
}
