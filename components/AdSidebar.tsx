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
            animate={{ opacity: 1, x: 0 }}
            className={`hidden lg:flex flex-col gap-4 w-[320px] h-fit sticky top-24 ${side === 'left' ? 'items-end' : 'items-start'}`}
        >
            <div className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 backdrop-blur-md overflow-hidden relative group">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                
                <div className="flex items-center gap-2 mb-4">
                    <Tag className="w-3 h-3 text-white/30" />
                    <span className="text-[10px] font-bold text-white/20 uppercase tracking-[0.2em]">Sponsored Content</span>
                </div>

                <div className="flex flex-col gap-3 min-h-[250px] items-center justify-center">
                    {side === 'left' ? (
                        <>
                            {/* Native Banner Ad */}
                            <script async={true} data-cfasync="false" src="https://pl29104319.profitablecpmratenetwork.com/09251a11f78920bcfe4fd626609c5fae/invoke.js"></script>
                            <div id="container-09251a11f78920bcfe4fd626609c5fae" className="w-full"></div>
                        </>
                    ) : (
                        <>
                            {/* 300x250 Banner Ad */}
                            <div className="relative">
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
                                <div id="ad-300x250-container" className="w-[300px] h-[250px] bg-white/5 rounded-xl border border-white/10 flex items-center justify-center">
                                    <p className="text-[10px] text-white/10 uppercase tracking-[0.2em]">Loading Advertisement...</p>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>

            <div className="w-full bg-indigo-500/5 border border-indigo-500/10 rounded-2xl p-4 backdrop-blur-md relative group">
                <a 
                    href="https://www.profitablecpmratenetwork.com/aair0is5w?key=05a5c7db7052d86884ba1d139263a33a" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex flex-col gap-2 group/link"
                >
                    <div className="flex justify-between items-center">
                        <div className="h-2 w-1/2 bg-indigo-500/20 rounded group-hover/link:bg-indigo-500/40 transition-colors" />
                        <ExternalLink className="w-3 h-3 text-indigo-500/40" />
                    </div>
                    <div className="h-24 w-full bg-indigo-500/10 rounded-xl border border-indigo-500/5 flex items-center justify-center group-hover/link:bg-indigo-500/15 transition-all">
                        <span className="text-indigo-400/40 text-[9px] font-bold uppercase tracking-[0.3em] group-hover/link:text-indigo-400 transition-colors">Premium Link →</span>
                    </div>
                </a>
            </div>
        </motion.div>
    );
}
