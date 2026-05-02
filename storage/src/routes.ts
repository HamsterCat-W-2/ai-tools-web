import { Router, Request, Response } from "express";
import multer from "multer";
import { randomUUID } from "crypto";
import path from "path";
import { minioClient, ensureBucket } from "./minio-client";
import { config } from "./config";

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

// 上传文件
router.post("/upload", upload.single("file"), async (req: Request, res: Response) => {
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
});

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

export default router;
