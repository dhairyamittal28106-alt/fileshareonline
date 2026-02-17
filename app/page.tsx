'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Share2, UploadCloud, ShieldCheck, Zap } from 'lucide-react';
import FileUploader from '@/components/FileUploader';
import FileReceiver from '@/components/FileReceiver';
import TotalFilesCounter from '@/components/TotalFilesCounter';
import { clsx } from "clsx";

export default function Home() {
  const [mode, setMode] = useState<'send' | 'receive'>('send');

  return (
    <main className="min-h-screen relative overflow-hidden flex flex-col bg-[#020617] text-white">
      {/* Background Gradients */}
      <div className="fixed inset-0 z-0 pointer-events-none bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/20 via-[#020617] to-[#020617]" />
      <div className="fixed inset-0 z-0 pointer-events-none opacity-30 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] brightness-100 contrast-150 mix-blend-overlay" />

      {/* Navbar */}
      <nav className="relative z-10 w-full max-w-6xl mx-auto px-6 py-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-500/10 border border-indigo-500/20 rounded-xl flex items-center justify-center">
            <Share2 className="text-indigo-400 w-5 h-5" />
          </div>
          <span className="text-xl font-bold tracking-tight text-white">ShareDrop</span>
        </div>
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-white/60">
          <a href="#" className="hover:text-white transition-colors">Features</a>
          <a href="#" className="hover:text-white transition-colors">Security</a>
          <a href="#" className="hover:text-white transition-colors">About</a>
        </div>
      </nav>

      <div className="relative z-10 flex-1 container mx-auto px-4 py-12 flex flex-col items-center justify-center min-h-[calc(100vh-100px)]">

        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-3xl mb-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-xs font-semibold text-indigo-300 mb-8 uppercase tracking-wider">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
            </span>
            Secure P2P File Sharing
          </div>
          <div className="flex justify-center mb-8">
            <TotalFilesCounter />
          </div>
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 tracking-tight leading-tight">
            Share files securely,<br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-violet-400">without limits.</span>
          </h1>
          <p className="text-lg text-white/40 mb-10 max-w-2xl mx-auto leading-relaxed">
            Simple, fast, and anonymous file sharing. No registration required.
            Files are end-to-end encrypted and deleted automatically after 24 hours.
          </p>
        </motion.div>

        {/* Interactive Area */}
        <div className="w-full max-w-xl mx-auto relative z-20">
          {/* Mode Switcher */}
          <div className="flex justify-center mb-8">
            <div className="bg-white/5 p-1.5 rounded-2xl border border-white/10 backdrop-blur-md flex shadow-2xl">
              <button
                onClick={() => setMode('send')}
                className={clsx(
                  "px-8 py-2.5 rounded-xl text-sm font-medium transition-all duration-300",
                  mode === 'send'
                    ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/20"
                    : "text-white/50 hover:text-white hover:bg-white/5"
                )}
              >
                Send File
              </button>
              <button
                onClick={() => setMode('receive')}
                className={clsx(
                  "px-8 py-2.5 rounded-xl text-sm font-medium transition-all duration-300",
                  mode === 'receive'
                    ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/20"
                    : "text-white/50 hover:text-white hover:bg-white/5"
                )}
              >
                Receive File
              </button>
            </div>
          </div>

          {/* Component View */}
          <div className="min-h-[400px]">
            <AnimatePresence mode="wait">
              <motion.div
                key={mode}
                initial={{ opacity: 0, x: mode === 'send' ? -20 : 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: mode === 'send' ? 20 : -20 }}
                transition={{ duration: 0.3 }}
                className="w-full"
              >
                {mode === 'send' ? <FileUploader /> : <FileReceiver />}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Features & Trust */}
        <div className="mt-24 w-full max-w-5xl mx-auto border-t border-white/5 pt-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="flex flex-col items-center md:items-start text-center md:text-left">
              <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center mb-4 border border-white/5">
                <UploadCloud className="w-6 h-6 text-indigo-400" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">No File Size Limits</h3>
              <p className="text-white/40 text-sm leading-relaxed">
                Share large files, HD videos, or entire project folders without hitting a paywall.
              </p>
            </div>
            <div className="flex flex-col items-center md:items-start text-center md:text-left">
              <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center mb-4 border border-white/5">
                <ShieldCheck className="w-6 h-6 text-emerald-400" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Bank-Grade Encryption</h3>
              <p className="text-white/40 text-sm leading-relaxed">
                Your files are encrypted in transit and at rest. We can&apos;t see what you share.
              </p>
            </div>
            <div className="flex flex-col items-center md:items-start text-center md:text-left">
              <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center mb-4 border border-white/5">
                <Zap className="w-6 h-6 text-amber-400" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Lightning Fast</h3>
              <p className="text-white/40 text-sm leading-relaxed">
                Optimized peer routing ensures you get the fastest possible upload and download speeds.
              </p>
            </div>
          </div>
        </div>

        <footer className="w-full mt-24 border-t border-white/5 py-8 text-center text-white/20 text-sm">
          <p>&copy; 2026 ShareDrop. Crafted for privacy.</p>
        </footer>
      </div>
    </main>
  );
}
