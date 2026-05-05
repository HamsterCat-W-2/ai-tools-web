"""爬虫配置文件"""

# 目标网站配置
TARGET_URL = "https://ai-bot.cn"
OUTPUT_DIR = "../data"
OUTPUT_FILE = "tools.json"

# 请求配置
REQUEST_HEADERS = {
    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
    "Accept-Language": "zh-CN,zh;q=0.9,en;q=0.8",
}

# 爬取配置
REQUEST_TIMEOUT = 30
REQUEST_DELAY = 1  # 请求间隔（秒）

# 存储服务配置
STORAGE_SERVICE_URL = "http://localhost:9100"

# 分类映射
CATEGORY_MAPPING = {
    "ai-chat": "chatbot",
    "ai-writing": "writing",
    "ai-image": "image",
    "ai-video": "video",
    "ai-audio": "audio",
    "ai-code": "coding",
    "ai-design": "design",
    "ai-office": "office",
}
