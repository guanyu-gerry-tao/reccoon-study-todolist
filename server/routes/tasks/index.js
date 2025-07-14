const express = require('express');
const router = express.Router();

const addTeskRoutes = require('./addTaskRoutes');

// 所有测试相关的 task 路由统一挂在 /tasks
router.use('/tasks/add', addTaskRoutes); // 最终路径：/api/tests-learning/tasks/addTask

module.exports = router;