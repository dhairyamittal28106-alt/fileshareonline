import { NextRequest, NextResponse } from 'next/server';
import { saveMetadata, incrementTotalFiles } from '@/lib/db';
import crypto from 'crypto';

export async function POST(req: NextRequest) {
    try {
        const { text } = await req.json();

        if (!text || typeof text !== 'string') {
            return NextResponse.json({ error: 'Text content is required' }, { status: 400 });
        }

        // Limit text size to 100KB to prevent abuse
        if (text.length > 100000) {
            return NextResponse.json({ error: 'Text is too long (max 100KB)' }, { status: 400 });
        }

        const token = crypto.randomInt(100000, 999999).toString();

        await saveMetadata({
            token,
            originalName: 'Text Snippet',
            mimeType: 'text/plain',
            size: new Blob([text]).size,
            textContent: text,
            filePath: '', // Not applicable for text
            createdAt: Date.now(),
        });

        await incrementTotalFiles();

        return NextResponse.json({ token });
    } catch (error) {
        console.error('Share text error:', error);
        return NextResponse.json({ error: 'Failed to share text' }, { status: 500 });
    }
}
