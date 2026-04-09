'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

export default function BackgroundEffects() {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;

    return (
        <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
            {/* Ambient Background Base */}
            <div className="absolute inset-0 bg-[#020617]" />
            
            {/* Animated Mesh Gradient Overlay */}
            <div className="absolute inset-0 opacity-30 mix-blend-soft-light select-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-500/20 blur-[120px] animate-pulse" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-violet-500/10 blur-[150px] animate-pulse" style={{ animationDelay: '2s' }} />
            </div>

            {/* Floating Orbs */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 2 }}
                className="relative w-full h-full"
            >
                {/* Main Central Glow */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-indigo-500/5 rounded-full blur-[120px]" />

                {/* Orb 1: Indigo Top Right */}
                <motion.div
                    animate={{
                        x: [0, 50, -30, 0],
                        y: [0, -80, 40, 0],
                        scale: [1, 1.1, 0.9, 1],
                    }}
                    transition={{
                        duration: 20,
                        repeat: Infinity,
                        ease: "linear"
                    }}
                    className="absolute top-[10%] right-[15%] w-96 h-96 bg-indigo-600/10 rounded-full blur-[100px]"
                />

                {/* Orb 2: Violet Bottom Left */}
                <motion.div
                    animate={{
                        x: [0, -60, 40, 0],
                        y: [0, 70, -30, 0],
                        scale: [1, 0.9, 1.1, 1],
                    }}
                    transition={{
                        duration: 25,
                        repeat: Infinity,
                        ease: "linear"
                    }}
                    className="absolute bottom-[20%] left-[10%] w-[450px] h-[450px] bg-violet-600/10 rounded-full blur-[120px]"
                />

                {/* Orb 3: Sky Center Right */}
                <motion.div
                    animate={{
                        x: [0, 40, -50, 0],
                        y: [0, 100, -80, 0],
                    }}
                    transition={{
                        duration: 18,
                        repeat: Infinity,
                        ease: "linear"
                    }}
                    className="absolute top-[40%] right-[5%] w-64 h-64 bg-sky-500/10 rounded-full blur-[80px]"
                />
            </motion.div>

            {/* Subtle Grid Pattern Overlay */}
            <div 
                className="absolute inset-0 opacity-[0.03] select-none pointer-events-none"
                style={{ 
                    backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
                    backgroundSize: '40px 40px'
                }}
            />
        </div>
    );
}
