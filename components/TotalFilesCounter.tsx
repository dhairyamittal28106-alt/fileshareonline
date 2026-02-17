'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FileText } from 'lucide-react';

export default function TotalFilesCounter() {
    const [count, setCount] = useState<number | null>(null);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await fetch('/api/stats', { cache: 'no-store' });
                if (res.ok) {
                    const data = await res.json();
                    setCount(data.totalFiles);
                }
            } catch (error) {
                console.error('Failed to fetch stats:', error);
            }
        };

        fetchStats();
        // Poll every 10 seconds
        const interval = setInterval(fetchStats, 10000);
        return () => clearInterval(interval);
    }, []);

    if (count === null) return null;

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-full backdrop-blur-md shadow-lg"
        >
            <FileText className="w-4 h-4 text-indigo-400" />
            <span className="text-sm font-medium text-white/80">
                <span className="text-white font-bold">{count.toLocaleString()}</span> files shared securely
            </span>
        </motion.div>
    );
}
