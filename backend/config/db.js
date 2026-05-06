const mongoose = require('mongoose');

let isConnected = false;

const connectDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/resume_analyzir';
  try {
    const conn = await mongoose.connect(uri, { serverSelectionTimeoutMS: 4000 });
    isConnected = true;
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.warn(`⚠️  MongoDB not available (${error.message.split(',')[0]})`);
    console.warn('⚠️  Running in NO-DB mode — analysis works but data won\'t persist.');
    // Do NOT exit — allow app to run without DB
  }
};

module.exports = connectDB;
module.exports.isConnected = () => isConnected;
