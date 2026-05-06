const MINIO_ORIGIN = process.env.MINIO_ORIGIN || "http://localhost:9000";
const MINIO_PUBLIC_URL = process.env.MINIO_PUBLIC_URL || "";

export function rewriteImageUrl(url: string): string {
  if (!MINIO_PUBLIC_URL || !url) return url;
  return url.replace(MINIO_ORIGIN, MINIO_PUBLIC_URL);
}
