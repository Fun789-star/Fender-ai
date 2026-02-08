import React, { useContext, useState, useEffect } from 'react';
import { AppContext } from '../App';
import { Moon, Sun, Globe, Menu, X } from 'lucide-react';
import { NotificationBell } from './NotificationBell';
import { MagneticButton } from './MagneticButton';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';

export const Header: React.FC = () => {
  const { theme, toggleTheme, language, toggleLanguage, config } = useContext(AppContext);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('home');
  const navigate = useNavigate();
  const location = useLocation();

  // Scroll Spy to determine active section on Homepage
  useEffect(() => {
    const handleScroll = () => {
      if (location.pathname !== '/') {
        setActiveSection('');
        return;
      }

      const articlesSection = document.getElementById('articles');
      if (articlesSection) {
        const rect = articlesSection.getBoundingClientRect();
        // Check if articles section is roughly in view (near top or taking up screen)
        const inView = rect.top <= 150 && rect.bottom >= 150;
        
        if (inView) {
          setActiveSection('articles');
        } else if (window.scrollY < 100) {
          setActiveSection('home');
        }
      }
    };

    // Attach listener
    window.addEventListener('scroll', handleScroll);
    // Initial check
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, [location.pathname]);

  const navItems = [
    { id: 'home', labelEn: 'Home', labelAr: 'الرئيسية', path: '/', isSection: false },
    { id: 'articles', labelEn: 'Articles', labelAr: 'المقالات', path: '/#articles', isSection: true },
    { id: 'links', labelEn: 'Links', labelAr: 'الروابط', path: '/links', isSection: false },
    { id: 'ai-generator', labelEn: 'AI Generator', labelAr: 'توليد البرومبتات', path: '/ai-tools', isSection: false },
  ];
  
  const MotionDiv = motion.div as any;

  const scrollToElement = (elementId: string) => {
    const element = document.getElementById(elementId);
    if (element) {
      const offset = 80; // Height of fixed header
      const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
      const offsetPosition = elementPosition - offset;
      window.scrollTo({ top: offsetPosition, behavior: "smooth" });
    }
  };

  const handleNavClick = (item: typeof navItems[0]) => {
    setIsMobileMenuOpen(false);

    if (item.isSection && item.id === 'articles') {
      if (location.pathname !== '/') {
        navigate('/');
        // Small delay to ensure page render before scrolling
        setTimeout(() => scrollToElement('articles'), 300);
      } else {
        scrollToElement('articles');
      }
    } else {
      navigate(item.path);
      window.scrollTo(0, 0);
    }
  };

  const isItemActive = (item: typeof navItems[0]) => {
    if (item.isSection && item.id === 'articles') {
      return activeSection === 'articles';
    }
    if (item.path === '/' && !item.isSection) {
      return location.pathname === '/' && activeSection === 'home';
    }
    return location.pathname === item.path;
  };

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-white/70 dark:bg-black/50 border-b border-gray-200 dark:border-neon-blue/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Identity: Logo + Name */}
          <div 
            className="flex-shrink-0 flex items-center gap-3 group cursor-pointer"
            onClick={() => handleNavClick(navItems[0])}
          >
            <div className="h-10 w-10 aspect-square rounded-full overflow-hidden border border-gray-200 dark:border-gray-700 shadow-sm relative transition-transform duration-300 group-hover:scale-105">
              {config?.site_logo ? (
                <img className="h-full w-full object-cover" src={config.site_logo} alt="Fender AI" />
              ) : (
                <div className="h-full w-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                  <span className="text-xs font-bold font-mono text-neon-blue">AI</span>
                </div>
              )}
            </div>
            <span className="text-2xl font-black font-sans tracking-tighter bg-gradient-to-r from-neon-blue to-neon-purple bg-clip-text text-transparent drop-shadow-[0_0_5px_rgba(0,243,255,0.4)] transition-all duration-300 transform group-hover:scale-105 group-hover:drop-shadow-[0_0_10px_rgba(188,19,254,0.6)]">
              Fender AI
            </span>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8 rtl:space-x-reverse mx-6">
            {navItems.map((item) => {
              const active = isItemActive(item);
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item)}
                  className={`relative group text-sm font-bold transition-colors py-1 ${
                    active 
                    ? 'text-black dark:text-white' 
                    : 'text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white'
                  }`}
                >
                  {language === 'en' ? item.labelEn : item.labelAr}
                  <span className={`absolute -bottom-1 left-0 h-0.5 bg-neon-blue transition-all duration-300 ${
                    active ? 'w-full shadow-[0_0_8px_#00f3ff]' : 'w-0 group-hover:w-full'
                  }`}></span>
                </button>
              );
            })}
          </nav>

          {/* Tools */}
          <div className="flex items-center space-x-3 rtl:space-x-reverse">
            <MagneticButton className="hidden sm:block">
              <button 
                onClick={toggleLanguage}
                className="p-2 text-gray-600 dark:text-gray-300 hover:text-neon-blue transition-colors flex items-center gap-2"
              >
                <Globe className="w-5 h-5" />
                <span className="text-xs font-bold uppercase">{language === 'en' ? 'AR' : 'EN'}</span>
              </button>
            </MagneticButton>

            <MagneticButton className="hidden sm:block">
              <button 
                onClick={toggleTheme}
                className="p-2 text-gray-600 dark:text-gray-300 hover:text-neon-blue transition-colors"
              >
                {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
            </MagneticButton>
            
            <NotificationBell />

            {/* Mobile Menu Toggle */}
            <button 
              className="md:hidden p-2 text-gray-600 dark:text-gray-300 hover:text-neon-blue transition-colors"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <MotionDiv
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden overflow-hidden bg-white/95 dark:bg-black/95 backdrop-blur-xl border-t border-gray-200 dark:border-gray-800"
          >
            <div className="px-4 py-4 space-y-4">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item)}
                  className={`block w-full text-left text-lg font-bold py-2 border-b border-gray-100 dark:border-gray-800/50 last:border-0 ${
                    isItemActive(item) 
                    ? 'text-neon-blue' 
                    : 'text-gray-800 dark:text-gray-200 hover:text-neon-blue dark:hover:text-neon-blue'
                  }`}
                >
                  {language === 'en' ? item.labelEn : item.labelAr}
                </button>
              ))}
              
              <div className="flex items-center justify-between pt-4 mt-2 border-t border-gray-200 dark:border-gray-800">
                <button 
                  onClick={toggleLanguage}
                  className="flex items-center gap-2 text-sm font-bold text-gray-600 dark:text-gray-400"
                >
                  <Globe className="w-4 h-4" />
                  {language === 'en' ? 'Switch to Arabic' : 'تغيير للإنجليزية'}
                </button>
                <button 
                  onClick={toggleTheme}
                  className="flex items-center gap-2 text-sm font-bold text-gray-600 dark:text-gray-400"
                >
                  {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                  {language === 'en' ? (theme === 'dark' ? 'Light Mode' : 'Dark Mode') : (theme === 'dark' ? 'الوضع المضيء' : 'الوضع المظلم')}
                </button>
              </div>
            </div>
          </MotionDiv>
        )}
      </AnimatePresence>
    </header>
  );
};