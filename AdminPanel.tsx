import React, { useState, useContext, useEffect } from 'react';
import { AppContext } from '../App';
import { motion, AnimatePresence } from 'framer-motion';
import { doc, updateDoc, collection, addDoc, deleteDoc, query, onSnapshot, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { AdminConfig, Article, SocialLink, Stats } from '../types';
import { Lock, Settings, FileText, Share2, BarChart, Plus, Trash2, Send, Youtube, Facebook, Instagram, Video, Image as ImageIcon, Tag, AlignLeft, Sparkles, DollarSign, ToggleLeft, ToggleRight, User, Mail, Code, Pencil, X, Menu, LogOut } from 'lucide-react';

// --- Login Component ---
const LoginStep: React.FC<{ onLogin: () => void }> = ({ onLogin }) => {
  const { config } = useContext(AppContext);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [step, setStep] = useState(1);
  const [error, setError] = useState('');
  
  const MotionDiv = motion.div as any;

  const handleEmailCheck = () => {
    if (config?.allowed_email && email === config.allowed_email) {
      setStep(2);
      setError('');
    } else {
      setError('Access Denied: Identity not recognized.');
    }
  };

  const handlePasswordCheck = () => {
    // In a real app, never store passwords in plain text.
    if (config?.password && password === config.password) {
      onLogin();
    } else {
      setError('Access Denied: Incorrect credentials.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 px-4">
      <MotionDiv 
        layout
        className="w-full max-w-md bg-black border border-gray-800 p-8 rounded-2xl shadow-2xl"
      >
        <div className="text-center mb-8">
          <Lock className="w-12 h-12 text-neon-blue mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white">System Access</h2>
        </div>

        {step === 1 ? (
          <MotionDiv initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Identity Check (Email)"
              className="w-full bg-gray-900 border border-gray-700 text-white rounded-lg p-3 mb-4 focus:border-neon-blue focus:outline-none"
            />
            <button
              onClick={handleEmailCheck}
              className="w-full bg-neon-blue text-black font-bold py-3 rounded-lg hover:bg-white transition-colors"
            >
              Verify Identity
            </button>
          </MotionDiv>
        ) : (
          <MotionDiv initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Security Key"
              className="w-full bg-gray-900 border border-gray-700 text-white rounded-lg p-3 mb-4 focus:border-neon-blue focus:outline-none"
            />
            <button
              onClick={handlePasswordCheck}
              className="w-full bg-neon-blue text-black font-bold py-3 rounded-lg hover:bg-white transition-colors"
            >
              Unlock Console
            </button>
          </MotionDiv>
        )}
        
        {error && <p className="text-red-500 text-sm mt-4 text-center">{error}</p>}
      </MotionDiv>
    </div>
  );
};

// --- Dashboard Sub-Components ---

const IdentitySuite: React.FC = () => {
  const { config } = useContext(AppContext);
  const [formData, setFormData] = useState<AdminConfig>(config || {} as AdminConfig);
  const [msg, setMsg] = useState('');

  // Sync config when it loads
  useEffect(() => {
    if (config) {
      setFormData(config);
    }
  }, [config]);

  const handleSave = async () => {
    try {
      // Use setDoc with merge to ensure creation/update
      await setDoc(doc(db, 'admin_config', 'settings'), { ...formData }, { merge: true });
      setMsg('Settings updated live.');
      setTimeout(() => setMsg(''), 3000);
    } catch (e) {
      setMsg('Error saving settings.');
    }
  };

  const SocialInputGroup = ({ label, icon: Icon, countKey, urlKey }: { label: string, icon: any, countKey: keyof AdminConfig, urlKey: keyof AdminConfig }) => (
    <div className="bg-gray-900 p-3 rounded-lg border border-gray-700">
      <div className="flex items-center gap-2 mb-2 text-gray-400 text-xs font-bold uppercase">
        <Icon className="w-4 h-4" /> {label}
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div>
           <label className="block text-[10px] text-gray-500 mb-1">Count</label>
           <input 
             value={String(formData[countKey] || '')} 
             onChange={(e) => setFormData({...formData, [countKey]: e.target.value})} 
             className="w-full bg-gray-800 border border-gray-600 rounded p-1 text-white text-sm" 
           />
        </div>
        <div>
           <label className="block text-[10px] text-gray-500 mb-1">URL</label>
           <input 
             value={String(formData[urlKey] || '')} 
             onChange={(e) => setFormData({...formData, [urlKey]: e.target.value})} 
             className="w-full bg-gray-800 border border-gray-600 rounded p-1 text-white text-sm" 
           />
        </div>
      </div>
    </div>
  );

  return (
    <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
      <h3 className="text-lg font-bold text-white mb-4 flex items-center"><Settings className="mr-2" /> Identity & Suite</h3>
      <div className="space-y-4">
        <div>
           <label className="block text-xs text-gray-400 uppercase">Site Logo URL</label>
           <input type="text" value={formData.site_logo || ''} onChange={(e) => setFormData({...formData, site_logo: e.target.value})} className="w-full bg-gray-900 border border-gray-600 rounded p-2 text-white text-sm" />
        </div>
        <div>
           <label className="block text-xs text-gray-400 uppercase">Owner Image URL</label>
           <input type="text" value={formData.owner_image || ''} onChange={(e) => setFormData({...formData, owner_image: e.target.value})} className="w-full bg-gray-900 border border-gray-600 rounded p-2 text-white text-sm" />
        </div>

        {/* Owner Info Fields */}
        <div className="bg-gray-900 p-3 rounded-lg border border-gray-700 space-y-2">
            <h4 className="text-xs text-gray-400 uppercase font-bold flex items-center"><User className="w-3 h-3 mr-1" /> Owner Signature</h4>
            <div className="grid grid-cols-2 gap-2">
                <input placeholder="Name (EN)" value={formData.owner_name_en || ''} onChange={(e) => setFormData({...formData, owner_name_en: e.target.value})} className="w-full bg-gray-800 border border-gray-600 rounded p-1 text-white text-sm" />
                <input placeholder="Name (AR)" value={formData.owner_name_ar || ''} onChange={(e) => setFormData({...formData, owner_name_ar: e.target.value})} className="w-full bg-gray-800 border border-gray-600 rounded p-1 text-white text-sm text-right" />
            </div>
            <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-gray-500" />
                <input placeholder="Contact Email" value={formData.contact_email || ''} onChange={(e) => setFormData({...formData, contact_email: e.target.value})} className="w-full bg-gray-800 border border-gray-600 rounded p-1 text-white text-sm" />
            </div>
        </div>

        <div className="pt-4 border-t border-gray-700">
          <h4 className="text-sm font-bold text-white mb-3">Social Counters</h4>
          <div className="space-y-2">
            <SocialInputGroup label="YouTube" icon={Youtube} countKey="youtube_count" urlKey="youtube_url" />
            <SocialInputGroup label="TikTok" icon={Video} countKey="tiktok_count" urlKey="tiktok_url" />
            <SocialInputGroup label="Facebook" icon={Facebook} countKey="facebook_count" urlKey="facebook_url" />
            <SocialInputGroup label="Instagram" icon={Instagram} countKey="instagram_count" urlKey="instagram_url" />
          </div>
        </div>

        <button onClick={handleSave} className="bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded text-sm font-bold w-full mt-2">Live Save</button>
        {msg && <p className="text-xs text-neon-blue text-center">{msg}</p>}
      </div>
    </div>
  );
};

const MonetizationHub: React.FC = () => {
  const { config } = useContext(AppContext);
  const [formData, setFormData] = useState<AdminConfig>(config || {} as AdminConfig);
  const [msg, setMsg] = useState('');

  // Sync config when it loads
  useEffect(() => {
    if (config) {
      setFormData(config);
    }
  }, [config]);

  const handleSave = async () => {
    try {
      // FORCE PERSISTENCE: Use setDoc with merge: true to create if missing and update if exists
      await setDoc(doc(db, 'admin_config', 'settings'), { ...formData }, { merge: true });
      setMsg('Monetization settings persisted to Database.');
      setTimeout(() => setMsg(''), 3000);
    } catch (e) {
      console.error(e);
      setMsg('Error saving settings to Firestore.');
    }
  };

  const toggle = (key: keyof AdminConfig) => {
    setFormData(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const AdSlotConfig = ({ label, toggleKey, scriptKey }: { label: string, toggleKey: keyof AdminConfig, scriptKey: keyof AdminConfig }) => (
    <div className="bg-gray-900 p-3 rounded-lg border border-gray-700 mb-3">
        <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-300 font-bold flex items-center gap-2">
                <Code className="w-4 h-4 text-neon-blue" />
                {label}
            </span>
            <button onClick={() => toggle(toggleKey)} className={`transition-colors ${formData[toggleKey] ? 'text-neon-blue' : 'text-gray-600'}`}>
                {formData[toggleKey] ? <ToggleRight className="w-8 h-8" /> : <ToggleLeft className="w-8 h-8" />}
            </button>
        </div>
        {formData[toggleKey] && (
            <textarea
                value={String(formData[scriptKey] || '')}
                onChange={(e) => setFormData({ ...formData, [scriptKey]: e.target.value })}
                placeholder={`Paste your HTML/JS code for ${label} here...`}
                className="w-full bg-black/50 border border-gray-800 rounded p-2 text-xs text-green-400 font-mono h-24 focus:border-neon-blue focus:outline-none resize-y"
            />
        )}
    </div>
  );

  return (
    <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
      <h3 className="text-lg font-bold text-white mb-4 flex items-center"><DollarSign className="mr-2" /> Monetization Hub</h3>
      <div className="space-y-1">
         <AdSlotConfig label="Header Banner (Slot 1)" toggleKey="show_header_ad" scriptKey="ad_header" />
         <AdSlotConfig label="Mid-Content Banner (Slot 2)" toggleKey="show_mid_ad" scriptKey="ad_mid" />
         <AdSlotConfig label="Post-Prompt Banner (Slot 3)" toggleKey="show_bottom_ad" scriptKey="ad_bottom" />
         <AdSlotConfig label="Sidebar Ad (AI Page)" toggleKey="show_sidebar_ad" scriptKey="ad_sidebar" />
         
         <button onClick={handleSave} className="bg-neon-purple hover:bg-purple-600 text-white px-4 py-2 rounded text-sm font-bold w-full mt-4">Save Configuration</button>
         {msg && <p className="text-xs text-neon-blue text-center mt-2">{msg}</p>}
      </div>
    </div>
  );
};

const ContentWorkshop: React.FC = () => {
  const [newArticle, setNewArticle] = useState<Partial<Article>>({ title: '', description: '', imageUrl: '', category: '', article_prompt: '' });
  const [articles, setArticles] = useState<Article[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    const q = query(collection(db, 'articles'));
    const unsub = onSnapshot(q, (s) => setArticles(s.docs.map(d => ({id: d.id, ...d.data()} as Article))));
    return () => unsub();
  }, []);

  const handleSave = async () => {
    if(!newArticle.title) return;
    
    if (editingId) {
      await updateDoc(doc(db, 'articles', editingId), { ...newArticle });
      setEditingId(null);
    } else {
      await addDoc(collection(db, 'articles'), { ...newArticle, createdAt: Date.now() });
    }
    setNewArticle({ title: '', description: '', imageUrl: '', category: '', article_prompt: '' });
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Delete this article?')) {
      await deleteDoc(doc(db, 'articles', id));
    }
  };

  const handleEdit = (article: Article) => {
    setNewArticle({
      title: article.title,
      description: article.description,
      imageUrl: article.imageUrl,
      category: article.category,
      article_prompt: article.article_prompt
    });
    setEditingId(article.id);
  };

  const cancelEdit = () => {
    setNewArticle({ title: '', description: '', imageUrl: '', category: '', article_prompt: '' });
    setEditingId(null);
  };

  return (
    <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
      <h3 className="text-lg font-bold text-white mb-4 flex items-center"><FileText className="mr-2" /> Content Workshop</h3>
      
      {/* Add/Edit Form */}
      <div className="mb-6 bg-gray-900 p-4 rounded-lg space-y-3">
        <div className="flex justify-between items-center mb-2">
            <h4 className="text-xs text-gray-400 uppercase font-bold tracking-wider">
                {editingId ? 'Edit Article' : 'Add New Article'}
            </h4>
            {editingId && (
                <button onClick={cancelEdit} className="text-xs text-red-400 hover:text-red-300 flex items-center">
                    <X className="w-3 h-3 mr-1" /> Cancel Edit
                </button>
            )}
        </div>
        
        {/* Title */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FileText className="h-4 w-4 text-gray-500" />
          </div>
          <input 
            placeholder="Article Title (عنوان المقال)" 
            value={newArticle.title} 
            onChange={e=>setNewArticle({...newArticle, title:e.target.value})} 
            className="w-full bg-gray-800 border border-gray-700 rounded-lg text-white text-sm py-2 pl-10 focus:border-neon-blue focus:outline-none transition-colors"
          />
        </div>

        {/* Category & Image Row */}
        <div className="flex gap-2">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Tag className="h-4 w-4 text-gray-500" />
              </div>
              <input 
                placeholder="Category (التصنيف)" 
                value={newArticle.category} 
                onChange={e=>setNewArticle({...newArticle, category:e.target.value})} 
                className="w-full bg-gray-800 border border-gray-700 rounded-lg text-white text-sm py-2 pl-10 focus:border-neon-blue focus:outline-none transition-colors"
              />
            </div>
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <ImageIcon className="h-4 w-4 text-gray-500" />
              </div>
              <input 
                placeholder="Image URL" 
                value={newArticle.imageUrl} 
                onChange={e=>setNewArticle({...newArticle, imageUrl:e.target.value})} 
                className="w-full bg-gray-800 border border-gray-700 rounded-lg text-white text-sm py-2 pl-10 focus:border-neon-blue focus:outline-none transition-colors"
              />
            </div>
        </div>
        
        {newArticle.imageUrl && <img src={newArticle.imageUrl} className="h-24 w-full object-cover rounded-lg border border-gray-700" alt="Preview"/>}
        
        {/* Description */}
        <div className="relative">
          <div className="absolute top-3 left-3 pointer-events-none">
            <AlignLeft className="h-4 w-4 text-gray-500" />
          </div>
          <textarea 
            placeholder="Short Description (وصف قصير)" 
            value={newArticle.description} 
            onChange={e=>setNewArticle({...newArticle, description:e.target.value})} 
            className="w-full bg-gray-800 border border-gray-700 rounded-lg text-white text-sm py-2 pl-10 h-24 focus:border-neon-blue focus:outline-none transition-colors resize-none"
          />
        </div>
        
        {/* Article Prompt */}
        <div className="relative">
          <div className="absolute top-3 left-3 pointer-events-none">
            <Sparkles className="h-4 w-4 text-neon-purple" />
          </div>
          <textarea 
            placeholder="Article Prompt (for copy feature) - البرومبت الخاص بالمقال" 
            value={newArticle.article_prompt || ''} 
            onChange={e=>setNewArticle({...newArticle, article_prompt:e.target.value})} 
            className="w-full bg-gray-800 border border-gray-700 rounded-lg text-white text-sm py-2 pl-10 h-20 focus:border-neon-purple focus:outline-none transition-colors resize-none font-mono"
          />
        </div>

        <button 
          onClick={handleSave} 
          className={`w-full text-black py-2 rounded-lg text-sm font-bold uppercase tracking-wider flex items-center justify-center transition-all shadow-[0_0_10px_rgba(0,243,255,0.3)] hover:shadow-[0_0_20px_rgba(0,243,255,0.5)] ${editingId ? 'bg-yellow-400 hover:bg-yellow-300' : 'bg-neon-blue hover:bg-white'}`}
        >
          {editingId ? <Pencil className="w-4 h-4 mr-2"/> : <Plus className="w-4 h-4 mr-2"/>} 
          {editingId ? 'Update Article' : 'Publish Article'}
        </button>
      </div>

      {/* List */}
      <div className="space-y-2">
        <h4 className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-2">Existing Articles</h4>
        <div className="max-h-60 overflow-y-auto pr-2 space-y-2 custom-scrollbar">
          {articles.length === 0 ? (
            <p className="text-xs text-gray-600 italic">No articles yet.</p>
          ) : (
            articles.map(art => (
              <div key={art.id} className={`flex justify-between items-center bg-gray-900 border p-3 rounded-lg transition-colors ${editingId === art.id ? 'border-neon-blue bg-gray-800' : 'border-gray-800 hover:border-gray-700'}`}>
                 <div className="flex flex-col overflow-hidden">
                    <span className="text-white text-sm font-bold truncate">{art.title}</span>
                    <span className="text-gray-500 text-[10px] uppercase tracking-wide">{art.category}</span>
                 </div>
                 <div className="flex items-center gap-2">
                    <button onClick={() => handleEdit(art)} className="p-2 hover:bg-blue-500/20 rounded-full group transition-colors">
                        <Pencil className="w-4 h-4 text-gray-500 group-hover:text-blue-400" />
                    </button>
                    <button onClick={() => handleDelete(art.id)} className="p-2 hover:bg-red-500/20 rounded-full group transition-colors">
                        <Trash2 className="w-4 h-4 text-gray-500 group-hover:text-red-500" />
                    </button>
                 </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

const BroadcastCenter: React.FC = () => {
  const [msg, setMsg] = useState('');

  const send = async () => {
    if(!msg) return;
    await addDoc(collection(db, 'notifications'), { message: msg, timestamp: Date.now(), read: false });
    setMsg('');
  };

  return (
    <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
      <h3 className="text-lg font-bold text-white mb-4 flex items-center"><Share2 className="mr-2" /> Broadcast Center</h3>
      <div className="flex space-x-2">
        <input value={msg} onChange={e=>setMsg(e.target.value)} placeholder="Global notification..." className="flex-1 bg-gray-900 border-none rounded text-white p-2 text-sm" />
        <button onClick={send} className="bg-neon-purple text-white p-2 rounded"><Send className="w-4 h-4"/></button>
      </div>
    </div>
  );
};

const StatsMatrix: React.FC = () => {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'stats', 'main'), (d) => setStats(d.data() as Stats));
    return () => unsub();
  }, []);

  return (
    <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
      <h3 className="text-lg font-bold text-white mb-4 flex items-center"><BarChart className="mr-2" /> Stats Matrix</h3>
      <div className="grid grid-cols-3 gap-2 text-center">
        <div className="bg-gray-900 p-2 rounded">
           <div className="text-xs text-gray-500">Visitors</div>
           <div className="text-xl font-mono text-neon-blue">{stats?.visitors || 0}</div>
        </div>
        <div className="bg-gray-900 p-2 rounded">
           <div className="text-xs text-gray-500">Links</div>
           <div className="text-xl font-mono text-green-400">{stats?.linkClicks || 0}</div>
        </div>
        <div className="bg-gray-900 p-2 rounded">
           <div className="text-xs text-gray-500">Copies</div>
           <div className="text-xl font-mono text-purple-400">{stats?.promptCopies || 0}</div>
        </div>
      </div>
    </div>
  );
};

export const AdminPanel: React.FC = () => {
  const [authenticated, setAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'content' | 'monetization' | 'settings'>('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { language, toggleLanguage } = useContext(AppContext);

  if (!authenticated) {
    return <LoginStep onLogin={() => setAuthenticated(true)} />;
  }

  const t = {
    en: {
      dashboard: 'Dashboard',
      content: 'Content',
      monetization: 'Monetization',
      settings: 'Settings',
      logout: 'Logout',
      adminConsole: 'ADMIN CONSOLE',
      console: 'Console',
      dashboardOverview: 'Dashboard Overview',
      contentManagement: 'Content Management',
      contentDesc: 'Create, edit, and manage your articles.',
      monetizationAds: 'Monetization & Ads',
      monetizationDesc: 'Manage ad slots and scripts.',
      systemSettings: 'System Settings',
      settingsDesc: 'Configure identity and social links.',
    },
    ar: {
      dashboard: 'لوحة التحكم',
      content: 'المحتوى',
      monetization: 'تحقيق الدخل',
      settings: 'الإعدادات',
      logout: 'تسجيل الخروج',
      adminConsole: 'لوحة الإدارة',
      console: 'تحكم',
      dashboardOverview: 'نظرة عامة',
      contentManagement: 'إدارة المحتوى',
      contentDesc: 'إنشاء وتعديل وإدارة المقالات.',
      monetizationAds: 'الإعلانات والدخل',
      monetizationDesc: 'إدارة مساحات الإعلانات والسكربتات.',
      systemSettings: 'إعدادات النظام',
      settingsDesc: 'تكوين الهوية وروابط التواصل.',
    }
  };

  const txt = language === 'en' ? t.en : t.ar;

  const tabs = [
    { id: 'dashboard', label: txt.dashboard, icon: BarChart },
    { id: 'content', label: txt.content, icon: FileText },
    { id: 'monetization', label: txt.monetization, icon: DollarSign },
    { id: 'settings', label: txt.settings, icon: Settings },
  ];

  return (
    <div className="flex h-screen bg-gray-900 text-white font-sans selection:bg-neon-blue selection:text-black overflow-hidden" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      
      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 w-full z-50 bg-black/90 backdrop-blur border-b border-gray-800 p-4 flex justify-between items-center">
         <div className="flex items-center gap-2">
            <div className="bg-neon-blue/10 p-1.5 rounded">
              <Lock className="w-4 h-4 text-neon-blue" />
            </div>
            <span className="font-bold tracking-tight">{txt.adminConsole}</span>
         </div>
         <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="text-gray-400 hover:text-white">
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
         </button>
      </div>

      {/* Sidebar (Desktop + Mobile Drawer) */}
      <div className={`
        fixed inset-y-0 ${language === 'ar' ? 'right-0 border-l' : 'left-0 border-r'} z-40 w-64 bg-black border-gray-800 transform transition-transform duration-300 ease-in-out
        md:relative md:translate-x-0
        ${mobileMenuOpen ? 'translate-x-0' : (language === 'ar' ? 'translate-x-full' : '-translate-x-full')}
        flex flex-col
      `}>
         <div className="p-6 border-b border-gray-800 flex items-center gap-3">
            <div className="bg-neon-blue/10 p-2 rounded-lg shadow-[0_0_10px_rgba(0,243,255,0.2)]">
              <Lock className="w-6 h-6 text-neon-blue" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight leading-none text-white">ADMIN</h1>
              <span className="text-[10px] text-neon-blue tracking-[0.2em] uppercase font-bold">{txt.console}</span>
            </div>
         </div>

         <nav className="flex-1 p-4 space-y-2 overflow-y-auto custom-scrollbar">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => { setActiveTab(tab.id as any); setMobileMenuOpen(false); }}
                  className={`
                    w-full flex items-center gap-3 px-4 py-3 text-sm font-bold rounded-xl transition-all duration-200 group
                    ${isActive 
                      ? 'bg-neon-blue text-black shadow-[0_0_15px_rgba(0,243,255,0.4)]' 
                      : 'text-gray-400 hover:bg-gray-800 hover:text-white'}
                  `}
                >
                  <Icon className={`w-5 h-5 ${isActive ? 'text-black' : 'text-gray-500 group-hover:text-white'}`} />
                  {tab.label}
                </button>
              );
            })}
         </nav>

         <div className="p-4 border-t border-gray-800 space-y-2">
            <button 
              onClick={toggleLanguage}
              className="w-full flex items-center justify-between px-4 py-3 text-sm font-bold text-gray-400 hover:bg-gray-800 hover:text-white rounded-xl transition-colors border border-gray-800"
            >
              <span className="flex items-center gap-2">
                <span className="text-xs bg-gray-700 px-1.5 rounded text-white">{language.toUpperCase()}</span>
                {language === 'en' ? 'Language' : 'اللغة'}
              </span>
              <span className="text-xs text-neon-blue">{language === 'en' ? 'AR' : 'EN'}</span>
            </button>

            <button 
              onClick={() => setAuthenticated(false)} 
              className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-red-400 hover:bg-red-500/10 hover:text-red-300 rounded-xl transition-colors"
            >
              <LogOut className="w-5 h-5" />
              {txt.logout}
            </button>
         </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto relative pt-20 md:pt-0 bg-gray-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: language === 'ar' ? -20 : 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: language === 'ar' ? 20 : -20 }}
              transition={{ duration: 0.2 }}
            >
              {activeTab === 'dashboard' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-white">{txt.dashboardOverview}</h2>
                    <span className="text-xs text-gray-500 font-mono">{new Date().toLocaleDateString()}</span>
                  </div>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <StatsMatrix />
                    <BroadcastCenter />
                  </div>
                </div>
              )}

              {activeTab === 'content' && (
                <div className="max-w-5xl mx-auto">
                   <div className="mb-6">
                    <h2 className="text-2xl font-bold text-white">{txt.contentManagement}</h2>
                    <p className="text-gray-400 text-sm">{txt.contentDesc}</p>
                  </div>
                  <ContentWorkshop />
                </div>
              )}

              {activeTab === 'monetization' && (
                <div className="max-w-4xl mx-auto">
                  <div className="mb-6">
                    <h2 className="text-2xl font-bold text-white">{txt.monetizationAds}</h2>
                    <p className="text-gray-400 text-sm">{txt.monetizationDesc}</p>
                  </div>
                  <MonetizationHub />
                </div>
              )}

              {activeTab === 'settings' && (
                <div className="max-w-4xl mx-auto">
                  <div className="mb-6">
                    <h2 className="text-2xl font-bold text-white">{txt.systemSettings}</h2>
                    <p className="text-gray-400 text-sm">{txt.settingsDesc}</p>
                  </div>
                  <IdentitySuite />
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
};