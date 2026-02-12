import { NextRequest, NextResponse } from 'next/server';
import { getMetadata } from '@/lib/db';
import { getFilePath } from '@/lib/storage';
import fs from 'fs';

export async function GET(
    req: NextRequest,
    { params }: { params: { token: string } }
) {
    const token = params.token;

    if (!token) {
        return NextResponse.json({ error: 'Token is required' }, { status: 400 });
    }

    const metadata = await getMetadata(token);

    if (!metadata) {
        return NextResponse.json({ error: 'Invalid token or file expired' }, { status: 404 });
    }

    const filePath = getFilePath(metadata.filePath);

    if (!fs.existsSync(filePath)) {
        return NextResponse.json({ error: 'File not found on server' }, { status: 410 });
    }

    // Use simple readFileSync for MVP to avoid streaming syntax issues
    const fileBuffer = fs.readFileSync(filePath);

    return new NextResponse(fileBuffer, {
        headers: {
            'Content-Length': metadata.size.toString(),
            'Content-Type': metadata.mimeType || 'application/octet-stream',
            'Content-Disposition': `attachment; filename="${metadata.originalName}"`,
        },
    });
}
