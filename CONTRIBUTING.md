# 开发指南

## 开发环境

### 依赖

- Node.js >= 18
- Python >= 3.9

### 安装

```bash
# 前端
cd web && npm install

# 爬虫
cd crawler && pip install -r requirements.txt
```

## 开发流程

### 启动开发服务器

```bash
# 终端1: Next.js
cd web && npm run dev

# 终端2: 爬虫（按需运行）
cd crawler && python run.py
```

### 代码规范

- TypeScript: 使用 ESLint
- Python: 遵循 PEP8

## 项目约定

### 文件命名

- 组件: `kebab-case.tsx`
- 工具函数: `camelCase.ts`
- Python: `snake_case.py`

### 提交规范

```
feat: 新功能
fix: 修复
docs: 文档
style: 格式
refactor: 重构
test: 测试
chore: 构建/工具
```
