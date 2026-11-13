const express = require('express');
const { postUsers, userLogin, getCurrentUser, logout, googleLogin, googleCallback, becomeOwner, getOwnerStatus} = require('../controllers/users.controller');
const requireAuth = require('../middlewares/requireAuth');
const requireRole = require('../middlewares/requireRole');

const router = express.Router();

router.post('/become-owner', requireAuth, requireRole('user'), becomeOwner);

router.get('/owner-status', requireAuth, requireRole('user', 'owner', 'admin'), getOwnerStatus);

router.post('/register', postUsers);

router.post('/login', userLogin);
router.post('/logout', logout);
router.get('/me', requireAuth, getCurrentUser);
router.get('/google', googleLogin);
router.get('/google/callback', googleCallback);

module.exports = router;