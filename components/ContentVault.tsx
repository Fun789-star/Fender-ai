import React, { useEffect, useState, useContext } from 'react';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import { Article } from '../types';
import { motion } from 'framer-motion';
import { ArrowUpRight, Zap, Hash } from 'lucide-react';
import { AppContext } from '../App';
import { useNavigate } from 'react-router-dom';

// High-quality sample data to demonstrate layout immediately
export const SAMPLE_ARTICLES: Article[] = [
  {
    id: 'sample-1',
    title: 'The Future of Generative AI',
    imageUrl: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&q=80&w=800',
    description: 'Generative AI is rapidly evolving, moving beyond simple text prompts to complex multimodal interactions. As models like Gemini 1.5 Pro and GPT-4o emerge, the barrier between human creativity and machine execution blurs.\n\nIn this article, we explore how these advancements are reshaping digital art, coding, and even strategic decision-making. The future isn\'t just about "generating" content; it\'s about "collaborating" with intelligence.\n\nKey takeaways include:\n- The rise of long-context windows.\n- Multimodal reasoning capabilities.\n- The democratization of high-end creative tools.',
    category: 'AI Trends',
    article_prompt: 'A futuristic digital art studio with holographic displays floating in mid-air, a human artist collaborating with a glowing AI entity, cyberpunk aesthetic, neon blue and purple lighting, cinematic composition, 8k resolution, unreal engine 5 render.',
    createdAt: Date.now()
  },
  {
    id: 'sample-2',
    title: 'Prompt Engineering 101',
    imageUrl: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&q=80&w=800',
    description: 'Prompt engineering is the new coding. It requires a mix of logic, creativity, and linguistic precision. To get the best out of LLMs, one must understand the nuances of context, persona, and constraints.\n\nThis guide covers the "Chain of Thought" prompting technique, few-shot learning, and how to structure your requests for maximum fidelity. Whether you are generating code or writing a novel, the quality of your output depends entirely on the quality of your input.',
    category: 'Tutorials',
    article_prompt: 'A close-up macro shot of a glowing fiber optic cable connecting to a human brain synapse, representing the connection between human language and machine logic, blue and gold color palette, depth of field, high detail.',
    createdAt: Date.now() - 100000
  },
  {
    id: 'sample-3',
    title: 'Cyberpunk Aesthetics',
    imageUrl: 'https://images.unsplash.com/photo-1535378437327-1e649afc20f1?auto=format&fit=crop&q=80&w=800',
    description: 'Neon lights, rain-slicked streets, and high-tech low-life. Cyberpunk is more than just a visual style; it is a commentary on the convergence of technology and society.\n\nFrom "Blade Runner" to modern UI design, the cyberpunk aesthetic influences color palettes (cyan/magenta), typography (glitch/mono), and layout (grid-breaking). Learn how to incorporate these elements into your web projects without sacrificing usability.',
    category: 'Design',
    article_prompt: 'A rainy futuristic Tokyo street at night, neon signs reflecting on wet pavement, a cyborg figure in a trench coat walking away from camera, blade runner style, atmospheric lighting, volumetric fog, cinematic.',
    createdAt: Date.now() - 200000
  }
];

const ArticleCard: React.FC<{ article: Article }> = ({ article }) => {
  const { language } = useContext(AppContext);
  const navigate = useNavigate();
  const MotionDiv = motion.div as any;

  return (
    <MotionDiv 
      layout
      onClick={() => navigate(`/article/${article.id}`)}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -8, scale: 1.01 }}
      className="group relative flex flex-col h-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden shadow-lg transition-all duration-300 hover:shadow-[0_0_20px_rgba(0,243,255,0.15)] dark:hover:border-neon-blue/40 cursor-pointer"
    >
      {/* Category Badge - Absolute Positioning */}
      <div className="absolute top-4 left-4 z-20">
        <span className="px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-black bg-neon-blue rounded-full shadow-[0_0_10px_rgba(0,243,255,0.5)]">
          {article.category || 'Article'}
        </span>
      </div>

      {/* Image Container */}
      <div className="relative aspect-video overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent z-10 opacity-60 group-hover:opacity-40 transition-opacity" />
        <img 
          src={article.imageUrl} 
          alt={article.title} 
          className="object-cover w-full h-full transform group-hover:scale-110 transition-transform duration-700 ease-out"
          loading="lazy"
        />
      </div>
      
      {/* Content */}
      <div className="flex flex-col flex-grow p-5 relative z-10">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 leading-tight group-hover:text-neon-blue transition-colors line-clamp-2">
          {article.title}
        </h3>
        
        <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3 mb-6 leading-relaxed flex-grow">
          {article.description}
        </p>
        
        {/* Footer / Action */}
        <div className="pt-4 mt-auto border-t border-gray-100 dark:border-gray-800 flex items-center justify-between text-xs font-bold uppercase tracking-widest">
          <div className="flex items-center text-gray-400 group-hover:text-white transition-colors">
             <Hash className="w-3 h-3 mr-1" />
             {language === 'en' ? 'Read More' : 'اقرأ المزيد'}
          </div>
          <div className="bg-gray-100 dark:bg-gray-800 p-2 rounded-full text-gray-400 group-hover:bg-neon-blue group-hover:text-black transition-all duration-300 transform group-hover:-rotate-45">
            <ArrowUpRight className="w-4 h-4" />
          </div>
        </div>
      </div>
    </MotionDiv>
  );
};

export const ContentVault: React.FC = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const { language } = useContext(AppContext);

  useEffect(() => {
    const q = query(collection(db, 'articles'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      // If DB is empty, use sample data to demonstrate UI
      if (snapshot.empty) {
        setArticles(SAMPLE_ARTICLES);
      } else {
        setArticles(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Article)));
      }
    });
    return () => unsubscribe();
  }, []);

  return (
    <section id="articles" className="py-16 px-4 max-w-7xl mx-auto">
       <div className="text-center mb-16">
        <h2 className="text-4xl font-black text-gray-900 dark:text-white uppercase tracking-tighter mb-4 flex items-center justify-center gap-3">
          <Zap className="w-8 h-8 text-neon-blue hidden md:block" fill="currentColor" />
          {language === 'en' ? 'Articles' : 'المقالات'}
          <Zap className="w-8 h-8 text-neon-purple hidden md:block" fill="currentColor" />
        </h2>
        <div className="w-32 h-1 bg-gradient-to-r from-neon-blue to-neon-purple mx-auto rounded-full"></div>
      </div>
       
       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
         {articles.map((article) => (
           <ArticleCard key={article.id} article={article} />
         ))}
       </div>
    </section>
  );
};