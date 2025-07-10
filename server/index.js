const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const routes = require('./routes'); // 加载所有 API 路由模块

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// 加载通用中间件
app.use(cors()); // 允许前端跨域访问
app.use(express.json()); // 自动解析 JSON 请求体

// 加载所有 API 路由
app.use('/api', routes); // 所有路由都挂在 /api 下

// 启动服务器监听
app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});