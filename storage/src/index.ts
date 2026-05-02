import express from "express";
import cors from "cors";
import { config } from "./config";
import routes from "./routes";

const app = express();

// 中间件
app.use(cors());
app.use(express.json());

// 路由
app.use("/api/storage", routes);

// 健康检查
app.get("/health", (req, res) => {
  res.json({ status: "ok", service: "storage" });
});

// 启动服务
app.listen(config.port, () => {
  console.log(`Storage service running on port ${config.port}`);
  console.log(`MinIO endpoint: ${config.minio.endPoint}:${config.minio.port}`);
});
