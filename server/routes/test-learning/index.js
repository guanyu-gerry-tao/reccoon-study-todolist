const express = require('express');
const router = express.Router();

const testRoutes = require('./testRoutes');

// 所有测试相关的 task 路由统一挂在 /tasks
router.use('/tasks', testRoutes); // 最终路径：/api/tests-learning/tasks

module.exports = router;