'use client';

import { motion, useSpring, useTransform, animate } from 'framer-motion';
import { useEffect, useState } from 'react';

function Counter({ value, suffix = "" }: { value: number, suffix?: string }) {
    const [count, setCount] = useState(0);

    useEffect(() => {
        const controls = animate(0, value, {
            duration: 2,
            onUpdate: (latest) => setCount(Math.floor(latest))
        });
        return () => controls.stop();
    }, [value]);

    return <span>{count.toLocaleString()}{suffix}</span>;
}

export default function LiveStats() {
    return (
        <section className="w-full py-16 bg-white/[0.02] border-y border-white/5 backdrop-blur-sm">
            <div className="max-w-6xl mx-auto px-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
                    <div className="flex flex-col gap-1">
                        <div className="text-4xl md:text-5xl font-black text-indigo-400 tracking-tighter">
                            <Counter value={12480} />
                        </div>
                        <div className="text-[10px] uppercase font-black tracking-[0.3em] text-white/30">Files Shared Today</div>
                    </div>
                    <div className="flex flex-col gap-1">
                        <div className="text-4xl md:text-5xl font-black text-violet-400 tracking-tighter">
                            <Counter value={145} suffix=" MB/s" />
                        </div>
                        <div className="text-[10px] uppercase font-black tracking-[0.3em] text-white/30">Avg. Transfer Speed</div>
                    </div>
                    <div className="flex flex-col gap-1">
                        <div className="text-4xl md:text-5xl font-black text-sky-400 tracking-tighter">
                            <Counter value={2560} />
                        </div>
                        <div className="text-[10px] uppercase font-black tracking-[0.3em] text-white/30">Active Users Now</div>
                    </div>
                </div>
            </div>
        </section>
    );
}
