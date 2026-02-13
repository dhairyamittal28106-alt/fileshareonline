import Redis from 'ioredis';

// Use a singleton pattern to prevent multiple connections in serverless environment
let redis: Redis | null = null;

if (!process.env.REDIS_URL) {
  console.error('Missing REDIS_URL environment variable');
} else {
  // In production (Vercel), usually we want to reuse the connection if possible,
  // though with serverless functions new connections might be created per invocation.
  // ioredis handles connection pooling well.
  redis = new Redis(process.env.REDIS_URL);
}

export type FileMetadata = {
  token: string;
  originalName: string;
  mimeType: string;
  size: number;
  filePath: string; // Blob URL
  fileKey?: string; // UploadThing Key
  createdAt: number;
};

export async function saveMetadata(metadata: FileMetadata) {
  if (!redis) throw new Error('Redis client not initialized');

  // 1. Save metadata with a 15-minute expiration (900 seconds)
  await redis.set(metadata.token, JSON.stringify(metadata), 'EX', 900);

  // 2. Schedule for physical deletion (backup if user doesn't access it)
  // We use a Sorted Set where Score = Expiration Timestamp
  if (metadata.fileKey) {
    const expiresAt = Date.now() + 15 * 60 * 1000;
    await redis.zadd('cleanup_schedule', expiresAt, JSON.stringify({ key: metadata.fileKey, token: metadata.token }));
  }
}

export async function getMetadata(token: string): Promise<FileMetadata | null> {
  if (!redis) return null;
  const data = await redis.get(token);
  return data ? JSON.parse(data) : null;
}
