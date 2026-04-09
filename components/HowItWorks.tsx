'use client';

import { motion } from 'framer-motion';
import { UploadCloud, Link as LinkIcon, Share2 } from 'lucide-react';

const steps = [
    {
        icon: UploadCloud,
        title: "Upload File",
        desc: "Drag and drop or select any file with no size limits.",
        color: "text-indigo-400",
        bg: "bg-indigo-500/5"
    },
    {
        icon: LinkIcon,
        title: "Generate Link",
        desc: "Get a secure, encrypted link and a 6-digit access code.",
        color: "text-violet-400",
        bg: "bg-violet-500/5"
    },
    {
        icon: Share2,
        title: "Share Instantly",
        desc: "The recipient enters the code and downloads the content.",
        color: "text-sky-400",
        bg: "bg-sky-500/5"
    }
];

export default function HowItWorks() {
    return (
        <section id="how-it-works" className="w-full py-24 border-t border-white/5 relative overflow-hidden">
            {/* Background Accent */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-500/5 rounded-full blur-[100px] pointer-events-none" />

            <div className="max-w-6xl mx-auto px-6 relative z-10 text-center">
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 tracking-tight">How it Works</h2>
                <p className="text-white/40 text-sm md:text-base max-w-xl mx-auto mb-16 leading-relaxed">
                    Sharing files should be easy, private, and fast. Follow these three simple steps to start sharing without any registration.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
                    {steps.map((step, i) => (
                        <motion.div 
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.1 }}
                            className="bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-md hover:border-indigo-500/30 transition-all group"
                        >
                            <div className={`w-14 h-14 ${step.bg} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500`}>
                                <step.icon className={`w-7 h-7 ${step.color}`} />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-3 group-hover:text-indigo-400 transition-colors uppercase tracking-tight">{step.title}</h3>
                            <p className="text-white/50 text-sm leading-relaxed tracking-wide">
                                {step.desc}
                            </p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
