package handler

import (
	pb "ai-tools-api/proto"
	"ai-tools-api/internal/repository"
	"context"

	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"
)

type ToolServer struct {
	pb.UnimplementedToolServiceServer
}

func NewToolServer() *ToolServer {
	return &ToolServer{}
}

// GetTools 获取工具列表
func (s *ToolServer) GetTools(ctx context.Context, req *pb.GetToolsRequest) (*pb.GetToolsResponse, error) {
	tools, err := repository.GetTools(req.GetCategory())
	if err != nil {
		return nil, status.Errorf(codes.Internal, "Failed to get tools: %v", err)
	}

	categories, _ := repository.GetCategories()
	count, _ := repository.GetToolsCount()

	// 转换为 protobuf 格式
	pbTools := make([]*pb.Tool, len(tools))
	for i, tool := range tools {
		pbTools[i] = &pb.Tool{
			Id:          tool.ID,
			Name:        tool.Name,
			Description: tool.Description,
			Url:         tool.URL,
			Category:    tool.Category,
			Icon:        tool.Icon,
			Tags:        tool.Tags,
			Features:    tool.Features,
			CrawledAt:   tool.CrawledAt.Format("2006-01-02T15:04:05Z"),
			CreatedAt:   tool.CreatedAt.Format("2006-01-02T15:04:05Z"),
			UpdatedAt:   tool.UpdatedAt.Format("2006-01-02T15:04:05Z"),
		}
	}

	return &pb.GetToolsResponse{
		Tools:       pbTools,
		Categories:  categories,
		Total:       int32(count),
		LastUpdated: "",
	}, nil
}

// GetTool 获取单个工具
func (s *ToolServer) GetTool(ctx context.Context, req *pb.GetToolRequest) (*pb.Tool, error) {
	tool, err := repository.GetToolByID(req.GetId())
	if err != nil {
		return nil, status.Errorf(codes.NotFound, "Tool not found: %v", err)
	}

	return &pb.Tool{
		Id:          tool.ID,
		Name:        tool.Name,
		Description: tool.Description,
		Url:         tool.URL,
		Category:    tool.Category,
		Icon:        tool.Icon,
		Tags:        tool.Tags,
		Features:    tool.Features,
		CrawledAt:   tool.CrawledAt.Format("2006-01-02T15:04:05Z"),
		CreatedAt:   tool.CreatedAt.Format("2006-01-02T15:04:05Z"),
		UpdatedAt:   tool.UpdatedAt.Format("2006-01-02T15:04:05Z"),
	}, nil
}

// GetCategories 获取分类列表
func (s *ToolServer) GetCategories(ctx context.Context, req *pb.GetCategoriesRequest) (*pb.GetCategoriesResponse, error) {
	categories, err := repository.GetCategories()
	if err != nil {
		return nil, status.Errorf(codes.Internal, "Failed to get categories: %v", err)
	}

	return &pb.GetCategoriesResponse{
		Categories: categories,
	}, nil
}

// SearchTools 搜索工具
func (s *ToolServer) SearchTools(ctx context.Context, req *pb.SearchToolsRequest) (*pb.SearchToolsResponse, error) {
	tools, err := repository.SearchTools(req.GetKeyword())
	if err != nil {
		return nil, status.Errorf(codes.Internal, "Failed to search tools: %v", err)
	}

	pbTools := make([]*pb.Tool, len(tools))
	for i, tool := range tools {
		pbTools[i] = &pb.Tool{
			Id:          tool.ID,
			Name:        tool.Name,
			Description: tool.Description,
			Url:         tool.URL,
			Category:    tool.Category,
			Icon:        tool.Icon,
			Tags:        tool.Tags,
			Features:    tool.Features,
			CrawledAt:   tool.CrawledAt.Format("2006-01-02T15:04:05Z"),
			CreatedAt:   tool.CreatedAt.Format("2006-01-02T15:04:05Z"),
			UpdatedAt:   tool.UpdatedAt.Format("2006-01-02T15:04:05Z"),
		}
	}

	return &pb.SearchToolsResponse{
		Tools: pbTools,
		Total: int32(len(tools)),
	}, nil
}
