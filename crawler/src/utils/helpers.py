"""工具函数模块"""

import hashlib
import json
import os
from datetime import datetime


def generate_tool_id(name: str, url: str) -> str:
    """生成工具唯一ID"""
    content = f"{name}:{url}"
    return hashlib.md5(content.encode()).hexdigest()[:12]


def get_current_time() -> str:
    """获取当前时间的ISO格式字符串"""
    return datetime.now().isoformat()


def ensure_dir(dir_path: str) -> None:
    """确保目录存在"""
    os.makedirs(dir_path, exist_ok=True)


def save_json(data: dict, file_path: str) -> None:
    """保存JSON数据到文件"""
    ensure_dir(os.path.dirname(file_path))
    with open(file_path, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)


def load_json(file_path: str) -> dict:
    """从文件加载JSON数据"""
    with open(file_path, "r", encoding="utf-8") as f:
        return json.load(f)
