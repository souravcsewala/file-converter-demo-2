const Job = require("../models/Job");

async function createJob(data) {
    return Job.create(data);
}

async function claimPendingJob() {
    const now = new Date();
    return Job.findOneAndUpdate(
        { status: 'pending' },
        { $set: { status: 'processing', startedAt: now } },
        { new: true, sort: { createdAt: 1 } }
    );
}

async function completeJob(job, convertedS3Key) {
    job.status = 'completed';
    job.convertedS3Key = convertedS3Key;
    job.completedAt = new Date();
    await job.save();
}

async function failJob(job, message) {
    job.status = 'failed';
    job.message = message;
    await job.save();
}

module.exports = {
    createJob,
    claimPendingJob,
    completeJob,
    failJob,
};


