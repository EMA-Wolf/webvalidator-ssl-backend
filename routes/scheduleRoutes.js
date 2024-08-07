const express = require('express');
const router = express.Router();
const {scheduleWithTimeout, stopScheduledTask} = require('../controllers/scheduleContorller')

// Schedule a task with a cron expression
router.post("/cron",scheduleWithTimeout)
router.post("/stop-cron",stopScheduledTask)

module.exports = router