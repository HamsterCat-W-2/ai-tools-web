"""AI翻译脚本 - 使用 Claude API 翻译工具数据为英文"""

import json
import sys
import os
import time
import requests

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from anthropic import Anthropic

# Storage service URL
STORAGE_URL = os.getenv("STORAGE_URL", "http://localhost:9100/api/storage")

# Claude API client - 使用环境变量中的配置
client = Anthropic(
    api_key=os.getenv("ANTHROPIC_AUTH_TOKEN"),
    base_url=os.getenv("ANTHROPIC_BASE_URL"),
)

# 使用环境变量中的模型
MODEL = os.getenv("ANTHROPIC_MODEL", "claude-haiku-4-5-20251001")


def get_all_tools() -> list:
    """从 storage service 获取所有工具"""
    resp = requests.get(f"{STORAGE_URL}/tools")
    resp.raise_for_status()
    data = resp.json()
    return data.get("tools", [])


def get_tool_detail(tool_id: str) -> dict:
    """从 storage service 获取工具详情"""
    resp = requests.get(f"{STORAGE_URL}/tools/{tool_id}/detail")
    if resp.status_code == 404:
        return None
    resp.raise_for_status()
    return resp.json()


def get_existing_translations(tool_id: str, lang: str) -> dict:
    """获取已有翻译"""
    resp = requests.get(f"{STORAGE_URL}/tools/{tool_id}/detail?lang={lang}")
    if resp.status_code == 404:
        return {}
    resp.raise_for_status()
    data = resp.json()
    # 如果返回的是中文（没有翻译），返回空
    return {}


def get_text_from_response(message) -> str:
    """从 API 响应中提取文本内容"""
    for block in message.content:
        if hasattr(block, 'text'):
            return block.text.strip()
    # 如果没有找到 text 属性，返回第一个 block 的字符串表示
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
        # 提取 JSON 部分
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

    # 分离需要翻译的文本块和不需要翻译的图片块
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

        # 合并翻译结果
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


def save_translations(tool_id: str, translations: list):
    """批量保存翻译到 storage service"""
    if not translations:
        return

    resp = requests.post(
        f"{STORAGE_URL}/tools/translations/batch",
        json={"translations": translations},
    )
    resp.raise_for_status()


def translate_tool(tool: dict, detail: dict, target_lang: str = "en") -> list:
    """翻译单个工具的所有字段"""
    translations = []

    # 翻译 name
    if tool.get("name"):
        print(f"    翻译 name: {tool['name'][:30]}...")
        translated = translate_text(tool["name"], target_lang)
        translations.append({
            "tool_id": tool["id"],
            "lang": target_lang,
            "field": "name",
            "value": translated,
        })

    # 翻译 description
    if tool.get("description"):
        print(f"    翻译 description...")
        translated = translate_text(tool["description"], target_lang)
        translations.append({
            "tool_id": tool["id"],
            "lang": target_lang,
            "field": "description",
            "value": translated,
        })

    # 翻译 tags
    if tool.get("tags") and len(tool["tags"]) > 0:
        print(f"    翻译 tags ({len(tool['tags'])} 个)...")
        translated = translate_tags(tool["tags"], target_lang)
        translations.append({
            "tool_id": tool["id"],
            "lang": target_lang,
            "field": "tags",
            "value": json.dumps(translated, ensure_ascii=False),
        })

    # 翻译 features
    if tool.get("features") and len(tool["features"]) > 0:
        print(f"    翻译 features ({len(tool['features'])} 个)...")
        translated = translate_tags(tool["features"], target_lang)
        translations.append({
            "tool_id": tool["id"],
            "lang": target_lang,
            "field": "features",
            "value": json.dumps(translated, ensure_ascii=False),
        })

    # 翻译 content_blocks
    if detail and detail.get("contentHtml"):
        try:
            blocks = json.loads(detail["contentHtml"]) if isinstance(detail["contentHtml"], str) else detail["contentHtml"]
            if blocks and len(blocks) > 0:
                print(f"    翻译 content_blocks ({len(blocks)} 个块)...")
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
        print(f"    翻译 faq ({len(detail['faq'])} 个)...")
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

    # 检查哪些已有翻译
    print("\n检查已有翻译...", flush=True)
    tools_to_translate = []
    for tool in tools:
        # 检查数据库中是否有该工具的翻译
        try:
            resp = requests.get(f"{STORAGE_URL}/translations/check?tool_id={tool['id']}&lang={target_lang}")
            if resp.status_code == 200:
                data = resp.json()
                if data.get("exists"):
                    print(f"  跳过 {tool['id']} ({tool['name']}) - 已有翻译", flush=True)
                    continue
            tools_to_translate.append(tool)
        except Exception as e:
            # 如果检查失败，假设没有翻译
            tools_to_translate.append(tool)

    print(f"\n需要翻译 {len(tools_to_translate)} 个工具", flush=True)

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
            time.sleep(0.5)

        except Exception as e:
            print(f"  翻译失败: {e}", flush=True)
            failed += 1

    print(f"\n翻译完成: 成功 {success}, 失败 {failed}", flush=True)


if __name__ == "__main__":
    main()
