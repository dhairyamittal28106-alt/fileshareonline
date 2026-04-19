'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Loader2, SendHorizontal, Text } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import BluetoothCompanionCard from '@/components/BluetoothCompanionCard';
import DevicePicker from '@/components/DevicePicker';
import type { DeviceIdentity } from '@/lib/deviceIdentity';

type TargetDevice = {
    id: string;
    name: string;
    mode: 'send' | 'receive' | 'idle';
    lastSeen: number;
};

export default function TextSharer() {
    const [text, setText] = useState('');
    const [loading, setLoading] = useState(false);
    const [token, setToken] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [origin, setOrigin] = useState('');
    const [selectedDevice, setSelectedDevice] = useState<TargetDevice | null>(null);
    const [identity, setIdentity] = useState<DeviceIdentity | null>(null);
    const [deliveryStatus, setDeliveryStatus] = useState<string | null>(null);
    const [sendingToDevice, setSendingToDevice] = useState(false);

    useEffect(() => {
        setOrigin(window.location.origin);
    }, []);

    const shareUrl = `${origin}/?code=${token}`;

    const shareText = async () => {
        if (!text.trim()) return;
        setLoading(true);
        setError(null);
        try {
            const res = await fetch('/api/share-text', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text }),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Failed to share text');
            }

            const data = await res.json();
            setToken(data.token);
            setDeliveryStatus(null);
        } catch (err: unknown) {
            const errorMessage = err instanceof Error ? err.message : 'Unknown error';
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const sendToSelectedDevice = async () => {
        if (!token || !selectedDevice || !identity) {
            return;
        }

        setSendingToDevice(true);
        setError(null);

        try {
            const transferResponse = await fetch('/api/devices/inbox', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    targetDeviceId: selectedDevice.id,
                    token,
                    fromDeviceId: identity.id,
                    fromDeviceName: identity.name,
                    kind: 'text',
                }),
            });

            if (!transferResponse.ok) {
                throw new Error('Direct delivery failed.');
            }

            setDeliveryStatus(`Sent to ${selectedDevice.name}`);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Direct delivery failed.');
        } finally {
            setSendingToDevice(false);
        }
    };

    return (
        <div className="w-full max-w-lg mx-auto">
            <AnimatePresence mode="wait">
                {!token ? (
                    <motion.div
                        key="input"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="flex flex-col gap-6"
                    >
                        <div className="relative">
                            <textarea
                                value={text}
                                onChange={(e) => setText(e.target.value)}
                                placeholder="Paste or type your text here..."
                                className="w-full h-64 bg-white/5 border border-white/10 rounded-2xl p-6 text-white placeholder:text-white/20 outline-none focus:border-indigo-500/50 resize-none transition-all duration-300"
                                maxLength={50000}
                            />
                            <div className="absolute bottom-4 right-4 text-xs text-white/20 pointer-events-none">
                                {text.length} / 50000
                            </div>
                        </div>

                        {error && (
                            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-200 text-sm text-center">
                                <p>{error}</p>
                            </div>
                        )}

                        <button
                            onClick={shareText}
                            disabled={!text.trim() || loading}
                            className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-medium shadow-lg shadow-indigo-900/20 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    <span>Creating Link...</span>
                                </>
                            ) : (
                                <>
                                    {selectedDevice ? <SendHorizontal className="w-5 h-5" /> : <Text className="w-5 h-5" />}
                                    <span>{selectedDevice ? `Send to ${selectedDevice.name}` : 'Share Text Securely'}</span>
                                </>
                            )}
                        </button>
                    </motion.div>
                ) : (
                    <motion.div
                        key="success"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[28px] p-5 md:p-7 shadow-2xl"
                    >
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-14 h-14 bg-emerald-500/20 rounded-2xl flex items-center justify-center shrink-0">
                                <Check className="w-7 h-7 text-emerald-400" />
                            </div>
                            <div>
                                <h3 className="text-2xl font-bold text-white">{deliveryStatus ? 'Delivered to Device' : 'Text Shared'}</h3>
                                <p className="text-sm text-white/50 mt-1">
                                    {deliveryStatus || 'Scan the QR or use the code and link below.'}
                                </p>
                                <p className="text-[11px] text-indigo-300 font-medium uppercase tracking-[0.18em] mt-2">Expires in 15 minutes</p>
                            </div>
                        </div>

                        <div className="grid gap-4 md:grid-cols-[220px_minmax(0,1fr)] w-full mb-5">
                            <div className="rounded-[24px] bg-white p-4 shadow-2xl border-4 border-white/10 flex items-center justify-center min-h-[220px]">
                                <QRCodeSVG value={shareUrl} size={168} level="H" includeMargin={false} />
                            </div>

                            <div className="grid gap-4">
                                <div className="relative group">
                                    <div className="absolute inset-0 bg-indigo-500/20 blur-xl rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
                                    <div className="relative bg-black/40 border border-white/10 rounded-2xl p-4 flex flex-col gap-2">
                                        <span className="text-[10px] text-white/30 uppercase tracking-widest font-semibold">Security Code</span>
                                        <span className="text-4xl md:text-[2.6rem] leading-none font-mono font-bold text-white tracking-[0.18em]">{token}</span>
                                    </div>
                                </div>

                                <div className="rounded-2xl border border-white/10 bg-black/25 p-4">
                                    <div className="flex items-center justify-between gap-3 mb-3">
                                        <span className="text-[10px] text-white/30 uppercase tracking-widest font-semibold">Share Link</span>
                                        <button
                                            onClick={() => navigator.clipboard.writeText(shareUrl)}
                                            className="px-3 py-1.5 rounded-lg border border-indigo-500/20 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-200 text-xs font-medium transition-colors"
                                        >
                                            Copy Link
                                        </button>
                                    </div>
                                    <p className="text-sm text-white/75 break-all">{shareUrl}</p>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col gap-3 w-full">
                            <BluetoothCompanionCard
                                kind="text"
                                token={token}
                                shareUrl={shareUrl}
                            />
                            <DevicePicker
                                mode="send"
                                selectedDeviceId={selectedDevice?.id || null}
                                onSelectDevice={setSelectedDevice}
                                onIdentityReady={setIdentity}
                                compact
                            />
                            <button
                                onClick={sendToSelectedDevice}
                                disabled={!selectedDevice || sendingToDevice}
                                className="w-full py-3 px-4 bg-emerald-600/15 hover:bg-emerald-600/25 border border-emerald-500/20 rounded-xl text-emerald-100 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {sendingToDevice ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        <span>Sending to device...</span>
                                    </>
                                ) : (
                                    <>
                                        <SendHorizontal className="w-4 h-4" />
                                        <span>{selectedDevice ? `Send to ${selectedDevice.name}` : 'Select a device to send'}</span>
                                    </>
                                )}
                            </button>
                            <button
                                onClick={() => {
                                    setToken(null);
                                    setText('');
                                    setDeliveryStatus(null);
                                    setSelectedDevice(null);
                                }}
                                className="w-full py-3 px-4 bg-transparent hover:bg-white/5 text-white/60 hover:text-white rounded-xl transition-colors text-xs"
                            >
                                Share New
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
