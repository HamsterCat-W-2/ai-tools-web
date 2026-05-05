"""详情页爬虫 - 爬取 ai-bot.cn 工具详情页"""

import requests
import time
from typing import Optional
import sys
import os

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "../.."))
from config import REQUEST_HEADERS, REQUEST_TIMEOUT, REQUEST_DELAY
from src.parsers.detail_parser import DetailParser


DETAIL_URL_TEMPLATE = "https://ai-bot.cn/sites/{id}.html"


class DetailSpider:
    """ai-bot.cn 详情页爬虫"""

    def __init__(self):
        self.session = requests.Session()
        self.session.headers.update(REQUEST_HEADERS)
        self.parser = DetailParser()

    def fetch_detail(self, tool_id: str) -> Optional[str]:
        """获取详情页 HTML"""
        url = DETAIL_URL_TEMPLATE.format(id=tool_id)
        try:
            response = self.session.get(url, timeout=REQUEST_TIMEOUT)
            response.raise_for_status()
            response.encoding = response.apparent_encoding
            return response.text
        except requests.RequestException as e:
            print(f"请求详情页失败 {url}: {e}")
            return None

    def crawl_detail(self, tool_id: str) -> Optional[dict]:
        """爬取单个工具详情页"""
        html = self.fetch_detail(tool_id)
        if not html:
            return None
        return self.parser.parse(html, tool_id)

    def crawl_details(self, tool_ids: list) -> list:
        """批量爬取详情页

        Args:
            tool_ids: 工具 ID 列表

        Returns:
            解析后的详情数据列表
        """
        results = []
        total = len(tool_ids)

        for i, tool_id in enumerate(tool_ids):
            print(f"  [{i+1}/{total}] 爬取详情: {tool_id}")
            detail = self.crawl_detail(tool_id)
            if detail:
                results.append(detail)
                print(f"    -> 成功 (截图: {len(detail['screenshots'])} 张, FAQ: {len(detail['faq'])} 条)")
            else:
                print(f"    -> 失败")

            if i < total - 1:
                time.sleep(REQUEST_DELAY)

        return results
