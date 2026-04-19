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

export type ActiveDevice = {
  id: string;
  name: string;
  mode: 'send' | 'receive' | 'idle';
  lastSeen: number;
  networkSegment?: string;
};

export type IncomingTransfer = {
  token: string;
  fromDeviceName: string;
  fromDeviceId: string;
  kind: 'file' | 'text';
  createdAt: number;
};

const DEVICE_TTL_SECONDS = 35;
const DEVICE_INDEX_KEY = 'devices:active';

function deviceKey(deviceId: string) {
  return `device:${deviceId}`;
}

function inboxKey(deviceId: string) {
  return `device_inbox:${deviceId}`;
}

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

export async function saveDevicePresence(device: ActiveDevice) {
  if (!redis) throw new Error('Redis client not initialized');

  const payload = JSON.stringify(device);
  const pipeline = redis.pipeline();
  pipeline.set(deviceKey(device.id), payload, 'EX', DEVICE_TTL_SECONDS);
  pipeline.zadd(DEVICE_INDEX_KEY, device.lastSeen, device.id);
  pipeline.expire(DEVICE_INDEX_KEY, DEVICE_TTL_SECONDS * 4);
  await pipeline.exec();
}

export async function listActiveDevices(options: {
  excludeDeviceId?: string;
  preferredNetworkSegment?: string;
}) {
  if (!redis) return [];

  const now = Date.now();
  const cutoff = now - DEVICE_TTL_SECONDS * 1000;
  await redis.zremrangebyscore(DEVICE_INDEX_KEY, 0, cutoff);

  const deviceIds = await redis.zrevrangebyscore(DEVICE_INDEX_KEY, now, cutoff);
  if (deviceIds.length === 0) {
    return [];
  }

  const payloads = await redis.mget(deviceIds.map((id) => deviceKey(id)));
  const devices = payloads
    .filter((value): value is string => Boolean(value))
    .map((value) => JSON.parse(value) as ActiveDevice)
    .filter((device) => device.id !== options.excludeDeviceId);

  const sameNetworkDevices = options.preferredNetworkSegment
    ? devices.filter((device) => device.networkSegment === options.preferredNetworkSegment)
    : [];

  const visibleDevices = sameNetworkDevices.length > 0 ? sameNetworkDevices : devices;

  return visibleDevices.sort((left, right) => right.lastSeen - left.lastSeen);
}

export async function queueIncomingTransfer(targetDeviceId: string, transfer: IncomingTransfer) {
  if (!redis) throw new Error('Redis client not initialized');

  const key = inboxKey(targetDeviceId);
  const pipeline = redis.pipeline();
  pipeline.lpush(key, JSON.stringify(transfer));
  pipeline.ltrim(key, 0, 9);
  pipeline.expire(key, 180);
  await pipeline.exec();
}

export async function popIncomingTransfer(deviceId: string): Promise<IncomingTransfer | null> {
  if (!redis) return null;

  const value = await redis.rpop(inboxKey(deviceId));
  return value ? (JSON.parse(value) as IncomingTransfer) : null;
}
