const mongoose = require('mongoose');
const Logger = require('../utils/logger');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/mentimeter-clone', {
      // These options are no longer needed in Mongoose 6+
      // but included for compatibility
    });

    Logger.startup(`MongoDB connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    Logger.error('MongoDB connection failed', error);
    process.exit(1);
  }
};

module.exports = connectDB;
