const express = require('express');
const router = express.Router();

// 各个模块路由导入
const testLearningRoutes = require('./test-learning');
// 你未来还可以继续添加其他模块：
// const taskRoutes = require('./tasks');
// const projectRoutes = require('./projects');

router.use('/tests-learning', testLearningRoutes); // => /api/tests-learning/...
// router.use('/tasks', taskRoutes); // => /api/tasks/...
// router.use('/projects', projectRoutes); // => /api/projects/...

module.exports = router;