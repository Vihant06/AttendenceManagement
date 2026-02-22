const express = require('express');
const { saveAttendance, getAttendance } = require('../controllers/attendanceController');

const router = express.Router();

router.post('/attendance', saveAttendance);
router.get('/attendance', getAttendance);

module.exports = router;
