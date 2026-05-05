package main

import (
	"ai-tools-api/internal/handler"
	"ai-tools-api/internal/repository"
	pb "ai-tools-api/proto"
	"context"
	"fmt"
	"log"
	"net"
	"net/http"
	"os"

	"github.com/grpc-ecosystem/grpc-gateway/v2/runtime"
	"google.golang.org/grpc"
	"google.golang.org/grpc/credentials/insecure"
	"google.golang.org/grpc/metadata"
	"google.golang.org/grpc/reflection"
)

func main() {
	// 初始化数据库
	if err := repository.InitDB(); err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}
	log.Println("Connected to MySQL database")

	// 创建 gRPC 服务器
	grpcServer := grpc.NewServer()

	// 注册服务
	toolServer := handler.NewToolServer()
	pb.RegisterToolServiceServer(grpcServer, toolServer)

	// 启用反射（用于调试）
	reflection.Register(grpcServer)

	// 启动 gRPC 服务
	grpcPort := getEnv("GRPC_PORT", "8080")
	lis, err := net.Listen("tcp", fmt.Sprintf(":%s", grpcPort))
	if err != nil {
		log.Fatalf("Failed to listen: %v", err)
	}

	go func() {
		log.Printf("gRPC server running on port %s", grpcPort)
		if err := grpcServer.Serve(lis); err != nil {
			log.Fatalf("Failed to serve gRPC: %v", err)
		}
	}()

	// 启动 HTTP 网关
	httpPort := getEnv("HTTP_PORT", "8081")
	ctx := context.Background()
	mux := runtime.NewServeMux(
		runtime.WithMetadata(func(ctx context.Context, req *http.Request) metadata.MD {
			lang := req.Header.Get("x-locale")
			if lang != "" {
				return metadata.Pairs("x-lang", lang)
			}
			return nil
		}),
	)
	opts := []grpc.DialOption{grpc.WithTransportCredentials(insecure.NewCredentials())}

	err = pb.RegisterToolServiceHandlerFromEndpoint(ctx, mux, fmt.Sprintf("localhost:%s", grpcPort), opts)
	if err != nil {
		log.Fatalf("Failed to register gateway: %v", err)
	}

	// 添加 CORS 支持
	corsHandler := corsMiddleware(mux)

	log.Printf("HTTP gateway running on port %s", httpPort)
	if err := http.ListenAndServe(fmt.Sprintf(":%s", httpPort), corsHandler); err != nil {
		log.Fatalf("Failed to serve HTTP: %v", err)
	}
}

func getEnv(key, defaultValue string) string {
	if value, exists := os.LookupEnv(key); exists {
		return value
	}
	return defaultValue
}

func corsMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization, x-locale")

		if r.Method == "OPTIONS" {
			w.WriteHeader(http.StatusNoContent)
			return
		}

		next.ServeHTTP(w, r)
	})
}
