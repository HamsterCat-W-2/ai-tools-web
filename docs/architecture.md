# 项目架构设计

## 整体架构

```
┌─────────────────────────────────────────────────────────────┐
│                      AI Tools Web                           │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────────┐      ┌──────────────┐      ┌──────────┐  │
│  │   Crawler    │ ───> │  data.json   │ <─── │   Web    │  │
│  │   (Python)   │      │   (共享)      │      │ (Next.js)│  │
│  └──────────────┘      └──────────────┘      └──────────┘  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## 数据流

```
1. 爬虫采集
   ai-bot.cn ──HTTP请求──> 爬虫程序 ──解析──> tools.json

2. 网站展示
   tools.json ──API读取──> Next.js ──渲染──> 用户浏览器
```

## 模块详解

### 1. 爬虫模块 (crawler/)

```
crawler/
├── src/
│   ├── spiders/          # 爬虫实现
│   │   └── ai_bot.py    # ai-bot.cn 爬虫
│   ├── parsers/          # 解析器
│   │   └── tool_parser.py
│   └── utils/            # 工具函数
│       └── helpers.py
├── config.py             # 配置文件
└── run.py                # 入口文件
```

**核心流程：**

```python
# run.py
AIBotSpider.crawl()
    ├── fetch_page(url)        # 获取页面HTML
    ├── parse_tools_page(html) # 解析工具列表
    └── save_json(data)        # 保存到文件
```

**数据解析：**

- 选择器：`a.card[class*="site-"]`
- 提取字段：
  - `data-id`: 工具ID
  - `strong`: 工具名称
  - `p.text-muted`: 工具描述
  - `href`: 链接
  - `img[data-src]`: 图标

**智能分类：**

基于关键词匹配自动分类：
```python
category_keywords = {
    "AI聊天": ["chat", "对话", "聊天", "助手"],
    "AI绘画": ["绘画", "图像", "midjourney"],
    "AI编程": ["编程", "代码", "copilot"],
    ...
}
```

### 2. 前端模块 (web/)

```
web/src/
├── app/
│   ├── api/data/           # API路由
│   │   └── [...path]/route.ts
│   ├── layout.tsx          # 根布局
│   └── page.tsx            # 首页
├── components/
│   ├── layout/             # 布局组件
│   ├── tools/              # 业务组件
│   └── ui/                 # 通用组件
├── lib/                    # 工具库
└── types/                  # 类型定义
```

**组件架构：**

```
page.tsx (首页)
├── Header (页头)
├── SearchInput (搜索框)
├── CategoryFilter (分类筛选)
└── ToolsGrid (工具列表)
    └── ToolCard[] (工具卡片)
```

**数据流向：**

```
page.tsx (Client Component)
    │
    ├── useState: search, category, data
    │
    ├── useEffect: fetch("/api/data/tools.json")
    │
    └── useMemo: filteredTools
        ├── filter by search
        └── filter by category
```

### 3. 数据模块 (data/)

**tools.json 结构：**

```typescript
interface ToolsData {
  tools: AITool[];      // 工具列表
  categories: string[]; // 分类列表
  lastUpdated: string;  // 更新时间
}

interface AITool {
  id: string;           // 工具ID
  name: string;         // 工具名称
  description: string;  // 工具描述
  url: string;          // 外部链接
  detailUrl: string;    // 详情页链接
  category: string;     // 分类
  tags: string[];       // 标签
  icon: string;         // 图标URL
  price: string;        // 价格
  features: string[];   // 特性
  crawledAt: string;    // 爬取时间
}
```

## 技术选型

| 模块 | 技术 | 原因 |
|------|------|------|
| 爬虫 | Python + BeautifulSoup | 生态成熟，解析方便 |
| 前端框架 | Next.js | React生态，SSR/SSG支持 |
| 类型系统 | TypeScript | 类型安全，开发体验好 |
| 样式方案 | Tailwind CSS | 原子化CSS，开发效率高 |
| 数据存储 | JSON | 简单直接，无需数据库 |

## 扩展点

### 1. 添加新爬虫源

```python
# crawler/src/spiders/new_site.py
class NewSiteSpider:
    def crawl(self) -> dict:
        # 实现爬取逻辑
        return {"tools": [...], "categories": [...]}
```

### 2. 添加新分类

更新 `crawler/src/spiders/ai_bot.py` 中的 `category_keywords`。

### 3. 添加新功能

- 收藏功能：添加 localStorage 存储
- 排序功能：在 ToolsGrid 组件中添加排序逻辑
- 分页功能：修改 ToolsGrid 支持分页

## 部署方案

### 开发环境

```bash
# 终端1: 启动前端
cd web && npm run dev

# 终端2: 运行爬虫
cd crawler && python run.py
```

### 生产环境

```bash
# 构建前端
cd web && npm run build

# 启动服务
cd web && npm start

# 定时爬虫 (crontab)
0 2 * * * cd /path/to/crawler && python run.py
```
