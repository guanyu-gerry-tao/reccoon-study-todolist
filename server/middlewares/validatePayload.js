function validateBulkPayloadStructure(req, res, next) {
  const payload = req.body;

  if (typeof payload !== 'object' || payload === null) {
    return res.status(400).json({ error: 'Payload must be a valid object' });
  }

  const { ops, backup } = payload;

  // Check existence
  if (!Array.isArray(ops)) {
    console.error('Invalid ops structure:', payload);
    return res.status(400).json({ error: '`ops` must be an array' });
  }

  if (!backup || typeof backup !== 'object') {
    console.error('Invalid backup structure:', payload);
    return res.status(400).json({ error: '`backup` must be an object' });
  }

  const { statuses, tasks, projects, userProfile } = backup;

  if (
    typeof statuses !== 'object' || statuses === null ||
    typeof tasks !== 'object' || tasks === null ||
    typeof projects !== 'object' || projects === null ||
    typeof userProfile !== 'object' || userProfile === null
  ) {
    console.error('Invalid backup structure:', backup);
    return res.status(400).json({ error: '`backup` must contain valid `tasks`, `projects`, `statuses`, and `userProfiles` objects' });
  }
  
  // Optional: validate structure of each op
  for (const [index, op] of ops.entries()) {
    if (
      !op ||
      typeof op !== 'object' ||
      !['task', 'project', 'status', 'userProfile'].includes(op.type) ||
      !['add', 'update', 'delete'].includes(op.operation) ||
      !('data' in op)
    ) {
      console.error(`Invalid operation at index ${index}:`, op);
      return res.status(400).json({ error: `Invalid operation at index ${index}` });
    }
  }

  next();
}

module.exports = validateBulkPayloadStructure;