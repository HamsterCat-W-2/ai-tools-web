import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI Tools - AI工具集导航",
  description: "发现最好用的AI工具，收录ChatGPT、Midjourney等热门AI应用",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" className="h-full antialiased">
      <body className="min-h-full flex flex-col font-sans">{children}</body>
    </html>
  );
}
