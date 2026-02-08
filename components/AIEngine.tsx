import React, { useContext, useState, useRef, useEffect } from 'react';
import { AppContext } from '../App';
import { generateAIResponse } from '../services/geminiService';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Copy, Check, Terminal, Play, Wand2 } from 'lucide-react';
import { doc, updateDoc, increment } from 'firebase/firestore';
import { db } from '../firebase';

// Helper to execute scripts inserted via innerHTML
const LiveAd: React.FC<{ code: string }> = ({ code }) => {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (containerRef.current && code) {
            containerRef.current.innerHTML = code;
            const scripts = containerRef.current.getElementsByTagName('script');
            Array.from(scripts).forEach(script => {
                const newScript = document.createElement('script');
                Array.from(script.attributes).forEach(attr => newScript.setAttribute(attr.name, attr.value));
                newScript.appendChild(document.createTextNode(script.innerHTML));
                if(script.parentNode) {
                   script.parentNode.replaceChild(newScript, script);
                }
            });
        }
    }, [code]);

    return <div ref={containerRef} className="w-full h-full flex items-center justify-center overflow-hidden" />;
};

const SidebarAd: React.FC<{ mobile?: boolean, code?: string }> = ({ mobile, code }) => {
  if (code && code.trim().length > 0) {
      return (
        <div className={`w-full ${mobile ? 'min-h-[300px]' : 'min-h-[600px]'} bg-gray-900/30 border border-gray-800 rounded-xl overflow-hidden`}>
            <LiveAd code={code} />
        </div>
      );
  }

  return (
    <div className={`w-full ${mobile ? 'h-[300px]' : 'h-[600px]'} bg-gray-900/50 border-2 border-neon-blue rounded-xl flex flex-col items-center justify-center relative overflow-hidden group shadow-[0_0_20px_rgba(0,243,255,0.1)]`}>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-neon-blue/10 to-transparent -translate-y-full group-hover:animate-[shimmer_2s_infinite]"></div>
        <span className="text-neon-blue font-black tracking-[0.2em] text-xl z-10 text-center px-4 drop-shadow-[0_0_8px_rgba(0,243,255,0.8)]">
        SIDEBAR AD
        </span>
        <span className="text-xs font-mono text-white/70 uppercase tracking-widest relative z-10 mt-4 bg-black/50 px-3 py-1 rounded border border-gray-700">
        VERTICAL 300x600
        </span>
    </div>
  );
};

export const AIEngine: React.FC = () => {
  const { config, language } = useContext(AppContext);
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleGenerate = async () => {
    if (!input.trim()) return;
    
    setLoading(true);
    setOutput('');
    try {
      const result = await generateAIResponse(input);
      setOutput(result || 'No response generated.');
      
      // Update stats (fire and forget)
      try {
        const statsRef = doc(db, 'stats', 'main');
        await updateDoc(statsRef, { promptCopies: increment(0) }); // Placeholder for tracking usage
      } catch (e) {
        // Ignore stats error
      }
    } catch (error) {
      setOutput(language === 'en' ? 'Error: Could not process request. Check API configuration.' : 'خطأ: لا يمكن معالجة الطلب. تحقق من إعدادات API.');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(output);
    setCopied(true);
    
    // Update stats for copies
    try {
       const statsRef = doc(db, 'stats', 'main');
       updateDoc(statsRef, { promptCopies: increment(1) });
    } catch (e) {}

    setTimeout(() => setCopied(false), 2000);
  };

  const placeholderText = language === 'en' 
    ? "Write your simple idea here and I will turn it into a professional and distinctive prompt..." 
    : "اكتب فكرتك البسيطة هنا وسأحولها لبرومبت احترافي ومميز...";
  
  const MotionButton = motion.button as any;
  const MotionDiv = motion.div as any;

  return (
    <section id="ai-generator" className="py-8 px-4 max-w-7xl mx-auto">
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* === LEFT COLUMN: Generator === */}
        <div className="lg:col-span-2">
            <div className="relative rounded-2xl overflow-hidden bg-gray-900 border border-gray-800 shadow-2xl">
                {/* Header */}
                <div className="flex items-center justify-between px-4 py-3 bg-gray-950 border-b border-gray-800">
                <div className="flex space-x-2 rtl:space-x-reverse">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                </div>
                <div className="text-xs font-mono text-neon-blue flex items-center tracking-widest uppercase">
                    <Wand2 className="w-3 h-3 mr-2 rtl:ml-2 rtl:mr-0" />
                    {language === 'en' ? 'PROMPT ENGINEER V1.0' : 'مولد الأوامر الذكي'}
                </div>
                </div>

                {/* Input Area */}
                <div className="p-6">
                <div className="flex items-start space-x-3 rtl:space-x-reverse">
                    <span className="text-neon-blue mt-1 font-mono text-lg">{'>'}</span>
                    <textarea 
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder={placeholderText}
                    className="w-full bg-transparent text-gray-200 placeholder-gray-600 focus:outline-none font-mono resize-none h-24 text-lg"
                    />
                </div>

                <div className="mt-4 flex justify-end">
                    <MotionButton
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleGenerate}
                    disabled={loading || !input.trim()}
                    className={`flex items-center px-6 py-2 rounded-lg font-bold text-sm transition-all ${loading ? 'bg-gray-700 text-gray-500 cursor-not-allowed' : 'bg-neon-blue text-black hover:bg-white hover:shadow-[0_0_15px_rgba(0,243,255,0.5)]'}`}
                    >
                    {loading ? (
                        <>
                        <span className="animate-spin mr-2 rtl:ml-2 rtl:mr-0">⟳</span> 
                        {language === 'en' ? 'Optimizing...' : 'جاري التحسين...'}
                        </>
                    ) : (
                        <>
                        <Sparkles className="w-4 h-4 mr-2 rtl:ml-2 rtl:mr-0" fill="currentColor" /> 
                        {language === 'en' ? 'GENERATE PROMPT' : 'توليد البرومبت'}
                        </>
                    )}
                    </MotionButton>
                </div>
                </div>

                {/* Output Area (Collapsible/Animate) */}
                <AnimatePresence>
                {output && (
                    <MotionDiv
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="border-t border-gray-800 bg-black/50"
                    >
                    <div className="p-6 relative">
                        <h3 className="text-xs font-bold text-gray-500 uppercase mb-3 tracking-wider flex items-center gap-2">
                        <Terminal className="w-4 h-4" />
                        {language === 'en' ? 'Optimized Result' : 'النتيجة المحسنة'}
                        </h3>
                        
                        <div className="bg-gray-950/80 p-4 rounded-lg border border-gray-800/50 backdrop-blur-sm">
                        <div className="prose prose-invert max-w-none font-mono text-sm text-neon-blue whitespace-pre-wrap leading-relaxed">
                            {output}
                        </div>
                        </div>
                        
                        <div className="mt-4 flex justify-end">
                        <button 
                            onClick={copyToClipboard}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-colors ${copied ? 'bg-green-500/20 text-green-400' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'}`}
                        >
                            {copied ? (
                                <>
                                <Check className="w-4 h-4" /> 
                                {language === 'en' ? 'COPIED' : 'تم النسخ'}
                                </>
                            ) : (
                                <>
                                <Copy className="w-4 h-4" /> 
                                {language === 'en' ? 'COPY TO CLIPBOARD' : 'نسخ النص'}
                                </>
                            )}
                        </button>
                        </div>
                    </div>
                    </MotionDiv>
                )}
                </AnimatePresence>
            </div>
        </div>

        {/* === RIGHT COLUMN: Sidebar Ad (Desktop Only) === */}
        <div className="hidden lg:block lg:col-span-1 sticky top-24">
             {config?.show_sidebar_ad !== false && <SidebarAd code={config?.ad_sidebar} />}
        </div>

        {/* === MOBILE AD (Falls below on small screens) === */}
        <div className="block lg:hidden w-full">
            {config?.show_sidebar_ad !== false && <SidebarAd mobile code={config?.ad_sidebar} />}
        </div>

      </div>
    </section>
  );
};