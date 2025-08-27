// backend/config/db.js
const mongoose = require('mongoose');

const uri = process.env.MONGODB_URI; // mongodb+srv://.../yourdb?retryWrites=true&w=majority

let connected = false;

async function connectDB() {
  if (connected) return;

  await mongoose.connect(uri, {
    // Make the connection resilient for long conversions
    socketTimeoutMS: 30 * 60 * 1000,     // 10 min; bump if needed
    connectTimeoutMS: 30 * 1000,         // 30s
    serverSelectionTimeoutMS: 30 * 1000, // 30s to find a node
    heartbeatFrequencyMS: 10 * 1000,     // faster failover detection
    maxPoolSize: 10,
    retryWrites: true,
    // Keep the TCP alive even when idle
    keepAlive: true,
    keepAliveInitialDelay: 300000,       // 5 min
    // Prefer IPv4 (avoids some SRV/IPv6 edge cases)
    family: 4,
  });

  const c = mongoose.connection;
  c.on('connected', () => console.log('Mongo connected:', c.host));
  c.on('disconnected', () => console.error('Mongo disconnected'));
  c.on('reconnectFailed', () => console.error('Mongo reconnect failed'));
  c.on('error', (e) => console.error('Mongo error:', e));

  connected = true;
}

module.exports = { connectDB };
