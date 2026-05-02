import { ToolsData } from "@/types/tool";
import fs from "fs";
import path from "path";

export async function getToolsData(): Promise<ToolsData> {
  const dataPath = path.join(process.cwd(), "..", "data", "tools.json");

  try {
    const fileContent = fs.readFileSync(dataPath, "utf-8");
    return JSON.parse(fileContent);
  } catch (error) {
    console.error("Failed to load tools data:", error);
    return {
      tools: [],
      categories: [],
      lastUpdated: new Date().toISOString(),
    };
  }
}
