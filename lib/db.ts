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
  files: Array<{
    originalName: string;
    mimeType: string;
    size: number;
    filePath: string; // Blob URL
    fileKey?: string; // UploadThing Key
  }>;
  textContent?: string; // For text sharing
  createdAt: number;
};

export async function saveMetadata(metadata: FileMetadata) {
  if (!redis) throw new Error('Redis client not initialized');

  // 1. Save metadata with a 15-minute expiration (900 seconds)
  await redis.set(metadata.token, JSON.stringify(metadata), 'EX', 900);

  // 2. Schedule all files for physical deletion
  for (const file of metadata.files) {
    const expiresAt = Date.now() + 15 * 60 * 1000;
    await redis.zadd('cleanup_schedule', expiresAt, JSON.stringify({
      url: file.filePath,
      key: file.fileKey,
      token: metadata.token
    }));
  }
}

export async function getMetadata(token: string): Promise<FileMetadata | null> {
  if (!redis) return null;
  const data = await redis.get(token);
  return data ? JSON.parse(data) : null;
}

export async function incrementTotalFiles() {
  if (!redis) return 0;
  return await redis.incr('stats:total_files');
}

export async function getTotalFiles() {
  if (!redis) return 0;
  const count = await redis.get('stats:total_files');
  return count ? parseInt(count, 10) : 0;
}

/**
 * Triggers the cleanup API to purge expired files.
 * This can be called "lazily" during other operations.
 */
export async function triggerCleanup() {
  try {
    // We call the API endpoint. In production, this might be a full URL.
    // For local dev, we use localhost.
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    // We don't await this to keep it non-blocking
    fetch(`${baseUrl}/api/cron/cleanup`, { method: 'GET' }).catch(console.error);
  } catch (e) {
    console.error('Failed to trigger cleanup:', e);
  }
}
