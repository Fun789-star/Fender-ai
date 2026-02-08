import React, { useEffect, useState, useContext, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { Article } from '../types';
import { AppContext } from '../App';
import { motion } from 'framer-motion';
import { ArrowLeft, Calendar, Tag, Share2, Copy, Check, Sparkles } from 'lucide-react';
import { SAMPLE_ARTICLES } from './ContentVault';

// --- COMPONENTS ---

// Helper to execute scripts inserted via innerHTML
const LiveAd: React.FC<{ code: string, label: string }> = ({ code, label }) => {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (containerRef.current && code) {
            // 1. Insert the HTML
            containerRef.current.innerHTML = code;
            
            // 2. Find all script tags
            const scripts = containerRef.current.getElementsByTagName('script');
            
            // 3. Re-create and replace them to force execution
            Array.from(scripts).forEach(script => {
                const newScript = document.createElement('script');
                // Copy attributes (src, async, type, etc.)
                Array.from(script.attributes).forEach(attr => newScript.setAttribute(attr.name, attr.value));
                // Copy inner content
                newScript.appendChild(document.createTextNode(script.innerHTML));
                // Replace old script with new one
                if(script.parentNode) {
                   script.parentNode.replaceChild(newScript, script);
                }
            });
        }
    }, [code]);

    return <div ref={containerRef} className="w-full my-6 flex justify-center" />;
};

const AdBanner: React.FC<{ label: string, code?: string }> = ({ label, code }) => {
  // 1. If we have code, render it live
  if (code && code.trim().length > 0) {
      return <LiveAd code={code} label={label} />;
  }

  // 2. Fallback to Placeholder
  return (
    <div className="w-full my-10 min-h-[120px] bg-gray-900/50 border-2 border-neon-blue rounded-xl flex flex-col items-center justify-center relative overflow-hidden group shadow-[0_0_20px_rgba(0,243,255,0.1)]">
        {/* Animated background hint */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-neon-blue/10 to-transparent -translate-x-full group-hover:animate-[shimmer_2s_infinite]"></div>
        
        {/* Label */}
        <span className="text-neon-blue font-black tracking-[0.2em] text-2xl z-10 drop-shadow-[0_0_8px_rgba(0,243,255,0.8)]">
        AD BANNER
        </span>
        <span className="text-xs font-mono text-white/70 uppercase tracking-widest relative z-10 mt-2 bg-black/50 px-3 py-1 rounded border border-gray-700">
        {label}
        </span>
    </div>
  );
};

const PromptBox: React.FC<{ promptText: string }> = ({ promptText }) => {
    const { language } = useContext(AppContext);
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(promptText);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="w-full my-8 relative">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-neon-blue to-neon-purple opacity-30 blur rounded-2xl"></div>
            <div className="relative bg-black border border-gray-800 rounded-xl p-6 shadow-xl">
                <div className="flex items-center justify-between mb-4 border-b border-gray-800 pb-3">
                    <h3 className="text-neon-blue font-bold flex items-center gap-2 uppercase tracking-wider text-sm">
                        <Sparkles className="w-4 h-4" />
                        {language === 'en' ? 'Article Prompt' : 'برومبت المقال'}
                    </h3>
                    <button 
                        onClick={handleCopy}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${copied ? 'bg-green-500/20 text-green-400' : 'bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white'}`}
                    >
                        {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                        {copied ? (language === 'en' ? 'COPIED!' : 'تم النسخ!') : (language === 'en' ? 'COPY' : 'نسخ')}
                    </button>
                </div>
                <div className="bg-gray-900/50 p-4 rounded-lg border border-gray-800/50">
                    <p className="font-mono text-gray-300 text-sm leading-relaxed whitespace-pre-wrap break-words">
                        {promptText}
                    </p>
                </div>
            </div>
        </div>
    );
};

// --- MAIN PAGE ---

export const ArticlePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { language, config } = useContext(AppContext);
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);

  // 1. FETCH DATA
  useEffect(() => {
    const fetchArticle = async () => {
      setLoading(true);
      if (!id) return;

      // Check samples first
      if (id.startsWith('sample-')) {
        const sample = SAMPLE_ARTICLES.find(a => a.id === id);
        if (sample) {
            setTimeout(() => {
                setArticle(sample);
                setLoading(false);
            }, 300);
            return;
        }
      }

      // Check Firestore
      try {
        const docRef = doc(db, 'articles', id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setArticle({ id: docSnap.id, ...docSnap.data() } as Article);
        } else {
            // Handle not found
            console.error("Article not found");
        }
      } catch (error) {
        console.error("Error fetching article:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchArticle();
    window.scrollTo(0, 0);
  }, [id]);

  // 2. LOADING STATE
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-black">
        <div className="w-12 h-12 border-4 border-gray-800 border-t-neon-blue rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!article) return <div className="min-h-screen flex items-center justify-center text-white">Article not found</div>;

  // 3. CONTENT SPLIT LOGIC
  // Simple split by newline to ensure distribution
  const splitContent = (text: string) => {
    if (!text) return { part1: '', part2: '' };
    const parts = text.split('\n');
    if (parts.length <= 1) return { part1: text, part2: '' };
    
    const midPoint = Math.ceil(parts.length / 2);
    const part1 = parts.slice(0, midPoint).join('\n');
    const part2 = parts.slice(midPoint).join('\n');
    return { part1, part2 };
  };

  const { part1, part2 } = splitContent(article.description);

  // 4. RENDER
  return (
    <article className="min-h-screen bg-gray-50 dark:bg-black pt-24 pb-20">
       <div className="max-w-4xl mx-auto px-4 sm:px-6">
          
          {/* Back Navigation */}
          <button 
             onClick={() => navigate('/')}
             className="mb-8 flex items-center gap-2 text-gray-500 hover:text-neon-blue transition-colors group"
          >
             <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
             <span className="text-sm font-bold uppercase tracking-wider">{language === 'en' ? 'Back' : 'عودة'}</span>
          </button>

          {/* Meta Info */}
          <div className="flex flex-wrap items-center gap-4 mb-6">
             <span className="px-3 py-1 bg-neon-blue/10 text-neon-blue border border-neon-blue/20 rounded-md text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                 <Tag className="w-3 h-3" /> {article.category}
             </span>
             <span className="flex items-center text-xs text-gray-500 font-mono uppercase">
                 <Calendar className="w-3 h-3 mr-2" />
                 {new Date(article.createdAt).toLocaleDateString()}
             </span>
          </div>

          {/* === 1. TITLE === */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-gray-900 dark:text-white mb-8 leading-tight tracking-tighter">
             {article.title}
          </h1>

          {/* === 2. FEATURED IMAGE === */}
          <div className="w-full aspect-video rounded-2xl overflow-hidden shadow-2xl mb-8 border border-gray-200 dark:border-gray-800">
             <img src={article.imageUrl} alt={article.title} className="w-full h-full object-cover" />
          </div>

          {/* Main Content Container */}
          <div className="bg-white dark:bg-[#0a0a0f] border border-gray-200 dark:border-gray-800 rounded-3xl p-6 md:p-10 shadow-lg">

            {/* === 3. AD SLOT #1 (HEADER) === */}
            {config?.show_header_ad !== false && (
                <AdBanner label="AD BANNER TOP" code={config?.ad_header} />
            )}

            {/* === 4. CONTENT PART 1 === */}
            <div className="prose prose-lg dark:prose-invert max-w-none mb-10">
                <p className="whitespace-pre-wrap leading-loose text-gray-700 dark:text-gray-300 font-sans text-lg">
                   {part1}
                </p>
            </div>

            {/* === 5. AD SLOT #2 (MIDDLE) === */}
            {config?.show_mid_ad !== false && (
                <AdBanner label="AD BANNER MID" code={config?.ad_mid} />
            )}

            {/* === 6. CONTENT PART 2 === */}
            <div className="prose prose-lg dark:prose-invert max-w-none mt-10 mb-10">
                <p className="whitespace-pre-wrap leading-loose text-gray-700 dark:text-gray-300 font-sans text-lg">
                   {part2}
                </p>
            </div>

            {/* === 7. PROMPT BOX === */}
            {article.article_prompt && (
                <PromptBox promptText={article.article_prompt} />
            )}

            {/* === 8. AD SLOT #3 (BOTTOM) === */}
            {config?.show_bottom_ad !== false && (
                <AdBanner label="AD BANNER BOTTOM" code={config?.ad_bottom} />
            )}

            {/* Share/Footer */}
            <div className="mt-12 pt-8 border-t border-gray-100 dark:border-gray-800 flex justify-between items-center">
                <div className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                    {language === 'en' ? 'Share this article' : 'مشاركة المقال'}
                </div>
                <button className="p-3 rounded-full bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:text-neon-blue hover:bg-black transition-colors">
                    <Share2 className="w-5 h-5" />
                </button>
            </div>

          </div>
       </div>
    </article>
  );
};