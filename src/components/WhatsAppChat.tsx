import React, { useState, useEffect, useRef } from 'react';
import { Send, CheckCheck, ShieldAlert, ArrowRight, User, PhoneCall, Image } from 'lucide-react';
import BadalLogo from './BadalLogo';

interface WhatsAppChatProps {
  productName: string;
  productPrice: string;
  onClose: () => void;
}

interface Message {
  id: string;
  text: string;
  isBot: boolean;
  time: string;
  status: 'sent' | 'delivered' | 'read';
}

export default function WhatsAppChat({ productName, productPrice, onClose }: WhatsAppChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Initialize with order message from user and auto-reply from Badal assistant
  useEffect(() => {
    const timeNow = new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' });
    
    // Initial user order message
    const initialUserMsg: Message = {
      id: 'msg-1',
      text: `مرحباً تطبيق بدل، أود الاستفسار وشراء منتج [${productName}] المعلن عنه بسعر [${productPrice} ج.س]. هل المنتج متوفر حالياً؟`,
      isBot: false,
      time: timeNow,
      status: 'read'
    };

    setMessages([initialUserMsg]);

    // After 1.2s, Badal bot starts typing
    const typingTimer = setTimeout(() => {
      setIsTyping(true);
    }, 1200);

    // After 3.5s, Badal bot sends replies
    const replyTimer = setTimeout(() => {
      setIsTyping(false);
      const replyTime = new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' });
      const botMsg: Message = {
        id: 'msg-2',
        text: `أهلاً بك يا فندم في تطبيق بدل! 🌹 نعم، منتج (${productName}) متوفر حالياً وبأعلى جودة شحن. 

سعر الكيس/العلبة هو ${productPrice} ج.س وجاهز للتوصيل الفوري.

الرجاء تزويدنا بالتالي لإتمام الطلب:
1. الاسم الكامل 👤
2. رقم الهاتف للتواصل 📞
3. عنوان التوصيل بالتفصيل 📍
4. الكمية المطلوبة 📦

سيتواصل معك مندوبنا فوراً لتأكيد موعد التسليم وسرعة الشحن. شكراً لثقتك بـ بدل! ✨`,
        isBot: true,
        time: replyTime,
        status: 'read'
      };
      setMessages(prev => [...prev, botMsg]);
    }, 3800);

    return () => {
      clearTimeout(typingTimer);
      clearTimeout(replyTimer);
    };
  }, [productName, productPrice]);

  // Scroll to bottom whenever messages change
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const timeNow = new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' });
    const newUserMsg: Message = {
      id: `user-msg-${Date.now()}`,
      text: inputText,
      isBot: false,
      time: timeNow,
      status: 'sent'
    };

    setMessages(prev => [...prev, newUserMsg]);
    setInputText('');

    // Simulate status update (sent -> delivered -> read)
    const msgId = newUserMsg.id;
    setTimeout(() => {
      setMessages(prev => prev.map(m => m.id === msgId ? { ...m, status: 'delivered' } : m));
    }, 800);
    setTimeout(() => {
      setMessages(prev => prev.map(m => m.id === msgId ? { ...m, status: 'read' } : m));
    }, 1600);

    // Simulate Bot response after a while
    setTimeout(() => {
      setIsTyping(true);
    }, 2000);

    setTimeout(() => {
      setIsTyping(false);
      const responseTime = new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' });
      const botResponse: Message = {
        id: `bot-msg-${Date.now()}`,
        text: `شكراً لردك السريع واهتمامك! لقد تم استلام تفاصيلك بنجاح وجاري تحويل الطلب لقسم المبيعات والتوصيل. 

سيقوم مندوبنا بالاتصال بك على الرقم الموفر خلال دقائق لتأكيد الشحن الفوري. 🚀

إذا كان لديك أي استفسار آخر بخصوص أسعار صرف العملات أو بقية المواد الاستهلاكية، نحن دائماً هنا في الخدمة!`,
        isBot: true,
        time: responseTime,
        status: 'read'
      };
      setMessages(prev => [...prev, botResponse]);
    }, 4500);
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs font-sans" dir="rtl">
      <div className="bg-[#E5DDD5] w-full max-w-md h-[85vh] rounded-2xl overflow-hidden shadow-2xl flex flex-col border border-emerald-800/10">
        
        {/* WhatsApp Green Header */}
        <div className="bg-[#075E54] text-white px-3 py-3 flex items-center justify-between shadow-md">
          <div className="flex items-center gap-2">
            <button 
              onClick={onClose} 
              className="p-1 hover:bg-emerald-700/50 rounded-full transition-colors ml-1"
              aria-label="Back"
            >
              <ArrowRight className="w-5 h-5 text-white" />
            </button>
            
            {/* Logo Avatar */}
            <div className="relative">
              <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center overflow-hidden border border-amber-300">
                <BadalLogo size={32} withTag={false} />
              </div>
              <span className="absolute bottom-0 left-0 w-2.5 h-2.5 bg-emerald-400 border-2 border-[#075E54] rounded-full"></span>
            </div>
            
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-semibold text-sm">بدل - الطلبات الفورية</span>
                {/* Verified business badge */}
                <svg className="w-4 h-4 text-emerald-400 fill-current" viewBox="0 0 24 24">
                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                </svg>
              </div>
              <span className="text-[10px] text-emerald-100 opacity-90">متصل الآن (حساب أعمال موثق)</span>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button className="p-1.5 hover:bg-emerald-700/50 rounded-full text-white transition-colors">
              <PhoneCall className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Security Warning bar */}
        <div className="bg-[#FFEFC6] text-[#6E4F10] text-[10px] py-1 px-3 flex items-center gap-1.5 justify-center border-b border-amber-100 font-medium">
          <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
          <span>الرسائل والمكالمات مشفرة تماماً. لا توجد جهة خارجية خارج هذه الدردشة لقراءة تفاصيلك.</span>
        </div>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3.5 no-scrollbar bg-[url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png')] bg-repeat opacity-95">
          
          {/* Info Badge */}
          <div className="flex justify-center my-2">
            <span className="bg-white/80 backdrop-blur-xs text-stone-600 text-[10px] py-1 px-2.5 rounded-lg shadow-xs font-medium">
              اليوم
            </span>
          </div>

          {messages.map((msg) => (
            <div 
              key={msg.id} 
              className={`flex w-full ${msg.isBot ? 'justify-start' : 'justify-end'}`}
            >
              <div 
                className={`max-w-[85%] rounded-lg px-3 py-2 shadow-xs relative text-sm ${
                  msg.isBot 
                    ? 'bg-white text-stone-800 rounded-tr-none' 
                    : 'bg-[#DCF8C6] text-stone-900 rounded-tl-none'
                }`}
              >
                {/* Arrow indicator decoration for bubbles */}
                <div className={`absolute top-0 w-2.5 h-2.5 ${
                  msg.isBot 
                    ? '-right-2 border-l-[10px] border-l-transparent border-t-[10px] border-t-white' 
                    : '-left-2 border-r-[10px] border-r-transparent border-t-[10px] border-t-[#DCF8C6]'
                }`} />

                <div className="whitespace-pre-line text-[13px] leading-relaxed font-normal">{msg.text}</div>
                
                <div className="flex items-center justify-end gap-1 mt-1 text-[9px] text-stone-500">
                  <span>{msg.time}</span>
                  {!msg.isBot && (
                    <span>
                      {msg.status === 'sent' && <span className="text-stone-400">✓</span>}
                      {msg.status === 'delivered' && <span className="text-stone-400">✓✓</span>}
                      {msg.status === 'read' && <span className="text-sky-500 font-bold">✓✓</span>}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}

          {/* Typing Indicator */}
          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-white rounded-lg rounded-tr-none px-4 py-2.5 shadow-xs relative flex items-center gap-1.5">
                <span className="text-stone-500 text-xs font-medium">جاري الكتابة</span>
                <span className="flex gap-1">
                  <span className="w-1.5 h-1.5 bg-stone-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                  <span className="w-1.5 h-1.5 bg-stone-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                  <span className="w-1.5 h-1.5 bg-stone-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                </span>
              </div>
            </div>
          )}

          <div ref={chatEndRef} />
        </div>

        {/* Input Footer Area */}
        <form onSubmit={handleSendMessage} className="bg-[#F0F0F0] p-2 flex items-center gap-2 border-t border-stone-200">
          <div className="flex-1 bg-white rounded-full px-4 py-1.5 flex items-center justify-between border border-stone-200 shadow-inner">
            <input 
              type="text" 
              placeholder="اكتب رسالة..." 
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="flex-1 border-none outline-hidden text-xs text-stone-800"
            />
            <button type="button" className="text-stone-400 hover:text-stone-600 p-0.5" aria-label="Attach file">
              <Image className="w-4.5 h-4.5" />
            </button>
          </div>
          
          <button 
            type="submit" 
            className="w-10 h-10 bg-[#128C7E] hover:bg-[#075E54] active:bg-[#054c43] text-white rounded-full flex items-center justify-center shadow-md transition-colors"
            aria-label="Send message"
          >
            <Send className="w-4.5 h-4.5 rotate-180 transform translate-x-px" />
          </button>
        </form>

      </div>
    </div>
  );
}
