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
	Category    string    `json:"category"`
	Icon        string    `json:"icon"`
	Tags        []string  `json:"tags"`
	Features    []string  `json:"features"`
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

// ScanTool 从数据库行扫描工具数据
func ScanTool(row interface {
	Scan(dest ...interface{}) error
}) (*Tool, error) {
	var t Tool
	var tagsJSON, featuresJSON []byte
	var crawledAt, createdAt, updatedAt sql.NullTime

	err := row.Scan(
		&t.ID, &t.Name, &t.Description, &t.URL,
		&t.Category, &t.Icon, &tagsJSON, &featuresJSON,
		&crawledAt, &createdAt, &updatedAt,
	)
	if err != nil {
		return nil, err
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
