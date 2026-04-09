'use client';

import { useState, useEffect, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Share2, UploadCloud, ShieldCheck, Zap } from 'lucide-react';
import FileUploader from '@/components/FileUploader';
import FileReceiver from '@/components/FileReceiver';
import TotalFilesCounter from '@/components/TotalFilesCounter';
import TextSharer from '@/components/TextSharer';
import Sidebar from '@/components/Sidebar';
import Navbar from '@/components/Navbar';
import TrustIndicators from '@/components/TrustIndicators';
import HowItWorks from '@/components/HowItWorks';
import { clsx } from "clsx";
import { useSearchParams } from 'next/navigation';

function InteractiveArea() {
  const searchParams = useSearchParams();
  const code = searchParams.get('code');
  const [mode, setMode] = useState<'send' | 'receive'>(code && code.length === 6 ? 'receive' : 'send');
  const [shareType, setShareType] = useState<'file' | 'text'>('file');

  return (
    <div className="w-full max-w-xl mx-auto relative z-20">
      {/* Main Mode Switcher */}
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
            Send
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
            Receive
          </button>
        </div>
      </div>

      {/* Sub Mode Switcher (File vs Text) - Only visible in SEND mode */}
      <AnimatePresence>
        {mode === 'send' && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="flex justify-center mb-6 overflow-hidden"
          >
            <div className="bg-black/20 p-1 rounded-xl flex gap-1">
              <button
                onClick={() => setShareType('file')}
                className={clsx(
                  "px-4 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all",
                  shareType === 'file' ? "bg-white/10 text-white" : "text-white/40 hover:text-white"
                )}
              >
                File
              </button>
              <button
                onClick={() => setShareType('text')}
                className={clsx(
                  "px-4 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all",
                  shareType === 'text' ? "bg-white/10 text-white" : "text-white/40 hover:text-white"
                )}
              >
                Text
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Component View */}
      <div className="min-h-[400px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={mode + shareType}
            initial={{ opacity: 0, x: mode === 'send' ? -20 : 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: mode === 'send' ? 20 : -20 }}
            transition={{ duration: 0.3 }}
            className="w-full"
          >
            {mode === 'send' ? (
              shareType === 'file' ? <FileUploader /> : <TextSharer />
            ) : (
              <FileReceiver key={code || 'none'} initialToken={code || ''} />
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <main className="min-h-screen relative overflow-hidden flex flex-col bg-[#020617] text-white selection:bg-indigo-500/30">
      <Navbar />

      <div className="flex justify-center gap-6 lg:gap-12 relative w-full overflow-hidden">
          {/* Left Sidebar */}
          <div className="hidden md:block shrink-0 pt-24">
            <Sidebar side="left" />
          </div>

          <div className="flex-1 flex flex-col items-center justify-center min-h-[calc(100vh-200px)] max-w-4xl mx-auto w-full relative z-10">
            {/* Hero Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center w-full mb-12"
            >
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-xs font-semibold text-indigo-300 mb-8 uppercase tracking-wider">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
                </span>
                Secure P2P Sharing
              </div>
              <div className="flex justify-center mb-6 md:mb-8 scale-90 md:scale-100">
                <TotalFilesCounter />
              </div>
              <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold text-white mb-6 tracking-tight leading-[1.1] md:leading-tight">
                Share <span className="text-indigo-400">anything</span> securely,<br />
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-violet-400">without limits.</span>
              </h1>
              <p className="text-base md:text-lg text-white/40 mb-8 md:mb-10 max-w-2xl mx-auto leading-relaxed px-4 md:px-0">
                Simple, fast, and anonymous sharing. Text or Files. No registration.
                Content is encrypted and deleted automatically after 15 minutes.
              </p>
            </motion.div>

            <Suspense fallback={<div className="w-full max-w-xl mx-auto h-[400px] flex items-center justify-center"><div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div></div>}>
              <InteractiveArea />
            </Suspense>

            <TrustIndicators />

            {/* Features & Trust with Staggered Reveal */}
            <motion.div 
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={{
                hidden: { opacity: 0 },
                visible: {
                  opacity: 1,
                  transition: { staggerChildren: 0.15 }
                }
              }}
              className="mt-24 w-full border-t border-white/5 pt-16"
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                <motion.div 
                  variants={{
                    hidden: { opacity: 0, y: 20 },
                    visible: { opacity: 1, y: 0 }
                  }}
                  className="flex flex-col items-center md:items-start text-center md:text-left group"
                >
                  <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center mb-4 border border-white/5 group-hover:border-indigo-500/50 group-hover:bg-indigo-500/10 transition-all duration-300">
                    <UploadCloud className="w-6 h-6 text-indigo-400 group-hover:scale-110 transition-transform" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-indigo-300 transition-colors">No File Size Limits</h3>
                  <p className="text-white/40 text-sm leading-relaxed">
                    Share large files, HD videos, or entire project folders without hitting a paywall.
                  </p>
                </motion.div>

                <motion.div 
                  variants={{
                    hidden: { opacity: 0, y: 20 },
                    visible: { opacity: 1, y: 0 }
                  }}
                  className="flex flex-col items-center md:items-start text-center md:text-left group"
                >
                  <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center mb-4 border border-white/5 group-hover:border-emerald-500/50 group-hover:bg-emerald-500/10 transition-all duration-300">
                    <ShieldCheck className="w-6 h-6 text-emerald-400 group-hover:scale-110 transition-transform" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-emerald-300 transition-colors">Bank-Grade Encryption</h3>
                  <p className="text-white/40 text-sm leading-relaxed">
                    Your files are encrypted in transit and at rest. We can&apos;t see what you share.
                  </p>
                </motion.div>

                <motion.div 
                  variants={{
                    hidden: { opacity: 0, y: 20 },
                    visible: { opacity: 1, y: 0 }
                  }}
                  className="flex flex-col items-center md:items-start text-center md:text-left group"
                >
                  <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center mb-4 border border-white/5 group-hover:border-amber-500/50 group-hover:bg-amber-500/10 transition-all duration-300">
                    <Zap className="w-6 h-6 text-amber-400 group-hover:scale-110 transition-transform" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-amber-300 transition-colors">Lightning Fast</h3>
                  <p className="text-white/40 text-sm leading-relaxed">
                    Optimized peer routing ensures you get the fastest possible upload and download speeds.
                  </p>
                </motion.div>
              </div>
            </motion.div>

            <HowItWorks />

            <footer className="w-full mt-24 border-t border-white/5 py-8 text-center text-white/20 text-sm">
              <p>&copy; 2026 SHAREDROP. Crafted for privacy.</p>
            </footer>
          </div>

          {/* Right Sidebar */}
          <div className="hidden md:block shrink-0 pt-24">
            <Sidebar side="right" />
          </div>
        </div>
    </main>
  );
}
