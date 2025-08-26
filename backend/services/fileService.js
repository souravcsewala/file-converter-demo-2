// Optional .env support without hard dependency


const fs = require("fs");
const path = require("path");
const s3 = require("../config/s3");

function getBucketName() {
    const bucket = process.env.AWS_S3_BUCKET;
    if (!bucket || !bucket.trim()) {
        throw new Error("Configuration error: AWS_S3_BUCKET is not set. Set it in your environment or .env file.");
    }
    return bucket;
}

async function uploadToS3(localFilePath, key, contentType) {
    const uploadParams = {
        Bucket: getBucketName(),
        Key: key,
        Body: fs.createReadStream(localFilePath),
        ContentType: contentType,
    };
    await s3.upload(uploadParams).promise();
}

async function uploadBufferToS3(buffer, key, contentType) {
    const uploadParams = {
        Bucket: getBucketName(),
        Key: key,
        Body: buffer,
        ContentType: contentType,
    };
    await s3.upload(uploadParams).promise();
}

async function downloadFromS3(key) {
    const params = { Bucket: getBucketName(), Key: key };
    const obj = await s3.getObject(params).promise();
    return obj.Body;
}

function getSignedUrl(key, expiresSeconds = 86400) {
    return s3.getSignedUrl('getObject', {
        Bucket: getBucketName(),
        Key: key,
        Expires: expiresSeconds,
    });
}

function removeLocalFile(filePath) {
    try {
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }
    } catch (_) {
        // ignore
    }
}

function generateS3Key(prefix, originalFileName) {
    const safeName = path.basename(originalFileName).replace(/\s+/g, "_");
    return `${prefix}/${Date.now()}_${safeName}`;
}

module.exports = {
    uploadToS3,
    uploadBufferToS3,
    downloadFromS3,
    getSignedUrl,
    removeLocalFile,
    generateS3Key,
};


