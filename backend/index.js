// Optional .env support without hard dependency
require('dotenv').config();

const express = require("express");
const fileUpload = require("express-fileupload");
const cors = require("cors");
const morgan = require("morgan");
const { connectDB } = require("./config/db");
const { upload } = require("./controllers/fileController");
const { getStatus } = require("./controllers/jobController");

const app = express();
const port = 3000;

// Middleware
app.use(morgan("combined"));
app.use(cors());
app.use(fileUpload({
    useTempFiles: true,
    tempFileDir: '/tmp/',
    limits: { fileSize: 10 * 1024 * 1024 },
}));

// Routes
app.post("/upload", upload);
app.get("/job/:jobId", getStatus);

// Optional: keep old route to avoid 404s; returns error encouraging new flow
app.post("/convertFile", (req, res) => {
    return res.status(400).json({ message: "Synchronous conversion disabled. Use /upload then poll /job/:jobId." });
});

// Start server
if (!process.env.AWS_S3_BUCKET) {
    console.error('Configuration error: AWS_S3_BUCKET is not set. Create backend/.env with AWS_S3_BUCKET and AWS credentials.');
}

connectDB().then(() => {
    console.log('Connected to MongoDB');
    app.listen(port, () => {
        console.log(`Server is listening on port ${port}`);
    });
}).catch(err => {
    console.error('MongoDB connection error:', err);
});