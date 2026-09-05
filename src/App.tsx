import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { MobileBottomNav } from './components/MobileBottomNav';
import { ToastContainer } from './components/Toast';
import { GlobalSearchModal } from './components/GlobalSearchModal';
import { CustomPropertyRequestModal } from './components/CustomPropertyRequestModal';
import { AiAssistantModal } from './components/AiAssistantModal';

// Views
import { HomeView } from './views/HomeView';
import { PropertiesView } from './views/PropertiesView';
import { PropertyDetailView } from './views/PropertyDetailView';
import { ShortletsView } from './views/ShortletsView';
import { ShortletDetailView } from './views/ShortletDetailView';
import { CarsView } from './views/CarsView';
import { CarDetailView } from './views/CarDetailView';
import { ServicesView } from './views/ServicesView';
import { AboutView } from './views/AboutView';
import { ContactView } from './views/ContactView';
import { FavoritesView } from './views/FavoritesView';
import { AdminView } from './views/AdminView';

import { Sparkles, MessageSquare, X } from 'lucide-react';

const AppContent: React.FC = () => {
  const { currentPath, openAiModal } = useApp();
  const [teaserInput, setTeaserInput] = useState('');
  const [teaserDismissed, setTeaserDismissed] = useState(false);

  const handleTeaserSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (teaserInput.trim()) {
      openAiModal(teaserInput.trim());
      setTeaserInput('');
    } else {
      openAiModal();
    }
  };

  // Route matching logic
  const renderCurrentView = () => {
    // Exact routes
    if (currentPath === '/' || currentPath === '') {
      return <HomeView />;
    }
    if (currentPath === '/properties') {
      return <PropertiesView />;
    }
    if (currentPath === '/properties/sale') {
      return <PropertiesView initialListingType="sale" />;
    }
    if (currentPath === '/properties/rent') {
      return <PropertiesView initialListingType="rent" />;
    }
    if (currentPath.startsWith('/properties/')) {
      const slug = currentPath.replace('/properties/', '').split('?')[0];
      return <PropertyDetailView slug={slug} />;
    }

    if (currentPath === '/shortlets') {
      return <ShortletsView />;
    }
    if (currentPath.startsWith('/shortlets/')) {
      const slug = currentPath.replace('/shortlets/', '').split('?')[0];
      return <ShortletDetailView slug={slug} />;
    }

    if (currentPath === '/cars') {
      return <CarsView />;
    }
    if (currentPath.startsWith('/cars/')) {
      const slug = currentPath.replace('/cars/', '').split('?')[0];
      return <CarDetailView slug={slug} />;
    }

    if (currentPath === '/services') {
      return <ServicesView />;
    }
    if (currentPath === '/about') {
      return <AboutView />;
    }
    if (currentPath === '/contact') {
      return <ContactView />;
    }
    if (currentPath === '/favorites') {
      return <FavoritesView />;
    }
    if (currentPath === '/admin') {
      return <AdminView />;
    }

    // Fallback to HomeView
    return <HomeView />;
  };

  return (
    <div className="min-h-screen bg-canvas text-primary flex flex-col font-sans selection:bg-[#D4AF37] selection:text-black transition-colors duration-200">
      {/* Global Navbar */}
      <Navbar />

      {/* Main Dynamic View Content */}
      <main className="flex-1">
        {renderCurrentView()}
      </main>

      {/* Floating AI Assistant Widget & Trigger (Bottom Right) */}
      <aside
        id="floating-ai-advisor-container"
        aria-label="Ask AI Assistant"
        className="fixed bottom-20 md:bottom-8 right-4 sm:right-6 lg:right-8 z-40 flex items-end gap-3.5"
      >
        {/* Desktop Teaser Card */}
        {!teaserDismissed && (
          <div className="hidden md:flex flex-col bg-white dark:bg-[#1A1A1A] border border-black/10 dark:border-white/10 rounded-2xl p-4 w-72 shadow-2xl shadow-black/10 dark:shadow-black relative animate-in fade-in slide-in-from-bottom-3 duration-300">
            <button
              onClick={() => setTeaserDismissed(true)}
              className="absolute top-3 right-3 text-neutral-400 hover:text-neutral-900 dark:text-white/40 dark:hover:text-white transition-colors"
              aria-label="Close teaser"
            >
              <X className="w-3.5 h-3.5" />
            </button>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
              <span className="text-[10px] uppercase tracking-widest font-bold text-[#D4AF37]">
                AI Property Assistant
              </span>
            </div>
            <p className="text-xs text-neutral-600 dark:text-white/70 leading-relaxed mb-3">
              "Looking for a 4-bedroom duplex in Ajah or serviced shortlet in Lekki? I can help."
            </p>
            <form onSubmit={handleTeaserSubmit} className="flex gap-2">
              <input
                type="text"
                value={teaserInput}
                onChange={e => setTeaserInput(e.target.value)}
                placeholder="Ask me anything..."
                className="bg-neutral-100 dark:bg-black/40 border border-neutral-200 dark:border-white/10 rounded-lg px-3 py-1.5 text-xs flex-1 outline-none text-neutral-900 dark:text-[#F5F5F0] placeholder:text-neutral-400 dark:placeholder:text-white/40 focus:border-[#D4AF37] transition-colors"
              />
              <button
                type="submit"
                aria-label="Submit query"
                className="bg-[#D4AF37] text-black px-2.5 py-1.5 rounded-lg hover:bg-[#c49f2e] transition-colors flex items-center justify-center font-bold"
              >
                <Sparkles className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        )}

        {/* Floating Circular Trigger Button */}
        <button
          id="floating-ai-advisor-trigger"
          onClick={() => openAiModal()}
          aria-label="Open AI Property Assistant"
          className="w-13 h-13 sm:w-14 sm:h-14 bg-neutral-900 text-white dark:bg-white dark:text-black rounded-full flex items-center justify-center shadow-2xl cursor-pointer border-4 border-neutral-100 dark:border-[#050505] hover:bg-[#D4AF37] hover:text-black dark:hover:bg-[#D4AF37] dark:hover:text-black transition-all hover:scale-105 active:scale-95 group shrink-0"
        >
          <MessageSquare className="w-5 h-5 sm:w-6 sm:h-6 fill-current transition-transform group-hover:scale-110" />
        </button>
      </aside>

      {/* Global Footer */}
      <Footer />

      {/* Mobile Bottom Navigation Bar */}
      <MobileBottomNav />

      {/* Global Modals & Notifications */}
      <GlobalSearchModal />
      <CustomPropertyRequestModal />
      <AiAssistantModal />
      <ToastContainer />
    </div>
  );
};

export default function App() {
  return (
    <ThemeProvider>
      <AppProvider>
        <AppContent />
      </AppProvider>
    </ThemeProvider>
  );
}
