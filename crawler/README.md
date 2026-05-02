# AI Tools Crawler

爬虫模块 - 负责从 ai-bot.cn 采集AI工具数据。

## 目录结构

```
crawler/
├── src/
│   ├── spiders/
│   │   ├── __init__.py
│   │   └── ai_bot.py        # ai-bot.cn 爬虫
│   ├── parsers/
│   │   ├── __init__.py
│   │   └── tool_parser.py   # HTML解析器
│   └── utils/
│       ├── __init__.py
│       └── helpers.py       # 工具函数
├── config.py                 # 配置文件
├── run.py                    # 运行入口
└── requirements.txt          # Python依赖
```

## 安装

```bash
pip install -r requirements.txt
```

## 使用

```bash
python run.py
```

输出文件：`../data/tools.json`

## 配置

编辑 `config.py` 修改配置：

```python
TARGET_URL = "https://ai-bot.cn"  # 目标网站
REQUEST_TIMEOUT = 30              # 请求超时
REQUEST_DELAY = 1                 # 请求间隔
```

## 数据格式

```json
{
  "tools": [...],
  "categories": [...],
  "lastUpdated": "ISO8601"
}
```

## 扩展

添加新爬虫：

1. 在 `src/spiders/` 创建新文件
2. 继承基础爬虫类
3. 实现 `crawl()` 方法
