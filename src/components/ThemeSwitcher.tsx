import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

interface ThemeSwitcherProps {
  className?: string;
  variant?: 'icon' | 'compact' | 'row';
  id?: string;
}

export const ThemeSwitcher: React.FC<ThemeSwitcherProps> = ({
  className = '',
  variant = 'icon',
  id = 'theme-switcher-btn'
}) => {
  const { theme, isDark, toggleTheme } = useTheme();

  const label = isDark ? 'Switch to light mode' : 'Switch to dark mode';

  if (variant === 'row') {
    return (
      <div
        className={`flex items-center justify-between py-2.5 px-3.5 rounded-xl bg-white/5 dark:bg-white/5 light:bg-black/5 border border-black/10 dark:border-white/10 ${className}`}
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-black/5 dark:bg-white/10 text-[#D4AF37]">
            {isDark ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4 text-amber-500" />}
          </div>
          <div className="flex flex-col text-left">
            <span className="text-xs font-semibold text-neutral-900 dark:text-white uppercase tracking-wider">
              Appearance
            </span>
            <span className="text-[11px] text-neutral-500 dark:text-white/60">
              {isDark ? 'Dark Mode (Luxury Black)' : 'Light Mode (Modern Cream)'}
            </span>
          </div>
        </div>

        <button
          id={id}
          type="button"
          onClick={toggleTheme}
          role="switch"
          aria-checked={isDark}
          aria-label={label}
          title={label}
          className="relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:ring-offset-2 bg-neutral-300 dark:bg-neutral-800"
        >
          <span className="sr-only">{label}</span>
          <span
            aria-hidden="true"
            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white dark:bg-[#D4AF37] shadow-lg ring-0 transition duration-200 ease-in-out ${
              isDark ? 'translate-x-5' : 'translate-x-0'
            } flex items-center justify-center`}
          >
            {isDark ? (
              <Moon className="w-3 h-3 text-black" />
            ) : (
              <Sun className="w-3 h-3 text-amber-600" />
            )}
          </span>
        </button>
      </div>
    );
  }

  return (
    <button
      id={id}
      type="button"
      onClick={toggleTheme}
      aria-label={label}
      title={label}
      className={`relative p-2 sm:p-2.5 rounded-full transition-all duration-200 shrink-0 flex items-center justify-center cursor-pointer select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-[#D4AF37] focus-visible:ring-offset-1 group ${
        isDark
          ? 'bg-white/5 hover:bg-white/10 text-white/80 hover:text-white border border-white/10 hover:border-[#D4AF37]/50'
          : 'bg-black/5 hover:bg-black/10 text-neutral-800 hover:text-black border border-black/10 hover:border-[#D4AF37]'
      } ${className}`}
    >
      <span className="sr-only">{label}</span>
      <div className="relative w-4 h-4 flex items-center justify-center">
        {isDark ? (
          <Sun className="w-4 h-4 text-white/80 group-hover:text-amber-400 transition-transform duration-300 group-hover:rotate-45" />
        ) : (
          <Moon className="w-4 h-4 text-neutral-800 group-hover:text-[#D4AF37] transition-transform duration-300 group-hover:-rotate-12" />
        )}
      </div>
    </button>
  );
};
