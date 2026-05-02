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


def _transform_tool(tool: dict) -> dict:
    """转换爬虫输出字段名为数据库字段名"""
    return {
        "id": tool.get("id", ""),
        "name": tool.get("name", ""),
        "description": tool.get("description", ""),
        "url": tool.get("url", ""),
        "category": tool.get("category", ""),
        "icon": tool.get("icon", ""),
        "tags": tool.get("tags", []),
        "features": tool.get("features", []),
        "crawled_at": tool.get("crawledAt", ""),
    }


def save_tools_to_db(tools: list) -> bool:
    """保存工具数据到数据库

    Args:
        tools: 工具列表（爬虫原始格式）

    Returns:
        是否成功
    """
    try:
        transformed = [_transform_tool(t) for t in tools]
        response = requests.post(
            f"{STORAGE_SERVICE_URL}/api/storage/tools/batch",
            json={"tools": transformed},
            timeout=60,
        )
        if response.status_code == 200:
            result = response.json()
            print(f"  服务器返回: {result}")
            return True
        else:
            print(f"  保存失败: {response.status_code} {response.text}")
            return False
    except Exception as e:
        print(f"保存到数据库失败: {e}")
        return False


def upload_screenshot(img_url: str, tool_id: str, index: int) -> Optional[str]:
    """下载截图并上传到 MinIO

    Args:
        img_url: 远程图片 URL
        tool_id: 工具 ID
        index: 截图序号

    Returns:
        上传后的 MinIO URL，失败返回 None
    """
    if not img_url:
        return None

    try:
        response = requests.get(img_url, timeout=15)
        response.raise_for_status()

        content_type = response.headers.get("content-type", "")
        if "png" in content_type:
            ext = ".png"
        elif "jpg" in content_type or "jpeg" in content_type:
            ext = ".jpg"
        elif "webp" in content_type:
            ext = ".webp"
        else:
            ext = ".png"

        filename = f"{tool_id}_screenshot_{index}{ext}"
        files = {"file": (filename, response.content, content_type)}
        upload_response = requests.post(
            f"{STORAGE_SERVICE_URL}/api/storage/upload/screenshots",
            files=files,
            timeout=30,
        )

        if upload_response.status_code == 200:
            return upload_response.json().get("url")
        return None
    except Exception as e:
        print(f"上传截图失败 {img_url}: {e}")
        return None


def save_tool_detail(tool_id: str, detail: dict) -> bool:
    """保存工具详情到数据库

    Args:
        tool_id: 工具 ID
        detail: 详情数据

    Returns:
        是否成功
    """
    try:
        response = requests.post(
            f"{STORAGE_SERVICE_URL}/api/storage/tools/{tool_id}/detail",
            json=detail,
            timeout=30,
        )
        if response.status_code == 200:
            return True
        else:
            print(f"  保存详情失败: {response.status_code} {response.text}")
            return False
    except Exception as e:
        print(f"保存详情到数据库失败: {e}")
        return False


def save_tool_details_batch(details: list) -> bool:
    """批量保存工具详情到数据库

    Args:
        details: 详情数据列表

    Returns:
        是否成功
    """
    try:
        response = requests.post(
            f"{STORAGE_SERVICE_URL}/api/storage/tools/details/batch",
            json={"details": details},
            timeout=60,
        )
        if response.status_code == 200:
            result = response.json()
            print(f"  服务器返回: {result}")
            return True
        else:
            print(f"  批量保存详情失败: {response.status_code} {response.text}")
            return False
    except Exception as e:
        print(f"批量保存详情到数据库失败: {e}")
        return False
