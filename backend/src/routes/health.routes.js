const express = require('express');
const {
  getHealth,
  getLiveness,
  getReadiness
} = require('../controllers/health.controller');

const router = express.Router();

router.use((req, res, next) => {
  res.setHeader('Cache-Control', 'no-store');
  next();
});

router.get('/live', getLiveness);
router.get('/ready', getReadiness);
router.get('/', getHealth);

module.exports = router;
