"""pricing 字段翻译脚本"""

import json
import sys
import os
import time
import mysql.connector
from concurrent.futures import ThreadPoolExecutor, as_completed

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from anthropic import Anthropic

# MySQL 配置
DB_CONFIG = {
    "host": os.getenv("MYSQL_HOST", "localhost"),
    "port": int(os.getenv("MYSQL_PORT", "3306")),
    "user": os.getenv("MYSQL_USER", "root"),
    "password": os.getenv("MYSQL_PASSWORD", "root123"),
    "database": os.getenv("MYSQL_DATABASE", "ai_tools"),
}

# Claude API client
client = Anthropic(
    api_key=os.getenv("ANTHROPIC_AUTH_TOKEN"),
    base_url=os.getenv("ANTHROPIC_BASE_URL"),
)

MODEL = os.getenv("ANTHROPIC_MODEL", "claude-haiku-4-5-20251001")

# 并行数
MAX_WORKERS = 3


def get_db_connection():
    return mysql.connector.connect(**DB_CONFIG)


def get_text_from_response(message) -> str:
    for block in message.content:
        # 只处理 TextBlock，跳过 ThinkingBlock
        if hasattr(block, 'text') and block.type == 'text':
            return block.text.strip()
    # 如果没有找到 TextBlock，返回空字符串
    return ""


def translate_pricing(pricing: str) -> str:
    """翻译 pricing 字段"""
    if not pricing or not pricing.strip():
        return pricing

    prompt = f"""Translate the following Chinese pricing text to English.
Keep it concise. Only return the translated text, nothing else.

Text: {pricing}"""

    message = client.messages.create(
        model=MODEL,
        max_tokens=100,
        messages=[{"role": "user", "content": prompt}],
    )
    return get_text_from_response(message)


def save_translation(tool_id: str, field: str, value: str):
    conn = get_db_connection()
    cursor = conn.cursor()
    sql = """
        INSERT INTO tool_translations (tool_id, lang, field, value)
        VALUES (%s, %s, %s, %s)
        ON DUPLICATE KEY UPDATE value = VALUES(value)
    """
    cursor.execute(sql, (tool_id, "en", field, value))
    conn.commit()
    cursor.close()
    conn.close()


def translate_single_tool(tool: dict) -> dict:
    """翻译单个工具的 pricing"""
    tool_id = tool["tool_id"]
    result = {"tool_id": tool_id, "pricing": None, "error": None}

    try:
        translated = translate_pricing(tool["pricing"])
        result["pricing"] = translated
    except Exception as e:
        result["error"] = str(e)

    return result


def main():
    # 获取需要翻译 pricing 的工具
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    cursor.execute("""
        SELECT d.tool_id, d.pricing
        FROM tool_details d
        WHERE d.pricing IS NOT NULL AND d.pricing != ''
        AND NOT EXISTS (
            SELECT 1 FROM tool_translations t
            WHERE t.tool_id = d.tool_id AND t.lang = 'en' AND t.field = 'pricing'
        )
        ORDER BY d.tool_id
    """)
    tools_to_translate = cursor.fetchall()
    cursor.close()
    conn.close()

    print(f"需要翻译 pricing 的工具: {len(tools_to_translate)} 个", flush=True)
    print(f"并行数: {MAX_WORKERS}", flush=True)

    if not tools_to_translate:
        print("所有 pricing 都已翻译完成", flush=True)
        return

    success = 0
    failed = 0

    with ThreadPoolExecutor(max_workers=MAX_WORKERS) as executor:
        future_to_tool = {
            executor.submit(translate_single_tool, tool): tool
            for tool in tools_to_translate
        }

        for i, future in enumerate(as_completed(future_to_tool)):
            tool = future_to_tool[future]
            tool_id = tool["tool_id"]

            try:
                result = future.result()
                if result["error"]:
                    print(f"[{i+1}/{len(tools_to_translate)}] {tool_id} 失败: {result['error']}", flush=True)
                    failed += 1
                else:
                    save_translation(tool_id, "pricing", result["pricing"])
                    print(f"[{i+1}/{len(tools_to_translate)}] {tool_id} 完成: {tool['pricing']} -> {result['pricing']}", flush=True)
                    success += 1
            except Exception as e:
                print(f"[{i+1}/{len(tools_to_translate)}] {tool_id} 异常: {e}", flush=True)
                failed += 1

    print(f"\n翻译完成: 成功 {success}, 失败 {failed}", flush=True)


if __name__ == "__main__":
    main()
