import mysql from "mysql2/promise";
import { config } from "./config";

let pool: mysql.Pool | null = null;

export function getPool(): mysql.Pool {
  if (!pool) {
    pool = mysql.createPool({
      host: config.mysql.host,
      port: config.mysql.port,
      database: config.mysql.database,
      user: config.mysql.user,
      password: config.mysql.password,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
    });
  }
  return pool;
}

export interface Tool {
  id: string;
  name: string;
  description: string;
  url: string;
  category: string;
  icon: string;
  tags: string[];
  features: string[];
  crawled_at: string;
  created_at?: string;
  updated_at?: string;
}

export async function upsertTool(tool: Tool): Promise<void> {
  const pool = getPool();
  const sql = `
    INSERT INTO tools (id, name, description, url, category, icon, tags, features, crawled_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE
      name = VALUES(name),
      description = VALUES(description),
      url = VALUES(url),
      category = VALUES(category),
      icon = VALUES(icon),
      tags = VALUES(tags),
      features = VALUES(features),
      crawled_at = VALUES(crawled_at)
  `;
  await pool.execute(sql, [
    tool.id,
    tool.name,
    tool.description,
    tool.url,
    tool.category,
    tool.icon,
    JSON.stringify(tool.tags),
    JSON.stringify(tool.features),
    tool.crawled_at,
  ]);
}

export async function upsertTools(tools: Tool[]): Promise<void> {
  for (const tool of tools) {
    await upsertTool(tool);
  }
}

export async function getTools(category?: string): Promise<Tool[]> {
  const pool = getPool();
  let sql = "SELECT * FROM tools";
  const params: string[] = [];

  if (category) {
    sql += " WHERE category = ?";
    params.push(category);
  }

  sql += " ORDER BY name";

  const [rows] = await pool.execute(sql, params);
  return (rows as Tool[]).map((row) => ({
    ...row,
    tags: typeof row.tags === "string" ? JSON.parse(row.tags) : row.tags,
    features:
      typeof row.features === "string"
        ? JSON.parse(row.features)
        : row.features,
  }));
}

export async function getToolById(id: string): Promise<Tool | null> {
  const pool = getPool();
  const [rows] = await pool.execute("SELECT * FROM tools WHERE id = ?", [id]);
  const tools = rows as Tool[];
  if (tools.length === 0) return null;

  const tool = tools[0];
  return {
    ...tool,
    tags: typeof tool.tags === "string" ? JSON.parse(tool.tags) : tool.tags,
    features:
      typeof tool.features === "string"
        ? JSON.parse(tool.features)
        : tool.features,
  };
}

export async function getCategories(): Promise<string[]> {
  const pool = getPool();
  const [rows] = await pool.execute(
    "SELECT DISTINCT category FROM tools ORDER BY category"
  );
  return (rows as { category: string }[]).map((row) => row.category);
}

export async function getToolsCount(): Promise<number> {
  const pool = getPool();
  const [rows] = await pool.execute("SELECT COUNT(*) as count FROM tools");
  return (rows as { count: number }[])[0].count;
}

export async function deleteTool(id: string): Promise<void> {
  const pool = getPool();
  await pool.execute("DELETE FROM tools WHERE id = ?", [id]);
}
