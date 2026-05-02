#!/usr/bin/env python3
"""爬虫运行入口"""

import sys
import os

# 添加项目根目录到path
sys.path.insert(0, os.path.dirname(__file__))

from src.main import run_crawler


def main():
    """主函数"""
    try:
        result = run_crawler()
        print(f"\n成功爬取 {len(result['tools'])} 个AI工具")
        print(f"分类列表: {', '.join(result['categories'])}")
    except Exception as e:
        print(f"爬虫运行失败: {e}")
        sys.exit(1)


if __name__ == "__main__":
    main()
