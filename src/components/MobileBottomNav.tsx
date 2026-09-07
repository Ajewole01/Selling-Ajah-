import React from 'react';
import { useApp } from '../context/AppContext';
import { Home, Building2, Key, Car, Sparkles } from 'lucide-react';

export const MobileBottomNav: React.FC = () => {
  const { currentPath, navigate, openAiModal } = useApp();

  // If in admin views, don't obstruct admin panel
  if (currentPath.startsWith('/admin')) {
    return null;
  }

  const items = [
    {
      id: 'tab-home',
      label: 'Home',
      path: '/',
      icon: Home,
      isActive: currentPath === '/'
    },
    {
      id: 'tab-properties',
      label: 'Properties',
      path: '/properties',
      icon: Building2,
      isActive: currentPath.startsWith('/properties')
    },
    {
      id: 'tab-ai',
      label: 'AI Advisor',
      isAi: true,
      icon: Sparkles
    },
    {
      id: 'tab-shortlets',
      label: 'Shortlets',
      path: '/shortlets',
      icon: Key,
      isActive: currentPath.startsWith('/shortlets')
    },
    {
      id: 'tab-cars',
      label: 'Cars',
      path: '/cars',
      icon: Car,
      isActive: currentPath.startsWith('/cars')
    }
  ];

  return (
    <div className="sa-mobile-nav lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-brand-black-deep/95 backdrop-blur-xl border-t border-black/10 dark:border-brand-gold/15 px-2 py-1.5 shadow-[0_-4px_25px_rgba(0,0,0,0.08)] dark:shadow-[0_-8px_30px_rgba(0,0,0,0.8)] transition-colors">
      <div className="grid grid-cols-5 items-center max-w-md mx-auto">
        {items.map(item => {
          if (item.isAi) {
            return (
              <button
                key={item.id}
                id={item.id}
                onClick={() => openAiModal()}
                className="flex flex-col items-center justify-center -mt-4 relative group cursor-pointer"
              >
                <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-brand-gold-deep via-brand-gold-champagne to-brand-gold p-0.5 shadow-[0_0_15px_rgba(198,161,91,0.35)] flex items-center justify-center">
                  <div className="w-full h-full rounded-full bg-white dark:bg-brand-black flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-brand-gold animate-pulse" />
                  </div>
                </div>
                <span className="text-[10px] font-semibold text-brand-gold mt-1 font-mono">AI Concierge</span>
              </button>
            );
          }

          const Icon = item.icon;
          return (
            <button
              key={item.id}
              id={item.id}
              onClick={() => item.path && navigate(item.path)}
              className={`flex flex-col items-center justify-center py-1 rounded-lg transition-colors cursor-pointer ${
                item.isActive ? 'text-brand-gold font-semibold' : 'text-neutral-500 hover:text-neutral-900 dark:text-white/50 dark:hover:text-white'
              }`}
            >
              <Icon className="w-5 h-5 mb-0.5" />
              <span className="text-[10px] font-medium tracking-tight">{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
