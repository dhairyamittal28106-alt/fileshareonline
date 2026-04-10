'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Type, Check, Copy, Loader2, X, Text, QrCode, Share2 } from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import { QRCodeSVG } from 'qrcode.react';

export default function TextSharer() {
    const [text, setText] = useState('');
    const [loading, setLoading] = useState(false);
    const [token, setToken] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [origin, setOrigin] = useState('');

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
        } catch (err: unknown) {
            const errorMessage = err instanceof Error ? err.message : 'Unknown error';
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const copyToken = () => {
        if (token) {
            navigator.clipboard.writeText(token);
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
                                    <Text className="w-5 h-5" />
                                    <span>Share Text Securely</span>
                                </>
                            )}
                        </button>
                    </motion.div>
                ) : (
                    <motion.div
                        key="success"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex flex-col items-center bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl"
                    >
                        <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mb-6">
                            <Check className="w-10 h-10 text-emerald-400" />
                        </div>

                        <h3 className="text-2xl font-bold text-white mb-2">Text Shared</h3>
                        <p className="text-white/50 text-center mb-8 max-w-xs">
                            Scan the QR code or use the security code to retrieve your text.
                            <span className="block mt-2 text-indigo-400 font-medium text-xs uppercase tracking-wider">Expires in 15 minutes</span>
                        </p>

                        <div className="flex flex-col items-center gap-6 mb-8 w-full">
                            {/* QR Code Section */}
                            <div className="bg-white p-4 rounded-2xl shadow-2xl border-4 border-white/10">
                                <QRCodeSVG
                                    value={shareUrl}
                                    size={160}
                                    level="H"
                                    includeMargin={false}
                                />
                            </div>

                            <div className="relative w-full group">
                                <div className="absolute inset-0 bg-indigo-500/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                                <div className="relative bg-black/40 border border-white/10 rounded-xl p-4 flex flex-col items-center gap-1">
                                    <span className="text-[10px] text-white/30 uppercase tracking-widest font-semibold">Security Code</span>
                                    <span className="text-4xl font-mono font-bold text-white tracking-[0.2em]">{token}</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col gap-3 w-full">
                            <div className="flex flex-col sm:flex-row gap-3 sm:gap-6 w-full">
                                <button
                                    onClick={copyToken}
                                    className="w-full sm:flex-1 py-3 px-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white font-medium transition-colors flex items-center justify-center gap-2 text-sm"
                                >
                                    <Copy className="w-4 h-4" />
                                    Copy Code
                                </button>
                                <button
                                    onClick={() => {
                                        navigator.clipboard.writeText(shareUrl);
                                        const btn = document.getElementById('copy-url-btn');
                                        if (btn) {
                                            const originalText = btn.innerHTML;
                                            btn.innerHTML = 'Link Copied!';
                                            setTimeout(() => btn.innerHTML = originalText, 2000);
                                        }
                                    }}
                                    id="copy-url-btn"
                                    className="w-full sm:flex-1 py-3 px-4 bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/20 rounded-xl text-indigo-300 font-medium transition-colors flex items-center justify-center gap-2 text-sm"
                                >
                                    <Share2 className="w-4 h-4" />
                                    Copy Link
                                </button>
                            </div>
                            <button
                                onClick={() => {
                                    setToken(null);
                                    setText('');
                                }}
                                className="w-full py-2 bg-transparent hover:bg-white/5 text-white/60 hover:text-white rounded-xl transition-colors text-xs"
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
