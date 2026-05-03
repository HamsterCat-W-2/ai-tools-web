import { Router, Request, Response } from "express";
import multer from "multer";
import { randomUUID } from "crypto";
import path from "path";
import { minioClient, ensureBucket } from "./minio-client";
import { config } from "./config";
import {
  getPool,
  getTools,
  getToolById,
  getCategories,
  getToolsCount,
  upsertTool,
  upsertTools,
  deleteTool,
  upsertToolDetail,
  getToolDetail,
  upsertTranslation,
  upsertTranslationsBatch,
  getToolWithTranslation,
  Tool,
  ToolDetail,
  Translation,
} from "./db";

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

// ========== 文件上传接口 ==========

// 上传文件
router.post(
  "/upload",
  upload.single("file"),
  async (req: Request, res: Response) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No file provided" });
      }

      await ensureBucket();

      const ext = path.extname(req.file.originalname);
      const objectName = `uploads/${randomUUID()}${ext}`;

      await minioClient.putObject(
        config.minio.bucket,
        objectName,
        req.file.buffer,
        req.file.size,
        { "Content-Type": req.file.mimetype }
      );

      const url = `${config.publicUrl}/${config.minio.bucket}/${objectName}`;

      res.json({ url, objectName, size: req.file.size });
    } catch (error) {
      console.error("Upload failed:", error);
      res.status(500).json({ error: "Upload failed" });
    }
  }
);

// 上传文件（指定路径）
router.post(
  "/upload/:folder",
  upload.single("file"),
  async (req: Request, res: Response) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No file provided" });
      }

      await ensureBucket();

      const ext = path.extname(req.file.originalname);
      const folder = req.params.folder || "uploads";
      const objectName = `${folder}/${randomUUID()}${ext}`;

      await minioClient.putObject(
        config.minio.bucket,
        objectName,
        req.file.buffer,
        req.file.size,
        { "Content-Type": req.file.mimetype }
      );

      const url = `${config.publicUrl}/${config.minio.bucket}/${objectName}`;

      res.json({ url, objectName, size: req.file.size });
    } catch (error) {
      console.error("Upload failed:", error);
      res.status(500).json({ error: "Upload failed" });
    }
  }
);

// 获取文件URL
router.get("/url/:objectName(*)", async (req: Request, res: Response) => {
  const objectName = req.params.objectName;
  const url = `${config.publicUrl}/${config.minio.bucket}/${objectName}`;
  res.json({ url });
});

// 列出文件
router.get("/list", async (req: Request, res: Response) => {
  try {
    const prefix = (req.query.prefix as string) || "";
    const objects = minioClient.listObjects(config.minio.bucket, prefix, true);

    const files: string[] = [];
    for await (const obj of objects) {
      files.push(obj.name!);
    }

    res.json({ files, count: files.length });
  } catch (error) {
    console.error("List failed:", error);
    res.status(500).json({ error: "List failed" });
  }
});

// 删除文件
router.delete("/:objectName(*)", async (req: Request, res: Response) => {
  try {
    const objectName = req.params.objectName;
    await minioClient.removeObject(config.minio.bucket, objectName);
    res.json({ success: true });
  } catch (error) {
    console.error("Delete failed:", error);
    res.status(500).json({ error: "Delete failed" });
  }
});

// ========== 工具数据接口 ==========

// 获取工具列表
router.get("/tools", async (req: Request, res: Response) => {
  try {
    const category = req.query.category as string | undefined;
    const tools = await getTools(category);
    const categories = await getCategories();
    const count = await getToolsCount();

    res.json({
      tools,
      categories,
      total: count,
      lastUpdated: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Get tools failed:", error);
    res.status(500).json({ error: "Failed to get tools" });
  }
});

// 获取单个工具
router.get("/tools/:id", async (req: Request, res: Response) => {
  try {
    const tool = await getToolById(req.params.id);
    if (!tool) {
      return res.status(404).json({ error: "Tool not found" });
    }
    res.json(tool);
  } catch (error) {
    console.error("Get tool failed:", error);
    res.status(500).json({ error: "Failed to get tool" });
  }
});

// 获取分类列表
router.get("/categories", async (req: Request, res: Response) => {
  try {
    const categories = await getCategories();
    res.json({ categories });
  } catch (error) {
    console.error("Get categories failed:", error);
    res.status(500).json({ error: "Failed to get categories" });
  }
});

// 创建/更新工具
router.post("/tools", async (req: Request, res: Response) => {
  try {
    const tool: Tool = req.body;
    await upsertTool(tool);
    res.json({ success: true });
  } catch (error) {
    console.error("Upsert tool failed:", error);
    res.status(500).json({ error: "Failed to save tool" });
  }
});

// 批量创建/更新工具
router.post("/tools/batch", async (req: Request, res: Response) => {
  try {
    const tools: Tool[] = req.body.tools;
    await upsertTools(tools);
    res.json({ success: true, count: tools.length });
  } catch (error) {
    console.error("Batch upsert failed:", error);
    res.status(500).json({ error: "Failed to save tools" });
  }
});

// 删除工具
router.delete("/tools/:id", async (req: Request, res: Response) => {
  try {
    await deleteTool(req.params.id);
    res.json({ success: true });
  } catch (error) {
    console.error("Delete tool failed:", error);
    res.status(500).json({ error: "Failed to delete tool" });
  }
});

// ========== 工具详情接口 ==========

// 获取工具详情（含基础信息）
router.get("/tools/:id/detail", async (req: Request, res: Response) => {
  try {
    const lang = req.query.lang as string | undefined;
    const tool = await getToolWithTranslation(req.params.id, lang);
    if (!tool) {
      return res.status(404).json({ error: "Tool not found" });
    }
    res.json(tool);
  } catch (error) {
    console.error("Get tool detail failed:", error);
    res.status(500).json({ error: "Failed to get tool detail" });
  }
});

// 创建/更新工具详情
router.post("/tools/:id/detail", async (req: Request, res: Response) => {
  try {
    const detail: ToolDetail = { ...req.body, tool_id: req.params.id };
    await upsertToolDetail(req.params.id, detail);
    res.json({ success: true });
  } catch (error) {
    console.error("Upsert tool detail failed:", error);
    res.status(500).json({ error: "Failed to save tool detail" });
  }
});

// 批量创建/更新工具详情
router.post("/tools/details/batch", async (req: Request, res: Response) => {
  try {
    const details: ToolDetail[] = req.body.details;
    let count = 0;
    for (const detail of details) {
      await upsertToolDetail(detail.tool_id, detail);
      count++;
    }
    res.json({ success: true, count });
  } catch (error) {
    console.error("Batch upsert details failed:", error);
    res.status(500).json({ error: "Failed to save tool details" });
  }
});

// ========== 翻译接口 ==========

// 写入单条翻译
router.post("/tools/:id/translations", async (req: Request, res: Response) => {
  try {
    const { lang, field, value } = req.body;
    if (!lang || !field || value === undefined) {
      return res.status(400).json({ error: "lang, field, value are required" });
    }
    await upsertTranslation(req.params.id, lang, field, value);
    res.json({ success: true });
  } catch (error) {
    console.error("Upsert translation failed:", error);
    res.status(500).json({ error: "Failed to save translation" });
  }
});

// 批量写入翻译
router.post("/tools/translations/batch", async (req: Request, res: Response) => {
  try {
    const translations: Translation[] = req.body.translations;
    if (!Array.isArray(translations)) {
      return res.status(400).json({ error: "translations array is required" });
    }
    await upsertTranslationsBatch(translations);
    res.json({ success: true, count: translations.length });
  } catch (error) {
    console.error("Batch upsert translations failed:", error);
    res.status(500).json({ error: "Failed to save translations" });
  }
});

// 检查工具是否有翻译
router.get("/translations/check", async (req: Request, res: Response) => {
  try {
    const toolId = req.query.tool_id as string;
    const lang = req.query.lang as string;

    if (!toolId || !lang) {
      return res.status(400).json({ error: "tool_id and lang are required" });
    }

    const pool = getPool();
    const [rows] = await pool.execute(
      "SELECT COUNT(*) as count FROM tool_translations WHERE tool_id = ? AND lang = ?",
      [toolId, lang]
    );
    const count = (rows as any[])[0].count;

    res.json({ exists: count > 0 });
  } catch (error) {
    console.error("Check translations failed:", error);
    res.status(500).json({ error: "Failed to check translations" });
  }
});

export default router;
