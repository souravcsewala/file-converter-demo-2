// Optional .env support without hard dependency

const AWS = require("aws-sdk");

const s3 = new AWS.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION || 'us-east-1'
});   


// async function testS3() {
//     try {
//       const result = await s3.listBuckets().promise();
//       console.log("Buckets:");
//       result.Buckets.forEach(bucket => console.log("-", bucket.Name));
//     } catch (err) {
//       console.error("AWS S3 Error:", err.message);
//       console.error(err);
//     }
//   }

//   testS3();

module.exports = s3;


