'use client';

import { motion } from 'framer-motion';
import { ExternalLink, Tag } from 'lucide-react';

import { useEffect } from 'react';

interface AdSidebarProps {
    side: 'left' | 'right';
}

export default function AdSidebar({ side }: AdSidebarProps) {
    useEffect(() => {
        // Load the external script for the banners
        const script = document.createElement('script');
        if (side === 'right') {
            // 300x250 Banner Script
            script.src = "//www.highperformanceformat.com/46577a89265928ad0e1b1d1053480095/invoke.js";
        }
        script.async = true;
        document.body.appendChild(script);

        return () => {
            document.body.removeChild(script);
        };
    }, [side]);

    return (
        <motion.div
            initial={{ opacity: 0, x: side === 'left' ? -20 : 20 }}
            animate={{ 
                opacity: 1, 
                x: 0,
                y: [0, -10, 0]
            }}
            transition={{
                opacity: { duration: 0.5 },
                x: { duration: 0.5 },
                y: { 
                    duration: 5, 
                    repeat: Infinity, 
                    ease: "easeInOut" 
                }
            }}
            className={`hidden md:flex flex-col gap-4 w-[200px] lg:w-[320px] h-fit sticky top-24 ${side === 'left' ? 'items-end' : 'items-start'}`}
        >
            <div className="w-full bg-white/5 border border-indigo-500/20 rounded-2xl p-4 backdrop-blur-md overflow-hidden relative group">
                {/* Temporary diagnostic border to ensure visibility */}
                <div className="absolute inset-0 border border-indigo-500/10 pointer-events-none rounded-2xl" />
                
                <div className="flex items-center gap-2 mb-4">
                    <Tag className="w-3 h-3 text-white/30" />
                    <span className="text-[10px] font-bold text-white/20 uppercase tracking-[0.2em]">Partner Content</span>
                </div>

                <div className="flex flex-col gap-3 min-h-[250px] items-center justify-center">
                    {side === 'left' ? (
                        <div className="w-full">
                            {/* Native Banner Ad (Anti-Adblock) */}
                            <script async={true} data-cfasync="false" src="https://ruffianattorneymargarine.com/09251a11f78920bcfe4fd626609c5fae/invoke.js"></script>
                            <div id="container-09251a11f78920bcfe4fd626609c5fae" className="w-full min-h-[200px] border border-white/5 rounded-lg flex items-center justify-center">
                                <span className="text-white/5 text-[10px] tracking-widest uppercase">Content Delivery...</span>
                            </div>
                        </div>
                    ) : (
                        <div className="w-full h-full flex items-center justify-center">
                            {/* 300x250 Banner Ad */}
                            <div className="relative w-full flex justify-center">
                                <script dangerouslySetInnerHTML={{
                                    __html: `
                                        atOptions = {
                                            'key' : '46577a89265928ad0e1b1d1053480095',
                                            'format' : 'iframe',
                                            'height' : 250,
                                            'width' : 300,
                                            'params' : {}
                                        };
                                    `
                                }} />
                                <div id="display-frame-300x250" className="w-[300px] h-[250px] bg-white/5 rounded-xl border border-white/10 flex items-center justify-center">
                                    <p className="text-[10px] text-white/10 uppercase tracking-[0.2em]">Partner Feed</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <motion.div 
                whileHover={{ scale: 1.02 }}
                className="w-full bg-indigo-500/5 border border-indigo-500/10 rounded-2xl p-4 backdrop-blur-md relative group overflow-hidden"
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
                    <div className="relative h-24 w-full bg-indigo-500/10 rounded-xl border border-indigo-500/5 flex items-center justify-center group-hover/link:bg-indigo-500/15 transition-all">
                        <span className="text-indigo-400/40 text-[9px] font-bold uppercase tracking-[0.3em] group-hover/link:text-indigo-400 transition-colors">Access Portal →</span>
                    </div>
                </a>
            </motion.div>
        </motion.div>
    );
}
