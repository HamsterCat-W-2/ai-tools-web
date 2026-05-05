"""AI翻译脚本 - 直接连接数据库，使用 Claude API 翻译工具数据为英文"""

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

# Claude API client - 使用环境变量中的配置
client = Anthropic(
    api_key=os.getenv("ANTHROPIC_AUTH_TOKEN"),
    base_url=os.getenv("ANTHROPIC_BASE_URL"),
)

# 使用环境变量中的模型
MODEL = os.getenv("ANTHROPIC_MODEL", "claude-haiku-4-5-20251001")


def get_db_connection():
    """获取数据库连接"""
    return mysql.connector.connect(**DB_CONFIG)


def get_all_tools() -> list:
    """从数据库获取所有工具"""
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT id, name, description, tags, features FROM tools ORDER BY id")
    tools = cursor.fetchall()
    cursor.close()
    conn.close()

    # 解析 JSON 字段
    for tool in tools:
        if isinstance(tool["tags"], str):
            tool["tags"] = json.loads(tool["tags"])
        if isinstance(tool["features"], str):
            tool["features"] = json.loads(tool["features"])
        if tool["tags"] is None:
            tool["tags"] = []
        if tool["features"] is None:
            tool["features"] = []

    return tools


def get_tool_detail(tool_id: str) -> dict:
    """从数据库获取工具详情"""
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute(
        "SELECT content_html, faq FROM tool_details WHERE tool_id = %s",
        (tool_id,)
    )
    detail = cursor.fetchone()
    cursor.close()
    conn.close()

    if detail:
        if isinstance(detail["faq"], str):
            detail["faq"] = json.loads(detail["faq"])
        if detail["faq"] is None:
            detail["faq"] = []
    return detail


def get_existing_translation_ids(lang: str) -> set:
    """获取已有翻译的工具 ID 集合"""
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute(
        "SELECT DISTINCT tool_id FROM tool_translations WHERE lang = %s",
        (lang,)
    )
    ids = {row[0] for row in cursor.fetchall()}
    cursor.close()
    conn.close()
    return ids


def save_translations(tool_id: str, translations: list):
    """批量保存翻译到数据库"""
    if not translations:
        return

    conn = get_db_connection()
    cursor = conn.cursor()
    sql = """
        INSERT INTO tool_translations (tool_id, lang, field, value)
        VALUES (%s, %s, %s, %s)
        ON DUPLICATE KEY UPDATE value = VALUES(value)
    """
    for t in translations:
        cursor.execute(sql, (tool_id, t["lang"], t["field"], t["value"]))
    conn.commit()
    cursor.close()
    conn.close()


def get_text_from_response(message) -> str:
    """从 API 响应中提取文本内容"""
    for block in message.content:
        if hasattr(block, 'text'):
            return block.text.strip()
    return str(message.content[0]).strip()


def translate_text(text: str, target_lang: str = "en") -> str:
    """翻译单条文本"""
    if not text or not text.strip():
        return text

    prompt = f"""Translate the following Chinese text to {target_lang}.
Only return the translated text, nothing else.

Text: {text}"""

    message = client.messages.create(
        model=MODEL,
        max_tokens=1024,
        messages=[{"role": "user", "content": prompt}],
    )
    return get_text_from_response(message)


def translate_tags(tags: list, target_lang: str = "en") -> list:
    """翻译标签数组"""
    if not tags:
        return tags

    prompt = f"""Translate the following Chinese tags to {target_lang}.
Return a JSON array of translated tags. Only return the JSON array, nothing else.

Tags: {json.dumps(tags, ensure_ascii=False)}"""

    message = client.messages.create(
        model=MODEL,
        max_tokens=512,
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
        return tags


def translate_content_blocks(blocks: list, target_lang: str = "en") -> list:
    """翻译内容块数组"""
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
    """翻译 FAQ 数组"""
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


def translate_tool(tool: dict, detail: dict, target_lang: str = "en") -> list:
    """翻译单个工具的所有字段"""
    translations = []

    # 翻译 name
    if tool.get("name"):
        print(f"    翻译 name: {tool['name'][:30]}...", flush=True)
        translated = translate_text(tool["name"], target_lang)
        translations.append({
            "tool_id": tool["id"],
            "lang": target_lang,
            "field": "name",
            "value": translated,
        })

    # 翻译 description
    if tool.get("description"):
        print(f"    翻译 description...", flush=True)
        translated = translate_text(tool["description"], target_lang)
        translations.append({
            "tool_id": tool["id"],
            "lang": target_lang,
            "field": "description",
            "value": translated,
        })

    # 翻译 tags
    if tool.get("tags") and len(tool["tags"]) > 0:
        print(f"    翻译 tags ({len(tool['tags'])} 个)...", flush=True)
        translated = translate_tags(tool["tags"], target_lang)
        translations.append({
            "tool_id": tool["id"],
            "lang": target_lang,
            "field": "tags",
            "value": json.dumps(translated, ensure_ascii=False),
        })

    # 翻译 features
    if tool.get("features") and len(tool["features"]) > 0:
        print(f"    翻译 features ({len(tool['features'])} 个)...", flush=True)
        translated = translate_tags(tool["features"], target_lang)
        translations.append({
            "tool_id": tool["id"],
            "lang": target_lang,
            "field": "features",
            "value": json.dumps(translated, ensure_ascii=False),
        })

    # 翻译 content_blocks
    if detail and detail.get("content_html"):
        try:
            blocks = json.loads(detail["content_html"]) if isinstance(detail["content_html"], str) else detail["content_html"]
            if blocks and len(blocks) > 0:
                print(f"    翻译 content_blocks ({len(blocks)} 个块)...", flush=True)
                translated = translate_content_blocks(blocks, target_lang)
                translations.append({
                    "tool_id": tool["id"],
                    "lang": target_lang,
                    "field": "content_blocks",
                    "value": json.dumps(translated, ensure_ascii=False),
                })
        except (json.JSONDecodeError, TypeError):
            pass

    # 翻译 faq
    if detail and detail.get("faq") and len(detail["faq"]) > 0:
        print(f"    翻译 faq ({len(detail['faq'])} 个)...", flush=True)
        translated = translate_faq(detail["faq"], target_lang)
        translations.append({
            "tool_id": tool["id"],
            "lang": target_lang,
            "field": "faq",
            "value": json.dumps(translated, ensure_ascii=False),
        })

    return translations


def main():
    target_lang = "en"

    # 获取所有工具
    print("获取工具列表...", flush=True)
    tools = get_all_tools()
    print(f"共 {len(tools)} 个工具", flush=True)

    # 获取已有翻译的工具 ID
    print("\n检查已有翻译...", flush=True)
    existing_ids = get_existing_translation_ids(target_lang)
    print(f"已有 {len(existing_ids)} 个工具翻译完成", flush=True)

    # 过滤出需要翻译的工具
    tools_to_translate = [t for t in tools if t["id"] not in existing_ids]
    print(f"需要翻译 {len(tools_to_translate)} 个工具", flush=True)

    if not tools_to_translate:
        print("所有工具都已翻译完成", flush=True)
        return

    # 开始翻译
    success = 0
    failed = 0
    for i, tool in enumerate(tools_to_translate):
        print(f"\n[{i+1}/{len(tools_to_translate)}] 翻译 {tool['id']} ({tool['name']})...", flush=True)

        try:
            # 获取详情
            detail = get_tool_detail(tool["id"])

            # 翻译
            translations = translate_tool(tool, detail, target_lang)

            # 保存
            if translations:
                save_translations(tool["id"], translations)
                print(f"  保存了 {len(translations)} 条翻译", flush=True)
                success += 1
            else:
                print(f"  没有需要翻译的内容", flush=True)
                success += 1

            # 避免 API 限流
            time.sleep(0.3)

        except Exception as e:
            print(f"  翻译失败: {e}", flush=True)
            failed += 1

    print(f"\n翻译完成: 成功 {success}, 失败 {failed}", flush=True)


if __name__ == "__main__":
    main()
