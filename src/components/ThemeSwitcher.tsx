import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

interface ThemeSwitcherProps {
  className?: string;
  variant?: 'icon' | 'compact' | 'row';
  id?: string;
  onHero?: boolean;
  style?: React.CSSProperties;
}

export const ThemeSwitcher: React.FC<ThemeSwitcherProps> = ({
  className = '',
  variant = 'icon',
  id = 'theme-switcher-btn',
  onHero = false,
  style
}) => {
  const { theme, isDark, toggleTheme } = useTheme();

  const label = isDark ? 'Switch to light mode' : 'Switch to dark mode';

  if (variant === 'row') {
    return (
      <div
        style={style}
        className={`flex items-center justify-between py-2.5 px-3.5 rounded-xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 ${className}`}
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-black/5 dark:bg-white/10 text-brand-green-primary dark:text-brand-green-sage">
            {isDark ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4 text-brand-green-primary" />}
          </div>
          <div className="flex flex-col text-left">
            <span className="text-xs font-semibold text-neutral-900 dark:text-white uppercase tracking-wider">
              Appearance
            </span>
            <span className="text-[11px] text-neutral-500 dark:text-white/60">
              {isDark ? 'Dark Mode (Forest Black)' : 'Light Mode (Modern Warm Ivory)'}
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
          className="relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-brand-green-primary focus:ring-offset-2 bg-neutral-300 dark:bg-brand-black-graphite"
        >
          <span className="sr-only">{label}</span>
          <span
            aria-hidden="true"
            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white dark:bg-brand-green-primary shadow-lg ring-0 transition duration-200 ease-in-out ${
              isDark ? 'translate-x-5' : 'translate-x-0'
            } flex items-center justify-center`}
          >
            {isDark ? (
              <Moon className="w-3 h-3 text-white" />
            ) : (
              <Sun className="w-3 h-3 text-brand-green-deep" />
            )}
          </span>
        </button>
      </div>
    );
  }

  if (onHero) {
    return (
      <button
        id={id}
        type="button"
        onClick={toggleTheme}
        aria-label={label}
        title={label}
        style={style}
        className={`relative p-2 sm:p-2.5 rounded-full transition-all duration-200 shrink-0 flex items-center justify-center cursor-pointer select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-green-primary bg-white/10 hover:bg-white/20 text-[#F5F5F5] border border-white/25 hover:border-brand-green-sage/60 group ${className}`}
      >
        <span className="sr-only">{label}</span>
        <div className="relative w-4 h-4 flex items-center justify-center">
          {isDark ? (
            <Sun className="w-4 h-4 text-[#F5F5F5] group-hover:text-brand-green-sage transition-transform duration-300 group-hover:rotate-45" />
          ) : (
            <Moon className="w-4 h-4 text-[#F5F5F5] group-hover:text-brand-green-sage transition-transform duration-300 group-hover:-rotate-12" />
          )}
        </div>
      </button>
    );
  }

  return (
    <button
      id={id}
      type="button"
      onClick={toggleTheme}
      aria-label={label}
      title={label}
      style={style}
      className={`relative p-2 sm:p-2.5 rounded-full transition-all duration-200 shrink-0 flex items-center justify-center cursor-pointer select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-green-primary group ${
        isDark
          ? 'bg-white/5 hover:bg-white/10 text-[#F5F5F5] hover:text-white border border-white/15 hover:border-brand-green-sage/50'
          : 'bg-black/5 hover:bg-black/10 text-neutral-800 hover:text-neutral-950 border border-black/10 hover:border-brand-green-primary/40'
      } ${className}`}
    >
      <span className="sr-only">{label}</span>
      <div className="relative w-4 h-4 flex items-center justify-center">
        {isDark ? (
          <Sun className="w-4 h-4 text-[#F5F5F5] group-hover:text-brand-green-sage transition-transform duration-300 group-hover:rotate-45" />
        ) : (
          <Moon className="w-4 h-4 text-neutral-700 group-hover:text-brand-green-primary transition-transform duration-300 group-hover:-rotate-12" />
        )}
      </div>
    </button>
  );
};
