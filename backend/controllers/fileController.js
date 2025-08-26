const path = require("path");
const Job = require("../models/Job");
const { uploadToS3, generateS3Key, removeLocalFile } = require("../services/fileService");

function getContentTypeByExt(ext) {
    if (ext === '.doc') return 'application/msword';
    return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
}

async function upload(req, res) {
    try {
        if (!req.files || !req.files.file) {
            return res.status(400).json({ message: "No file uploaded" });
        }

        const uploadedFile = req.files.file;
        const fileExtension = path.extname(uploadedFile.name).toLowerCase();
        const allowedExtensions = ['.doc', '.docx'];
        if (!allowedExtensions.includes(fileExtension)) {
            return res.status(400).json({ message: "Only .doc and .docx files are supported" });
        }

        const tempFilePath = uploadedFile.tempFilePath || path.join('/tmp', uploadedFile.name);
        if (!uploadedFile.tempFilePath) {
            await uploadedFile.mv(tempFilePath);
        }

        const originalS3Key = generateS3Key('uploads', uploadedFile.name);
        await uploadToS3(tempFilePath, originalS3Key, getContentTypeByExt(fileExtension));

        const job = await Job.create({
            originalFileName: uploadedFile.name,
            originalS3Key,
            status: 'pending'
        });

        removeLocalFile(tempFilePath);

        return res.json({
            message: 'Upload successful, conversion scheduled',
            jobId: job._id
        });
    } catch (error) {
        console.log("upload error" ,error)
        return res.status(500).json({ message: 'Upload error', error: error.message });
    }
}

module.exports = { upload };


