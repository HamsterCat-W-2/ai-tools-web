package model

import (
	"database/sql"
	"encoding/json"
	"time"
)

type Tool struct {
	ID          string    `json:"id"`
	Name        string    `json:"name"`
	Description string    `json:"description"`
	URL         string    `json:"url"`
	DetailURL   string    `json:"detail_url"`
	Category    string    `json:"category"`
	Icon        string    `json:"icon"`
	Tags        []string  `json:"tags"`
	Features    []string  `json:"features"`
	Pricing     string    `json:"pricing"`
	CrawledAt   time.Time `json:"crawled_at"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}

type ToolsResponse struct {
	Tools       []Tool  `json:"tools"`
	Categories  []string `json:"categories"`
	Total       int     `json:"total"`
	LastUpdated string  `json:"lastUpdated"`
}

type FAQItem struct {
	Question string `json:"question"`
	Answer   string `json:"answer"`
}

type ToolDetail struct {
	ToolID       string     `json:"tool_id"`
	ContentHTML  string     `json:"content_html"`
	Screenshots  []string   `json:"screenshots"`
	Pricing      string     `json:"pricing"`
	FAQ          []FAQItem  `json:"faq"`
	LikeCount    int        `json:"like_count"`
	CommentCount int        `json:"comment_count"`
	PublishedAt  string     `json:"published_at"`
}

type ToolWithDetail struct {
	Tool
	Detail *ToolDetail `json:"detail,omitempty"`
}

// ScanTool 从数据库行扫描工具数据
func ScanTool(row interface {
	Scan(dest ...interface{}) error
}) (*Tool, error) {
	var t Tool
	var tagsJSON, featuresJSON []byte
	var crawledAt, createdAt, updatedAt sql.NullTime
	var detailURL, pricing sql.NullString

	err := row.Scan(
		&t.ID, &t.Name, &t.Description, &t.URL, &detailURL,
		&t.Category, &t.Icon, &tagsJSON, &featuresJSON, &pricing,
		&crawledAt, &createdAt, &updatedAt,
	)
	if err != nil {
		return nil, err
	}
	if detailURL.Valid {
		t.DetailURL = detailURL.String
	}
	if pricing.Valid {
		t.Pricing = pricing.String
	}

	if tagsJSON != nil {
		json.Unmarshal(tagsJSON, &t.Tags)
	}
	if featuresJSON != nil {
		json.Unmarshal(featuresJSON, &t.Features)
	}
	if t.Tags == nil {
		t.Tags = []string{}
	}
	if t.Features == nil {
		t.Features = []string{}
	}
	if crawledAt.Valid {
		t.CrawledAt = crawledAt.Time
	}
	if createdAt.Valid {
		t.CreatedAt = createdAt.Time
	}
	if updatedAt.Valid {
		t.UpdatedAt = updatedAt.Time
	}

	return &t, nil
}
