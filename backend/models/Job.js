const mongoose = require("mongoose");

const jobSchema = new mongoose.Schema({
    originalFileName: String,
    originalS3Key: String,
    convertedS3Key: String,
    status: { type: String, enum: ['pending', 'processing', 'completed', 'failed'], default: 'pending' },
    message: String,
    createdAt: { type: Date, default: Date.now },
    startedAt: Date,
    completedAt: Date
});

const Job = mongoose.model('Job', jobSchema);

module.exports = Job;


