"""爬虫主模块"""

import sys
import os

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from config import OUTPUT_DIR, OUTPUT_FILE
from src.spiders.ai_bot import AIBotSpider
from src.utils.helpers import save_json, get_current_time
from src.utils.uploader import upload_icon, save_tools_to_db


def run_crawler():
    """运行爬虫"""
    spider = AIBotSpider()
    result = spider.crawl()

    tools = result["tools"]

    # 上传图标到MinIO
    print("\n开始上传图标到MinIO...")
    for i, tool in enumerate(tools):
        if tool.get("icon"):
            print(f"  [{i+1}/{len(tools)}] 上传 {tool['name']} 的图标...")
            new_icon_url = upload_icon(tool["icon"], tool["id"])
            if new_icon_url:
                tool["icon"] = new_icon_url
                print(f"    -> {new_icon_url}")
            else:
                print(f"    -> 上传失败，保留原始URL")

    # 保存到数据库
    print("\n保存数据到MySQL...")
    if save_tools_to_db(tools):
        print("数据已保存到MySQL")
    else:
        print("保存到MySQL失败，回退到JSON文件")
        # 回退：保存到JSON文件
        output_data = {
            "tools": tools,
            "categories": result["categories"],
            "lastUpdated": get_current_time(),
        }
        output_path = os.path.join(OUTPUT_DIR, OUTPUT_FILE)
        save_json(output_data, output_path)
        print(f"数据已保存到: {output_path}")

    # 同时保存一份JSON备份
    output_data = {
        "tools": tools,
        "categories": result["categories"],
        "lastUpdated": get_current_time(),
    }
    output_path = os.path.join(OUTPUT_DIR, OUTPUT_FILE)
    save_json(output_data, output_path)
    print(f"JSON备份已保存到: {output_path}")

    return {"tools": tools, "categories": result["categories"]}


if __name__ == "__main__":
    run_crawler()
