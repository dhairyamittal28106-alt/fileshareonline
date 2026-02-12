import fs from 'fs/promises';
import path from 'path';

const UPLOAD_DIR = path.join(process.cwd(), '.uploads');

export async function saveFile(file: File): Promise<string> {
    await fs.mkdir(UPLOAD_DIR, { recursive: true });

    const buffer = Buffer.from(await file.arrayBuffer());
    const fileName = `${crypto.randomUUID()}-${file.name}`;
    const filePath = path.join(UPLOAD_DIR, fileName);

    await fs.writeFile(filePath, buffer);
    return fileName;
}

export function getFilePath(fileName: string): string {
    return path.join(UPLOAD_DIR, fileName);
}
