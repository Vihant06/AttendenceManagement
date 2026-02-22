const Attendance = require('../models/Attendance');

const saveAttendance = async (req, res) => {
  try {
    const { records } = req.body;

    if (!records || !Array.isArray(records) || records.length === 0) {
      return res.status(400).json({ message: 'Attendance records are required' });
    }

    const saved = await Attendance.insertMany(records);
    return res.status(201).json({ message: 'Attendance saved', records: saved });
  } catch (error) {
    return res.status(500).json({ message: 'Could not save attendance', error: error.message });
  }
};

const getAttendance = async (req, res) => {
  try {
    const { studentId } = req.query;

    const filter = studentId ? { studentId } : {};

    const records = await Attendance.find(filter)
      .populate('studentId', 'name email')
      .sort({ date: -1, createdAt: -1 });

    return res.json(records);
  } catch (error) {
    return res.status(500).json({ message: 'Could not fetch attendance', error: error.message });
  }
};

module.exports = { saveAttendance, getAttendance };
