'use client';

import { motion } from 'framer-motion';

export default function Navbar() {
  return (
    <motion.nav 
      initial="hidden"
      animate="visible"
      variants={{
        hidden: { opacity: 0, y: -20 },
        visible: { 
          opacity: 1, 
          y: 0,
          transition: { 
            staggerChildren: 0.1,
            delayChildren: 0.2
          }
        }
      }}
      className="relative z-10 w-full max-w-6xl mx-auto px-6 py-6 md:py-8 flex items-center justify-between"
    >
      <motion.div 
        variants={{
          hidden: { opacity: 0, x: -20 },
          visible: { opacity: 1, x: 0 }
        }}
        className="flex items-center gap-3 md:gap-4 group cursor-pointer"
      >
        <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-indigo-500/20 to-violet-500/10 border border-indigo-400/30 rounded-xl flex items-center justify-center overflow-hidden shadow-lg shadow-indigo-500/20 group-hover:rotate-[10deg] transition-transform duration-500">
          <img src="/logo.png" alt="SHAREDROP Logo" className="w-full h-full object-cover p-1.5" />
        </div>
        <div className="flex flex-col">
          <span className="text-xl md:text-2xl font-black tracking-tighter text-white leading-none">SHAREDROP</span>
          <span className="text-[8px] md:text-[9px] text-white/40 uppercase tracking-[0.2em] md:tracking-[0.25em] mt-1 font-bold">Fast • Secure • Seamless</span>
        </div>
      </motion.div>
      <motion.div 
        variants={{
          hidden: { opacity: 0, x: 20 },
          visible: { opacity: 1, x: 0 }
        }}
        className="hidden md:flex items-center gap-8 text-sm font-medium text-white/70 px-5 py-2.5 rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-lg shadow-[0_20px_50px_-30px_rgba(99,102,241,0.7)]"
      >
        <a href="#how-it-works" className="hover:text-white transition-colors relative group">
          How it Works
          <span className="absolute -bottom-1 left-0 w-0 h-px bg-indigo-500 transition-all group-hover:w-full" />
        </a>
        <a href="#" className="hover:text-white transition-colors relative group">
          Security
          <span className="absolute -bottom-1 left-0 w-0 h-px bg-indigo-500 transition-all group-hover:w-full" />
        </a>
        <a href="#" className="hover:text-white transition-colors relative group">
          Privacy
          <span className="absolute -bottom-1 left-0 w-0 h-px bg-indigo-500 transition-all group-hover:w-full" />
        </a>
      </motion.div>
    </motion.nav>
  );
}
