"""详情页翻译脚本 - 补充翻译 content_blocks 和 faq"""

import json
import sys
import os
import time
import mysql.connector

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


def get_db_connection():
    return mysql.connector.connect(**DB_CONFIG)


def get_text_from_response(message) -> str:
    for block in message.content:
        if hasattr(block, 'text'):
            return block.text.strip()
    return str(message.content[0]).strip()


def translate_content_blocks(blocks: list, target_lang: str = "en") -> list:
    if not blocks:
        return blocks

    text_parts = []
    for i, block in enumerate(blocks):
        if block["type"] == "text":
            text_parts.append({"index": i, "style": block["style"], "content": block["content"]})

    if not text_parts:
        return blocks

    prompt = f"""Translate the following Chinese content blocks to {target_lang}.
Each block has an index, style (heading or body), and content.
Return a JSON array of objects with the same index, style, and translated content.
Only return the JSON array, nothing else.

Blocks: {json.dumps(text_parts, ensure_ascii=False)}"""

    message = client.messages.create(
        model=MODEL,
        max_tokens=4096,
        messages=[{"role": "user", "content": prompt}],
    )

    try:
        result = get_text_from_response(message)
        if "[" in result:
            start = result.index("[")
            end = result.rindex("]") + 1
            translated = json.loads(result[start:end])
        else:
            translated = json.loads(result)

        result_blocks = list(blocks)
        for item in translated:
            idx = item["index"]
            if 0 <= idx < len(result_blocks):
                result_blocks[idx] = {
                    "type": "text",
                    "style": item["style"],
                    "content": item["content"],
                }
        return result_blocks
    except (json.JSONDecodeError, ValueError, KeyError):
        return blocks


def translate_faq(faq: list, target_lang: str = "en") -> list:
    if not faq:
        return faq

    prompt = f"""Translate the following Chinese FAQ items to {target_lang}.
Each item has a question and answer.
Return a JSON array of objects with translated question and answer.
Only return the JSON array, nothing else.

FAQ: {json.dumps(faq, ensure_ascii=False)}"""

    message = client.messages.create(
        model=MODEL,
        max_tokens=2048,
        messages=[{"role": "user", "content": prompt}],
    )

    try:
        result = get_text_from_response(message)
        if "[" in result:
            start = result.index("[")
            end = result.rindex("]") + 1
            return json.loads(result[start:end])
        return json.loads(result)
    except (json.JSONDecodeError, ValueError):
        return faq


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


def main():
    lang = "en"

    # 获取需要翻译 content_blocks 的工具
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    # 找出有 content_html 但没有 content_blocks 翻译的工具
    cursor.execute("""
        SELECT d.tool_id, d.content_html, d.faq
        FROM tool_details d
        WHERE d.content_html IS NOT NULL AND d.content_html != ''
        AND NOT EXISTS (
            SELECT 1 FROM tool_translations t
            WHERE t.tool_id = d.tool_id AND t.lang = %s AND t.field = 'content_blocks'
        )
        ORDER BY d.tool_id
    """, (lang,))
    tools_to_translate = cursor.fetchall()
    cursor.close()
    conn.close()

    print(f"需要翻译 content_blocks 的工具: {len(tools_to_translate)} 个", flush=True)

    if not tools_to_translate:
        print("所有详情页都已翻译完成", flush=True)
        return

    success = 0
    failed = 0
    for i, tool in enumerate(tools_to_translate):
        tool_id = tool["tool_id"]
        print(f"\n[{i+1}/{len(tools_to_translate)}] 翻译 {tool_id}...", flush=True)

        try:
            # 翻译 content_blocks
            if tool["content_html"]:
                try:
                    blocks = json.loads(tool["content_html"])
                    if blocks and len(blocks) > 0:
                        print(f"  翻译 content_blocks ({len(blocks)} 个块)...", flush=True)
                        translated = translate_content_blocks(blocks, lang)
                        save_translation(tool_id, "content_blocks", json.dumps(translated, ensure_ascii=False))
                        print(f"  保存 content_blocks 翻译", flush=True)
                except (json.JSONDecodeError, TypeError) as e:
                    print(f"  解析 content_html 失败: {e}", flush=True)

            # 翻译 faq
            if tool["faq"]:
                try:
                    faq = json.loads(tool["faq"]) if isinstance(tool["faq"], str) else tool["faq"]
                    if faq and len(faq) > 0:
                        print(f"  翻译 faq ({len(faq)} 个)...", flush=True)
                        translated = translate_faq(faq, lang)
                        save_translation(tool_id, "faq", json.dumps(translated, ensure_ascii=False))
                        print(f"  保存 faq 翻译", flush=True)
                except (json.JSONDecodeError, TypeError) as e:
                    print(f"  解析 faq 失败: {e}", flush=True)

            success += 1
            time.sleep(0.3)

        except Exception as e:
            print(f"  翻译失败: {e}", flush=True)
            failed += 1

    print(f"\n翻译完成: 成功 {success}, 失败 {failed}", flush=True)


if __name__ == "__main__":
    main()
