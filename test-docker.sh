#!/bin/bash

# Docker 本地测试脚本
# 用于验证 Docker 配置是否正确

set -e

echo "🐳 Docker 本地测试脚本"
echo "===================="
echo ""

# 颜色定义
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 检查 Docker 是否运行
if ! docker info > /dev/null 2>&1; then
    echo -e "${RED}❌ Docker 未运行，请启动 Docker Desktop${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Docker 正在运行${NC}"
echo ""

# 测试主服务
echo "📦 构建主服务镜像..."
cd server
docker build -t raccoon-server:test . > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ 主服务镜像构建成功${NC}"
else
    echo -e "${RED}❌ 主服务镜像构建失败${NC}"
    exit 1
fi
cd ..

echo ""

# 测试AI服务
echo "📦 构建AI服务镜像..."
cd ai-service
docker build -t raccoon-ai:test . > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ AI服务镜像构建成功${NC}"
else
    echo -e "${RED}❌ AI服务镜像构建失败${NC}"
    exit 1
fi
cd ..

echo ""
echo -e "${GREEN}🎉 所有镜像构建成功！${NC}"
echo ""
echo "下一步："
echo "1. 使用 docker-compose 启动服务："
echo "   ${YELLOW}docker-compose up${NC}"
echo ""
echo "2. 或单独运行容器："
echo "   ${YELLOW}docker run -p 3001:3001 --env-file server/.env raccoon-server:test${NC}"
echo "   ${YELLOW}docker run -p 3002:3002 --env-file ai-service/.env raccoon-ai:test${NC}"
echo ""
echo "3. 测试健康检查："
echo "   ${YELLOW}curl http://localhost:3001/health${NC}"
echo "   ${YELLOW}curl http://localhost:3002/health${NC}"

