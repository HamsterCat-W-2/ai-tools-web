"""详情页导入脚本 - 爬取详情页、上传截图、入库"""

import json
import sys
import os
import re

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from src.spiders.detail_spider import DetailSpider
from src.utils.uploader import upload_screenshot, save_tool_detail


def replace_image_urls(html: str, url_map: dict) -> str:
    """替换 HTML 中的图片地址为 MinIO 地址"""
    for old_url, new_url in url_map.items():
        html = html.replace(old_url, new_url)
    return html


def main():
    data_path = os.path.join(os.path.dirname(__file__), "..", "..", "data", "tools.json")
    data_path = os.path.abspath(data_path)

    if not os.path.exists(data_path):
        print(f"数据文件不存在: {data_path}")
        return

    with open(data_path, "r", encoding="utf-8") as f:
        data = json.load(f)

    tools = data.get("tools", [])
    tool_ids = [t["id"] for t in tools]
    print(f"读取到 {len(tool_ids)} 个工具 ID")

    if not tool_ids:
        print("没有工具可导入")
        return

    # 爬取详情页
    print("\n开始爬取详情页...")
    spider = DetailSpider()
    details = spider.crawl_details(tool_ids)
    print(f"\n成功爬取 {len(details)}/{len(tool_ids)} 个详情页")

    # 上传截图并替换 HTML 中的图片地址
    print("\n开始上传截图到 MinIO...")
    for i, detail in enumerate(details):
        screenshots = detail.get("screenshots", [])
        if not screenshots:
            continue

        print(f"  [{i+1}/{len(details)}] 上传 {detail['tool_id']} 的截图 ({len(screenshots)} 张)...")
        url_map = {}
        new_screenshots = []
        for j, img_url in enumerate(screenshots):
            new_url = upload_screenshot(img_url, detail["tool_id"], j)
            if new_url:
                url_map[img_url] = new_url
                new_screenshots.append(new_url)
            else:
                new_screenshots.append(img_url)

        # 替换 HTML 中的图片地址
        detail["content_html"] = replace_image_urls(detail["content_html"], url_map)
        detail["screenshots"] = new_screenshots

    # 入库
    print("\n开始写入数据库...")
    success = 0
    for detail in details:
        if save_tool_detail(detail["tool_id"], detail):
            success += 1
    print(f"\n入库完成: {success}/{len(details)} 条成功")


if __name__ == "__main__":
    main()
