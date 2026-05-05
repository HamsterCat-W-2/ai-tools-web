"""一次性数据导入脚本 - 将 data/tools.json 导入到 MySQL（含图标上传）"""

import json
import sys
import os

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from src.utils.uploader import upload_icon, save_tools_to_db


def main():
    data_path = os.path.join(os.path.dirname(__file__), "..", "..", "data", "tools.json")
    data_path = os.path.abspath(data_path)

    if not os.path.exists(data_path):
        print(f"数据文件不存在: {data_path}")
        return

    with open(data_path, "r", encoding="utf-8") as f:
        data = json.load(f)

    tools = data.get("tools", [])
    print(f"读取到 {len(tools)} 条工具数据")

    if not tools:
        print("没有数据可导入")
        return

    # 上传图标到 MinIO
    print("\n开始上传图标到 MinIO...")
    upload_success = 0
    upload_fail = 0
    for i, tool in enumerate(tools):
        icon_url = tool.get("icon", "")
        if icon_url and not icon_url.startswith("http://localhost"):
            print(f"  [{i+1}/{len(tools)}] 上传 {tool['name']} 的图标...")
            new_url = upload_icon(icon_url, tool["id"])
            if new_url:
                tool["icon"] = new_url
                upload_success += 1
                print(f"    -> {new_url}")
            else:
                upload_fail += 1
                print(f"    -> 上传失败，保留原始URL")
        else:
            print(f"  [{i+1}/{len(tools)}] {tool['name']} 无图标或已是MinIO地址，跳过")

    print(f"\n图标上传完成: 成功 {upload_success}, 失败 {upload_fail}")

    # 分批入库，每批 50 条
    print("\n开始写入数据库...")
    batch_size = 50
    success_count = 0
    for i in range(0, len(tools), batch_size):
        batch = tools[i : i + batch_size]
        print(f"  导入第 {i+1}-{min(i+batch_size, len(tools))} 条...")
        if save_tools_to_db(batch):
            success_count += len(batch)
        else:
            print(f"    第 {i+1}-{min(i+batch_size, len(tools))} 条导入失败")

    print(f"\n导入完成: {success_count}/{len(tools)} 条成功入库")


if __name__ == "__main__":
    main()
