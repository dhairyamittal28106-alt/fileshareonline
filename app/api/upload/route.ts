import { NextRequest, NextResponse } from 'next/server';
import { saveFile } from '@/lib/storage';
import { saveMetadata } from '@/lib/db';
import crypto from 'crypto';

export async function POST(req: NextRequest) {
    try {
        let fileUrl;
        let originalName;
        let mimeType;
        let size;
        let key;

        const contentType = req.headers.get('content-type') || '';

        if (contentType.includes('application/json')) {
            // Handle metadata sync from UploadThing
            const body = await req.json();
            fileUrl = body.url;
            originalName = body.name;
            mimeType = 'application/octet-stream';
            size = body.size;
            key = body.key;
        } else {
            // Fallback or Legacy
            return NextResponse.json({ error: 'This endpoint now expects JSON metadata from UploadThing' }, { status: 400 });
        }

        // Generate 6-digit token
        const token = crypto.randomInt(100000, 999999).toString();

        // Save metadata
        try {
            await saveMetadata({
                token,
                originalName,
                mimeType,
                size,
                filePath: fileUrl,
                fileKey: key, // Pass the key for cleanup
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
