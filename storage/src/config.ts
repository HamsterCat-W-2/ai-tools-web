import dotenv from "dotenv";

dotenv.config();

export const config = {
  // 服务配置
  port: parseInt(process.env.STORAGE_PORT || "9100"),

  // MinIO 配置
  minio: {
    endPoint: process.env.MINIO_ENDPOINT || "localhost",
    port: parseInt(process.env.MINIO_PORT || "9000"),
    useSSL: process.env.MINIO_SECURE === "true",
    accessKey: process.env.MINIO_ACCESS_KEY || "minioadmin",
    secretKey: process.env.MINIO_SECRET_KEY || "minioadmin123",
    bucket: process.env.MINIO_BUCKET || "ai-tools",
  },

  // 公共访问URL
  publicUrl:
    process.env.MINIO_PUBLIC_URL ||
    `http://${process.env.MINIO_ENDPOINT || "localhost"}:${process.env.MINIO_PORT || "9000"}`,
};
