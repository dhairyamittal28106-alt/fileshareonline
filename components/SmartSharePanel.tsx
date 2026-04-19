'use client';

import { useEffect, useMemo, useState } from 'react';
import { Bluetooth, Check, Copy, Loader2, Router, Share2, Wifi } from 'lucide-react';

interface SmartSharePanelProps {
    token: string;
    shareUrl: string;
    files?: File[];
    text?: string;
    copyLabel?: string;
}

interface NetworkInfo {
    localUrls: string[];
    isLanReachable: boolean;
}

const ABORT_ERROR_NAME = 'AbortError';

export default function SmartSharePanel({
    token,
    shareUrl,
    files = [],
    text,
    copyLabel = 'Copy Link',
}: SmartSharePanelProps) {
    const [networkInfo, setNetworkInfo] = useState<NetworkInfo | null>(null);
    const [networkLoading, setNetworkLoading] = useState(true);
    const [shareStatus, setShareStatus] = useState<'idle' | 'done' | 'error'>('idle');
    const [shareError, setShareError] = useState<string | null>(null);
    const [copiedTarget, setCopiedTarget] = useState<'code' | 'link' | 'wifi' | null>(null);
    const [nativeShareSupported, setNativeShareSupported] = useState(false);

    useEffect(() => {
        setNativeShareSupported(typeof navigator !== 'undefined' && typeof navigator.share === 'function');
    }, []);

    useEffect(() => {
        let cancelled = false;

        const loadNetworkInfo = async () => {
            try {
                const response = await fetch('/api/network-info', { cache: 'no-store' });
                if (!response.ok) {
                    throw new Error('Failed to detect local network');
                }

                const data = await response.json();
                if (!cancelled) {
                    setNetworkInfo(data);
                }
            } catch (error) {
                console.error(error);
                if (!cancelled) {
                    setNetworkInfo({ localUrls: [], isLanReachable: false });
                }
            } finally {
                if (!cancelled) {
                    setNetworkLoading(false);
                }
            }
        };

        loadNetworkInfo();

        return () => {
            cancelled = true;
        };
    }, []);

    const wifiUrl = useMemo(() => {
        if (!networkInfo?.localUrls.length) {
            return null;
        }

        const baseUrl = networkInfo.localUrls[0];
        return `${baseUrl}/?code=${token}`;
    }, [networkInfo, token]);

    const copyValue = async (value: string, target: 'code' | 'link' | 'wifi') => {
        await navigator.clipboard.writeText(value);
        setCopiedTarget(target);
        setTimeout(() => setCopiedTarget((current) => (current === target ? null : current)), 2000);
    };

    const handleNativeShare = async () => {
        if (!navigator.share) {
            setShareError('Native sharing is not available on this device or browser.');
            setShareStatus('error');
            return;
        }

        setShareError(null);
        setShareStatus('idle');

        const shareDataBase = {
            title: 'Secure ShareDrop transfer',
            text: text
                ? `Open this secure text share with code ${token}.`
                : `Open this secure file share with code ${token}.`,
            url: shareUrl,
        };

        try {
            if (files.length > 0 && navigator.canShare?.({ files })) {
                await navigator.share({
                    ...shareDataBase,
                    text: `Share directly, or open the backup link with code ${token}.`,
                    files,
                });
            } else if (text?.trim()) {
                await navigator.share({
                    ...shareDataBase,
                    text: `${text.slice(0, 1200)}${text.length > 1200 ? '…' : ''}`,
                });
            } else {
                await navigator.share(shareDataBase);
            }

            setShareStatus('done');
        } catch (error) {
            if (error instanceof Error && error.name === ABORT_ERROR_NAME) {
                return;
            }

            console.error(error);
            setShareError('Sharing failed on this device. You can still copy the internet or Wi-Fi link below.');
            setShareStatus('error');
        }
    };

    return (
        <div className="w-full rounded-2xl border border-white/10 bg-black/20 p-4 sm:p-5">
            <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                    <p className="text-[10px] uppercase tracking-[0.24em] text-white/35 font-semibold">Share Options</p>
                    <h4 className="text-white font-semibold mt-2">Bluetooth, Nearby Share, and same Wi-Fi</h4>
                    <p className="text-sm text-white/45 mt-1">
                        Use the native share sheet for Nearby Share or Bluetooth. Use the Wi-Fi link when both devices are on the same local network.
                    </p>
                </div>
                <div className="hidden sm:flex w-11 h-11 rounded-2xl border border-white/10 bg-white/5 items-center justify-center">
                    <Share2 className="w-5 h-5 text-indigo-300" />
                </div>
            </div>

            <div className="grid gap-3 md:grid-cols-2">
                <button
                    onClick={handleNativeShare}
                    disabled={!nativeShareSupported}
                    className="rounded-2xl border border-indigo-500/20 bg-indigo-500/10 hover:bg-indigo-500/15 px-4 py-4 text-left transition-colors"
                >
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-xl bg-indigo-500/15 border border-indigo-400/20 flex items-center justify-center">
                            <Bluetooth className="w-5 h-5 text-indigo-300" />
                        </div>
                        <div>
                            <p className="text-white font-medium">Nearby / Bluetooth</p>
                            <p className="text-xs text-white/45">
                                {nativeShareSupported ? 'Opens the device share sheet' : 'Not supported in this browser'}
                            </p>
                        </div>
                    </div>
                    <p className="text-sm text-white/60">
                        {nativeShareSupported
                            ? 'On Android or Windows this can hand off to Nearby Share, Bluetooth, Quick Share, or another installed share target.'
                            : 'Desktop browsers often do not expose native Bluetooth or Nearby Share. Use the Wi-Fi link below or open this page on a phone browser.'}
                    </p>
                    <span className="inline-flex mt-4 items-center gap-2 text-sm text-indigo-200">
                        {shareStatus === 'done' ? <Check className="w-4 h-4" /> : <Share2 className="w-4 h-4" />}
                        {shareStatus === 'done'
                            ? 'Share sheet opened'
                            : nativeShareSupported
                                ? 'Open share sheet'
                                : 'Unavailable here'}
                    </span>
                </button>

                <div className="rounded-2xl border border-emerald-500/15 bg-emerald-500/10 px-4 py-4">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-400/20 flex items-center justify-center">
                            {networkLoading ? <Loader2 className="w-5 h-5 text-emerald-300 animate-spin" /> : <Wifi className="w-5 h-5 text-emerald-300" />}
                        </div>
                        <div>
                            <p className="text-white font-medium">Same Wi-Fi</p>
                            <p className="text-xs text-white/45">Best for phones and laptops on one router</p>
                        </div>
                    </div>
                    {wifiUrl ? (
                        <>
                            <p className="text-sm text-white/60 mb-3">
                                Start the app on your computer and open this LAN link from the other device while both devices stay on the same Wi-Fi.
                            </p>
                            <div className="rounded-xl border border-white/10 bg-black/25 p-3">
                                <p className="text-[11px] uppercase tracking-[0.18em] text-white/30 mb-2">Wi-Fi Link</p>
                                <p className="text-sm text-white/75 break-all">{wifiUrl}</p>
                            </div>
                            <div className="mt-3 flex flex-wrap gap-2">
                                <button
                                    onClick={() => copyValue(wifiUrl, 'wifi')}
                                    className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 px-3 py-2 text-sm text-white transition-colors"
                                >
                                    <Router className="w-4 h-4" />
                                    {copiedTarget === 'wifi' ? 'Wi-Fi link copied' : 'Copy Wi-Fi link'}
                                </button>
                                <a
                                    href={wifiUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="inline-flex items-center gap-2 rounded-xl border border-emerald-400/20 bg-emerald-400/10 hover:bg-emerald-400/15 px-3 py-2 text-sm text-emerald-50 transition-colors"
                                >
                                    <Wifi className="w-4 h-4" />
                                    Open Wi-Fi link
                                </a>
                            </div>
                        </>
                    ) : (
                        <p className="text-sm text-white/60">
                            No private LAN address was detected here. If this app is deployed publicly, use the internet link instead. If you self-host locally, start Next.js with `--hostname 0.0.0.0`.
                        </p>
                    )}
                </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 mt-3">
                <button
                    onClick={() => copyValue(token, 'code')}
                    className="rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 px-4 py-3 text-sm text-white transition-colors inline-flex items-center justify-center gap-2"
                >
                    <Copy className="w-4 h-4" />
                    {copiedTarget === 'code' ? 'Code copied' : 'Copy Code'}
                </button>
                <button
                    onClick={() => copyValue(shareUrl, 'link')}
                    className="rounded-xl border border-indigo-500/20 bg-indigo-600/15 hover:bg-indigo-600/25 px-4 py-3 text-sm text-indigo-100 transition-colors inline-flex items-center justify-center gap-2"
                >
                    <Copy className="w-4 h-4" />
                    {copiedTarget === 'link' ? `${copyLabel} copied` : copyLabel}
                </button>
            </div>

            {shareError && (
                <div className="mt-3 rounded-xl border border-amber-400/20 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
                    {shareError}
                </div>
            )}
        </div>
    );
}
