'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, File, Check, Copy, Loader2, X } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export default function FileUploader() {
    const [file, setFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [token, setToken] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
            setError(null);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            setFile(e.dataTransfer.files[0]);
            setError(null);
        }
    };

    const uploadFile = async () => {
        if (!file) return;

        setUploading(true);
        setError(null);

        const formData = new FormData();
        formData.append('file', file);

        try {
            const res = await fetch('/api/upload', {
                method: 'POST',
                body: formData,
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Upload failed');
            }

            setToken(data.token);
        } catch (err: any) {
            console.error(err);
            setError(err.message || 'Failed to upload file. Please check your connection.');
        } finally {
            setUploading(false);
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
                        className="flex flex-col gap-6"
                    >
                        {/* Dropzone */}
                        <div
                            className={twMerge(
                                "group relative w-full h-64 border-2 border-dashed border-white/10 hover:border-indigo-500/50 rounded-2xl transition-all duration-300 ease-out bg-white/5 hover:bg-white/10 flex flex-col items-center justify-center cursor-pointer overflow-hidden",
                                file ? "border-indigo-500/50 bg-indigo-500/5" : ""
                            )}
                            onDragOver={(e) => e.preventDefault()}
                            onDrop={handleDrop}
                            onClick={() => document.getElementById('file-input')?.click()}
                        >
                            <input
                                type="file"
                                id="file-input"
                                className="hidden"
                                onChange={handleFileChange}
                            />

                            {file ? (
                                <div className="flex flex-col items-center z-10 p-6 w-full">
                                    <div className="w-16 h-16 bg-gradient-to-tr from-indigo-500 to-violet-500 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-indigo-500/20">
                                        <File className="w-8 h-8 text-white" />
                                    </div>
                                    <p className="text-white font-semibold text-lg max-w-[80%] truncate">{file.name}</p>
                                    <p className="text-white/40 text-sm mt-1">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); setFile(null); }}
                                        className="mt-4 p-2 bg-white/5 hover:bg-white/10 rounded-full transition-colors"
                                    >
                                        <X className="w-4 h-4 text-white/60" />
                                    </button>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center z-10">
                                    <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                                        <Upload className="w-8 h-8 text-white/40 group-hover:text-indigo-400 transition-colors" />
                                    </div>
                                    <p className="text-white/80 font-medium text-lg">Drop your file here</p>
                                    <p className="text-white/40 text-sm mt-2">or click to browse</p>
                                </div>
                            )}
                        </div>

                        {error && (
                            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-200 text-sm text-center">
                                {error}
                            </div>
                        )}

                        <button
                            onClick={uploadFile}
                            disabled={!file || uploading}
                            className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-medium shadow-lg shadow-indigo-900/20 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {uploading ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    <span>Encrypting & Uploading...</span>
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
                            This unique code grants access to your file for the next 24 hours.
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
                                    setFile(null);
                                }}
                                className="flex-1 py-3 bg-transparent hover:bg-white/5 text-white/60 hover:text-white rounded-xl transition-colors text-sm"
                            >
                                Send Another
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
