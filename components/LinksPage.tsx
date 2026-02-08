import React, { useEffect, useState, useContext } from 'react';
import { collection, onSnapshot, query } from 'firebase/firestore';
import { db } from '../firebase';
import { SocialLink } from '../types';
import { AppContext } from '../App';
import { motion } from 'framer-motion';
import { Globe, Youtube, Facebook, Twitter, Instagram, Linkedin, Github, ExternalLink, ArrowRight } from 'lucide-react';

const getIcon = (platform?: string) => {
  if (!platform) return <Globe className="w-6 h-6" />;
  switch (platform.toLowerCase()) {
    case 'youtube': return <Youtube className="w-6 h-6" />;
    case 'facebook': return <Facebook className="w-6 h-6" />;
    case 'twitter': return <Twitter className="w-6 h-6" />;
    case 'instagram': return <Instagram className="w-6 h-6" />;
    case 'linkedin': return <Linkedin className="w-6 h-6" />;
    case 'github': return <Github className="w-6 h-6" />;
    default: return <Globe className="w-6 h-6" />;
  }
};

export const LinksPage: React.FC = () => {
  const [links, setLinks] = useState<SocialLink[]>([]);
  const { language } = useContext(AppContext);

  useEffect(() => {
    const q = query(collection(db, 'links'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setLinks(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as SocialLink)));
    });
    return () => unsubscribe();
  }, []);
  
  const MotionA = motion.a as any;

  return (
    <div className="min-h-[60vh] py-16 px-4 max-w-2xl mx-auto w-full">
      <div className="text-center mb-10">
        <h2 className="text-3xl font-black text-gray-900 dark:text-white uppercase tracking-tighter mb-4">
          {language === 'en' ? 'Important Links' : 'روابط هامة'}
        </h2>
        <div className="w-24 h-1 bg-neon-blue mx-auto rounded-full"></div>
      </div>

      <div className="flex flex-col gap-4 w-full">
        {links.length === 0 ? (
          <div className="text-center text-gray-500 py-10">
            {language === 'en' ? 'No links found.' : 'لا توجد روابط حالياً.'}
          </div>
        ) : (
          links.map((link, index) => (
            <MotionA
              key={link.id}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              className="relative w-full flex items-center p-4 bg-white dark:bg-gray-900/80 backdrop-blur-sm border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm hover:shadow-lg hover:border-neon-blue/50 transition-all group overflow-hidden"
            >
              {/* Hover Glow Background */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-neon-blue/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              
              {/* Icon */}
              <div className="relative z-10 flex-shrink-0 p-3 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 group-hover:text-neon-blue group-hover:bg-black transition-colors">
                {getIcon(link.platform)}
              </div>
              
              {/* Text Content */}
              <div className="relative z-10 flex-1 ml-4 rtl:ml-0 rtl:mr-4 flex flex-col justify-center text-left rtl:text-right">
                <span className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-0.5">
                  {link.platform || 'Link'}
                </span>
                <span className="text-lg font-bold text-gray-900 dark:text-white group-hover:text-neon-blue transition-colors truncate">
                  {link.title || link.url.replace(/^https?:\/\//, '').replace(/\/$/, '')}
                </span>
              </div>
              
              {/* Arrow Icon */}
              <div className="relative z-10 flex-shrink-0 text-gray-300 dark:text-gray-700 group-hover:text-neon-blue transition-colors transform group-hover:translate-x-1 rtl:group-hover:-translate-x-1 duration-300">
                 {language === 'ar' ? <ArrowRight className="w-5 h-5 rotate-180" /> : <ArrowRight className="w-5 h-5" />}
              </div>
            </MotionA>
          ))
        )}
      </div>
    </div>
  );
};