const mongoose = require('mongoose');

// Enhanced connection options for different network scenarios
const getConnectionOptions = () => {
  return {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 30000, // Increased timeout for network issues
    socketTimeoutMS: 45000,
    connectTimeoutMS: 30000,
    heartbeatFrequencyMS: 10000,
    maxPoolSize: 10,
    minPoolSize: 2,
    maxIdleTimeMS: 30000,
    bufferCommands: false,
    retryWrites: true,
    retryReads: true,
    // Additional options for network resilience
    family: 4, // Use IPv4, skip trying IPv6
  };
};

// Function to check current IP address
const getCurrentIP = async () => {
  try {
    const https = require('https');
    return new Promise((resolve, reject) => {
      const req = https.get('https://api.ipify.org?format=json', (res) => {
        let data = '';
        res.on('data', (chunk) => data += chunk);
        res.on('end', () => {
          try {
            const parsed = JSON.parse(data);
            resolve(parsed.ip);
          } catch (e) {
            reject(e);
          }
        });
      });
      req.on('error', reject);
      req.setTimeout(5000, () => {
        req.destroy();
        reject(new Error('IP check timeout'));
      });
    });
  } catch (error) {
    return 'Unknown';
  }
};

// Enhanced connection function with retry logic
const connectWithRetry = async (retryCount = 0, maxRetries = 3) => {
  try {
    const options = getConnectionOptions();
    
    console.log(`🔄 Attempting MongoDB connection (attempt ${retryCount + 1}/${maxRetries + 1})...`);
    
    // Check current IP
    const currentIP = await getCurrentIP();
    console.log(`🌐 Current IP Address: ${currentIP}`);
    
    const conn = await mongoose.connect(process.env.MONGODB_URI, options);

    console.log('✅ MongoDB Connected Successfully');
    console.log(`📊 Database: ${conn.connection.name}`);
    console.log(`🌍 Host: ${conn.connection.host}`);
    console.log(`🔗 Connection State: ${mongoose.connection.readyState}`);

    return conn;

  } catch (error) {
    console.error(`❌ MongoDB Connection Attempt ${retryCount + 1} Failed:`, error.message);
    
    if (error.message.includes('IP') || error.message.includes('whitelist')) {
      console.log('🚨 IP WHITELIST ISSUE DETECTED!');
      console.log('📋 SOLUTIONS:');
      console.log('   1. Add your current IP to MongoDB Atlas whitelist');
      console.log('   2. Use 0.0.0.0/0 for development (allows all IPs)');
      console.log('   3. Switch to mobile hotspot if ethernet has restrictions');
      console.log('   4. Check if your ISP/network blocks MongoDB Atlas ports');
    }

    if (retryCount < maxRetries) {
      const delay = Math.pow(2, retryCount) * 2000; // Exponential backoff
      console.log(`⏳ Retrying in ${delay/1000} seconds...`);
      
      await new Promise(resolve => setTimeout(resolve, delay));
      return connectWithRetry(retryCount + 1, maxRetries);
    } else {
      throw error;
    }
  }
};

const connectDB = async () => {
  try {
    await connectWithRetry();

    // Enhanced connection event handlers
    mongoose.connection.on('error', (err) => {
      console.error('❌ MongoDB connection error:', err.message);
      if (err.message.includes('IP') || err.message.includes('whitelist')) {
        console.log('🚨 Network/IP issue detected. Consider switching networks.');
      }
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('⚠️  MongoDB disconnected. Attempting to reconnect...');
    });

    mongoose.connection.on('reconnected', () => {
      console.log('✅ MongoDB reconnected successfully');
    });

    mongoose.connection.on('close', () => {
      console.log('🔒 MongoDB connection closed');
    });

    // Graceful shutdown
    process.on('SIGINT', async () => {
      try {
        await mongoose.connection.close();
        console.log('🔒 MongoDB connection closed through app termination');
        process.exit(0);
      } catch (error) {
        console.error('Error during graceful shutdown:', error);
        process.exit(1);
      }
    });

  } catch (error) {
    console.error('❌ MongoDB Connection Failed After All Retries:', error.message);
    
    // Provide network-specific guidance
    console.log('\n🔧 NETWORK TROUBLESHOOTING GUIDE:');
    console.log('================================');
    console.log('1. ETHERNET CONNECTION ISSUES:');
    console.log('   - Corporate/ISP firewall may block MongoDB Atlas');
    console.log('   - Try switching to mobile hotspot');
    console.log('   - Contact network admin to whitelist MongoDB Atlas IPs');
    console.log('\n2. MOBILE HOTSPOT WORKS:');
    console.log('   - Your ethernet network has restrictions');
    console.log('   - Use mobile data for development');
    console.log('   - Configure VPN if available');
    console.log('\n3. MONGODB ATLAS SETUP:');
    console.log('   - Add 0.0.0.0/0 to IP whitelist for development');
    console.log('   - Check cluster status in Atlas dashboard');
    console.log('   - Verify connection string is correct');
    
    // Don't exit immediately in development
    if (process.env.NODE_ENV === 'development') {
      console.log('\n⚠️  Running in development mode without database connection');
      console.log('🔄 Server will continue running. Switch networks and restart.');
      return null;
    } else {
      process.exit(1);
    }
  }
};

module.exports = connectDB;