'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Type, Check, Copy, Loader2, X, Text } from 'lucide-react';
import { twMerge } from 'tailwind-merge';

export default function TextSharer() {
    const [text, setText] = useState('');
    const [loading, setLoading] = useState(false);
    const [token, setToken] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

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
                            Use this code to retrieve your text on any device.
                        </p>

                        <div className="relative w-full mb-8 group">
                            <div className="absolute inset-0 bg-indigo-500/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                            <div className="relative bg-black/40 border border-white/10 rounded-xl p-6 flex flex-col items-center gap-2">
                                <span className="text-sm text-white/30 uppercase tracking-widest font-semibold">Security Code</span>
                                <span className="text-5xl font-mono font-bold text-white tracking-[0.2em]">{token}</span>
                            </div>
                        </div>

                        <div className="flex gap-3 w-full">
                            <button
                                onClick={copyToken}
                                className="flex-1 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white font-medium transition-colors flex items-center justify-center gap-2"
                            >
                                <Copy className="w-4 h-4" />
                                Copy Code
                            </button>
                            <button
                                onClick={() => {
                                    setToken(null);
                                    setText('');
                                }}
                                className="flex-1 py-3 bg-transparent hover:bg-white/5 text-white/60 hover:text-white rounded-xl transition-colors text-sm"
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
