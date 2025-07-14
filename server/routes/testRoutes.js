let tasks = [
  { id: '1', title: 'Buy milk', status: 0 },
  { id: '2', title: 'Read book', status: 1 }
];

const express = require('express');
const router = express.Router();

/**
 * GET /api/tests-learning/tasks
 * 获取所有任务
 */
router.get('/', (req, res) => {
  res.json(tasks);
});

/**
 * POST /api/tests-learning/tasks
 * 添加一个新任务（客户端需传 title 和 status）
 */
router.post('/', (req, res) => {
  const newTask = { ...req.body, id: Date.now().toString() }; // 自动生成唯一 id
  tasks.push(newTask);
  res.status(201).json(newTask);
});

/**
 * DELETE /api/tests-learning/tasks/:id
 * 删除指定 id 的任务
 */
router.delete('/:id', (req, res) => {
  const { id } = req.params;
  tasks = tasks.filter(task => task.id !== id);
  res.status(204).send(); // 204 表示成功但无返回内容
});

module.exports = router;