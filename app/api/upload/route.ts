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

        // Save file
        const fileName = await saveFile(file);

        // Generate 6-digit token
        // Ensure uniqueness in a real app, but for MVP random is fine 
        const token = crypto.randomInt(100000, 999999).toString();

        // Save metadata
        await saveMetadata({
            token,
            originalName: file.name,
            mimeType: file.type,
            size: file.size,
            filePath: fileName,
            createdAt: Date.now(),
        });

        return NextResponse.json({ token });
    } catch (error) {
        console.error('Upload error:', error);
        return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
    }
}
