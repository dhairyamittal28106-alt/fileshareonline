'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Download, File, Loader2, AlertCircle, ArrowRight, Check, Copy } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface FileMetadata {
    files: Array<{
        originalName: string;
        size: number;
        mimeType: string;
    }>;
    textContent?: string;
    createdAt: number;
}

export default function FileReceiver({ initialToken = '' }: { initialToken?: string }) {
    const [token, setToken] = useState(initialToken);
    const [loading, setLoading] = useState(false);
    const [fileData, setFileData] = useState<FileMetadata | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        if (initialToken && initialToken.length === 6) {
            checkFile(initialToken);
        }
    }, []); // Only runs on mount. Relies on 'key' prop for resets.

    const checkFile = async (explicitToken?: string) => {
        const tokenToUse = explicitToken || token;
        if (tokenToUse.length < 6) return;
        setLoading(true);
        setError(null);
        try {
            const res = await fetch('/api/retrieve', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token: tokenToUse }),
            });

            if (!res.ok) {
                throw new Error('File not found or expired');
            }

            const data = await res.json();
            setFileData(data);
        } catch (err) {
            console.error(err);
            setError('Invalid code or expired.');
            setFileData(null);
        } finally {
            setLoading(false);
        }
    };

    const downloadFile = (index: number = 0) => {
        if (!token) return;
        window.location.href = `/api/file/${token}?index=${index}`;
    };

    const copyText = () => {
        if (fileData?.textContent) {
            navigator.clipboard.writeText(fileData.textContent);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    }

    return (
        <div className="w-full max-w-lg mx-auto">
            {!fileData ? (
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col gap-6"
                >
                    <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-8 flex flex-col items-center">
                        <div className="mb-4 md:mb-6 text-center">
                            <h3 className="text-lg md:text-xl font-semibold text-white mb-2">Have a code?</h3>
                            <p className="text-white/40 text-xs md:text-sm">Enter the 6-digit secure code to access the shared content.</p>
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
                                className="w-full bg-black/40 border border-white/10 focus:border-indigo-500 rounded-xl py-3 md:py-4 text-center text-2xl md:text-3xl font-mono tracking-[0.2em] md:tracking-[0.25em] text-white placeholder:text-white/10 outline-none transition-all"
                            />
                        </div>

                        {error && (
                            <div className="flex items-center gap-2 text-red-400 text-sm mb-4 bg-red-500/10 px-4 py-2 rounded-lg">
                                <AlertCircle className="w-4 h-4" />
                                {error}
                            </div>
                        )}

                        <button
                            onClick={() => checkFile()}
                            disabled={token.length !== 6 || loading}
                            className="w-full py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl font-medium transition-all disabled:opacity-50 flex items-center justify-center gap-2 group"
                        >
                            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                                <>
                                    <span>Retrieve</span>
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
                    <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-8 flex flex-col items-center shadow-2xl w-full">
                        {fileData.textContent ? (
                            <>
                                <div className="w-full mb-6 relative">
                                    <div className="absolute top-0 right-0 p-2">
                                        <button
                                            onClick={copyText}
                                            className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
                                        >
                                            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-white/60" />}
                                        </button>
                                    </div>
                                    <h3 className="text-base md:text-lg font-semibold text-white mb-3">Shared Text</h3>
                                    <div className="w-full max-h-[300px] md:max-h-96 overflow-y-auto bg-black/40 rounded-xl p-4 border border-white/10 text-white/80 font-mono text-xs md:text-sm whitespace-pre-wrap leading-relaxed">
                                        {fileData.textContent}
                                    </div>
                                </div>
                                <div className="flex flex-col sm:flex-row w-full gap-3 sm:gap-6">
                                    <button
                                        onClick={copyText}
                                        className="w-full sm:flex-1 py-3 px-4 sm:py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-medium shadow-lg shadow-indigo-900/20 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                                    >
                                        <Copy className="w-5 h-5" />
                                        {copied ? 'Copied!' : 'Copy Text'}
                                    </button>
                                    <button
                                        onClick={() => {
                                            setFileData(null);
                                            setToken('');
                                        }}
                                        className="w-full sm:w-auto py-3 px-4 sm:py-4 sm:px-6 bg-white/5 hover:bg-white/10 text-white rounded-xl font-medium transition-colors"
                                    >
                                        Done
                                    </button>
                                </div>
                            </>
                        ) : (
                            <div className="w-full flex flex-col gap-6">
                                <div className="text-center">
                                    <h3 className="text-2xl font-bold text-white mb-1">Shared Files</h3>
                                    <p className="text-white/40 text-sm">
                                        Received {fileData.files.length} {fileData.files.length === 1 ? 'file' : 'files'}
                                    </p>
                                </div>

                                <div className="flex flex-col gap-3 w-full max-h-[400px] overflow-y-auto pr-2">
                                    {fileData.files.map((file, idx) => (
                                        <div
                                            key={`${file.originalName}-${idx}`}
                                            className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-colors group"
                                        >
                                            <div className="flex items-center gap-4 overflow-hidden">
                                                <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center shrink-0 shadow-lg shadow-blue-500/10">
                                                    <File className="w-6 h-6 text-blue-400" />
                                                </div>
                                                <div className="overflow-hidden">
                                                    <p className="text-white font-semibold truncate">{file.originalName}</p>
                                                    <p className="text-white/40 text-xs mt-0.5">
                                                        {(file.size / 1024 / 1024).toFixed(2)} MB • {file.mimeType.split('/')[1]?.toUpperCase() || 'FILE'}
                                                    </p>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => downloadFile(idx)}
                                                className="p-3 bg-blue-600/20 hover:bg-blue-600 text-blue-400 hover:text-white rounded-xl transition-all active:scale-[0.95]"
                                                title="Download"
                                            >
                                                <Download className="w-5 h-5" />
                                            </button>
                                        </div>
                                    ))}
                                </div>

                                <button
                                    onClick={() => {
                                        setFileData(null);
                                        setToken('');
                                    }}
                                    className="w-full py-4 mt-2 bg-white/5 hover:bg-white/10 text-white/60 hover:text-white rounded-xl font-medium transition-colors border border-white/5"
                                >
                                    Done
                                </button>
                            </div>
                        )}
                    </div>
                </motion.div>
            )}
        </div>
    );
}
