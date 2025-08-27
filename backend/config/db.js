// backend/config/db.js
const mongoose = require('mongoose');

const uri = process.env.MONGODB_URI; // e.g. mongodb+srv://.../yourdb?retryWrites=true&w=majority

let connected = false;

async function connectDB() {
  if (connected) return;
  if (!uri) throw new Error('MONGODB_URI is not set');

  await mongoose.connect(uri, {
    // Keep operations alive long enough for big conversions
    socketTimeoutMS: 30 * 60 * 1000,        // 30 minutes (timeout for I/O on a socket)
    serverSelectionTimeoutMS: 30 * 1000,    // 30s to find a node
    connectTimeoutMS: 30 * 1000,            // 30s to establish the initial TCP connection
    heartbeatFrequencyMS: 10 * 1000,        // monitor pings more frequently
    maxPoolSize: 10,

    // Useful extras
    maxIdleTimeMS: 10 * 60 * 1000,          // 10 minutes before closing *idle* pooled sockets
    retryWrites: true,
    family: 4,                              // prefer IPv4 to dodge some SRV/IPv6 issues
  });

  const c = mongoose.connection;
  c.on('connected', () => console.log('Mongo connected:', c.host));
  c.on('disconnected', () => console.error('Mongo disconnected'));
  c.on('reconnectFailed', () => console.error('Mongo reconnect failed'));
  c.on('error', (e) => console.error('Mongo error:', e));

  connected = true;
}

module.exports = { connectDB };
