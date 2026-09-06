import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { AdminUser, SiteSettings } from '../types';
import { OFFICIAL_CONTACT } from '../constants/contact';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}

interface AppContextType {
  currentPath: string;
  navigate: (path: string) => void;
  favorites: string[];
  toggleFavorite: (id: string) => void;
  clearFavorites: () => void;
  isFavorite: (id: string) => boolean;
  isAiModalOpen: boolean;
  openAiModal: (initialPrompt?: string) => void;
  closeAiModal: () => void;
  aiInitialPrompt?: string;
  isSearchModalOpen: boolean;
  openSearchModal: () => void;
  closeSearchModal: () => void;
  isRequestModalOpen: boolean;
  openRequestModal: (prefill?: Partial<{ service: string; budget: string; location: string }>) => void;
  closeRequestModal: () => void;
  requestPrefill?: Partial<{ service: string; budget: string; location: string }>;
  currentUser: AdminUser | null;
  setCurrentUser: (user: AdminUser | null) => void;
  logout: () => void;
  toasts: ToastMessage[];
  addToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  removeToast: (id: string) => void;
  settings: SiteSettings;
  updateSettings: (newSettings: Partial<SiteSettings>) => void;
  updateSettingsState: (settings: SiteSettings) => void;
}

const DEFAULT_SETTINGS: SiteSettings = {
  businessName: OFFICIAL_CONTACT.brandName,
  companyName: OFFICIAL_CONTACT.brandName,
  phone: OFFICIAL_CONTACT.phone,
  whatsapp: OFFICIAL_CONTACT.whatsappDisplay,
  email: OFFICIAL_CONTACT.email,
  officeAddress: OFFICIAL_CONTACT.address,
  address: OFFICIAL_CONTACT.address,
  businessHours: OFFICIAL_CONTACT.businessHours,
  socialLinks: {
    instagram: 'https://instagram.com/sellingajah',
    facebook: 'https://facebook.com/sellingajah',
    twitter: 'https://x.com/sellingajah',
    linkedin: 'https://linkedin.com/company/sellingajah',
    youtube: 'https://youtube.com/@sellingajah'
  },
  defaultSeoTitle: 'Selling Ajah | Premium Properties, Shortlets & Luxury Rentals in Lagos',
  defaultSeoDescription: 'Verified properties for sale, long-term rentals, serviced shortlets, and executive car rentals in Ajah, Lekki, and Lagos.',
  heroHeadline: 'Find Your Place in Ajah.',
  heroSubheadline: 'Discover verified luxury properties, premium serviced shortlets, and executive car rentals across Ajah, Lekki, and greater Lagos.'
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Simple client-side routing with browser history support
  const [currentPath, setCurrentPath] = useState<string>(() => {
    return window.location.pathname || '/';
  });

  const navigate = useCallback((path: string) => {
    if (window.location.pathname !== path) {
      window.history.pushState({}, '', path);
    }
    setCurrentPath(path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname || '/');
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Favorites
  const [favorites, setFavorites] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('sa_favorites');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const toggleFavorite = useCallback((id: string) => {
    setFavorites(prev => {
      const exists = prev.includes(id);
      const next = exists ? prev.filter(item => item !== id) : [...prev, id];
      try {
        localStorage.setItem('sa_favorites', JSON.stringify(next));
      } catch (e) {
        console.error(e);
      }
      return next;
    });
  }, []);

  const clearFavorites = useCallback(() => {
    setFavorites([]);
    try {
      localStorage.removeItem('sa_favorites');
    } catch (e) {
      console.error(e);
    }
  }, []);

  const isFavorite = useCallback((id: string) => favorites.includes(id), [favorites]);

  // AI Modal
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [aiInitialPrompt, setAiInitialPrompt] = useState<string | undefined>(undefined);

  const openAiModal = useCallback((initialPrompt?: string) => {
    setAiInitialPrompt(initialPrompt);
    setIsAiModalOpen(true);
  }, []);

  const closeAiModal = useCallback(() => {
    setIsAiModalOpen(false);
    setAiInitialPrompt(undefined);
  }, []);

  // Global Search Modal
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const openSearchModal = useCallback(() => setIsSearchModalOpen(true), []);
  const closeSearchModal = useCallback(() => setIsSearchModalOpen(false), []);

  // Bespoke Request Modal
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [requestPrefill, setRequestPrefill] = useState<Partial<{ service: string; budget: string; location: string }>>();
  const openRequestModal = useCallback((prefill?: Partial<{ service: string; budget: string; location: string }>) => {
    setRequestPrefill(prefill);
    setIsRequestModalOpen(true);
  }, []);
  const closeRequestModal = useCallback(() => {
    setIsRequestModalOpen(false);
    setRequestPrefill(undefined);
  }, []);

  // Authentication
  const [currentUser, setCurrentUser] = useState<AdminUser | null>(() => {
    try {
      const saved = localStorage.getItem('sa_admin_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const logout = useCallback(() => {
    setCurrentUser(null);
    localStorage.removeItem('sa_admin_user');
    navigate('/');
  }, [navigate]);

  const handleSetUser = useCallback((user: AdminUser | null) => {
    setCurrentUser(user);
    if (user) {
      localStorage.setItem('sa_admin_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('sa_admin_user');
    }
  }, []);

  // Toast Notifications
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = 'toast-' + Date.now() + Math.random().toString(36).substring(2, 5);
    setToasts(prev => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  // Settings
  const [settings, setSettings] = useState<SiteSettings>(DEFAULT_SETTINGS);

  useEffect(() => {
    fetch('/api/settings')
      .then(res => res.json())
      .then(data => {
        if (data && data.businessName) {
          if (!data.whatsapp || data.whatsapp.includes('812 345 6789') || data.whatsapp.includes('2348123456789')) {
            data.whatsapp = OFFICIAL_CONTACT.whatsappDisplay;
          }
          if (!data.phone || data.phone.includes('812 345 6789') || data.phone.includes('2348123456789')) {
            data.phone = OFFICIAL_CONTACT.phone;
          }
          setSettings(data);
        }
      })
      .catch(err => console.warn('Could not load settings:', err));
  }, []);

  const updateSettingsState = useCallback((newSettings: SiteSettings) => {
    setSettings(newSettings);
  }, []);

  const updateSettings = useCallback((newSettings: Partial<SiteSettings>) => {
    setSettings(prev => {
      const merged = { ...prev, ...newSettings };
      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      };

      if (currentUser?.token) {
        headers.Authorization = `Bearer ${currentUser.token}`;
      }

      fetch('/api/settings', {
        method: 'POST',
        headers,
        body: JSON.stringify(merged)
      })
        .then(res => {
          if (!res.ok) {
            throw new Error(`Settings update failed with status ${res.status}`);
          }
        })
        .catch(err => console.error('Error saving settings:', err));

      return merged;
    });
  }, [currentUser?.token]);

  return (
    <AppContext.Provider
      value={{
        currentPath,
        navigate,
        favorites,
        toggleFavorite,
        clearFavorites,
        isFavorite,
        isAiModalOpen,
        openAiModal,
        closeAiModal,
        aiInitialPrompt,
        isSearchModalOpen,
        openSearchModal,
        closeSearchModal,
        isRequestModalOpen,
        openRequestModal,
        closeRequestModal,
        requestPrefill,
        currentUser,
        setCurrentUser: handleSetUser,
        logout,
        toasts,
        addToast,
        removeToast,
        settings,
        updateSettings,
        updateSettingsState
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = (): AppContextType => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
