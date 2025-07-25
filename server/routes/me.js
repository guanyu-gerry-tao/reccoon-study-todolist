const express = require('express');
const router = express.Router();

const jwt = require('jsonwebtoken');
const SECRET = process.env.JWT_SECRET;

if (!SECRET) {
    throw new Error('JWT_SECRET is not defined in environment variables');
}

router.get('/', (req, res) => {

    const token = req.cookies.token;
    if (!token) {
        return res.status(401).json({ message: 'Authentication token is missing' });
    }

    try {
    const user = jwt.verify(token, SECRET);
    req.user = user; // Attach user info to request object
    res.json({ user: req.user });
} catch (error) {
    console.error('Error verifying token:', error);
    return res.status(401).json({ message: 'Invalid authentication token' });
}
});

module.exports = router;