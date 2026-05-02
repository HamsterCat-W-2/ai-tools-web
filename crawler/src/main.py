"""爬虫主模块"""

import sys
import os

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from config import OUTPUT_DIR, OUTPUT_FILE
from src.spiders.ai_bot import AIBotSpider
from src.utils.helpers import save_json, get_current_time


def run_crawler():
    """运行爬虫"""
    spider = AIBotSpider()
    result = spider.crawl()

    # 构建输出数据
    output_data = {
        "tools": result["tools"],
        "categories": result["categories"],
        "lastUpdated": get_current_time(),
    }

    # 保存到文件
    output_path = os.path.join(OUTPUT_DIR, OUTPUT_FILE)
    save_json(output_data, output_path)
    print(f"数据已保存到: {output_path}")

    return output_data


if __name__ == "__main__":
    run_crawler()
