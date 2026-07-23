import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const s3 = new S3Client({
  region: process.env.VITE_S3_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.VITE_S3_ACCESS_KEY || '',
    secretAccessKey: process.env.VITE_S3_SECRET_KEY || '',
  },
});

export async function getPresignedUrl(key: string, contentType: string) {
  const command = new PutObjectCommand({
    Bucket: process.env.VITE_S3_BUCKET || '',
    Key: key,
    ContentType: contentType,
  });
  return getSignedUrl(s3, command, { expiresIn: 3600 });
}
