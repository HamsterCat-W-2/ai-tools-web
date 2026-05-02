"""工具信息解析器"""

from bs4 import BeautifulSoup, Tag
from typing import Optional
import sys
import os

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "../.."))
from src.utils.helpers import generate_tool_id, get_current_time


class ToolParser:
    """AI工具信息解析器"""

    def parse_tool_card(self, card: Tag, category: str = "") -> Optional[dict]:
        """解析工具卡片元素"""
        try:
            # 提取工具名称
            name_elem = card.select_one("strong")
            if not name_elem:
                return None
            name = name_elem.get_text(strip=True)

            # 提取描述
            desc_elem = card.select_one("p.text-muted, .text-muted")
            description = desc_elem.get_text(strip=True) if desc_elem else ""

            # 提取链接
            url = str(card.get("href", ""))
            if url and not url.startswith("http"):
                url = f"https://ai-bot.cn{url}"

            # 提取外部链接（data-url属性）
            external_url = str(card.get("data-url", ""))

            # 提取图标
            icon_elem = card.select_one("img")
            icon = ""
            if icon_elem:
                icon = str(icon_elem.get("data-src", icon_elem.get("src", "")))

            # 提取data-id作为工具ID
            tool_id = str(card.get("data-id", ""))
            if not tool_id:
                tool_id = generate_tool_id(name, url)

            # 提取title属性作为特性描述
            title_attr = card.get("title", "")
            features = [title_attr] if title_attr else []

            return {
                "id": tool_id,
                "name": name,
                "description": description,
                "url": external_url or url,
                "detailUrl": url,
                "category": category,
                "tags": [],
                "icon": icon,
                "price": "",
                "features": features,
                "crawledAt": get_current_time(),
            }
        except Exception as e:
            print(f"解析工具卡片失败: {e}")
            return None

    def parse_tools_page(self, html: str, category: str = "") -> list[dict]:
        """解析工具列表页面"""
        soup = BeautifulSoup(html, "html.parser")
        tools = []

        # 查找工具卡片：a.card[class*="site-"]
        cards = soup.select('a.card[class*="site-"]')

        for card in cards:
            tool = self.parse_tool_card(card, category)
            if tool:
                tools.append(tool)

        return tools

    def parse_categories(self, html: str) -> list[dict]:
        """解析分类列表"""
        soup = BeautifulSoup(html, "html.parser")
        categories = []

        # 查找分类导航 - 根据实际结构调整
        # 常见位置：侧边栏、顶部导航
        nav_selectors = [
            ".sidebar a[href*='cat']",
            ".nav a[href*='category']",
            "a[href*='/sites/']",
        ]

        seen_urls = set()
        for selector in nav_selectors:
            links = soup.select(selector)
            for link in links:
                href = str(link.get("href", ""))
                text = link.get_text(strip=True)
                if text and href and href not in seen_urls:
                    seen_urls.add(href)
                    categories.append({
                        "name": text,
                        "url": href if href.startswith("http") else f"https://ai-bot.cn{href}",
                    })

        return categories
