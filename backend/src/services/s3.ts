import AWS from "aws-sdk";
import { v4 as uuidv4 } from "uuid";

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION || "us-east-1",
});

export const uploadToS3 = async (
  buffer: Buffer,
  filename: string,
  contentType: string,
): Promise<string> => {
  const key = `uploads/${uuidv4()}-${filename}`;

  const params = {
    Bucket: process.env.AWS_S3_BUCKET!,
    Key: key,
    Body: buffer,
    ContentType: contentType,
    ACL: "public-read",
  };

  await s3.upload(params).promise();

  return `https://${process.env.AWS_S3_BUCKET}.s3.amazonaws.com/${key}`;
};

export const deleteFromS3 = async (key: string): Promise<void> => {
  const params = {
    Bucket: process.env.AWS_S3_BUCKET!,
    Key: key,
  };

  await s3.deleteObject(params).promise();
};
