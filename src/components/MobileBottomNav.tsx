import React from 'react';
import { useApp } from '../context/AppContext';
import { Home, Building2, Key, Sparkles } from 'lucide-react';

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
    }
  ];

  return (
    <div className="sa-mobile-nav lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-brand-black-deep/95 backdrop-blur-xl border-t border-black/10 dark:border-brand-green-primary/20 px-2 py-1.5 shadow-[0_-4px_25px_rgba(0,0,0,0.08)] dark:shadow-[0_-8px_30px_rgba(0,0,0,0.8)] transition-colors">
      <div className="grid grid-cols-4 items-center max-w-md mx-auto">
        {items.map(item => {
          if (item.isAi) {
            return (
              <button
                key={item.id}
                id={item.id}
                onClick={() => openAiModal()}
                className="flex flex-col items-center justify-center -mt-4 relative group cursor-pointer"
              >
                <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-brand-green-deep via-brand-green-sage to-brand-green-primary p-0.5 shadow-[0_0_15px_rgba(37,61,43,0.3)] flex items-center justify-center">
                  <div className="w-full h-full rounded-full bg-white dark:bg-brand-black flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-brand-green-primary dark:text-brand-green-sage animate-pulse" />
                  </div>
                </div>
                <span className="text-[10px] font-semibold text-brand-green-primary dark:text-brand-green-sage mt-1 font-mono">AI Concierge</span>
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
                item.isActive ? 'text-brand-green-primary dark:text-brand-green-sage font-semibold' : 'text-neutral-500 hover:text-neutral-900 dark:text-white/50 dark:hover:text-white'
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
