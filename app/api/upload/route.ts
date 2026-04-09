import { NextRequest, NextResponse } from 'next/server';

import { saveMetadata, incrementTotalFiles, triggerCleanup } from '@/lib/db';
import crypto from 'crypto';

export async function POST(req: NextRequest) {
    try {
        // Trigger lazy cleanup
        triggerCleanup();
        const contentType = req.headers.get('content-type') || '';

        if (!contentType.includes('application/json')) {
            return NextResponse.json({ error: 'Invalid content type' }, { status: 400 });
        }

        const body = await req.json();
        const files = body.files;

        if (!files || !Array.isArray(files) || files.length === 0) {
            return NextResponse.json({ error: 'No files provided' }, { status: 400 });
        }

        // Generate 6-digit token
        const token = crypto.randomInt(100000, 999999).toString();

        interface FileRecord {
            name: string;
            url: string;
            size: number;
            key: string;
            mimeType?: string;
        }

        // Prepare metadata
        const metadata = {
            token,
            files: (files as FileRecord[]).map((f) => ({
                originalName: f.name,
                mimeType: f.mimeType || 'application/octet-stream',
                size: f.size,
                filePath: f.url,
                fileKey: f.key,
            })),
            createdAt: Date.now(),
        };

        // Save metadata
        try {
            await saveMetadata(metadata);
            await incrementTotalFiles();
            return NextResponse.json({ token });
        } catch (dbError: unknown) {
            console.error('Database Error:', dbError);
            const errorMessage = dbError instanceof Error ? dbError.message : 'Unknown error';
            return NextResponse.json({ error: `Database Failed: ${errorMessage}` }, { status: 502 });
        }
    } catch (error) {
        console.error('Upload error:', error);
        return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
    }
}
