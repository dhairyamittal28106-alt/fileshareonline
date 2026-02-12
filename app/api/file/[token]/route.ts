import { NextRequest, NextResponse } from 'next/server';
import { getMetadata } from '@/lib/db';

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ token: string }> } // Updated to Promise for Next.js 15+ compat, though 14 works with straight object
) {
    // Await params if it's a promise (handling potential future Next.js changes or strict types)
    const resolvedParams = await params;
    const token = resolvedParams.token;

    if (!token) {
        return NextResponse.json({ error: 'Token is required' }, { status: 400 });
    }

    const metadata = await getMetadata(token);

    if (!metadata) {
        return NextResponse.json({ error: 'Invalid token or file expired' }, { status: 404 });
    }

    // metadata.filePath now contains the Vercel Blob URL
    const fileUrl = metadata.filePath;

    try {
        // Fetch the file from Vercel Blob
        const response = await fetch(fileUrl);

        if (!response.ok) {
            return NextResponse.json({ error: 'Failed to fetch file from storage' }, { status: 502 });
        }

        // Create a new response with the blob's body
        // We assume the blob is public and accessible
        const blob = await response.blob();

        return new NextResponse(blob, {
            headers: {
                'Content-Length': metadata.size.toString(),
                'Content-Type': metadata.mimeType || 'application/octet-stream',
                'Content-Disposition': `attachment; filename="${metadata.originalName}"`,
            },
        });
    } catch (error) {
        console.error('Proxy error:', error);
        return NextResponse.json({ error: 'Internal server error during download' }, { status: 500 });
    }
}
