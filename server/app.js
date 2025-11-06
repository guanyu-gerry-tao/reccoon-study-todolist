// server/app.js - 导出app实例用于测试
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');

// load routes
const routes = require('./routes/operations');
const getAll = require('./routes/getAll');
const authRoute = require('./routes/authRoute');
const me = require('./routes/me');
const aiChatRouter = require('./routes/ai-chat');

const app = express();

// 只在非测试环境连接数据库
if (process.env.NODE_ENV !== 'test') {
  dotenv.config();
  mongoose.connect(process.env.MONGODB_URI).then(() => {
    console.log('Connected to MongoDB');
  }).catch((error) => {
    console.error('Error connecting to MongoDB:', error);
  });
}

const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000', 'http://localhost:5173'];

// load middlewares
app.use(cors({
  origin: function(origin, callback) {
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    
    if (process.env.NODE_ENV !== 'production' && origin && origin.includes('localhost')) {
      return callback(null, true);
    }
    
    const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
    return callback(new Error(msg), false);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['Set-Cookie']
}));
app.use(express.json());
app.use(cookieParser());

// Health check endpoint (before auth middleware)
app.get('/health', async (req, res) => {
  try {
    const dbStatus = process.env.NODE_ENV === 'test' 
      ? 'disconnected' 
      : (mongoose.connection.readyState === 1 ? 'connected' : 'disconnected');
    
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      service: 'main-service',
      database: dbStatus,
      uptime: process.uptime()
    });
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// use all API routes
app.use('/api/bulk', routes);
app.use('/api/getAll', getAll);
app.use('/api/login', authRoute);
app.use('/api/me', me);
app.use('/api/ai-chat', aiChatRouter);

// 只在非测试环境启动服务器
if (process.env.NODE_ENV !== 'test') {
  const PORT = process.env.PORT || 3001;
  app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
  });
}

module.exports = app;
