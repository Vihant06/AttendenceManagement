const User = require('../models/User');

const getStudents = async (req, res) => {
  try {
    const students = await User.find({ role: 'student' }).select('-password');
    return res.json(students);
  } catch (error) {
    return res.status(500).json({ message: 'Could not fetch students', error: error.message });
  }
};

module.exports = { getStudents };
