const express = require('express');
const {postUsers, userLogin, becomeOwner} = require('../controllers/users.controller');
const requireAuth = require('../middlewares/requireAuth');
const requireRole = require('../middlewares/requireRole');

const router = express.Router();

router.post('/', postUsers);

router.post('/become-owner', requireAuth, requireRole('user'), becomeOwner);

router.post('/login', userLogin);

module.exports = router;