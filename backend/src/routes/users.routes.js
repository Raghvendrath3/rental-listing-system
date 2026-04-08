const express = require('express');
const {postUsers, userLogin, becomeOwner, getUserProfile, updateUserProfile, getAllUsers, updateUserRole, deleteUser} = require('../controllers/users.controller');
const requireAuth = require('../middlewares/requireAuth');
const requireRole = require('../middlewares/requireRole');

const router = express.Router();

// Public routes
router.post('/', postUsers);
router.post('/login', userLogin);

// Protected routes
router.post('/become-owner', requireAuth, requireRole('user'), becomeOwner);

// Profile endpoints (MUST come after /become-owner to avoid route conflict)
router.get('/profile', requireAuth, getUserProfile);
router.patch('/profile', requireAuth, updateUserProfile);

// Admin routes (MUST come after profile endpoints)
router.get('/admin', requireAuth, requireRole('admin'), getAllUsers);
router.patch('/:id/role', requireAuth, requireRole('admin'), updateUserRole);
router.delete('/:id', requireAuth, requireRole('admin'), deleteUser);

module.exports = router;
