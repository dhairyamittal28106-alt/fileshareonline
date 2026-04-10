'use client';

import { motion } from 'framer-motion';
import { ExternalLink, Tag } from 'lucide-react';
import { useEffect, useRef } from 'react';

interface AdSidebarProps {
    side: 'left' | 'right';
}

export default function AdSidebar({ side }: AdSidebarProps) {
    const adContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!adContainerRef.current) return;

        if (side === 'left') {
            // Native Banner Ad — inject via DOM so script actually executes
            const script = document.createElement('script');
            script.src = 'https://ruffianattorneymargarine.com/09251a11f78920bcfe4fd626609c5fae/invoke.js';
            script.async = true;
            script.setAttribute('data-cfasync', 'false');
            adContainerRef.current.appendChild(script);
        } else {
            // 300x250 Banner Ad — set atOptions then load invoke script
            const configScript = document.createElement('script');
            configScript.textContent = `
                atOptions = {
                    'key' : '46577a89265928ad0e1b1d1053480095',
                    'format' : 'iframe',
                    'height' : 250,
                    'width' : 300,
                    'params' : {}
                };
            `;
            adContainerRef.current.appendChild(configScript);

            const invokeScript = document.createElement('script');
            invokeScript.src = '//www.highperformanceformat.com/46577a89265928ad0e1b1d1053480095/invoke.js';
            invokeScript.async = true;
            adContainerRef.current.appendChild(invokeScript);
        }
    }, [side]);

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col gap-3 w-full"
        >
            <div className="w-full bg-white/5 border border-indigo-500/20 rounded-xl p-3 backdrop-blur-md overflow-hidden relative">
                <div className="flex items-center gap-2 mb-3">
                    <Tag className="w-3 h-3 text-white/30" />
                    <span className="text-[10px] font-bold text-white/20 uppercase tracking-[0.2em]">Partner Content</span>
                </div>

                <div ref={adContainerRef} className="flex flex-col gap-3 min-h-[200px] items-center justify-center">
                    {side === 'left' ? (
                        <div id="container-09251a11f78920bcfe4fd626609c5fae" className="w-full min-h-[200px] border border-white/5 rounded-lg flex items-center justify-center">
                            <span className="text-white/5 text-[10px] tracking-widest uppercase">Loading...</span>
                        </div>
                    ) : (
                        <div id="display-frame-300x250" className="w-full min-h-[200px] bg-white/5 rounded-lg border border-white/10 flex items-center justify-center">
                            <span className="text-[10px] text-white/10 uppercase tracking-[0.2em]">Loading...</span>
                        </div>
                    )}
                </div>
            </div>

            <motion.div 
                whileHover={{ scale: 1.02 }}
                className="w-full bg-indigo-500/5 border border-indigo-500/10 rounded-xl p-3 backdrop-blur-md relative group overflow-hidden"
            >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-indigo-500/10 to-transparent -translate-x-full group-hover:animate-[shimmer_2s_infinite] pointer-events-none" />
                <a 
                    href="https://ruffianattorneymargarine.com/aair0is5w?key=05a5c7db7052d86884ba1d139263a33a" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex flex-col gap-2 group/link"
                >
                    <div className="flex justify-between items-center">
                        <div className="h-2 w-1/2 bg-indigo-500/20 rounded group-hover/link:bg-indigo-500/40 transition-colors" />
                        <ExternalLink className="w-3 h-3 text-indigo-500/40" />
                    </div>
                    <div className="relative h-16 w-full bg-indigo-500/10 rounded-lg border border-indigo-500/5 flex items-center justify-center group-hover/link:bg-indigo-500/15 transition-all">
                        <span className="text-indigo-400/40 text-[9px] font-bold uppercase tracking-[0.3em] group-hover/link:text-indigo-400 transition-colors">Access Portal →</span>
                    </div>
                </a>
            </motion.div>
        </motion.div>
    );
}
