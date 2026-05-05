package handler

import (
	pb "ai-tools-api/proto"
	"ai-tools-api/internal/repository"
	"context"

	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/metadata"
	"google.golang.org/grpc/status"
)

type ToolServer struct {
	pb.UnimplementedToolServiceServer
}

func NewToolServer() *ToolServer {
	return &ToolServer{}
}

// getLangFromContext 从 gRPC metadata 中提取语言参数，回退到请求中的 lang 字段
func getLangFromContext(ctx context.Context, reqLang string) string {
	md, ok := metadata.FromIncomingContext(ctx)
	if ok {
		if vals := md.Get("x-lang"); len(vals) > 0 && vals[0] != "" {
			return vals[0]
		}
	}
	return reqLang
}

// GetTools 获取工具列表
func (s *ToolServer) GetTools(ctx context.Context, req *pb.GetToolsRequest) (*pb.GetToolsResponse, error) {
	lang := getLangFromContext(ctx, req.GetLang())
	tools, err := repository.GetTools(req.GetCategory(), lang)
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
			DetailUrl:   tool.DetailURL,
			Category:    tool.Category,
			Icon:        tool.Icon,
			Tags:        tool.Tags,
			Features:    tool.Features,
			Pricing:     tool.Pricing,
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
	lang := getLangFromContext(ctx, req.GetLang())
	tool, err := repository.GetToolByID(req.GetId(), lang)
	if err != nil {
		return nil, status.Errorf(codes.NotFound, "Tool not found: %v", err)
	}

	return &pb.Tool{
		Id:          tool.ID,
		Name:        tool.Name,
		Description: tool.Description,
		Url:         tool.URL,
		DetailUrl:   tool.DetailURL,
		Category:    tool.Category,
		Icon:        tool.Icon,
		Tags:        tool.Tags,
		Features:    tool.Features,
		Pricing:     tool.Pricing,
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
	lang := getLangFromContext(ctx, req.GetLang())
	tools, err := repository.SearchTools(req.GetKeyword(), lang)
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
			DetailUrl:   tool.DetailURL,
			Category:    tool.Category,
			Icon:        tool.Icon,
			Tags:        tool.Tags,
			Features:    tool.Features,
			Pricing:     tool.Pricing,
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

// GetToolDetail 获取工具详情
func (s *ToolServer) GetToolDetail(ctx context.Context, req *pb.GetToolDetailRequest) (*pb.GetToolDetailResponse, error) {
	lang := getLangFromContext(ctx, req.GetLang())
	td, err := repository.GetToolDetailByID(req.GetId(), lang)
	if err != nil {
		return nil, status.Errorf(codes.NotFound, "Tool not found: %v", err)
	}

	pbTool := &pb.Tool{
		Id:          td.ID,
		Name:        td.Name,
		Description: td.Description,
		Url:         td.URL,
		DetailUrl:   td.DetailURL,
		Category:    td.Category,
		Icon:        td.Icon,
		Tags:        td.Tags,
		Features:    td.Features,
		Pricing:     td.Pricing,
		CrawledAt:   td.CrawledAt.Format("2006-01-02T15:04:05Z"),
		CreatedAt:   td.CreatedAt.Format("2006-01-02T15:04:05Z"),
		UpdatedAt:   td.UpdatedAt.Format("2006-01-02T15:04:05Z"),
	}

	resp := &pb.GetToolDetailResponse{
		Tool: pbTool,
	}

	if td.Detail != nil {
		pbFAQ := make([]*pb.FAQItem, len(td.Detail.FAQ))
		for i, f := range td.Detail.FAQ {
			pbFAQ[i] = &pb.FAQItem{
				Question: f.Question,
				Answer:   f.Answer,
			}
		}
		resp.Detail = &pb.ToolDetail{
			ToolId:       td.Detail.ToolID,
			ContentHtml:  td.Detail.ContentHTML,
			Screenshots:  td.Detail.Screenshots,
			Pricing:      td.Detail.Pricing,
			Faq:          pbFAQ,
			LikeCount:    int32(td.Detail.LikeCount),
			CommentCount: int32(td.Detail.CommentCount),
			PublishedAt:  td.Detail.PublishedAt,
		}
	}

	return resp, nil
}
