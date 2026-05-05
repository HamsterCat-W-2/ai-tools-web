import express from "express";
import cors from "cors";
import { config } from "./config";
import routes from "./routes";

const app = express();

// 中间件
app.use(cors());
app.use(express.json({ limit: "10mb" }));

// 路由
app.use("/api/storage", routes);

// 工具数据接口（直接路径，方便调用）
app.get("/api/tools", async (req, res) => {
  try {
    const { getTools, getCategories, getToolsCount } = await import("./db");
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

// 健康检查
app.get("/health", (req, res) => {
  res.json({ status: "ok", service: "storage" });
});

// 启动服务
app.listen(config.port, () => {
  console.log(`Storage service running on port ${config.port}`);
  console.log(`MinIO endpoint: ${config.minio.endPoint}:${config.minio.port}`);
  console.log(`MySQL host: ${config.mysql.host}:${config.mysql.port}`);
});
