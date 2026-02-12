import fs from 'fs/promises';
import path from 'path';

const DB_PATH = path.join(process.cwd(), 'data/db.json');

export type FileMetadata = {
  token: string;
  originalName: string;
  mimeType: string;
  size: number;
  filePath: string;
  createdAt: number;
};

// Ensure data directory exists
const ensureDb = async () => {
  try {
    const dir = path.dirname(DB_PATH);
    await fs.mkdir(dir, { recursive: true });
    try {
      await fs.access(DB_PATH);
    } catch {
      await fs.writeFile(DB_PATH, JSON.stringify([], null, 2));
    }
  } catch (error) {
    console.error('Error ensuring DB:', error);
  }
};

export async function saveMetadata(metadata: FileMetadata) {
  await ensureDb();
  const data = await fs.readFile(DB_PATH, 'utf-8');
  const files: FileMetadata[] = JSON.parse(data || '[]');
  files.push(metadata);
  await fs.writeFile(DB_PATH, JSON.stringify(files, null, 2));
}

export async function getMetadata(token: string): Promise<FileMetadata | null> {
  await ensureDb();
  const data = await fs.readFile(DB_PATH, 'utf-8');
  const files: FileMetadata[] = JSON.parse(data || '[]');
  return files.find((f) => f.token === token) || null;
}
