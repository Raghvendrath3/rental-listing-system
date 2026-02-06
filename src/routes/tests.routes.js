const express = require('express');
const router = express.Router();
const { throwTestError } = require('../controllers/tests.controller');

router.get('/error', throwTestError);

module.exports = router;