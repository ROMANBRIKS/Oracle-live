import AWS from "aws-sdk";

// Lazy initialization to prevent crash if env vars are missing
let s3Instance: AWS.S3 | null = null;

export const getS3 = () => {
  if (!s3Instance) {
    if (!process.env.AWS_ACCESS_KEY || !process.env.AWS_SECRET_KEY) {
      console.warn("AWS S3 credentials missing. Cloud uploads will fail.");
      // We don't throw here to avoid crashing the server on startup
      // but actual upload attempts will fail.
    }
    
    s3Instance = new AWS.S3({
      accessKeyId: process.env.AWS_ACCESS_KEY,
      secretAccessKey: process.env.AWS_SECRET_KEY,
      region: process.env.AWS_REGION || "us-east-1",
    });
  }
  return s3Instance;
};

export default getS3;
