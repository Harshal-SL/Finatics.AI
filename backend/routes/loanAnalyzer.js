const express = require('express');
const router = express.Router();
const controller = require('../controllers/loanAnalyzerController');

router.get('/metrics', controller.getMetrics);
// POST /api/loan-analyzer
router.post('/', controller.analyze);

module.exports = router;
