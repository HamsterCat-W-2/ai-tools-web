"""文件上传工具 - 调用存储服务上传文件"""

import os
import requests
from typing import Optional

STORAGE_SERVICE_URL = os.getenv("STORAGE_SERVICE_URL", "http://localhost:9100")


def upload_icon(icon_url: str, tool_id: str) -> Optional[str]:
    """下载远程图标并上传到MinIO

    Args:
        icon_url: 远程图标URL
        tool_id: 工具ID，用于生成文件名

    Returns:
        上传后的MinIO URL，失败返回None
    """
    if not icon_url:
        return None

    try:
        # 下载图标
        response = requests.get(icon_url, timeout=10)
        response.raise_for_status()

        # 确定文件扩展名
        content_type = response.headers.get("content-type", "")
        if "png" in content_type:
            ext = ".png"
        elif "jpg" in content_type or "jpeg" in content_type:
            ext = ".jpg"
        elif "svg" in content_type:
            ext = ".svg"
        elif "webp" in content_type:
            ext = ".webp"
        else:
            ext = ".png"

        # 上传到存储服务
        files = {"file": (f"{tool_id}{ext}", response.content, content_type)}
        upload_response = requests.post(
            f"{STORAGE_SERVICE_URL}/api/storage/upload/icons",
            files=files,
            timeout=30,
        )

        if upload_response.status_code == 200:
            result = upload_response.json()
            return result.get("url")
        else:
            print(f"上传失败: {upload_response.status_code}")
            return None

    except Exception as e:
        print(f"上传图标失败 {icon_url}: {e}")
        return None


def save_tools_to_db(tools: list) -> bool:
    """保存工具数据到数据库

    Args:
        tools: 工具列表

    Returns:
        是否成功
    """
    try:
        response = requests.post(
            f"{STORAGE_SERVICE_URL}/api/storage/tools/batch",
            json={"tools": tools},
            timeout=30,
        )
        return response.status_code == 200
    except Exception as e:
        print(f"保存到数据库失败: {e}")
        return False
