const express = require('express');
const { postInquiry, getInquiries, getOwnerInquiries } = require('../controllers/inquiries.controller');
const requireAuth = require('../middlewares/requireAuth');
const requireRole = require('../middlewares/requireRole');

const router = express.Router();

router.post('/', requireAuth, requireRole('user'), postInquiry);
router.get('/', requireAuth, requireRole('user'), getInquiries);
router.get('/owner', requireAuth, requireRole('owner'), getOwnerInquiries);

module.exports = router;
