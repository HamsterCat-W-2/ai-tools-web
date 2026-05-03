package repository

import (
	"ai-tools-api/internal/model"
	"database/sql"
	"encoding/json"
)

func getTranslations(toolID string, lang string) (map[string]string, error) {
	rows, err := GetDB().Query(
		"SELECT field, value FROM tool_translations WHERE tool_id = ? AND lang = ?",
		toolID, lang,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	result := make(map[string]string)
	for rows.Next() {
		var field, value string
		if err := rows.Scan(&field, &value); err != nil {
			return nil, err
		}
		result[field] = value
	}
	return result, nil
}

func applyTranslation(tool *model.Tool, translations map[string]string) {
	if v, ok := translations["name"]; ok {
		tool.Name = v
	}
	if v, ok := translations["description"]; ok {
		tool.Description = v
	}
	if v, ok := translations["tags"]; ok {
		var tags []string
		json.Unmarshal([]byte(v), &tags)
		if tags != nil {
			tool.Tags = tags
		}
	}
	if v, ok := translations["features"]; ok {
		var features []string
		json.Unmarshal([]byte(v), &features)
		if features != nil {
			tool.Features = features
		}
	}
}

func applyDetailTranslation(detail *model.ToolDetail, translations map[string]string) {
	if v, ok := translations["content_blocks"]; ok {
		detail.ContentHTML = v
	}
	if v, ok := translations["faq"]; ok {
		var faq []model.FAQItem
		json.Unmarshal([]byte(v), &faq)
		if faq != nil {
			detail.FAQ = faq
		}
	}
	if v, ok := translations["pricing"]; ok {
		detail.Pricing = v
	}
}

func GetTools(category string, lang string) ([]model.Tool, error) {
	var rows *sql.Rows
	var err error

	if category != "" {
		rows, err = GetDB().Query(
			"SELECT id, name, description, url, detail_url, category, icon, tags, features, pricing, crawled_at, created_at, updated_at FROM tools WHERE category = ? ORDER BY name",
			category,
		)
	} else {
		rows, err = GetDB().Query(
			"SELECT id, name, description, url, detail_url, category, icon, tags, features, pricing, crawled_at, created_at, updated_at FROM tools ORDER BY category, name",
		)
	}
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var tools []model.Tool
	for rows.Next() {
		tool, err := model.ScanTool(rows)
		if err != nil {
			return nil, err
		}
		tools = append(tools, *tool)
	}

	if tools == nil {
		tools = []model.Tool{}
	}

	// Apply translations if lang is specified
	if lang != "" && lang != "zh" {
		for i := range tools {
			translations, err := getTranslations(tools[i].ID, lang)
			if err == nil && len(translations) > 0 {
				applyTranslation(&tools[i], translations)
			}
		}
	}

	return tools, nil
}

func GetToolByID(id string, lang string) (*model.Tool, error) {
	row := GetDB().QueryRow(
		"SELECT id, name, description, url, detail_url, category, icon, tags, features, pricing, crawled_at, created_at, updated_at FROM tools WHERE id = ?",
		id,
	)
	tool, err := model.ScanTool(row)
	if err != nil {
		return nil, err
	}

	// Apply translations if lang is specified
	if lang != "" && lang != "zh" {
		translations, err := getTranslations(id, lang)
		if err == nil && len(translations) > 0 {
			applyTranslation(tool, translations)
		}
	}

	return tool, nil
}

func GetCategories() ([]string, error) {
	rows, err := GetDB().Query("SELECT DISTINCT category FROM tools ORDER BY category")
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var categories []string
	for rows.Next() {
		var category string
		if err := rows.Scan(&category); err != nil {
			return nil, err
		}
		categories = append(categories, category)
	}

	if categories == nil {
		categories = []string{}
	}

	return categories, nil
}

func GetToolsCount() (int, error) {
	var count int
	err := GetDB().QueryRow("SELECT COUNT(*) FROM tools").Scan(&count)
	return count, err
}

func SearchTools(keyword string, lang string) ([]model.Tool, error) {
	rows, err := GetDB().Query(
		`SELECT id, name, description, url, category, icon, tags, features, crawled_at, created_at, updated_at
		 FROM tools
		 WHERE name LIKE ? OR description LIKE ? OR tags LIKE ?
		 ORDER BY name`,
		"%"+keyword+"%",
		"%"+keyword+"%",
		"%"+keyword+"%",
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var tools []model.Tool
	for rows.Next() {
		tool, err := model.ScanTool(rows)
		if err != nil {
			return nil, err
		}
		tools = append(tools, *tool)
	}

	if tools == nil {
		tools = []model.Tool{}
	}

	// Apply translations if lang is specified
	if lang != "" && lang != "zh" {
		for i := range tools {
			translations, err := getTranslations(tools[i].ID, lang)
			if err == nil && len(translations) > 0 {
				applyTranslation(&tools[i], translations)
			}
		}
	}

	return tools, nil
}

func GetToolDetailByID(id string, lang string) (*model.ToolWithDetail, error) {
	row := GetDB().QueryRow(
		`SELECT t.id, t.name, t.description, t.url, t.detail_url, t.category, t.icon, t.tags, t.features, t.pricing, t.crawled_at, t.created_at, t.updated_at,
		        d.content_html, d.screenshots, d.pricing, d.faq, d.like_count, d.comment_count, d.published_at
		 FROM tools t LEFT JOIN tool_details d ON t.id = d.tool_id
		 WHERE t.id = ?`, id,
	)

	var td model.ToolWithDetail
	var tagsJSON, featuresJSON []byte
	var crawledAt, createdAt, updatedAt sql.NullTime
	var detailURL, toolPricing, contentHTML, detailPricing, publishedAt sql.NullString
	var screenshotsJSON, faqJSON []byte
	var likeCount, commentCount sql.NullInt32

	err := row.Scan(
		&td.ID, &td.Name, &td.Description, &td.URL, &detailURL,
		&td.Category, &td.Icon, &tagsJSON, &featuresJSON, &toolPricing,
		&crawledAt, &createdAt, &updatedAt,
		&contentHTML, &screenshotsJSON, &detailPricing, &faqJSON,
		&likeCount, &commentCount, &publishedAt,
	)
	if err != nil {
		return nil, err
	}
	if detailURL.Valid {
		td.DetailURL = detailURL.String
	}
	if toolPricing.Valid {
		td.Pricing = toolPricing.String
	}
	if tagsJSON != nil {
		json.Unmarshal(tagsJSON, &td.Tags)
	}
	if featuresJSON != nil {
		json.Unmarshal(featuresJSON, &td.Features)
	}
	if td.Tags == nil {
		td.Tags = []string{}
	}
	if td.Features == nil {
		td.Features = []string{}
	}
	if crawledAt.Valid {
		td.CrawledAt = crawledAt.Time
	}
	if createdAt.Valid {
		td.CreatedAt = createdAt.Time
	}
	if updatedAt.Valid {
		td.UpdatedAt = updatedAt.Time
	}

	if contentHTML.Valid && contentHTML.String != "" {
		detail := &model.ToolDetail{
			ToolID:      td.ID,
			ContentHTML: contentHTML.String,
		}
		if screenshotsJSON != nil {
			json.Unmarshal(screenshotsJSON, &detail.Screenshots)
		}
		if detail.Screenshots == nil {
			detail.Screenshots = []string{}
		}
		if detailPricing.Valid {
			detail.Pricing = detailPricing.String
		}
		if faqJSON != nil {
			json.Unmarshal(faqJSON, &detail.FAQ)
		}
		if detail.FAQ == nil {
			detail.FAQ = []model.FAQItem{}
		}
		if likeCount.Valid {
			detail.LikeCount = int(likeCount.Int32)
		}
		if commentCount.Valid {
			detail.CommentCount = int(commentCount.Int32)
		}
		if publishedAt.Valid {
			detail.PublishedAt = publishedAt.String
		}
		td.Detail = detail
	}

	// Apply translations if lang is specified
	if lang != "" && lang != "zh" {
		translations, err := getTranslations(id, lang)
		if err == nil && len(translations) > 0 {
			applyTranslation(&td.Tool, translations)
			if td.Detail != nil {
				applyDetailTranslation(td.Detail, translations)
			}
		}
	}

	return &td, nil
}
