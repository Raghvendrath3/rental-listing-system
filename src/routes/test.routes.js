const express = require('express');
const router = express.Router();
const { throwTestError } = require('../controllers/test.controller');

router.get('/error', throwTestError);

module.exports = router;