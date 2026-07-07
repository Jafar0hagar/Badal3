import React from 'react';
import { motion } from 'motion/react';
import BadalLogo from './BadalLogo';

interface Splash2Props {
  onStart: () => void;
}

export default function Splash2({ onStart }: Splash2Props) {
  return (
    <div 
      className="relative w-full h-full bg-[#FAF7F0] text-stone-800 select-none overflow-hidden flex flex-col justify-between p-8 text-center"
      dir="rtl"
    >
      {/* Curved background lines */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Soft yellow glow top right */}
        <div className="absolute -top-12 -right-12 w-64 h-64 rounded-full bg-[#FAF1D6]/80 blur-2xl" />
        {/* Soft yellow glow bottom left */}
        <div className="absolute -bottom-16 -left-16 w-80 h-80 rounded-full bg-[#E9C37A]/30 blur-2xl" />

        {/* Elegant circular arcs */}
        <svg viewBox="0 0 100 100" className="absolute top-0 right-0 w-48 h-48 text-[#E9C37A]/20" fill="currentColor">
          <circle cx="100" cy="0" r="80" />
          <circle cx="100" cy="0" r="60" fill="#FAF7F0" />
        </svg>

        <svg viewBox="0 0 100 100" className="absolute bottom-0 left-0 w-64 h-64 text-[#FAF1D6]/40" fill="currentColor">
          <circle cx="0" cy="100" r="90" />
          <circle cx="0" cy="100" r="70" fill="#FAF7F0" />
        </svg>

        {/* Small floating sparkles/dots */}
        <div className="absolute top-[20%] left-[15%] w-2 h-2 rounded-full bg-amber-400 opacity-60" />
        <div className="absolute top-[35%] right-[20%] w-1.5 h-1.5 rounded-full bg-amber-500 opacity-55" />
        <div className="absolute bottom-[40%] left-[25%] w-1.5 h-1.5 rounded-full bg-[#850F1D] opacity-40 animate-pulse" />
        <div className="absolute bottom-[25%] right-[15%] w-2.5 h-2.5 rounded-full bg-amber-300 opacity-65" />
      </div>

      {/* Top spacer */}
      <div className="h-4" />

      {/* Center content - Logo and Onboarding text */}
      <div className="flex flex-col items-center justify-center space-y-10 z-10 my-auto">
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, type: 'spring' }}
          className="p-1.5 bg-white rounded-2xl shadow-md border border-amber-200/20"
        >
          <BadalLogo size={90} />
        </motion.div>

        <div className="space-y-4 px-2">
          <motion.h2 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="text-3xl font-black text-[#850F1D] font-cairo"
          >
            مرحباً بك
          </motion.h2>

          <motion.p 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.7 }}
            className="text-stone-600 text-sm font-medium leading-relaxed font-tajawal max-w-xs mx-auto"
          >
            تعرف على أسعار العملات والمنتجات بسهولة، وتابع آخر التحديثات لحظة بلحظة مع تجربة استخدام ذكية وبسيطة.
          </motion.p>
        </div>
      </div>

      {/* Button & Progress Indicator */}
      <div className="flex flex-col items-center gap-6 z-10">
        
        {/* Maroon start button */}
        <motion.button 
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onStart}
          className="w-full max-w-xs bg-[#850F1D] hover:bg-[#720a15] active:bg-[#5C0A13] text-white text-base font-black py-3.5 rounded-full shadow-lg hover:shadow-xl transition-all duration-150 font-cairo cursor-pointer"
        >
          ابدأ الآن
        </motion.button>

        {/* Page dot indicator */}
        <div className="flex gap-2.5 pb-2">
          <div className="w-2.5 h-2.5 rounded-full bg-[#E9C37A] opacity-60" />
          <div className="w-2.5 h-2.5 rounded-full bg-[#850F1D] scale-110 shadow-xs" />
          <div className="w-2.5 h-2.5 rounded-full bg-[#E9C37A] opacity-60" />
        </div>

      </div>

    </div>
  );
}
