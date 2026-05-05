# AI Tools Web

AI工具集导航网站 - 自动爬取 ai-bot.cn 数据，提供搜索和筛选功能。

## 项目概述

本项目是一个AI工具导航网站，通过Python爬虫自动采集 ai-bot.cn 的AI工具数据，使用Next.js构建前端展示，支持搜索和分类筛选功能。

## 项目结构

```
ai-tools-web/
├── crawler/                          # Python爬虫模块
│   ├── src/
│   │   ├── spiders/
│   │   │   └── ai_bot.py            # ai-bot.cn 爬虫实现
│   │   ├── parsers/
│   │   │   └── tool_parser.py       # HTML解析器
│   │   └── utils/
│   │       └── helpers.py           # 工具函数
│   ├── config.py                     # 爬虫配置
│   ├── run.py                        # 运行入口
│   └── requirements.txt              # Python依赖
│
├── web/                              # Next.js前端
│   ├── src/
│   │   ├── app/
│   │   │   ├── api/data/            # API路由
│   │   │   ├── layout.tsx           # 根布局
│   │   │   └── page.tsx             # 首页
│   │   ├── components/
│   │   │   ├── layout/              # 布局组件
│   │   │   │   └── header.tsx
│   │   │   ├── tools/               # 工具相关组件
│   │   │   │   ├── tool-card.tsx
│   │   │   │   └── tools-grid.tsx
│   │   │   └── ui/                  # 通用UI组件
│   │   │       ├── search-input.tsx
│   │   │       └── category-filter.tsx
│   │   ├── lib/                     # 工具库
│   │   │   ├── data.ts              # 数据加载
│   │   │   └── utils.ts             # 通用工具
│   │   └── types/                   # TypeScript类型
│   │       └── tool.ts
│   ├── package.json
│   └── next.config.ts
│
├── data/                             # 共享数据目录
│   └── tools.json                   # 工具数据(JSON)
│
├── scripts/                          # 脚本工具
│   └── run-crawler.sh               # 爬虫运行脚本
│
├── package.json                      # Monorepo配置
└── README.md
```

## 快速开始

### 环境要求

- Node.js >= 18
- Python >= 3.9
- npm 或 yarn

### 安装依赖

```bash
# 安装前端依赖
cd web && npm install

# 安装爬虫依赖
cd crawler && pip install -r requirements.txt
```

### 运行爬虫

```bash
# 方式1: 直接运行
cd crawler && python run.py

# 方式2: 使用脚本
./scripts/run-crawler.sh
```

### 启动网站

```bash
cd web && npm run dev
```

访问 http://localhost:3000

## 技术栈

| 模块 | 技术 |
|------|------|
| 爬虫 | Python + Requests + BeautifulSoup4 |
| 前端 | Next.js 16 + TypeScript + Tailwind CSS |
| 数据 | JSON文件 |

## 数据结构

### tools.json

```json
{
  "tools": [
    {
      "id": "4189",
      "name": "豆包",
      "description": "智能对话助手，办公创作全能！",
      "url": "https://www.doubao.com",
      "detailUrl": "https://ai-bot.cn/sites/4189.html",
      "category": "AI聊天",
      "tags": [],
      "icon": "https://ai-bot.cn/wp-content/uploads/...",
      "price": "",
      "features": ["智能对话助手"],
      "crawledAt": "2026-05-02T11:21:33Z"
    }
  ],
  "categories": ["AI聊天", "AI绘画", "AI编程", "AI写作", "AI视频", "AI音频", "AI设计", "AI办公", "AI搜索", "其他"],
  "lastUpdated": "2026-05-02T11:21:33Z"
}
```

## 功能特性

### 爬虫功能
- 自动爬取 ai-bot.cn 首页工具
- 智能分类识别（基于关键词匹配）
- 数据去重处理
- JSON格式输出

### 前端功能
- 关键词搜索（名称、描述、标签）
- 分类筛选（10个分类）
- 响应式布局
- 工具卡片展示

## 开发说明

### 添加新的爬虫源

1. 在 `crawler/src/spiders/` 创建新的爬虫类
2. 实现 `crawl()` 方法返回标准数据格式
3. 在 `crawler/src/main.py` 中调用新爬虫

### 修改数据结构

1. 更新 `crawler/src/parsers/tool_parser.py` 的解析逻辑
2. 更新 `web/src/types/tool.ts` 的类型定义
3. 更新 `web/src/components/tools/tool-card.tsx` 的展示

## 部署

待补充...

## 许可证

MIT
