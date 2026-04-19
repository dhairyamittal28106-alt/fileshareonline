'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Bell, X } from 'lucide-react';
import { getStoredDeviceIdentity } from '@/lib/deviceIdentity';

type IncomingTransfer = {
    token: string;
    fromDeviceName: string;
    kind: 'file' | 'text';
};

export default function IncomingTransferWatcher() {
    const [transfer, setTransfer] = useState<IncomingTransfer | null>(null);

    useEffect(() => {
        const identity = getStoredDeviceIdentity();
        let cancelled = false;

        const syncPresence = async () => {
            try {
                await fetch('/api/devices', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        id: identity.id,
                        name: identity.name,
                        mode: 'idle',
                    }),
                });
            } catch (error) {
                console.error(error);
            }
        };

        const pollInbox = async () => {
            try {
                const response = await fetch(`/api/devices/inbox?deviceId=${identity.id}`, { cache: 'no-store' });
                if (!response.ok) {
                    return;
                }

                const data = await response.json();
                if (!cancelled && data.transfer) {
                    setTransfer(data.transfer);
                }
            } catch (error) {
                console.error(error);
            }
        };

        syncPresence();
        pollInbox();
        const inboxInterval = window.setInterval(pollInbox, 4000);
        const presenceInterval = window.setInterval(syncPresence, 10000);

        return () => {
            cancelled = true;
            window.clearInterval(inboxInterval);
            window.clearInterval(presenceInterval);
        };
    }, []);

    if (!transfer) {
        return null;
    }

    return (
        <div className="fixed bottom-4 right-4 z-50 w-[calc(100vw-2rem)] max-w-sm rounded-3xl border border-emerald-400/20 bg-slate-950/95 p-5 shadow-2xl backdrop-blur-xl">
            <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                    <div className="w-11 h-11 rounded-2xl border border-emerald-400/20 bg-emerald-400/10 flex items-center justify-center shrink-0">
                        <Bell className="w-5 h-5 text-emerald-300" />
                    </div>
                    <div>
                        <p className="text-white font-semibold">Incoming {transfer.kind}</p>
                        <p className="text-sm text-white/55 mt-1">
                            {transfer.fromDeviceName} sent you a {transfer.kind}. Open it now.
                        </p>
                    </div>
                </div>
                <button
                    onClick={() => setTransfer(null)}
                    className="p-2 rounded-xl hover:bg-white/5 text-white/45 hover:text-white transition-colors"
                >
                    <X className="w-4 h-4" />
                </button>
            </div>
            <div className="flex gap-3 mt-4">
                <Link
                    href={`/?code=${transfer.token}`}
                    className="flex-1 inline-flex items-center justify-center gap-2 rounded-2xl border border-emerald-400/20 bg-emerald-400/10 px-4 py-3 text-sm font-medium text-emerald-50 hover:bg-emerald-400/15 transition-colors"
                >
                    Open Now
                    <ArrowRight className="w-4 h-4" />
                </Link>
                <button
                    onClick={() => setTransfer(null)}
                    className="px-4 py-3 rounded-2xl border border-white/10 bg-white/5 text-sm text-white hover:bg-white/10 transition-colors"
                >
                    Later
                </button>
            </div>
        </div>
    );
}
