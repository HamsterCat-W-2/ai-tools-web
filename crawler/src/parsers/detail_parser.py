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
            soup = BeautifulSoup(html, "html.parser")

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
        """提取主体内容 HTML 和截图列表"""
        content_el = soup.select_one(".panel-body.single")
        if not content_el:
            return "", []

        screenshots = []
        # 收集内容区的图片 URL
        for img in content_el.select("img"):
            img_url = img.get("data-src") or img.get("src", "")
            if img_url and "placeholder" not in str(img_url) and "t.png" not in str(img_url):
                screenshots.append(str(img_url))

        # 获取处理后的 HTML
        content_html = str(content_el)
        return content_html, screenshots

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
