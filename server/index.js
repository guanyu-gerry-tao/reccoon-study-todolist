// 使用重构后的app.js
// 这样可以同时支持运行和测试
require('dotenv').config();
const app = require('./app');

// 如果直接运行此文件，启动服务器
if (require.main === module) {
  const PORT = process.env.PORT || 3001;
  app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
  });
}