import { NextRequest, NextResponse } from 'next/server';
import { popIncomingTransfer, queueIncomingTransfer } from '@/lib/db';

export async function GET(req: NextRequest) {
    try {
        const deviceId = req.nextUrl.searchParams.get('deviceId');
        if (!deviceId) {
            return NextResponse.json({ error: 'Device id is required' }, { status: 400 });
        }

        const transfer = await popIncomingTransfer(deviceId);
        return NextResponse.json({ transfer });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Failed to fetch inbox' }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const targetDeviceId = String(body.targetDeviceId || '');
        const token = String(body.token || '');
        const fromDeviceId = String(body.fromDeviceId || '');
        const fromDeviceName = String(body.fromDeviceName || '').slice(0, 40);
        const kind = body.kind === 'text' ? 'text' : 'file';

        if (!targetDeviceId || !token || !fromDeviceId || !fromDeviceName) {
            return NextResponse.json({ error: 'Missing transfer details' }, { status: 400 });
        }

        await queueIncomingTransfer(targetDeviceId, {
            token,
            fromDeviceId,
            fromDeviceName,
            kind,
            createdAt: Date.now(),
        });

        return NextResponse.json({ ok: true });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Failed to send transfer' }, { status: 500 });
    }
}
