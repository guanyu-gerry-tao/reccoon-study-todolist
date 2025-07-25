function validateBulkPayloadStructure(req, res, next) {
  const payload = req.body;

  if (typeof payload !== 'object' || payload === null) {
    return res.status(400).json({ error: 'Payload must be a valid object' });
  }

  const { ops, backup } = payload;

  // Check existence
  if (!Array.isArray(ops)) {
    return res.status(400).json({ error: '`ops` must be an array' });
  }

  if (!backup || typeof backup !== 'object') {
    return res.status(400).json({ error: '`backup` must be an object' });
  }

  const { statuses, tasks, projects } = backup;

  if (
    typeof statuses !== 'object' || statuses === null ||
    typeof tasks !== 'object' || tasks === null ||
    typeof projects !== 'object' || projects === null
  ) {
    return res.status(400).json({ error: '`backup` must contain valid `tasks`, `projects`, and `statuses` objects' });
  }

  // Optional: validate structure of each op
  for (const [index, op] of ops.entries()) {
    if (
      !op ||
      typeof op !== 'object' ||
      !['task', 'project', 'status'].includes(op.type) ||
      !['add', 'update', 'delete'].includes(op.operation) ||
      !('data' in op)
    ) {
      return res.status(400).json({ error: `Invalid operation at index ${index}` });
    }
  }

  next();
}

module.exports = validateBulkPayloadStructure;