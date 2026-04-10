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
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(99,102,241,0.18),transparent_32%),radial-gradient(circle_at_80%_0%,rgba(168,85,247,0.15),transparent_28%)]" />
            
            {/* Animated Mesh Gradient Overlay */}
            <div className="absolute inset-0 opacity-30 mix-blend-soft-light select-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-500/20 blur-[120px] animate-pulse" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-violet-500/10 blur-[150px] animate-pulse" style={{ animationDelay: '2s' }} />
            </div>

            {/* Aurora ribbons for premium motion depth */}
            <motion.div
                animate={{ x: [0, 40, -20, 0], opacity: [0.3, 0.5, 0.35, 0.3] }}
                transition={{ duration: 24, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute -top-24 -left-24 w-[50vw] h-[32vh] bg-gradient-to-r from-indigo-500/25 via-violet-500/20 to-transparent blur-[70px]"
            />
            <motion.div
                animate={{ x: [0, -50, 30, 0], opacity: [0.2, 0.35, 0.25, 0.2] }}
                transition={{ duration: 28, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute -bottom-24 right-[-10%] w-[55vw] h-[30vh] bg-gradient-to-l from-fuchsia-500/20 via-indigo-500/15 to-transparent blur-[80px]"
            />

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
                className="absolute inset-0 opacity-[0.03] select-none pointer-events-none bg-grid-drift"
                style={{ 
                    backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
                    backgroundSize: '40px 40px'
                }}
            />

            {/* Floating particles */}
            <div className="absolute inset-0 overflow-hidden">
                {[...Array(12)].map((_, i) => (
                    <motion.span
                        key={i}
                        className="absolute block w-1 h-1 rounded-full bg-indigo-200/40"
                        style={{
                            left: `${8 + i * 7}%`,
                            top: `${10 + (i % 6) * 14}%`,
                        }}
                        animate={{
                            y: [0, -20, 0],
                            opacity: [0.15, 0.55, 0.15],
                            scale: [1, 1.6, 1],
                        }}
                        transition={{
                            duration: 4 + (i % 5),
                            repeat: Infinity,
                            ease: 'easeInOut',
                            delay: i * 0.3,
                        }}
                    />
                ))}
            </div>
        </div>
    );
}
