#!/bin/bash

# 运行爬虫脚本
echo "==================================="
echo "开始运行AI工具爬虫"
echo "==================================="

cd "$(dirname "$0")/../crawler"

# 检查Python环境
if ! command -v python3 &> /dev/null; then
    echo "错误: 未找到Python3"
    exit 1
fi

# 检查依赖
if [ ! -d "venv" ]; then
    echo "创建虚拟环境..."
    python3 -m venv venv
    source venv/bin/activate
    pip install -r requirements.txt
else
    source venv/bin/activate
fi

# 运行爬虫
python run.py

echo "==================================="
echo "爬虫运行完成"
echo "==================================="
