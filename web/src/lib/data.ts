import { ToolsData, AITool } from "@/types/tool";

const API_URL = process.env.API_URL || "http://localhost:8081";

export async function getToolsData(): Promise<ToolsData> {
  try {
    const response = await fetch(`${API_URL}/api/tools`, {
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

export async function getToolsByCategory(category: string): Promise<AITool[]> {
  try {
    const response = await fetch(`${API_URL}/api/tools?category=${category}`);
    const data = await response.json();
    return data.tools || [];
  } catch (error) {
    console.error("Failed to load tools by category:", error);
    const toolsData = await getToolsData();
    return toolsData.tools.filter((tool) => tool.category === category);
  }
}

export async function searchTools(keyword: string): Promise<AITool[]> {
  try {
    const response = await fetch(
      `${API_URL}/api/tools?keyword=${encodeURIComponent(keyword)}`
    );
    const data = await response.json();
    return data.tools || [];
  } catch (error) {
    console.error("Failed to search tools:", error);
    return [];
  }
}
