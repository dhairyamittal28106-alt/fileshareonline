import { kv } from '@vercel/kv';

export type FileMetadata = {
  token: string;
  originalName: string;
  mimeType: string;
  size: number;
  filePath: string; // This will now store the Blob URL
  createdAt: number;
};

export async function saveMetadata(metadata: FileMetadata) {
  // Save metadata with a 24-hour expiration (86400 seconds)
  await kv.set(metadata.token, metadata, { ex: 86400 });
}

export async function getMetadata(token: string): Promise<FileMetadata | null> {
  const metadata = await kv.get<FileMetadata>(token);
  return metadata || null;
}
