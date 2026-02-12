import { put } from '@vercel/blob';

export async function saveFile(file: File): Promise<string> {
    const filename = `${crypto.randomUUID()}-${file.name}`;
    const blob = await put(filename, file, {
        access: 'public',
    });

    return blob.url;
}

export function getFilePath(fileName: string): string {
    return fileName; // In the blob version, the "fileName" stored in metadata is actually the full URL
}
