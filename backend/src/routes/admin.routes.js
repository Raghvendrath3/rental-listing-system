const express = require('express');
const { getAdminStats } = require('../controllers/admin.controller');
const requireAuth = require('../middlewares/requireAuth');
const requireRole = require('../middlewares/requireRole');

const router = express.Router();

// Get admin statistics (admin only)
router.get('/stats', requireAuth, requireRole('admin'), getAdminStats);

module.exports = router;
