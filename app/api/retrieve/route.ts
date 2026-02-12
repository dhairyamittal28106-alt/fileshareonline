import { NextRequest, NextResponse } from 'next/server';
import { getMetadata } from '@/lib/db';

export async function POST(req: NextRequest) {
    try {
        const { token } = await req.json();

        if (!token) {
            return NextResponse.json({ error: 'Token is required' }, { status: 400 });
        }

        const metadata = await getMetadata(token);

        if (!metadata) {
            return NextResponse.json({ error: 'Invalid token' }, { status: 404 });
        }

        // Return metadata without internal file path
        const { filePath, ...publicMetadata } = metadata;

        return NextResponse.json(publicMetadata);
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}
