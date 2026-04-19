import { NextRequest, NextResponse } from 'next/server';
import { listActiveDevices, saveDevicePresence } from '@/lib/db';

function extractClientIp(req: NextRequest) {
    const forwarded = req.headers.get('x-forwarded-for');
    if (forwarded) {
        return forwarded.split(',')[0]?.trim() || '';
    }

    return req.headers.get('x-real-ip') || '';
}

function toNetworkSegment(ip: string) {
    const match = ip.match(/^(\d+)\.(\d+)\.(\d+)\.\d+$/);
    return match ? `${match[1]}.${match[2]}.${match[3]}` : undefined;
}

export async function GET(req: NextRequest) {
    try {
        const selfId = req.nextUrl.searchParams.get('self') || undefined;
        const preferredNetworkSegment = toNetworkSegment(extractClientIp(req));
        const devices = await listActiveDevices({
            excludeDeviceId: selfId,
            preferredNetworkSegment,
        });

        return NextResponse.json({ devices });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Failed to load devices' }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const device = {
            id: String(body.id || ''),
            name: String(body.name || '').slice(0, 40),
            mode: body.mode === 'send' || body.mode === 'receive' ? body.mode : 'idle',
            lastSeen: Date.now(),
            networkSegment: toNetworkSegment(extractClientIp(req)),
        };

        if (!device.id || !device.name) {
            return NextResponse.json({ error: 'Device id and name are required' }, { status: 400 });
        }

        await saveDevicePresence(device);
        return NextResponse.json({ ok: true });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Failed to save device presence' }, { status: 500 });
    }
}
