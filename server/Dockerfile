# 多阶段构建，优化镜像大小
FROM node:18-alpine AS builder

WORKDIR /app

# 复制package文件
COPY package*.json ./

# 安装依赖（只安装生产依赖）
RUN npm ci --only=production && npm cache clean --force

# 生产阶段
FROM node:18-alpine

WORKDIR /app

# 从builder阶段复制依赖
COPY --from=builder /app/node_modules ./node_modules

# 复制应用代码
COPY . .

# 创建非root用户（安全最佳实践）
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001 && \
    chown -R nodejs:nodejs /app

USER nodejs

# 暴露端口
EXPOSE 3001

# 健康检查
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3001/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# 启动应用
CMD ["node", "index.js"]

