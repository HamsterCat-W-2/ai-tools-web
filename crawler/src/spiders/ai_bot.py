"""ai-bot.cn 爬虫实现"""

import requests
import time
from typing import Optional
import sys
import os

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "../.."))
from config import TARGET_URL, REQUEST_HEADERS, REQUEST_TIMEOUT, REQUEST_DELAY
from src.parsers.tool_parser import ToolParser


class AIBotSpider:
    """ai-bot.cn 爬虫"""

    def __init__(self):
        self.session = requests.Session()
        self.session.headers.update(REQUEST_HEADERS)
        self.parser = ToolParser()

    def fetch_page(self, url: str) -> Optional[str]:
        """获取页面HTML"""
        try:
            response = self.session.get(url, timeout=REQUEST_TIMEOUT)
            response.raise_for_status()
            response.encoding = response.apparent_encoding
            return response.text
        except requests.RequestException as e:
            print(f"请求失败 {url}: {e}")
            return None

    def crawl_homepage(self) -> dict:
        """爬取首页，获取工具列表"""
        print(f"正在爬取首页: {TARGET_URL}")
        html = self.fetch_page(TARGET_URL)
        if not html:
            return {"categories": [], "tools": []}

        # 解析首页工具
        tools = self.parser.parse_tools_page(html, "首页推荐")
        print(f"首页发现 {len(tools)} 个工具")

        # 提取分类
        categories = list(set(t["category"] for t in tools if t["category"]))

        return {
            "categories": categories,
            "tools": tools,
        }

    def crawl_category(self, category_url: str, category_name: str) -> list[dict]:
        """爬取分类页面"""
        print(f"正在爬取分类: {category_name} ({category_url})")
        time.sleep(REQUEST_DELAY)

        html = self.fetch_page(category_url)
        if not html:
            return []

        tools = self.parser.parse_tools_page(html, category_name)
        print(f"分类 {category_name} 发现 {len(tools)} 个工具")
        return tools

    def crawl(self) -> dict:
        """执行完整爬取流程"""
        print("=" * 50)
        print("开始爬取 ai-bot.cn")
        print("=" * 50)

        # 爬取首页
        result = self.crawl_homepage()
        all_tools = result["tools"]

        # 根据工具名称自动分类
        category_keywords = {
            "chatbot": ["chat", "对话", "聊天", "助手", "chatgpt", "claude", "gemini"],
            "image": ["绘画", "图像", "图片", "画", "midjourney", "stable diffusion", "dall-e"],
            "coding": ["编程", "代码", "code", "copilot", "cursor", "开发"],
            "writing": ["写作", "文案", "文章", "文本"],
            "video": ["视频", "video", "sora"],
            "audio": ["音频", "音乐", "语音", "music", "suno"],
            "design": ["设计", "design", "ui"],
            "office": ["办公", "文档", "ppt", "表格", "excel"],
            "search": ["搜索", "search", "检索"],
        }

        for tool in all_tools:
            if not tool["category"] or tool["category"] == "首页推荐":
                name_lower = tool["name"].lower()
                desc_lower = tool["description"].lower()
                for cat, keywords in category_keywords.items():
                    if any(kw in name_lower or kw in desc_lower for kw in keywords):
                        tool["category"] = cat
                        break
                if not tool["category"] or tool["category"] == "首页推荐":
                    tool["category"] = "other"

        # 去重
        seen_ids = set()
        unique_tools = []
        for tool in all_tools:
            if tool["id"] not in seen_ids:
                seen_ids.add(tool["id"])
                unique_tools.append(tool)

        # 获取所有分类
        categories = sorted(list(set(t["category"] for t in unique_tools)))

        print("=" * 50)
        print(f"爬取完成，共获取 {len(unique_tools)} 个工具")
        print(f"分类: {', '.join(categories)}")
        print("=" * 50)

        return {
            "tools": unique_tools,
            "categories": categories,
        }
