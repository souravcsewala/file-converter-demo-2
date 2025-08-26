// workers/converterWorker.js
'use strict';

const fs = require('fs');
const path = require('path');

// --- Load .env only if the file actually exists (local dev) ---
// In Docker (with --env-file) and on Render (dashboard vars), this will be skipped.
const envPath = path.resolve(__dirname, '../.env');
if (fs.existsSync(envPath)) {
  require('dotenv').config({ path: envPath });
  console.log(`[env] Loaded .env from ${envPath}`);
} else {
  console.log('[env] No local .env file found. Using process environment.');
}

// --- Imports ---
const Job = require('../models/Job');
const { connectDB } = require('../config/db');
const {
  downloadFromS3,
  uploadBufferToS3,
  generateS3Key,
} = require('../services/fileService');
const { convertDocToPdf } = require('../services/convertService');
const { claimPendingJob, completeJob, failJob } = require('../services/jobService');

// --- Config ---
const POLL_INTERVAL_MS = Number.parseInt(process.env.WORKER_POLL_MS || '20000', 10);

// --- Worker loop ---
async function processOne() {
  const job = await claimPendingJob();

  if (!job) return;

  console.log('Claimed job:', job._id?.toString?.() || job._id, 'original key:', job.originalS3Key);

  try {
    const inputBuffer = await downloadFromS3(job.originalS3Key);

    // Convert and prepare output file name/key
    const outputBuffer = await convertDocToPdf(inputBuffer);
    const originalName = job.originalFileName || 'document.docx';
    const outputFileName = originalName.replace(/\.(doc|docx)$/i, '.pdf');
    const convertedKey = generateS3Key('converted', outputFileName);

    // Upload converted PDF
    await uploadBufferToS3(outputBuffer, convertedKey, 'application/pdf');

    // Mark job as complete
    await completeJob(job, convertedKey);

    console.log(`✅ Job ${job._id} completed → ${convertedKey}`);
  } catch (err) {
    // Mark job as failed
    await failJob(job, err.message || 'Unknown conversion error');

    console.error(`❌ Job ${job._id} failed:`, err?.message || err);
    // Optional: log full stack
    if (err?.stack) console.error(err.stack);
  }
}

let intervalHandle;

async function start() {
  await connectDB();
  console.log('Worker connected to MongoDB. Starting polling...');

  // Optional visibility: list pending jobs at boot
  try {
    const pendingJobs = await Job.find({ status: 'pending' }).limit(10);
    console.log(`Pending jobs in DB (showing up to 10): ${pendingJobs.length}`);
  } catch (e) {
    console.warn('Warning: could not list pending jobs at startup:', e?.message || e);
  }

  intervalHandle = setInterval(processOne, POLL_INTERVAL_MS);
  // Don’t keep the process alive forever if nothing else is running
  intervalHandle.unref?.();
}

// Graceful shutdown
async function shutdown(signal) {
  try {
    console.log(`\nReceived ${signal}. Shutting down worker...`);
    if (intervalHandle) clearInterval(intervalHandle);
    // If your connectDB exposes a close/disconnect, call it here (e.g., mongoose.disconnect())
    // Example:
    // const mongoose = require('mongoose');
    // await mongoose.disconnect();
  } catch (e) {
    console.error('Error during shutdown:', e?.message || e);
  } finally {
    process.exit(0);
  }
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));

start().catch((e) => {
  console.error('Worker failed to start:', e?.message || e);
  if (e?.stack) console.error(e.stack);
  process.exit(1);
});
