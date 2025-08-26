const Job = require("../models/Job");
const { getSignedUrl } = require("../services/fileService");

async function getStatus(req, res) {
    try {
        const job = await Job.findById(req.params.jobId);
        if (!job) {
            return res.status(404).json({ message: "Job not found" });
        }

        const response = {
            _id: job._id,
            status: job.status,
            message: job.message,
        };

        if (job.originalS3Key) {
            response.originalFileUrl = getSignedUrl(job.originalS3Key);
        }
        if (job.convertedS3Key) {
            response.convertedFileUrl = getSignedUrl(job.convertedS3Key);
        }

        return res.json(response);
    } catch (error) {
        return res.status(500).json({ message: 'Error fetching job status' });
    }
}

module.exports = { getStatus };


