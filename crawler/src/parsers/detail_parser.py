"""详情页解析器 - 解析 ai-bot.cn 工具详情页"""

from bs4 import BeautifulSoup
from typing import Optional
import re


class DetailParser:
    """AI工具详情页解析器"""

    def parse(self, html: str, tool_id: str) -> Optional[dict]:
        """解析详情页 HTML

        Args:
            html: 详情页 HTML 内容
            tool_id: 工具 ID

        Returns:
            解析后的详情数据字典
        """
        try:
            soup = BeautifulSoup(html, "lxml")

            # 价格信息
            pricing = self._extract_pricing(soup)

            # 标签
            tags = self._extract_tags(soup)

            # 内容 HTML（主体内容区）
            content_html, screenshots = self._extract_content(soup)

            # FAQ
            faq = self._extract_faq(soup)

            # 点赞数
            like_count = self._extract_int(soup, ".like-count")

            # 评论数
            comment_count = self._extract_int(soup, ".share-count")

            # 发布时间
            published_at = self._extract_meta_time(soup)

            return {
                "tool_id": tool_id,
                "content_html": content_html,
                "screenshots": screenshots,
                "pricing": pricing,
                "faq": faq,
                "tags": tags,
                "like_count": like_count,
                "comment_count": comment_count,
                "published_at": published_at,
            }
        except Exception as e:
            print(f"解析详情页失败 {tool_id}: {e}")
            return None

    def _extract_pricing(self, soup: BeautifulSoup) -> str:
        """提取价格信息"""
        el = soup.select_one("#country")
        if el:
            return el.get_text(strip=True)
        return ""

    def _extract_tags(self, soup: BeautifulSoup) -> list:
        """提取标签"""
        tag_els = soup.select("a[rel='tag']")
        return [el.get_text(strip=True) for el in tag_els if el.get_text(strip=True)]

    def _extract_content(self, soup: BeautifulSoup) -> tuple:
        """提取主体内容为结构化 JSON 数组"""
        content_el = soup.select_one(".panel-body.single")
        if not content_el:
            return [], []

        blocks = []
        screenshots = []

        for child in content_el.children:
            if not hasattr(child, "name") or not child.name:
                continue

            # 标题
            if child.name in ("h2", "h3", "h4"):
                text = child.get_text(strip=True)
                if text:
                    blocks.append({"type": "text", "content": text})

            # 段落
            elif child.name == "p":
                text = child.get_text(strip=True)
                if text:
                    blocks.append({"type": "text", "content": text})

            # 图片
            elif child.name == "img":
                img_url = child.get("data-src") or child.get("src", "")
                img_url = str(img_url)
                if img_url and "placeholder" not in img_url and "t.png" not in img_url:
                    blocks.append({"type": "image", "content": img_url})
                    screenshots.append(img_url)

            # 列表
            elif child.name in ("ul", "ol"):
                for li in child.select("li"):
                    text = li.get_text(strip=True)
                    if text:
                        blocks.append({"type": "text", "content": text})

            # div（可能嵌套了内容）
            elif child.name == "div":
                for el in child.find_all(["h2", "h3", "p", "img", "li"]):
                    if el.name == "img":
                        img_url = el.get("data-src") or el.get("src", "")
                        img_url = str(img_url)
                        if img_url and "placeholder" not in img_url and "t.png" not in img_url:
                            blocks.append({"type": "image", "content": img_url})
                            screenshots.append(img_url)
                    else:
                        text = el.get_text(strip=True)
                        if text:
                            blocks.append({"type": "text", "content": text})

        return blocks, screenshots

    def _extract_faq(self, soup: BeautifulSoup) -> list:
        """提取 FAQ"""
        faq = []
        accordion = soup.select_one("#accordion")
        if not accordion:
            return faq

        for card in accordion.select(".card"):
            question_el = card.select_one(".card-header strong")
            answer_el = card.select_one(".card-body")
            if question_el and answer_el:
                faq.append({
                    "question": question_el.get_text(strip=True),
                    "answer": answer_el.get_text(strip=True),
                })
        return faq

    def _extract_int(self, soup: BeautifulSoup, selector: str) -> int:
        """提取数字"""
        el = soup.select_one(selector)
        if el:
            text = el.get_text(strip=True).replace(",", "")
            try:
                return int(text)
            except ValueError:
                pass
        return 0

    def _extract_meta_time(self, soup: BeautifulSoup) -> str:
        """提取发布时间"""
        el = soup.find("meta", property="article:published_time")
        if el and el.get("content"):
            return str(el["content"])
        return ""
