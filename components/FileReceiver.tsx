'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Download, File, Loader2, AlertCircle, ArrowRight } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface FileMetadata {
    originalName: string;
    size: number;
    mimeType: string;
}

export default function FileReceiver() {
    const [token, setToken] = useState('');
    const [loading, setLoading] = useState(false);
    const [fileData, setFileData] = useState<FileMetadata | null>(null);
    const [error, setError] = useState<string | null>(null);

    const checkFile = async () => {
        if (token.length < 6) return;
        setLoading(true);
        setError(null);
        try {
            const res = await fetch('/api/retrieve', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token }),
            });

            if (!res.ok) {
                throw new Error('File not found or expired');
            }

            const data = await res.json();
            setFileData(data);
        } catch (err) {
            console.error(err);
            setError('Invalid code or file expired.');
            setFileData(null);
        } finally {
            setLoading(false);
        }
    };

    const downloadFile = () => {
        if (!token) return;
        window.location.href = `/api/file/${token}`;
    };

    return (
        <div className="w-full max-w-lg mx-auto">
            {!fileData ? (
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col gap-6"
                >
                    <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-8 flex flex-col items-center">
                        <div className="mb-6 text-center">
                            <h3 className="text-xl font-semibold text-white mb-2">Have a code?</h3>
                            <p className="text-white/40 text-sm">Enter the 6-digit secure code to access the file.</p>
                        </div>

                        <div className="relative w-full max-w-xs mb-6">
                            <input
                                type="text"
                                value={token}
                                onChange={(e) => {
                                    const val = e.target.value.replace(/[^0-9]/g, '').slice(0, 6);
                                    setToken(val);
                                    if (val.length === 6) setError(null);
                                }}
                                placeholder="000000"
                                className="w-full bg-black/40 border border-white/10 focus:border-indigo-500 rounded-xl py-4 text-center text-3xl font-mono tracking-[0.25em] text-white placeholder:text-white/10 outline-none transition-all"
                            />
                        </div>

                        {error && (
                            <div className="flex items-center gap-2 text-red-400 text-sm mb-4 bg-red-500/10 px-4 py-2 rounded-lg">
                                <AlertCircle className="w-4 h-4" />
                                {error}
                            </div>
                        )}

                        <button
                            onClick={checkFile}
                            disabled={token.length !== 6 || loading}
                            className="w-full py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl font-medium transition-all disabled:opacity-50 flex items-center justify-center gap-2 group"
                        >
                            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                                <>
                                    <span>Find File</span>
                                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </button>
                    </div>
                </motion.div>
            ) : (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col gap-6"
                >
                    <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-8 flex flex-col items-center shadow-2xl">
                        <div className="w-20 h-20 bg-blue-500/20 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-blue-500/20">
                            <File className="w-10 h-10 text-blue-400" />
                        </div>

                        <h3 className="text-2xl font-bold text-white mb-1 text-center max-w-full truncate px-4">
                            {fileData.originalName}
                        </h3>
                        <p className="text-white/50 text-sm mb-8">
                            {(fileData.size / 1024 / 1024).toFixed(2)} MB • {fileData.mimeType || 'Unknown Type'}
                        </p>

                        <button
                            onClick={downloadFile}
                            className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-medium shadow-lg shadow-blue-900/20 transition-all active:scale-[0.98] flex items-center justify-center gap-2 mb-3"
                        >
                            <Download className="w-5 h-5" />
                            Download Now
                        </button>

                        <button
                            onClick={() => {
                                setFileData(null);
                                setToken('');
                            }}
                            className="text-white/40 hover:text-white text-sm transition-colors"
                        >
                            Cancel
                        </button>
                    </div>
                </motion.div>
            )}
        </div>
    );
}
