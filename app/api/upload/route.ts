import { NextRequest, NextResponse } from 'next/server';
import { saveFile } from '@/lib/storage';
import { saveMetadata } from '@/lib/db';
import crypto from 'crypto';

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return NextResponse.json({ error: 'No file provided' }, { status: 400 });
        }

        // Debug logging
        console.log('Starting upload...');
        if (!process.env.BLOB_READ_WRITE_TOKEN) {
            console.error('Missing BLOB_READ_WRITE_TOKEN');
            return NextResponse.json({ error: 'Server configuration error: Missing Blob Token' }, { status: 500 });
        }
        if (!process.env.REDIS_URL) {
            console.error('Missing REDIS_URL');
            return NextResponse.json({ error: 'Server configuration error: Missing REDIS_URL' }, { status: 500 });
        }

        // Save file
        let fileName;
        try {
            fileName = await saveFile(file);
        } catch (storageError: any) {
            console.error('Storage Error:', storageError);
            return NextResponse.json({ error: `Storage Failed: ${storageError.message}` }, { status: 502 });
        }

        // Generate 6-digit token
        const token = crypto.randomInt(100000, 999999).toString();

        // Save metadata
        try {
            await saveMetadata({
                token,
                originalName: file.name,
                mimeType: file.type,
                size: file.size,
                filePath: fileName,
                createdAt: Date.now(),
            });
        } catch (dbError: any) {
            console.error('Database Error:', dbError);
            return NextResponse.json({ error: `Database Failed: ${dbError.message}` }, { status: 502 });
        }

        return NextResponse.json({ token });
    } catch (error) {
        console.error('Upload error:', error);
        return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
    }
}
