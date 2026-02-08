
export interface AdminConfig {
  site_logo: string;
  owner_image: string;
  allowed_email: string;
  password?: string; // Stored as plain text based on prompt requirements
  
  // Owner Identity
  owner_name_en?: string;
  owner_name_ar?: string;
  contact_email?: string;

  // Social Stats
  youtube_count?: string;
  youtube_url?: string;
  tiktok_count?: string;
  tiktok_url?: string;
  facebook_count?: string;
  facebook_url?: string;
  instagram_count?: string;
  instagram_url?: string;

  // Monetization Settings (Toggles)
  show_header_ad?: boolean;
  show_mid_ad?: boolean;
  show_bottom_ad?: boolean;
  show_sidebar_ad?: boolean;

  // Monetization Scripts (Raw HTML/JS)
  ad_header?: string;
  ad_mid?: string;
  ad_bottom?: string;
  ad_sidebar?: string;
}

export interface SocialLink {
  id: string;
  platform: 'youtube' | 'tiktok' | 'facebook' | 'twitter' | 'instagram' | 'linkedin' | 'github' | 'website';
  url: string;
  title?: string;
}

export interface Article {
  id: string;
  title: string;
  imageUrl: string;
  description: string;
  category: string;
  article_prompt?: string;
  createdAt: number;
}

export interface Notification {
  id: string;
  message: string;
  timestamp: number;
  read: boolean;
}

export interface Stats {
  visitors: number;
  linkClicks: number;
  promptCopies: number;
}

export type Theme = 'light' | 'dark';
export type Language = 'en' | 'ar';

export interface AppContextType {
  theme: Theme;
  toggleTheme: () => void;
  language: Language;
  toggleLanguage: () => void;
  config: AdminConfig | null;
  setConfig: (config: AdminConfig) => void;
  user: any | null; // Placeholder for simple auth state
  isAuthenticated: boolean;
  login: (email: string) => void;
  logout: () => void;
}