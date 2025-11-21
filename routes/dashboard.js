const express = require('express');
const router = express.Router();
const Dashboard = require('../models/dashboard');
const verifyToken = require('../verifyToken'); // JWT middleware



// GET dashboard items (protected route)
router.get('/', verifyToken, async (req, res) => {
  try {
    const dashboards = await Dashboard.find({});
    res.json(dashboards);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error fetching dashboard' });
  }
});

module.exports = router;
