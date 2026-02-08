import React, { createContext, useState, useEffect, useContext } from 'react';
import { HashRouter as Router, Routes, Route, Outlet } from 'react-router-dom';
import { AdminPanel } from './components/AdminPanel';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { AIEngine } from './components/AIEngine';
import { ContentVault } from './components/ContentVault';
import { LinksPage } from './components/LinksPage';
import { ArticlePage } from './components/ArticlePage';
import { AppContextType, AdminConfig, Theme, Language } from './types';
import { doc, onSnapshot, setDoc, getDoc, updateDoc, increment } from 'firebase/firestore';
import { db } from './firebase';

export const AppContext = createContext<AppContextType>({} as AppContextType);

// --- Page Components ---

const HomePage: React.FC = () => {
  return (
    <main className="flex-grow">
      <Hero />
      <div className="max-w-7xl mx-auto px-4 py-4">
         <div className="w-full h-24 bg-gray-200 dark:bg-gray-800 rounded-lg flex items-center justify-center text-gray-400 text-xs tracking-widest border border-dashed border-gray-300 dark:border-gray-700">
           AD SPACE
         </div>
      </div>
      <ContentVault />
    </main>
  );
};

const AIToolsPage: React.FC = () => {
  return (
    <main className="flex-grow pt-8">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-black text-white uppercase tracking-wider">
          AI PROMPT GENERATOR
        </h2>
      </div>
      <AIEngine />
    </main>
  );
};

// --- Layouts ---

const Footer: React.FC = () => {
   const { language, config } = useContext(AppContext);

   const ownerName = language === 'en' 
      ? (config?.owner_name_en || 'Owner: Ahmed Farag') 
      : (config?.owner_name_ar || 'المالك: أحمد فرج');
   
   const ownerEmail = config?.contact_email || 'ahmedtaktok917@gmail.com';

   return (
     <footer className="bg-white dark:bg-black border-t border-gray-200 dark:border-gray-800 py-12 mt-12">
        <div className="max-w-7xl mx-auto px-4 flex flex-col items-center text-center">
            
            {/* Owner Signature */}
            <div className="mb-8 group">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 transition-all duration-300 group-hover:text-neon-blue drop-shadow-[0_0_5px_rgba(0,243,255,0.1)] group-hover:drop-shadow-[0_0_10px_rgba(0,243,255,0.4)]">
                   {ownerName}
                </h3>
                <a 
                  href={`mailto:${ownerEmail}`}
                  className="font-mono text-sm text-gray-500 dark:text-gray-400 hover:text-neon-purple transition-colors tracking-wider block"
                >
                   {ownerEmail}
                </a>
            </div>

            <p className="text-gray-500 dark:text-gray-400 text-sm">
              © {new Date().getFullYear()} Fender AI. All Rights Reserved.
            </p>
        </div>
     </footer>
   );
};

const MainLayout: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen transition-colors duration-300">
      <Header />
      <Outlet />
      <Footer />
    </div>
  );
};

export default function App() {
  const [theme, setTheme] = useState<Theme>('dark');
  const [language, setLanguage] = useState<Language>('en');
  const [config, setConfig] = useState<AdminConfig | null>(null);

  // Initialize Theme
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  // Fetch Config & Auto-Create Database Structure
  useEffect(() => {
    const settingsRef = doc(db, 'admin_config', 'settings');
    const unsub = onSnapshot(settingsRef, (docSnapshot) => {
      if (docSnapshot.exists()) {
        setConfig(docSnapshot.data() as AdminConfig);
      } else {
        // --- AUTO-CREATE DATABASE STRUCTURE ---
        // If 'admin_config/settings' doesn't exist, create it with default ad slots.
        const defaultConfig: AdminConfig = {
          site_logo: '',
          owner_image: '',
          allowed_email: 'admin@fender.ai',
          password: 'password123',
          
          // Ad Slots (The Tables)
          ad_header: '',
          ad_mid: '',
          ad_bottom: '',
          ad_sidebar: '',
          
          // Ad Toggles
          show_header_ad: true,
          show_mid_ad: true,
          show_bottom_ad: true,
          show_sidebar_ad: true,

          // Owner Defaults
          owner_name_en: 'Ahmed Farag',
          owner_name_ar: 'أحمد فرج',
          contact_email: 'ahmedtaktok917@gmail.com'
        };
        
        // Use setDoc to create the document immediately
        setDoc(settingsRef, defaultConfig)
          .then(() => console.log("Database structure created: admin_config/settings"))
          .catch(err => console.error("Error creating database structure:", err));
      }
    });
    return () => unsub();
  }, []);

  // Track Visitors
  useEffect(() => {
    const trackVisitor = async () => {
       const statsRef = doc(db, 'stats', 'main');
       const snap = await getDoc(statsRef);
       if (!snap.exists()) {
          await setDoc(statsRef, { visitors: 1, linkClicks: 0, promptCopies: 0 });
       } else {
          await updateDoc(statsRef, { visitors: increment(1) });
       }
    };
    trackVisitor();
  }, []);

  const toggleTheme = () => setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  const toggleLanguage = () => setLanguage(prev => prev === 'en' ? 'ar' : 'en');

  // Context Value
  const contextValue: AppContextType = {
    theme,
    toggleTheme,
    language,
    toggleLanguage,
    config,
    setConfig,
    user: null, 
    isAuthenticated: false,
    login: () => {},
    logout: () => {}
  };

  return (
    <AppContext.Provider value={contextValue}>
      <div dir={language === 'ar' ? 'rtl' : 'ltr'}>
        <Router>
          <Routes>
            {/* Admin Route (No Header/Footer by default) */}
            <Route path="/admin" element={<AdminPanel />} />
            
            {/* Main App Routes (Wrapped in Layout) */}
            <Route element={<MainLayout />}>
              <Route path="/" element={<HomePage />} />
              <Route path="/links" element={<LinksPage />} />
              <Route path="/ai-tools" element={<AIToolsPage />} />
              <Route path="/article/:id" element={<ArticlePage />} />
            </Route>
          </Routes>
        </Router>
      </div>
    </AppContext.Provider>
  );
}