import { ToolsData, AITool } from "@/types/tool";
import fs from "fs";
import path from "path";

let cachedData: ToolsData | null = null;

function loadRawData(): ToolsData {
  if (cachedData) return cachedData;

  const dataPath = path.join(process.cwd(), "..", "data", "tools.json");

  try {
    const fileContent = fs.readFileSync(dataPath, "utf-8");
    cachedData = JSON.parse(fileContent);
    return cachedData!;
  } catch (error) {
    console.error("Failed to load tools data:", error);
    return {
      tools: [],
      categories: [],
      lastUpdated: new Date().toISOString(),
    };
  }
}

export async function getToolsData(): Promise<ToolsData> {
  return loadRawData();
}

export async function getCategories(): Promise<string[]> {
  const data = loadRawData();
  return data.categories;
}

export async function getToolsByCategory(category: string): Promise<AITool[]> {
  const data = loadRawData();
  return data.tools.filter((tool) => tool.category === category);
}

export async function getToolsCount(): Promise<number> {
  const data = loadRawData();
  return data.tools.length;
}
