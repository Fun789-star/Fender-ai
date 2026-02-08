import React, { useState, useContext, useEffect } from 'react';
import { AppContext } from '../App';
import { motion, AnimatePresence } from 'framer-motion';
import { doc, updateDoc, collection, addDoc, deleteDoc, query, onSnapshot, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { AdminConfig, Article, SocialLink, Stats } from '../types';
import { Lock, Settings, FileText, Share2, BarChart, Plus, Trash2, Send, Youtube, Facebook, Instagram, Video, Image as ImageIcon, Tag, AlignLeft, Sparkles, DollarSign, ToggleLeft, ToggleRight, User, Mail, Code } from 'lucide-react';

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

  useEffect(() => {
    const q = query(collection(db, 'articles'));
    const unsub = onSnapshot(q, (s) => setArticles(s.docs.map(d => ({id: d.id, ...d.data()} as Article))));
    return () => unsub();
  }, []);

  const handleAdd = async () => {
    if(!newArticle.title) return;
    await addDoc(collection(db, 'articles'), { ...newArticle, createdAt: Date.now() });
    setNewArticle({ title: '', description: '', imageUrl: '', category: '', article_prompt: '' });
  };

  const handleDelete = async (id: string) => {
    await deleteDoc(doc(db, 'articles', id));
  };

  return (
    <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
      <h3 className="text-lg font-bold text-white mb-4 flex items-center"><FileText className="mr-2" /> Content Workshop</h3>
      
      {/* Add New */}
      <div className="mb-6 bg-gray-900 p-4 rounded-lg space-y-3">
        <h4 className="text-xs text-gray-400 uppercase mb-2 font-bold tracking-wider">Add New Article</h4>
        
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
          onClick={handleAdd} 
          className="w-full bg-neon-blue hover:bg-white text-black py-2 rounded-lg text-sm font-bold uppercase tracking-wider flex items-center justify-center transition-all shadow-[0_0_10px_rgba(0,243,255,0.3)] hover:shadow-[0_0_20px_rgba(0,243,255,0.5)]"
        >
          <Plus className="w-4 h-4 mr-2"/> Publish Article
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
              <div key={art.id} className="flex justify-between items-center bg-gray-900 border border-gray-800 p-3 rounded-lg hover:border-gray-700 transition-colors">
                 <div className="flex flex-col overflow-hidden">
                    <span className="text-white text-sm font-bold truncate">{art.title}</span>
                    <span className="text-gray-500 text-[10px] uppercase tracking-wide">{art.category}</span>
                 </div>
                 <button onClick={() => handleDelete(art.id)} className="p-2 hover:bg-red-500/20 rounded-full group transition-colors">
                    <Trash2 className="w-4 h-4 text-gray-500 group-hover:text-red-500" />
                 </button>
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

  if (!authenticated) {
    return <LoginStep onLogin={() => setAuthenticated(true)} />;
  }

  return (
    <div className="min-h-screen bg-gray-900 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
           <h1 className="text-3xl font-bold text-white tracking-tighter">ADMIN <span className="text-neon-blue">CONSOLE</span></h1>
           <button onClick={() => setAuthenticated(false)} className="text-gray-400 hover:text-white text-sm">Logout</button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
           <IdentitySuite />
           <MonetizationHub />
           <StatsMatrix />
           <ContentWorkshop />
           <BroadcastCenter />
        </div>
      </div>
    </div>
  );
};