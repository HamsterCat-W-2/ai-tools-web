CREATE TABLE IF NOT EXISTS tools (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  url VARCHAR(500),
  detail_url VARCHAR(500),
  category VARCHAR(50),
  icon VARCHAR(500),
  tags JSON,
  features JSON,
  pricing VARCHAR(50),
  crawled_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_category (category),
  INDEX idx_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS tool_details (
  tool_id VARCHAR(50) PRIMARY KEY,
  content_html TEXT,
  screenshots JSON,
  pricing VARCHAR(50),
  faq JSON,
  like_count INT DEFAULT 0,
  comment_count INT DEFAULT 0,
  published_at DATETIME,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (tool_id) REFERENCES tools(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
