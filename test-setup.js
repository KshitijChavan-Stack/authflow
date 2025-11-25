import 'dotenv/config';
import mongoose from 'mongoose';
import Redis from 'ioredis';

async function testSetup() {
  console.log('🧪 Testing setup...\n');

  // Test MongoDB
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB connected successfully');
    await mongoose.disconnect();
  } catch (error) {
    console.log('❌ MongoDB connection failed:', error.message);
  }

  // Test Redis
  try {
    const redis = new Redis({
      host: process.env.REDIS_HOST,
      port: process.env.REDIS_PORT,
    });
    await redis.ping();
    console.log('✅ Redis connected successfully');
    redis.disconnect();
  } catch (error) {
    console.log('❌ Redis connection failed:', error.message);
  }

  console.log('\n✨ Setup verification complete!');
  process.exit(0);
}

testSetup();
