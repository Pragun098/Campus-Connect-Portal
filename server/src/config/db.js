const mongoose = require('mongoose');

const connectDB = async () => {
  const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/student_demo_db';
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB successfully!');
  } catch (err) {
    console.error('❌ Connection error:', err.message);
  }
};

module.exports = connectDB;
