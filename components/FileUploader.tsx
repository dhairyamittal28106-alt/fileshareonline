'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, File, Check, Loader2, SendHorizontal, X } from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import { useUploadThing } from "@/lib/uploadthing";
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

export default function FileUploader() {
    const [files, setFiles] = useState<File[]>([]);
    const [token, setToken] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [origin, setOrigin] = useState('');
    const [isDragging, setIsDragging] = useState(false);
    const [selectedDevice, setSelectedDevice] = useState<TargetDevice | null>(null);
    const [identity, setIdentity] = useState<DeviceIdentity | null>(null);
    const [deliveryStatus, setDeliveryStatus] = useState<string | null>(null);
    const [sendingToDevice, setSendingToDevice] = useState(false);

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
                    setDeliveryStatus(null);
                } catch (err) {
                    setError(err instanceof Error ? err.message : 'Upload successful but failed to save token.');
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
                    kind: 'file',
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
                        key="upload"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="flex flex-col gap-4 md:gap-6"
                    >
                        {/* Dropzone */}
                        <div
                            className={twMerge(
                                "group relative w-full border-2 border-dashed rounded-3xl transition-all duration-500 ease-out flex flex-col cursor-pointer overflow-hidden",
                                isDragging 
                                    ? "border-indigo-500 bg-indigo-500/10 shadow-[0_0_50px_-12px_rgba(99,102,241,0.5)] scale-[0.99]" 
                                    : "border-white/10 bg-white/5 hover:border-indigo-500/40 hover:bg-white/[0.07]",
                                files.length > 0 ? "min-h-[14rem] md:min-h-[16rem]" : "h-48 md:h-64 items-center justify-center"
                            )}
                            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                            onDragLeave={() => setIsDragging(false)}
                            onDrop={(e) => { setIsDragging(false); handleDrop(e); }}
                            onClick={() => document.getElementById('file-input')?.click()}
                        >
                            {/* Interactive Background Glow */}
                            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
                            
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
                                        <h4 className="text-white/60 text-xs font-black uppercase tracking-widest">
                                            Selected {files.length} {files.length === 1 ? 'file' : 'files'}
                                        </h4>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); setFiles([]); }}
                                            className="text-white/40 hover:text-white text-[10px] font-black uppercase tracking-wider transition-colors"
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
                                                className="flex items-center justify-between p-3 bg-white/5 rounded-2xl border border-white/5 backdrop-blur-md"
                                            >
                                                <div className="flex items-center gap-3 overflow-hidden">
                                                    <div className="w-10 h-10 bg-indigo-500/10 rounded-xl flex items-center justify-center shrink-0 border border-indigo-500/20">
                                                        <File className="w-5 h-5 text-indigo-400" />
                                                    </div>
                                                    <div className="overflow-hidden">
                                                        <p className="text-white text-sm font-bold truncate">{file.name}</p>
                                                        <p className="text-white/40 text-[10px] font-black uppercase tracking-tighter">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
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
                                </div>
                            ) : (
                                <div className="flex flex-col items-center z-10 pointer-events-none p-4">
                                    <motion.div 
                                        animate={{ y: [0, -8, 0] }}
                                        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                                        className="w-16 h-16 bg-indigo-500/10 rounded-2xl flex items-center justify-center mb-6 border border-indigo-500/20 group-hover:bg-indigo-500/20 group-hover:border-indigo-500/40 transition-all duration-300"
                                    >
                                        <Upload className="w-8 h-8 text-indigo-400 group-hover:scale-110 transition-transform" />
                                    </motion.div>
                                    <p className="text-white font-[900] text-3xl md:text-4xl tracking-tighter uppercase mb-4">DROP FILES HERE</p>
                                    <div className="px-6 py-3 bg-white/5 rounded-2xl border border-white/10 text-[10px] md:text-xs font-black uppercase tracking-[0.2em] text-white/40 group-hover:text-indigo-300 group-hover:border-indigo-500/30 transition-all">
                                        OR CLICK TO BROWSE DEVICE
                                    </div>
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
                            className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold shadow-lg shadow-indigo-600/20 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden group/btn"
                        >
                            <AnimatePresence mode="wait">
                                {isUploading ? (
                                    <motion.div 
                                        key="uploading"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        className="flex items-center justify-center gap-2"
                                    >
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        <span>Encrypting... {progress}%</span>
                                        <div className="absolute bottom-0 left-0 h-1.5 w-full bg-white/10">
                                            <motion.div 
                                                className="h-full bg-white/40"
                                                initial={{ width: 0 }}
                                                animate={{ width: `${progress}%` }}
                                                transition={{ type: "spring", stiffness: 50, damping: 20 }}
                                            />
                                        </div>
                                    </motion.div>
                                ) : (
                                    <motion.div 
                                        key="idle"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        className="flex items-center justify-center gap-2"
                                    >
                                        {selectedDevice ? (
                                            <>
                                                <SendHorizontal className="w-5 h-5" />
                                                <span>Send to {selectedDevice.name}</span>
                                            </>
                                        ) : (
                                            <span>Create Secure Link</span>
                                        )}
                                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover/btn:animate-[shimmer_2s_infinite] pointer-events-none" />
                                    </motion.div>
                                )}
                            </AnimatePresence>
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
                                <h3 className="text-2xl font-bold text-white">{deliveryStatus ? 'Delivered to Device' : 'Ready to Share'}</h3>
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
                                kind="file"
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
                                    setFiles([]);
                                    setDeliveryStatus(null);
                                    setSelectedDevice(null);
                                }}
                                className="w-full py-3 px-4 bg-transparent hover:bg-white/5 text-white/60 hover:text-white rounded-xl transition-colors text-xs"
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
