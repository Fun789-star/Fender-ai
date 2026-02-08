import React, { useContext, useEffect, useState } from 'react';
import { AppContext } from '../App';
import { motion, useSpring, useTransform } from 'framer-motion';
import { Youtube, Facebook, Instagram } from 'lucide-react';

const TypingText: React.FC<{ text: string }> = ({ text }) => {
  const [displayedText, setDisplayedText] = useState('');
  
  useEffect(() => {
    setDisplayedText(''); // Reset on text change
    let i = 0;
    const intervalId = setInterval(() => {
      setDisplayedText((prev) => text.slice(0, i + 1));
      i++;
      if (i > text.length) clearInterval(intervalId);
    }, 50);
    return () => clearInterval(intervalId);
  }, [text]);

  return (
    <span className="font-mono text-neon-blue border-r-2 border-neon-blue animate-pulse pr-1">
      {displayedText}
    </span>
  );
};

// Custom TikTok Icon SVG
const TikTokIcon = ({ className }: { className?: string }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    fill="currentColor" 
    stroke="currentColor" 
    strokeWidth="0"
    className={className}
  >
     <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
  </svg>
);

const CountUp: React.FC<{ value: string | number | undefined }> = ({ value }) => {
  // CRITICAL FIX: Ensure value is a string before regex match to prevent TypeError
  const strValue = value !== undefined && value !== null ? String(value) : '0';
  
  // Extract number and suffix. E.g., "1.5M" -> num: 1.5, suffix: "M"
  const match = strValue.match(/^([\d.]+)(.*)$/);
  const num = match ? parseFloat(match[1]) : 0;
  const suffix = match ? match[2] : '';
  
  const spring = useSpring(0, { mass: 0.8, stiffness: 75, damping: 15 });
  const display = useTransform(spring, (current: number) => {
    const isDecimal = num % 1 !== 0;
    return current.toFixed(isDecimal ? 1 : 0) + suffix;
  });

  useEffect(() => {
    // Only update if we have a valid number
    if (!isNaN(num)) {
      spring.set(num);
    }
  }, [num, spring]);

  const MotionSpan = motion.span as any;
  return <MotionSpan>{display}</MotionSpan>;
};

const StatCard: React.FC<{ 
  icon: any, 
  count: string | number | undefined, 
  url: string | undefined, 
  label: string, 
  colorClass: string 
}> = ({ icon: Icon, count, url, label, colorClass }) => {
  if (!url && !count) return null;

  const MotionA = motion.a as any;

  return (
    <MotionA
      href={url || '#'}
      target="_blank"
      rel="noopener noreferrer"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.05, y: -5 }}
      whileTap={{ scale: 0.95 }}
      className={`relative group flex flex-col items-center justify-center p-4 bg-white dark:bg-black/40 backdrop-blur-sm rounded-2xl border border-gray-100 dark:border-gray-800 shadow-xl overflow-hidden`}
    >
      <div className={`absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-300 bg-gradient-to-br ${colorClass}`}></div>
      
      <div className={`mb-2 p-3 rounded-full bg-gray-50 dark:bg-gray-900 group-hover:scale-110 transition-transform duration-300 ${colorClass.replace('from-', 'text-').split(' ')[0]}`}>
        <Icon className="w-6 h-6 md:w-8 md:h-8" />
      </div>

      <div className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white mb-1">
        <CountUp value={count} />
      </div>

      <div className="text-xs font-bold text-gray-500 uppercase tracking-widest group-hover:text-neon-blue transition-colors">
        {label}
      </div>

      <div className={`absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r ${colorClass} transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left`}></div>
    </MotionA>
  );
};

export const Hero: React.FC = () => {
  const { config, language } = useContext(AppContext);

  const subtitle = language === 'en' 
    ? "AI Content Creator | Future Tech Enthusiast" 
    : "صانع محتوى ذكاء اصطناعي | شغوف بتقنيات المستقبل";
  
  const MotionDiv = motion.div as any;

  return (
    <section id="home" className="relative pt-12 pb-12 overflow-hidden">
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center text-center">
        
        {/* Profile Avatar */}
        <MotionDiv 
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="relative group mb-8"
        >
          <div className="absolute -inset-1 bg-gradient-to-r from-neon-blue to-neon-purple rounded-full blur opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
          <div className="relative w-36 h-36 md:w-44 md:h-44 rounded-full p-1 bg-white dark:bg-black ring-2 ring-gray-100 dark:ring-gray-800 overflow-hidden">
             {config?.owner_image ? (
                <img 
                  src={config.owner_image} 
                  alt="Profile" 
                  className="w-full h-full object-cover rounded-full"
                  loading="lazy"
                />
             ) : (
                <div className="w-full h-full bg-gray-200 dark:bg-gray-800 rounded-full flex items-center justify-center text-gray-500">
                  No Img
                </div>
             )}
          </div>
        </MotionDiv>

        {/* Identity */}
        <h1 className="text-5xl md:text-7xl font-black tracking-tighter mb-4 pb-2 bg-gradient-to-r from-neon-blue to-neon-purple bg-clip-text text-transparent drop-shadow-[0_0_15px_rgba(0,243,255,0.3)]">
          FENDER
        </h1>
        <div className="text-lg md:text-xl font-medium text-gray-600 dark:text-gray-300 mb-12 h-8">
          <TypingText text={subtitle} />
        </div>

        {/* Social Stats Cards */}
        <div className="w-full max-w-5xl grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 px-2">
          <StatCard 
            icon={Youtube} 
            count={config?.youtube_count} 
            url={config?.youtube_url} 
            label="YouTube"
            colorClass="from-red-500 to-red-700"
          />
          <StatCard 
            icon={TikTokIcon} 
            count={config?.tiktok_count} 
            url={config?.tiktok_url} 
            label="TikTok"
            colorClass="from-pink-500 to-cyan-500"
          />
          <StatCard 
            icon={Facebook} 
            count={config?.facebook_count} 
            url={config?.facebook_url} 
            label="Facebook"
            colorClass="from-blue-600 to-blue-800"
          />
          <StatCard 
            icon={Instagram} 
            count={config?.instagram_count} 
            url={config?.instagram_url} 
            label="Instagram"
            colorClass="from-purple-500 to-pink-500"
          />
        </div>
      </div>
    </section>
  );
};