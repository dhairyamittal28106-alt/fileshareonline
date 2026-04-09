'use client';

import { motion } from 'framer-motion';
import { ShieldCheck, Zap, Lock } from 'lucide-react';

const badges = [
    {
        icon: ShieldCheck,
        text: "End-to-End Encrypted",
        color: "text-emerald-400",
        bg: "bg-emerald-500/10"
    },
    {
        icon: Zap,
        text: "Auto-delete in 15m",
        color: "text-amber-400",
        bg: "bg-amber-500/10"
    },
    {
        icon: Lock,
        text: "Zero Data Logging",
        color: "text-indigo-400",
        bg: "bg-indigo-500/10"
    }
];

export default function TrustIndicators() {
    return (
        <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="flex flex-wrap justify-center gap-4 mt-8"
        >
            {badges.map((badge, i) => (
                <div 
                    key={i}
                    className={`flex items-center gap-2 px-4 py-1.5 rounded-full ${badge.bg} border border-white/5 backdrop-blur-sm shadow-xl`}
                >
                    <badge.icon className={`w-3.5 h-3.5 ${badge.color}`} />
                    <span className="text-[11px] font-bold text-white/60 uppercase tracking-widest">{badge.text}</span>
                </div>
            ))}
        </motion.div>
    );
}
