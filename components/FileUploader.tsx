'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, File, Check, Copy, Loader2, X, Share2, QrCode } from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import { useUploadThing } from "@/lib/uploadthing";
import { QRCodeSVG } from 'qrcode.react';

export default function FileUploader() {
    const [files, setFiles] = useState<File[]>([]);
    const [token, setToken] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [origin, setOrigin] = useState('');

    useEffect(() => {
        setOrigin(window.location.origin);
    }, []);

    const shareUrl = `${origin}/?code=${token}`;

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const newFiles = Array.from(e.target.files);
            setFiles(prev => [...prev, ...newFiles]);
            setError(null);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        if (e.dataTransfer.files) {
            const newFiles = Array.from(e.dataTransfer.files);
            setFiles(prev => [...prev, ...newFiles]);
            setError(null);
        }
    };

    const [progress, setProgress] = useState(0);

    const { startUpload, isUploading } = useUploadThing("fileUploader", {
        onClientUploadComplete: async (res) => {
            if (res && res.length > 0) {
                try {
                    // Sync all files metadata to our database
                    const response = await fetch('/api/upload', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            files: res.map(file => ({
                                url: file.url,
                                name: file.name,
                                size: file.size,
                                key: file.key
                            }))
                        }),
                    });

                    if (!response.ok) throw new Error('Failed to save metadata');

                    const data = await response.json();
                    setToken(data.token);
                } catch (err) {
                    setError('Upload successful but failed to save token.');
                    console.error(err);
                }
            }
        },
        onUploadProgress: (p) => {
            setProgress(p);
        },
        onUploadError: (err: Error) => {
            console.error("Upload Error:", err);
            setError(`Upload failed: ${err.message}`);
        },
    });

    const uploadFile = async (retryCount = 0) => {
        if (files.length === 0) return;

        if (retryCount === 0) {
            setError(null);
            setProgress(0);
        }

        try {
            await startUpload(files);
        } catch (e) {
            console.error("Upload attempt failed:", e);
            if (retryCount < 3) {
                const nextRetry = retryCount + 1;
                setError(`Upload failed. Retrying... (${nextRetry}/3)`);
                setTimeout(() => uploadFile(nextRetry), 2000);
            }
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
                        key="upload"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="flex flex-col gap-4 md:gap-6"
                    >
                        {/* Dropzone */}
                        <div
                            className={twMerge(
                                "group relative w-full border-2 border-dashed border-white/10 hover:border-indigo-500/50 rounded-2xl transition-all duration-300 ease-out bg-white/5 hover:bg-white/10 flex flex-col cursor-pointer overflow-hidden",
                                files.length > 0 ? "border-indigo-500/50 bg-indigo-500/5 min-h-[14rem] md:min-h-[16rem]" : "h-48 md:h-64 items-center justify-center"
                            )}
                            onDragOver={(e) => e.preventDefault()}
                            onDrop={handleDrop}
                            onClick={() => document.getElementById('file-input')?.click()}
                        >
                            <input
                                type="file"
                                id="file-input"
                                className="hidden"
                                multiple
                                onChange={handleFileChange}
                            />

                            {files.length > 0 ? (
                                <div className="flex flex-col z-10 p-6 w-full gap-4 max-h-[400px] overflow-y-auto">
                                    <div className="flex items-center justify-between mb-2">
                                        <h4 className="text-white/60 text-sm font-medium uppercase tracking-wider">
                                            Selected {files.length} {files.length === 1 ? 'file' : 'files'}
                                        </h4>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); setFiles([]); }}
                                            className="text-white/40 hover:text-white text-xs transition-colors"
                                        >
                                            Clear All
                                        </button>
                                    </div>
                                    <AnimatePresence>
                                        {files.map((file, idx) => (
                                            <motion.div
                                                key={`${file.name}-${idx}`}
                                                initial={{ opacity: 0, x: -10 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                exit={{ opacity: 0, scale: 0.95 }}
                                                className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5"
                                            >
                                                <div className="flex items-center gap-3 overflow-hidden">
                                                    <div className="w-10 h-10 bg-indigo-500/20 rounded-lg flex items-center justify-center shrink-0">
                                                        <File className="w-5 h-5 text-indigo-400" />
                                                    </div>
                                                    <div className="overflow-hidden">
                                                        <p className="text-white text-sm font-medium truncate">{file.name}</p>
                                                        <p className="text-white/40 text-[10px]">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setFiles(prev => prev.filter((_, i) => i !== idx));
                                                    }}
                                                    className="p-2 hover:bg-white/10 rounded-full transition-colors text-white/40 hover:text-red-400"
                                                >
                                                    <X className="w-4 h-4" />
                                                </button>
                                            </motion.div>
                                        ))}
                                    </AnimatePresence>
                                    <div className="mt-2 py-4 border-t border-white/5 flex flex-col items-center">
                                        <p className="text-white/30 text-xs italic">Drop more files or click to add</p>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center z-10 pointer-events-none p-4">
                                    <div className="w-12 h-12 md:w-16 md:h-16 bg-white/5 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                                        <Upload className="w-6 h-6 md:w-8 md:h-8 text-white/40 group-hover:text-indigo-400 transition-colors" />
                                    </div>
                                    <p className="text-white/80 font-medium text-base md:text-lg">Drop your files here</p>
                                    <p className="text-white/40 text-xs md:text-sm mt-2">or click to browse multiple files</p>
                                </div>
                            )}
                        </div>

                        {error && (
                            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-200 text-sm text-center">
                                <p>{error}</p>
                                <button
                                    onClick={(e) => {
                                        e.preventDefault();
                                        uploadFile();
                                    }}
                                    className="mt-2 px-4 py-1 bg-red-500/20 hover:bg-red-500/30 rounded-lg text-xs font-semibold uppercase tracking-wider transition-colors"
                                >
                                    Retry Upload
                                </button>
                            </div>
                        )}

                        <button
                            onClick={() => uploadFile()}
                            disabled={files.length === 0 || isUploading}
                            className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-medium shadow-lg shadow-indigo-900/20 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {isUploading ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    <span>Uploading... {progress}%</span>
                                    <div className="absolute bottom-0 left-0 h-1 bg-white/20 w-full rounded-b-xl overflow-hidden">
                                        <div
                                            className="h-full bg-white/50 transition-all duration-300 ease-out"
                                            style={{ width: `${progress}%` }}
                                        />
                                    </div>
                                </>
                            ) : (
                                <>
                                    <span>Create Secure Link</span>
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

                        <h3 className="text-2xl font-bold text-white mb-2">Ready to Share</h3>
                        <p className="text-white/50 text-center mb-8 max-w-xs">
                            Scan the QR code or use the security code to access your files.
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
                            <div className="flex gap-3 w-full">
                                <button
                                    onClick={copyToken}
                                    className="flex-1 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white font-medium transition-colors flex items-center justify-center gap-2 text-sm"
                                >
                                    <Copy className="w-4 h-4" />
                                    Copy Code
                                </button>
                                <button
                                    onClick={() => {
                                        navigator.clipboard.writeText(shareUrl);
                                        const btn = document.getElementById('copy-file-url-btn');
                                        if (btn) {
                                            const originalText = btn.innerHTML;
                                            btn.innerHTML = 'Link Copied!';
                                            setTimeout(() => btn.innerHTML = originalText, 2000);
                                        }
                                    }}
                                    id="copy-file-url-btn"
                                    className="flex-1 py-3 bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/20 rounded-xl text-indigo-300 font-medium transition-colors flex items-center justify-center gap-2 text-sm"
                                >
                                    <Share2 className="w-4 h-4" />
                                    Copy Link
                                </button>
                            </div>
                            <button
                                onClick={() => {
                                    setToken(null);
                                    setFiles([]);
                                }}
                                className="w-full py-2 bg-transparent hover:bg-white/5 text-white/60 hover:text-white rounded-xl transition-colors text-xs"
                            >
                                Send Another
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div >
    );
}
