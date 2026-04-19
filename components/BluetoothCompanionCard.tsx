'use client';

import { useEffect, useState } from 'react';
import { Bluetooth, Check, Loader2 } from 'lucide-react';

const COMPANION_BASE_URL = 'http://127.0.0.1:45721';

interface BluetoothCompanionCardProps {
    kind: 'file' | 'text';
    token: string;
    shareUrl: string;
}

export default function BluetoothCompanionCard({
    kind,
    token,
    shareUrl,
}: BluetoothCompanionCardProps) {
    const [companionState, setCompanionState] = useState<'checking' | 'online' | 'offline'>('checking');
    const [sendState, setSendState] = useState<'idle' | 'sending' | 'done' | 'error'>('idle');

    useEffect(() => {
        let cancelled = false;

        const checkCompanion = async () => {
            try {
                const response = await fetch(`${COMPANION_BASE_URL}/health`, { cache: 'no-store' });
                if (!response.ok) {
                    throw new Error('Companion not available');
                }

                if (!cancelled) {
                    setCompanionState('online');
                }
            } catch {
                if (!cancelled) {
                    setCompanionState('offline');
                }
            }
        };

        checkCompanion();
        const interval = window.setInterval(checkCompanion, 8000);

        return () => {
            cancelled = true;
            window.clearInterval(interval);
        };
    }, []);

    const sendToCompanion = async () => {
        setSendState('sending');

        try {
            const response = await fetch(`${COMPANION_BASE_URL}/share`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    kind,
                    token,
                    shareUrl,
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to hand off share');
            }

            setSendState('done');
        } catch (error) {
            console.error(error);
            setSendState('error');
        }
    };

    if (companionState === 'offline') {
        return null;
    }

    return (
        <div className="w-full rounded-2xl border border-sky-500/15 bg-sky-500/10 p-4">
            <div className="flex items-start gap-3 mb-4">
                <div className="w-11 h-11 rounded-2xl border border-sky-400/20 bg-sky-400/10 flex items-center justify-center shrink-0">
                    <Bluetooth className="w-5 h-5 text-sky-200" />
                </div>
                <div>
                    <p className="text-[10px] uppercase tracking-[0.22em] text-white/35 font-semibold">Bluetooth Companion</p>
                    <h4 className="text-white font-semibold mt-1">Bluetooth Share</h4>
                    <p className="text-sm text-white/45 mt-1">
                        Send this share to the Bluetooth app on your computer. After the app is ready, users only need to tap one button here.
                    </p>
                </div>
            </div>

            {companionState === 'online' ? (
                <div className="space-y-3">
                    <div className="rounded-xl border border-emerald-400/20 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-50 flex items-center gap-2">
                        <Check className="w-4 h-4" />
                        Bluetooth app is ready on this computer
                    </div>
                    <button
                        onClick={sendToCompanion}
                        disabled={sendState === 'sending'}
                        className="w-full rounded-xl border border-sky-400/20 bg-sky-400/10 hover:bg-sky-400/15 px-4 py-3 text-sm font-medium text-sky-50 transition-colors disabled:opacity-60"
                    >
                        {sendState === 'sending' ? (
                            <span className="inline-flex items-center gap-2">
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Sending to desktop companion...
                            </span>
                        ) : sendState === 'done' ? (
                            'Sent to Bluetooth app'
                        ) : sendState === 'error' ? (
                            'Try Bluetooth again'
                        ) : (
                            'Send by Bluetooth'
                        )}
                    </button>
                </div>
            ) : (
                <div className="rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white/65">
                    Checking Bluetooth app...
                </div>
            )}
        </div>
    );
}
