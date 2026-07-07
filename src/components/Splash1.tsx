import React, { useEffect } from 'react';
import { motion } from 'motion/react';
import BadalLogo from './BadalLogo';

interface Splash1Props {
  onNext: () => void;
}

export default function Splash1({ onNext }: Splash1Props) {
  // Let the splash screen auto-transition after 3.5 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      onNext();
    }, 4500);
    return () => clearTimeout(timer);
  }, [onNext]);

  return (
    <div 
      className="relative w-full h-full bg-gradient-to-b from-[#FAF1D6] via-[#E9C37A] to-[#C89B44] text-stone-900 select-none cursor-pointer overflow-hidden flex flex-col justify-between p-8 text-center"
      onClick={onNext}
    >
      {/* Decorative Gold Sand Dunes (curves rendered with CSS/SVG) */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Glow light effect */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-72 h-72 rounded-full bg-amber-100/30 blur-3xl" />
        
        {/* Top Wave */}
        <svg viewBox="0 0 100 100" className="absolute top-0 inset-x-0 w-full h-40 opacity-20" preserveAspectRatio="none">
          <path d="M 0 0 Q 30 50 60 20 T 100 0 Z" fill="#FFF" />
        </svg>

        {/* Bottom swooping dunes */}
        <svg viewBox="0 0 100 100" className="absolute bottom-0 inset-x-0 w-full h-64 opacity-25" preserveAspectRatio="none">
          <path d="M 0 100 Q 25 70 50 85 T 100 60 L 100 100 Z" fill="#FFF" />
          <path d="M 0 100 Q 35 60 70 80 T 100 50 L 100 100 Z" fill="#FFF" opacity="0.5" />
        </svg>

        {/* Animated sparkling gold particles */}
        <div className="absolute inset-0">
          {[...Array(15)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1.5 h-1.5 bg-amber-50 rounded-full opacity-60 animate-ping"
              style={{
                top: `${Math.random() * 80 + 10}%`,
                left: `${Math.random() * 80 + 10}%`,
                animationDuration: `${Math.random() * 3 + 2}s`,
                animationDelay: `${Math.random() * 2}s`
              }}
            />
          ))}
        </div>
      </div>

      {/* Top spacer */}
      <div className="h-6" />

      {/* Logo and App Title - centered vertically */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.85 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1, ease: 'easeOut' }}
        className="flex flex-col items-center justify-center space-y-7 z-10"
      >
        <div className="relative group p-2 rounded-3xl bg-white/10 backdrop-blur-xs shadow-xl border border-white/20">
          {/* Pulsing glow ring */}
          <div className="absolute -inset-1 rounded-3xl bg-amber-400 opacity-20 blur-md group-hover:opacity-40 transition-opacity animate-pulse" />
          <BadalLogo size={140} />
        </div>

        <div className="space-y-3">
          <motion.h1 
            initial={{ letterSpacing: '0.1em', opacity: 0 }}
            animate={{ letterSpacing: '0.25em', opacity: 1 }}
            transition={{ delay: 0.3, duration: 1.2 }}
            className="text-4xl font-extrabold text-[#850F1D] font-sans tracking-widest leading-none drop-shadow-sm"
          >
            BADAL
          </motion.h1>
          
          <motion.p 
            initial={{ y: 15, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.8 }}
            className="text-base font-bold text-[#5c131c] font-tajawal px-4 tracking-wide"
          >
            أسعار العملات والمنتجات لحظة بلحظة
          </motion.p>
        </div>
      </motion.div>

      {/* Page indicator - Slide 1 */}
      <div className="flex flex-col items-center gap-4 z-10">
        <div className="flex gap-2.5">
          {/* Active indicator */}
          <div className="w-10 h-1.5 rounded-full bg-[#850F1D] shadow-sm transition-all" />
          {/* Inactive Indicators */}
          <div className="w-8 h-1.5 rounded-full bg-white/40" />
          <div className="w-8 h-1.5 rounded-full bg-white/40" />
        </div>
        
        <span className="text-[10px] text-stone-700 font-bold tracking-wide font-tajawal animate-pulse">
          اضغط للمتابعة أو انتظر ثوانٍ...
        </span>
      </div>

    </div>
  );
}
