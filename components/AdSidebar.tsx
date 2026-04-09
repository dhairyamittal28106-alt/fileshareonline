'use client';

import { motion } from 'framer-motion';
import { ExternalLink, Tag } from 'lucide-react';

interface AdSidebarProps {
    side: 'left' | 'right';
}

export default function AdSidebar({ side }: AdSidebarProps) {
    return (
        <motion.div
            initial={{ opacity: 0, x: side === 'left' ? -20 : 20 }}
            animate={{ opacity: 1, x: 0 }}
            className={`hidden lg:flex flex-col gap-4 w-48 h-fit sticky top-24 ${side === 'left' ? 'items-end' : 'items-start'}`}
        >
            <div className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 backdrop-blur-md overflow-hidden relative group">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                
                <div className="flex items-center gap-2 mb-4">
                    <Tag className="w-3 h-3 text-white/30" />
                    <span className="text-[10px] font-bold text-white/20 uppercase tracking-[0.2em]">Sponsored</span>
                </div>

                <div className="flex flex-col gap-3">
                    <div className="w-full aspect-[4/5] bg-white/5 rounded-xl border border-white/5 flex items-center justify-center relative overflow-hidden">
                        <div className="absolute inset-0 bg-indigo-500/5 animate-pulse" />
                        <span className="text-white/10 text-xs font-mono uppercase tracking-widest text-center px-4">
                            Premium Ad Placement
                        </span>
                    </div>

                    <div className="space-y-1">
                        <div className="h-3 w-3/4 bg-white/10 rounded" />
                        <div className="h-2 w-full bg-white/5 rounded" />
                        <div className="h-2 w-2/3 bg-white/5 rounded" />
                    </div>

                    <button className="w-full py-2 bg-white/10 hover:bg-white/15 border border-white/5 rounded-lg text-white/40 hover:text-white transition-all text-[10px] font-bold uppercase tracking-wider flex items-center justify-center gap-2">
                        <span>Learn More</span>
                        <ExternalLink className="w-3 h-3" />
                    </button>
                </div>
            </div>

            <div className="w-full bg-indigo-500/5 border border-indigo-500/10 rounded-2xl p-4 backdrop-blur-md relative group">
                <div className="flex flex-col gap-2">
                    <div className="h-2 w-1/2 bg-indigo-500/20 rounded" />
                    <div className="h-32 w-full bg-indigo-500/10 rounded-xl border border-indigo-500/5 flex items-center justify-center">
                        <span className="text-indigo-400/20 text-[8px] font-bold uppercase tracking-[0.3em] rotate-90">Sharedrop Pro</span>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
