'use client';

import { useEffect, useState } from 'react';
import { Check, Loader2, Smartphone, Wifi } from 'lucide-react';
import { DeviceIdentity, getStoredDeviceIdentity, saveDeviceName } from '@/lib/deviceIdentity';

type RemoteDevice = {
    id: string;
    name: string;
    mode: 'send' | 'receive' | 'idle';
    lastSeen: number;
};

interface DevicePickerProps {
    mode: 'send' | 'receive' | 'idle';
    selectedDeviceId: string | null;
    onSelectDevice: (device: RemoteDevice | null) => void;
    onIdentityReady?: (identity: DeviceIdentity) => void;
    compact?: boolean;
}

export default function DevicePicker({
    mode,
    selectedDeviceId,
    onSelectDevice,
    onIdentityReady,
    compact = false,
}: DevicePickerProps) {
    const [identity, setIdentity] = useState<DeviceIdentity | null>(null);
    const [name, setName] = useState('');
    const [devices, setDevices] = useState<RemoteDevice[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const nextIdentity = getStoredDeviceIdentity();
        setIdentity(nextIdentity);
        setName(nextIdentity.name);
        onIdentityReady?.(nextIdentity);
    }, [onIdentityReady]);

    useEffect(() => {
        if (!identity) {
            return;
        }

        let cancelled = false;

        const syncPresence = async () => {
            try {
                const trimmedName = (window.localStorage.getItem('pdfshareonline-device-name') || identity.name).trim();

                await fetch('/api/devices', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        id: identity.id,
                        name: trimmedName,
                        mode,
                    }),
                });

                const response = await fetch(`/api/devices?self=${identity.id}`, { cache: 'no-store' });
                if (!response.ok) {
                    throw new Error('Failed to load devices');
                }

                const data = await response.json();
                if (!cancelled) {
                    setDevices(data.devices || []);
                    setLoading(false);
                }
            } catch (error) {
                console.error(error);
                if (!cancelled) {
                    setLoading(false);
                }
            }
        };

        syncPresence();
        const interval = window.setInterval(syncPresence, 6000);

        return () => {
            cancelled = true;
            window.clearInterval(interval);
        };
    }, [identity, mode]);

    return (
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 md:p-5">
            <div className={`flex items-start gap-3 ${compact ? 'mb-3' : 'mb-4'}`}>
                <div className="w-11 h-11 rounded-2xl border border-emerald-400/20 bg-emerald-400/10 flex items-center justify-center shrink-0">
                    <Wifi className="w-5 h-5 text-emerald-300" />
                </div>
                <div>
                    <p className="text-[10px] uppercase tracking-[0.22em] text-white/35 font-semibold">Live Devices</p>
                    <h4 className="text-white font-semibold mt-1">Devices on this app</h4>
                    <p className="text-sm text-white/45 mt-1">
                        {compact
                            ? 'Open this site on the other phone or laptop and it will appear here.'
                            : 'Open this website on the other phone or laptop, and it will appear here for direct sending.'}
                    </p>
                </div>
            </div>

            <div className={compact ? 'mb-3' : 'mb-4'}>
                <label className="block text-[11px] uppercase tracking-[0.18em] text-white/30 mb-2">Your device name</label>
                <input
                    value={name}
                    onChange={(event) => {
                        const nextName = event.target.value.slice(0, 40);
                        setName(nextName);
                        saveDeviceName(nextName);
                        if (identity) {
                            const nextIdentity = { ...identity, name: nextName };
                            setIdentity(nextIdentity);
                            onIdentityReady?.(nextIdentity);
                        }
                    }}
                    className="w-full rounded-xl border border-white/10 bg-black/25 px-4 py-3 text-white outline-none focus:border-emerald-400/40"
                    placeholder="My phone"
                />
            </div>

            <div className="rounded-2xl border border-white/10 bg-black/20 overflow-hidden">
                <div className="px-4 py-3 border-b border-white/10 text-[11px] uppercase tracking-[0.18em] text-white/35">
                    Available devices
                </div>
                {loading ? (
                    <div className="px-4 py-6 flex items-center justify-center text-white/50 gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Scanning active browsers...
                    </div>
                ) : devices.length === 0 ? (
                    <div className={`px-4 ${compact ? 'py-5' : 'py-6'} text-sm text-white/45 text-center`}>
                        No other active device yet. Open this site on another phone or laptop on the same Wi-Fi and keep it open.
                    </div>
                ) : (
                    <div className="divide-y divide-white/10">
                        {devices.map((device) => (
                            <button
                                key={device.id}
                                onClick={() => onSelectDevice(selectedDeviceId === device.id ? null : device)}
                                className="w-full px-4 py-4 text-left hover:bg-white/[0.04] transition-colors"
                            >
                                <div className="flex items-center justify-between gap-3">
                                    <div className="flex items-center gap-3 overflow-hidden">
                                        <div className="w-10 h-10 rounded-xl border border-white/10 bg-white/5 flex items-center justify-center shrink-0">
                                            <Smartphone className="w-4 h-4 text-white/70" />
                                        </div>
                                        <div className="overflow-hidden">
                                            <p className="text-white font-medium truncate">{device.name}</p>
                                            <p className="text-xs text-white/40">
                                                {device.mode === 'receive' ? 'Ready to receive' : device.mode === 'send' ? 'Browsing' : 'Online'}
                                            </p>
                                        </div>
                                    </div>
                                    {selectedDeviceId === device.id ? (
                                        <span className="inline-flex items-center gap-2 text-sm text-emerald-300">
                                            <Check className="w-4 h-4" />
                                            Selected
                                        </span>
                                    ) : (
                                        <span className="text-sm text-white/45">Select</span>
                                    )}
                                </div>
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
