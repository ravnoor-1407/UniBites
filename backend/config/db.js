// UniBite MongoDB Atlas Connection Handler
const mongoose = require('mongoose');

const connectDB = async () => {
  const mongoUri = process.env.MONGO_URI;

  if (!mongoUri || mongoUri.includes('example.mongodb.net') || mongoUri.includes('placeholder')) {
    console.log('⚠️  MongoDB Notice: MONGO_URI contains "example.mongodb.net" placeholder.');
    console.log('ℹ️  Please update your MongoDB Atlas cluster hostname in backend/.env.');
    console.log('ℹ️  Running in transitional mode: APIs and Mock services are operational.');
    return;
  }

  try {
    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log(`✅ MongoDB Atlas Connected: ${conn.connection.host}`);
    console.log(`📦 Database Name: ${conn.connection.name}`);
  } catch (error) {
    console.error(`❌ MongoDB Atlas Connection Error: ${error.message}`);
    console.log('ℹ️  Tip: Verify that your IP Address is allowed in MongoDB Atlas (Network Access -> 0.0.0.0/0).');
  }
};

module.exports = connectDB;
