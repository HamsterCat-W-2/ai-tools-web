package repository

import (
	"ai-tools-api/internal/model"
	"database/sql"
)

func GetTools(category string) ([]model.Tool, error) {
	var rows *sql.Rows
	var err error

	if category != "" {
		rows, err = GetDB().Query(
			"SELECT id, name, description, url, category, icon, tags, features, crawled_at, created_at, updated_at FROM tools WHERE category = ? ORDER BY name",
			category,
		)
	} else {
		rows, err = GetDB().Query(
			"SELECT id, name, description, url, category, icon, tags, features, crawled_at, created_at, updated_at FROM tools ORDER BY category, name",
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

	return tools, nil
}

func GetToolByID(id string) (*model.Tool, error) {
	row := GetDB().QueryRow(
		"SELECT id, name, description, url, category, icon, tags, features, crawled_at, created_at, updated_at FROM tools WHERE id = ?",
		id,
	)
	return model.ScanTool(row)
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

func SearchTools(keyword string) ([]model.Tool, error) {
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

	return tools, nil
}
