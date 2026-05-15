const express = require('express');
const { getRequests,
   approveRequest, 
   rejectRequest, 
   getStats, 
   getAllUsers } = require('../controllers/admin.controller');


const requireAuth = require('../middlewares/requireAuth');
const requireRole = require('../middlewares/requireRole');

const router = express.Router();

// Apply auth and admin role requirements to all routes in this router
router.use(requireAuth);
router.use(requireRole('admin'));

router.get('/requests', getRequests);
router.get('/admin', getAllUsers); // Fix: removed redundant requireAuth + requireRole('admin') — router.use() above already applies both to all routes
router.patch('/requests/:id/approve', approveRequest);
router.patch('/requests/:id/reject', rejectRequest);

router.get('/stats', getStats);

module.exports = router;