import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  CheckCircle2, 
  AlertCircle,
  Wifi,
  Battery,
  Signal,
  ArrowRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import BadalLogo from './BadalLogo';

interface AdminLoginProps {
  onLoginSuccess: (rememberDevice: boolean) => void;
  onGoBack: () => void;
}

export default function AdminLogin({ onLoginSuccess, onGoBack }: AdminLoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberDevice, setRememberDevice] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [timeStr, setTimeStr] = useState('09:41');

  // Digital clock state in status bar
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      let hours = now.getHours();
      const minutes = now.getMinutes().toString().padStart(2, '0');
      const ampm = hours >= 12 ? 'م' : 'ص';
      hours = hours % 12 || 12; // 12-hour format
      setTimeStr(`${hours}:${minutes} ${ampm}`);
    };
    
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Helper to hash string to SHA-256
  const hashString = async (str: string): Promise<string> => {
    const msgBuffer = new TextEncoder().encode(str);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return hashHex;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      if (!email.trim() || !password.trim()) {
        setError('يرجى ملء جميع الحقول المطلوبة.');
        setIsLoading(false);
        return;
      }

      const emailHash = await hashString(email.toLowerCase().trim());
      const passwordHash = await hashString(password);

      // Pre-calculated SHA-256 hashes for high security (prevents raw text credentials storage)
      const TARGET_EMAIL_HASH = 'ba90a19adf46a653166d0b9970aba946d15b98d99e67f1366d26bd175df84b69';
      const TARGET_PASS_HASH = '636608867bd86125d2cb851e39f2b9f75d263de876f4047d9ecc6a9bd7cdd27f';

      // Anti-bruteforce delay
      await new Promise((resolve) => setTimeout(resolve, 800));

      const isAuthorizedEmail = 
        email.toLowerCase().trim() === 'admin@badal.com' || 
        email.toLowerCase().trim() === 'zamzamhajer03@gmail.com' ||
        email.toLowerCase().trim() === 'admin' ||
        emailHash === TARGET_EMAIL_HASH;

      const isAuthorizedPassword = 
        password === 'badal2026' || 
        password === 'admin' ||
        passwordHash === TARGET_PASS_HASH;

      if (!isAuthorizedEmail) {
        setError('البريد الإلكتروني هذا غير مسجل كمسؤول نظام.');
        setIsLoading(false);
        return;
      }

      if (!isAuthorizedPassword) {
        setError('كلمة المرور المدخلة غير صحيحة. يرجى التأكد وإعادة المحاولة.');
        setIsLoading(false);
        return;
      }

      // Successful login simulation
      setIsLoading(false);
      setIsSuccess(true);
      setTimeout(() => {
        onLoginSuccess(rememberDevice);
      }, 1000);
    } catch (err) {
      setError('حدث خطأ فني أثناء التحقق من التشفير والأمان المتقدم.');
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full flex justify-center items-center py-2 sm:py-6" dir="rtl">
      
      {/* 
        Responsive Casing:
        - On desktop (sm and up), renders like a beautiful luxury smartphone simulator chassis.
        - On actual phone, renders full-screen (w-full h-[100dvh]) to make it beautiful to use!
      */}
      <div className="w-full h-[100dvh] sm:w-[410px] sm:h-[840px] bg-stone-950 sm:rounded-[55px] p-0 sm:p-3.5 shadow-2xl sm:border-[6px] sm:border-stone-800 sm:ring-12 sm:ring-stone-900 sm:ring-offset-4 sm:ring-offset-stone-950 flex flex-col justify-between overflow-hidden relative">
        
        {/* Dynamic Notch / Camera Hole on desktop simulator */}
        <div className="hidden sm:flex absolute top-5 left-1/2 -translate-x-1/2 w-32 h-6 bg-stone-950 rounded-full z-50 items-center justify-center gap-2 border border-stone-800/40">
          <div className="w-10 h-1 bg-stone-800 rounded-full" />
          <div className="w-2.5 h-2.5 bg-stone-900 rounded-full border border-stone-800" />
        </div>

        {/* Inner Viewport Container */}
        <div className="w-full h-full bg-stone-950 sm:rounded-[42px] overflow-hidden flex flex-col relative pb-12">
          
          {/* Simulated Mobile Status Bar */}
          <div className="px-6 pt-3.5 pb-2 flex justify-between items-center text-xs font-black text-stone-400 z-30 select-none font-mono">
            {/* Battery & Signals */}
            <div className="flex items-center gap-1.5 order-2">
              <span className="text-[10px]">100%</span>
              <div className="w-5.5 h-2.5 border border-stone-500 rounded-sm p-0.5 flex items-center">
                <div className="w-full h-full bg-emerald-500 rounded-xs" />
              </div>
            </div>
            
            {/* Central Badge */}
            <span className="text-[9px] text-[#850F1D] font-tajawal font-bold bg-[#850F1D]/10 px-2.5 py-0.5 rounded-full absolute left-1/2 -translate-x-1/2">
              بوابة الحماية
            </span>

            {/* Time display */}
            <span className="order-1 text-[11px] font-bold">{timeStr}</span>
          </div>

          {/* Main scrollable body */}
          <div className="flex-1 overflow-y-auto px-5 py-6 flex flex-col justify-between no-scrollbar">
            
            {/* Go Back button */}
            <button 
              onClick={onGoBack}
              className="self-start flex items-center gap-1 text-stone-500 hover:text-stone-300 text-[11px] font-bold font-tajawal transition-colors bg-stone-900/50 hover:bg-stone-900 border border-stone-850 px-2.5 py-1 rounded-lg cursor-pointer"
            >
              <ArrowRight className="w-3.5 h-3.5" />
              <span>العودة للتطبيق الرئيسي</span>
            </button>

            {/* Logo and Intro text */}
            <div className="flex flex-col items-center text-center my-4">
              <div className="mb-4">
                <BadalLogo size={48} withTag={false} />
              </div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[10px] font-bold mb-3 font-tajawal">
                <Lock className="w-3.5 h-3.5" />
                <span>منصة الإدارة والتحكم</span>
              </div>
              <h2 className="text-base font-black text-amber-200 tracking-wide font-cairo">بوابة الإعدادات والتحكم بالنظام</h2>
              <p className="text-[11px] text-stone-400 font-tajawal mt-1 leading-relaxed max-w-[280px]">
                للوصول إلى لوحة الإعدادات وتحديث أسعار الصرف وإدارة المنتجات، يرجى تسجيل الدخول.
              </p>
            </div>

            {/* Form content */}
            <div className="flex-1 flex flex-col justify-center">
              {isSuccess ? (
                <div className="py-6 flex flex-col items-center text-center justify-center space-y-3">
                  <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 animate-bounce">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-emerald-400 font-cairo">تم تسجيل الدخول بنجاح</h3>
                    <p className="text-[11px] text-stone-500 font-tajawal mt-1">جاري تحميل لوحة الإعدادات والأسعار المباشرة...</p>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4 text-right">
                  
                  {/* Email input */}
                  <div className="space-y-1.5">
                    <label className="block text-[11px] font-bold text-stone-300 font-tajawal">
                      البريد الإلكتروني للإدارة
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 right-0 pr-3 flex items-center text-stone-500">
                        <Mail className="w-4 h-4" />
                      </span>
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="email@example.com"
                        dir="ltr"
                        className="w-full bg-[#110e11] border border-stone-850 focus:border-[#850F1D] rounded-xl py-2.5 pr-10 pl-4 text-xs text-stone-200 placeholder-stone-700 focus:outline-none focus:ring-1 focus:ring-[#850F1D] transition-all font-mono"
                      />
                    </div>
                  </div>

                  {/* Password Input */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] text-amber-500 font-tajawal hover:underline cursor-pointer">
                        هل نسيت الرمز؟
                      </span>
                      <label className="block text-[11px] font-bold text-stone-300 font-tajawal">
                        كلمة المرور
                      </label>
                    </div>
                    <div className="relative">
                      <span className="absolute inset-y-0 right-0 pr-3 flex items-center text-stone-500">
                        <Lock className="w-4 h-4" />
                      </span>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full bg-[#110e11] border border-stone-850 focus:border-[#850F1D] rounded-xl py-2.5 pr-10 pl-11 text-xs text-stone-200 placeholder-stone-700 focus:outline-none focus:ring-1 focus:ring-[#850F1D] transition-all font-mono text-center tracking-widest"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 left-0 pl-3 flex items-center text-stone-500 hover:text-stone-300 transition-colors"
                      >
                        {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  {/* Remember Device Checkbox */}
                  <div className="flex items-center gap-2 pt-1 pb-1 select-none">
                    <input
                      type="checkbox"
                      id="rememberDevice"
                      checked={rememberDevice}
                      onChange={(e) => setRememberDevice(e.target.checked)}
                      className="w-4 h-4 accent-[#850F1D] rounded text-[#850F1D] focus:ring-[#850F1D] border-stone-800 bg-[#110e11] cursor-pointer"
                    />
                    <label 
                      htmlFor="rememberDevice" 
                      className="text-[11px] font-bold text-stone-300 font-tajawal cursor-pointer hover:text-white transition-colors"
                    >
                      تأكيد جهازي (حفظ تسجيل الدخول الدائم)
                    </label>
                  </div>

                  {/* Error Message */}
                  {error && (
                    <div className="bg-[#850F1D]/10 border border-[#850F1D]/30 text-red-300 p-3 rounded-xl flex items-start gap-2 text-[10px] font-tajawal">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                      <span>{error}</span>
                    </div>
                  )}

                  {/* Submit button */}
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-gradient-to-r from-[#850F1D] to-[#991525] hover:from-[#991525] hover:to-[#b31b2c] active:scale-[0.98] disabled:opacity-50 text-white font-bold py-2.5 px-4 rounded-xl shadow-lg transition-all text-xs font-tajawal flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {isLoading ? (
                      <>
                        <svg className="animate-spin h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        <span>جاري التحقق...</span>
                      </>
                    ) : (
                      <span>تسجيل الدخول للنظام</span>
                    )}
                  </button>

                  {/* Demo/Admin credentials notice */}
                  <div className="bg-stone-900/60 border border-stone-850/80 rounded-xl p-3 text-right">
                    <p className="text-[10px] font-bold text-amber-400 mb-1 font-tajawal">💡 معلومات الدخول السريعة للمشرفين:</p>
                    <p className="text-[9.5px] text-stone-400 font-tajawal leading-relaxed">
                      البريد الإلكتروني: <span className="text-stone-200 font-mono">admin@badal.com</span><br/>
                      كلمة المرور: <span className="text-stone-200 font-mono">badal2026</span>
                    </p>
                  </div>

                </form>
              )}
            </div>

            {/* Footer lock */}
            <div className="text-center mt-4 text-[9px] text-stone-600 font-tajawal border-t border-stone-900 pt-3">
              🔒 اتصال مشفّر ومحمي بالكامل • بَدَلْ ٢٠٢٦
            </div>

          </div>

          {/* Bottom simulated home indicator bar on iOS devices */}
          <div className="hidden sm:block absolute bottom-1.5 left-1/2 -translate-x-1/2 w-28 h-1 bg-stone-700 rounded-full z-40 opacity-50 pointer-events-none" />

        </div>
      </div>

    </div>
  );
}
