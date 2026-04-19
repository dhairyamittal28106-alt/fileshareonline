import { NextResponse } from 'next/server';
import { networkInterfaces } from 'node:os';

const VIRTUAL_INTERFACE_PATTERNS = [
    /vmware/i,
    /virtualbox/i,
    /hyper-v/i,
    /vethernet/i,
    /loopback/i,
    /docker/i,
    /tailscale/i,
];

function isPrivateIpv4(address: string) {
    return (
        address.startsWith('10.') ||
        address.startsWith('192.168.') ||
        /^172\.(1[6-9]|2\d|3[0-1])\./.test(address)
    );
}

function getPriority(name: string) {
    if (/wi-?fi|wireless|wlan/i.test(name)) {
        return 0;
    }

    if (/ethernet/i.test(name)) {
        return 1;
    }

    return 2;
}

export async function GET() {
    const interfaces = networkInterfaces();
    const port = process.env.PORT || '3000';
    const candidates: Array<{ name: string; address: string }> = [];

    for (const [name, entries] of Object.entries(interfaces)) {
        if (VIRTUAL_INTERFACE_PATTERNS.some((pattern) => pattern.test(name))) {
            continue;
        }

        for (const entry of entries || []) {
            if (entry.family !== 'IPv4' || entry.internal || !isPrivateIpv4(entry.address)) {
                continue;
            }

            candidates.push({ name, address: entry.address });
        }
    }

    candidates.sort((left, right) => {
        const priorityDiff = getPriority(left.name) - getPriority(right.name);
        if (priorityDiff !== 0) {
            return priorityDiff;
        }

        return left.name.localeCompare(right.name);
    });

    const localUrls = Array.from(
        new Set(candidates.map((candidate) => `http://${candidate.address}:${port}`))
    );

    return NextResponse.json({
        localUrls,
        isLanReachable: localUrls.length > 0,
    });
}
