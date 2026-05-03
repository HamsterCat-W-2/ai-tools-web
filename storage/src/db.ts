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
  detail_url?: string;
  category: string;
  icon: string;
  tags: string[];
  features: string[];
  pricing?: string;
  crawled_at: string;
  created_at?: string;
  updated_at?: string;
}

export interface ToolDetail {
  tool_id: string;
  content_html: string;
  screenshots: string[];
  pricing: string;
  faq: { question: string; answer: string }[];
  like_count: number;
  comment_count: number;
  published_at: string;
}

export interface ToolWithDetail extends Tool {
  detail?: ToolDetail;
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

// ========== Tool Detail ==========

export async function upsertToolDetail(
  toolId: string,
  detail: ToolDetail
): Promise<void> {
  const pool = getPool();
  const sql = `
    INSERT INTO tool_details (tool_id, content_html, screenshots, pricing, faq, like_count, comment_count, published_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE
      content_html = VALUES(content_html),
      screenshots = VALUES(screenshots),
      pricing = VALUES(pricing),
      faq = VALUES(faq),
      like_count = VALUES(like_count),
      comment_count = VALUES(comment_count),
      published_at = VALUES(published_at)
  `;
  await pool.execute(sql, [
    toolId,
    detail.content_html,
    JSON.stringify(detail.screenshots),
    detail.pricing,
    JSON.stringify(detail.faq),
    detail.like_count,
    detail.comment_count,
    detail.published_at || null,
  ]);
}

export async function getToolDetail(
  toolId: string
): Promise<ToolWithDetail | null> {
  const pool = getPool();
  const sql = `
    SELECT t.*, d.content_html, d.screenshots, d.pricing as detail_pricing,
           d.faq, d.like_count, d.comment_count, d.published_at
    FROM tools t
    LEFT JOIN tool_details d ON t.id = d.tool_id
    WHERE t.id = ?
  `;
  const [rows] = await pool.execute(sql, [toolId]);
  const tools = rows as any[];
  if (tools.length === 0) return null;

  const row = tools[0];
  const tool: ToolWithDetail = {
    id: row.id,
    name: row.name,
    description: row.description,
    url: row.url,
    detail_url: row.detail_url,
    category: row.category,
    icon: row.icon,
    tags: typeof row.tags === "string" ? JSON.parse(row.tags) : row.tags || [],
    features:
      typeof row.features === "string"
        ? JSON.parse(row.features)
        : row.features || [],
    pricing: row.pricing,
    crawled_at: row.crawled_at,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };

  if (row.content_html) {
    tool.detail = {
      tool_id: row.id,
      content_html: row.content_html,
      screenshots:
        typeof row.screenshots === "string"
          ? JSON.parse(row.screenshots)
          : row.screenshots || [],
      pricing: row.detail_pricing || "",
      faq: typeof row.faq === "string" ? JSON.parse(row.faq) : row.faq || [],
      like_count: row.like_count || 0,
      comment_count: row.comment_count || 0,
      published_at: row.published_at || "",
    };
  }

  return tool;
}

// ========== Translations ==========

export interface Translation {
  tool_id: string;
  lang: string;
  field: string;
  value: string;
}

export async function upsertTranslation(
  toolId: string,
  lang: string,
  field: string,
  value: string
): Promise<void> {
  const pool = getPool();
  const sql = `
    INSERT INTO tool_translations (tool_id, lang, field, value)
    VALUES (?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE value = VALUES(value)
  `;
  await pool.execute(sql, [toolId, lang, field, value]);
}

export async function upsertTranslationsBatch(
  translations: Translation[]
): Promise<void> {
  const pool = getPool();
  const sql = `
    INSERT INTO tool_translations (tool_id, lang, field, value)
    VALUES (?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE value = VALUES(value)
  `;
  for (const t of translations) {
    await pool.execute(sql, [t.tool_id, t.lang, t.field, t.value]);
  }
}

export async function getTranslations(
  toolId: string,
  lang: string
): Promise<Record<string, string>> {
  const pool = getPool();
  const [rows] = await pool.execute(
    "SELECT field, value FROM tool_translations WHERE tool_id = ? AND lang = ?",
    [toolId, lang]
  );
  const result: Record<string, string> = {};
  for (const row of rows as any[]) {
    result[row.field] = row.value;
  }
  return result;
}

export async function getToolWithTranslation(
  toolId: string,
  lang?: string
): Promise<ToolWithDetail | null> {
  const tool = await getToolDetail(toolId);
  if (!tool || !lang || lang === "zh") return tool;

  const translations = await getTranslations(toolId, lang);

  // Apply translations to tool fields
  if (translations.name) tool.name = translations.name;
  if (translations.description) tool.description = translations.description;
  if (translations.tags) {
    try {
      tool.tags = JSON.parse(translations.tags);
    } catch {}
  }
  if (translations.features) {
    try {
      tool.features = JSON.parse(translations.features);
    } catch {}
  }

  // Apply translations to detail fields
  if (tool.detail) {
    if (translations.content_blocks) {
      tool.detail.content_html = translations.content_blocks;
    }
    if (translations.faq) {
      try {
        tool.detail.faq = JSON.parse(translations.faq);
      } catch {}
    }
  }

  return tool;
}
