const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');

dotenv.config();

const seedUsers = [
  { name: 'Teacher One', email: 'teacher@example.com', password: '123456', role: 'teacher' },
  { name: 'Student One', email: 'student1@example.com', password: '123456', role: 'student' },
  { name: 'Student Two', email: 'student2@example.com', password: '123456', role: 'student' }
];

const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    await User.deleteMany({});
    await User.insertMany(seedUsers);
    console.log('Seed data inserted successfully');
    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error.message);
    process.exit(1);
  }
};

seedDatabase();
