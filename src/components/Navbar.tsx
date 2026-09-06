import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { BrandLogo } from './BrandLogo';
import { ThemeSwitcher } from './ThemeSwitcher';
import {
  Search,
  Heart,
  MessageSquare,
  Sparkles,
  Menu,
  X,
  Phone,
  ChevronDown,
  ShieldCheck,
  Building2,
  Car,
  Home,
  SlidersHorizontal
} from 'lucide-react';
import { formatWhatsAppUrl } from '../utils/formatters';

export const Navbar: React.FC = () => {
  const {
    currentPath,
    navigate,
    favorites,
    openAiModal,
    openSearchModal,
    openRequestModal,
    currentUser,
    settings
  } = useApp();

  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [propertiesDropdownOpen, setPropertiesDropdownOpen] = useState(false);
  const [mobilePropertiesExpanded, setMobilePropertiesExpanded] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const closeMenus = () => {
    setMobileMenuOpen(false);
    setPropertiesDropdownOpen(false);
    setMobilePropertiesExpanded(false);
  };

  const handleNav = (path: string) => {
    navigate(path);
    closeMenus();
  };

  const navLinks = [
    { label: 'Home', path: '/' },
    {
      label: 'Properties',
      path: '/properties',
      hasDropdown: true,
      subItems: [
        { label: 'All Properties', path: '/properties' },
        { label: 'Properties for Sale', path: '/properties/sale' },
        { label: 'Properties for Rent', path: '/properties/rent' },
      ]
    },
    { label: 'Shortlets', path: '/shortlets' },
    { label: 'Luxury Cars', path: '/cars' },
    { label: 'Services', path: '/services' },
    { label: 'About', path: '/about' },
    { label: 'Contact', path: '/contact' }
  ];

  const whatsappDirect = formatWhatsAppUrl(
    settings.whatsapp,
    "Hello Selling Ajah, I am inquiring about properties and luxury lifestyle services in Ajah/Lekki."
  );

  return (
    <header
      className={`sa-navbar ${currentPath === '/' ? 'sa-navbar--home' : ''} ${isScrolled ? 'is-scrolled' : ''} sticky top-0 z-40 w-full transition-all duration-300 navbar-surface ${
        isScrolled
          ? 'bg-white/95 dark:bg-[#050505]/98 backdrop-blur-md border-b border-black/10 dark:border-white/10 shadow-2xl py-2 sm:py-2.5'
          : 'bg-white/92 dark:bg-[#050505]/92 backdrop-blur-sm border-b border-black/10 dark:border-white/10 py-2.5 sm:py-3.5'
      }`}
    >
      <div className="w-full max-w-[1600px] mx-auto px-3 sm:px-4 md:px-5 lg:px-6 xl:px-6 2xl:px-8 box-border">
        <div className="flex items-center justify-between w-full min-w-0 gap-2 sm:gap-3 xl:gap-4 2xl:gap-6">
          
          {/* 1. LEFT ZONE: Brand Logo */}
          <div
            onClick={() => handleNav('/')}
            className="shrink-0 flex items-center cursor-pointer select-none"
          >
            <BrandLogo size="md" />
          </div>

          {/* 2. CENTER ZONE: Primary Desktop Navigation (Guaranteed single line, never wraps) */}
          <nav
            aria-label="Primary Navigation"
            className="hidden xl:flex items-center justify-center gap-1.5 xl:gap-2 2xl:gap-5 text-[11px] xl:text-xs font-semibold uppercase tracking-wider text-neutral-700 dark:text-white/75 min-w-0"
          >
            {navLinks.map(link => {
              const isActive =
                link.path === '/'
                  ? currentPath === '/'
                  : currentPath.startsWith(link.path);

              if (link.hasDropdown) {
                return (
                  <div
                    key={link.path}
                    className="relative shrink-0"
                    onMouseEnter={() => setPropertiesDropdownOpen(true)}
                    onMouseLeave={() => setPropertiesDropdownOpen(false)}
                  >
                    <button
                      id="nav-properties-dropdown"
                      onClick={() => handleNav(link.path)}
                      className={`flex items-center gap-1 py-1.5 px-1 xl:px-1.5 2xl:px-2 whitespace-nowrap transition-colors uppercase tracking-wider ${
                        isActive
                          ? 'text-[#D4AF37] font-bold'
                          : 'text-neutral-700 dark:text-white/75 hover:text-[#D4AF37]'
                      }`}
                    >
                      <span className="whitespace-nowrap">{link.label}</span>
                      <ChevronDown
                        className={`w-3.5 h-3.5 opacity-75 transition-transform duration-200 ${
                          propertiesDropdownOpen ? 'rotate-180 text-[#D4AF37]' : ''
                        }`}
                      />
                    </button>

                    {/* Dropdown Menu */}
                    {propertiesDropdownOpen && (
                      <div className="absolute top-full left-0 w-52 pt-1.5 z-50 animate-in fade-in-50 slide-in-from-top-1 duration-150">
                        <div className="bg-white dark:bg-[#111111] border border-black/10 dark:border-white/10 rounded-xl shadow-2xl shadow-black/10 dark:shadow-black p-1.5 backdrop-blur-xl">
                          {link.subItems?.map(sub => (
                            <button
                              key={sub.path}
                              onClick={() => handleNav(sub.path)}
                              className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-colors uppercase tracking-wider ${
                                currentPath === sub.path
                                  ? 'text-[#D4AF37] bg-black/5 dark:bg-white/5 font-bold'
                                  : 'text-neutral-700 hover:text-black hover:bg-black/5 dark:text-white/70 dark:hover:text-[#D4AF37] dark:hover:bg-white/5'
                              }`}
                            >
                              <span className="whitespace-nowrap">{sub.label}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              }

              return (
                <button
                  key={link.path}
                  onClick={() => handleNav(link.path)}
                  className={`py-1.5 px-1 xl:px-1.5 2xl:px-2 whitespace-nowrap transition-colors uppercase tracking-wider shrink-0 ${
                    isActive
                      ? 'text-[#D4AF37] font-bold'
                      : 'text-neutral-700 dark:text-white/75 hover:text-[#D4AF37]'
                  }`}
                >
                  <span className="whitespace-nowrap">{link.label}</span>
                </button>
              );
            })}
          </nav>

          {/* 3. RIGHT ZONE: Actions (Search, Favorites, Theme Toggle, Find Property, WhatsApp, Menu) */}
          <div className="flex items-center justify-end gap-1.5 sm:gap-2 xl:gap-2.5 2xl:gap-3 shrink-0 ml-auto min-w-0">
            
            {/* Desktop Search Trigger */}
            <button
              id="search-trigger-desktop"
              onClick={openSearchModal}
              title="Search Ajah listings"
              className="hidden xl:flex items-center gap-1.5 xl:gap-2 px-2.5 xl:px-3 py-1.5 xl:py-2 rounded-full bg-black/5 hover:bg-black/10 dark:bg-white/5 dark:hover:bg-white/10 text-neutral-600 hover:text-black dark:text-white/70 dark:hover:text-white border border-black/10 hover:border-black/20 dark:border-white/10 dark:hover:border-white/20 transition-all text-xs w-[120px] xl:w-[145px] 2xl:w-[200px] max-w-[240px] min-w-[100px] flex-shrink group select-none cursor-pointer"
            >
              <Search className="w-3.5 h-3.5 text-neutral-400 dark:text-white/50 group-hover:text-[#D4AF37] shrink-0 transition-colors" />
              <span className="truncate whitespace-nowrap overflow-hidden text-ellipsis text-neutral-500 dark:text-white/50 group-hover:text-neutral-900 dark:group-hover:text-white/80 select-none text-[11px] xl:text-xs">
                Search Ajah...
              </span>
            </button>

            {/* Tablet & Mobile Search Icon Trigger */}
            <button
              id="search-trigger-mobile"
              onClick={openSearchModal}
              title="Search listings"
              className="xl:hidden p-2 sm:p-2.5 rounded-full bg-black/5 hover:bg-black/10 dark:bg-white/5 dark:hover:bg-white/10 text-neutral-700 dark:text-white/80 hover:text-black dark:hover:text-white border border-black/10 dark:border-white/10 transition-all shrink-0 flex items-center justify-center"
              aria-label="Open Search"
            >
              <Search className="w-4 h-4 text-neutral-600 dark:text-white/70" />
            </button>

            {/* Saved Favorites Trigger */}
            <button
              id="favorites-trigger-btn"
              onClick={() => handleNav('/favorites')}
              title="Saved Properties"
              className="relative p-2 sm:p-2.5 rounded-full bg-black/5 hover:bg-black/10 dark:bg-white/5 dark:hover:bg-white/10 text-neutral-700 hover:text-black dark:text-white/70 dark:hover:text-white border border-black/10 hover:border-black/20 dark:border-white/10 dark:hover:border-white/20 transition-all shrink-0 flex items-center justify-center"
              aria-label="View Saved Wishlist"
            >
              <Heart className={`w-3.5 h-3.5 sm:w-4 sm:h-4 transition-colors ${favorites.length > 0 ? 'text-rose-500 fill-rose-500' : 'text-neutral-700 dark:text-white/70'}`} />
              {favorites.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#D4AF37] text-black text-[10px] font-bold rounded-full h-3.5 w-3.5 sm:h-4 sm:w-4 flex items-center justify-center shadow-lg">
                  {favorites.length}
                </span>
              )}
            </button>

            {/* Global Theme Switcher (Desktop & Tablet) */}
            <ThemeSwitcher id="navbar-theme-switcher-desktop" className="shrink-0" />

            {/* "FIND PROPERTY" CTA - Guaranteed single-line pill button */}
            <button
              id="navbar-find-property-btn"
              onClick={() => handleNav('/properties')}
              className="hidden sm:inline-flex items-center justify-center whitespace-nowrap shrink-0 bg-neutral-900 text-white dark:bg-white dark:text-black px-3 xl:px-3.5 2xl:px-4 py-1.5 xl:py-2 text-[11px] xl:text-xs font-bold uppercase tracking-wider 2xl:tracking-widest rounded-full hover:bg-[#D4AF37] hover:text-black dark:hover:bg-[#D4AF37] dark:hover:text-black transition-all shadow-sm active:scale-95"
            >
              <span className="whitespace-nowrap">Find Property</span>
            </button>

            {/* WhatsApp CTA */}
            <a
              id="navbar-whatsapp-cta"
              href={whatsappDirect}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 px-2.5 xl:px-3 2xl:px-3.5 py-1.5 xl:py-2 rounded-full border border-black/15 hover:border-[#D4AF37] dark:border-white/15 dark:hover:border-[#D4AF37] text-neutral-900 hover:text-[#D4AF37] dark:text-white dark:hover:text-[#D4AF37] text-[11px] xl:text-xs font-semibold uppercase tracking-wider transition-all active:scale-95"
            >
              <MessageSquare className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400 shrink-0" />
              <span className="whitespace-nowrap">WhatsApp</span>
            </a>

            {/* Admin Dashboard shortcut if authenticated */}
            {currentUser && (
              <button
                id="navbar-admin-btn"
                onClick={() => handleNav('/admin')}
                className="hidden 2xl:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/5 hover:bg-black/10 dark:bg-white/5 dark:hover:bg-white/10 text-neutral-800 dark:text-white/80 border border-black/10 dark:border-white/10 text-xs font-medium uppercase tracking-wider whitespace-nowrap shrink-0"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-[#D4AF37] shrink-0" />
                <span className="whitespace-nowrap">Admin</span>
              </button>
            )}

            {/* Mobile & Tablet Menu Hamburger Toggle */}
            <button
              id="mobile-menu-toggle-btn"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="xl:hidden p-2 sm:p-2.5 rounded-full bg-black/5 hover:bg-black/10 dark:bg-white/5 border border-black/10 dark:border-white/10 text-neutral-800 dark:text-white/80 hover:text-black dark:hover:text-white transition-colors shrink-0 flex items-center justify-center"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? (
                <X className="w-5 h-5 text-[#D4AF37]" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile & Tablet Drawer Menu */}
      {mobileMenuOpen && (
        <div className="xl:hidden border-t border-black/10 dark:border-white/10 bg-white/98 dark:bg-[#050505]/98 backdrop-blur-2xl px-4 pt-4 pb-8 shadow-2xl animate-in slide-in-from-top-2 duration-200 max-h-[calc(100vh-70px)] overflow-y-auto">
          <div className="flex flex-col gap-1 max-w-lg mx-auto">
            {/* Quick Search inside Drawer */}
            <div className="mb-3">
              <button
                onClick={() => {
                  closeMenus();
                  openSearchModal();
                }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-neutral-600 hover:text-black dark:text-white/60 dark:hover:text-white text-xs transition-colors"
              >
                <Search className="w-4 h-4 text-[#D4AF37]" />
                <span className="whitespace-nowrap">Search Ajah properties, shortlets, cars...</span>
              </button>
            </div>

            {/* Nav links */}
            <button
              onClick={() => handleNav('/')}
              className={`flex items-center gap-3 px-3.5 py-3 rounded-xl text-xs uppercase tracking-widest font-medium text-left transition-colors ${
                currentPath === '/'
                  ? 'text-[#D4AF37] bg-black/5 dark:bg-white/5 font-bold'
                  : 'text-neutral-800 hover:text-[#D4AF37] hover:bg-black/5 dark:text-white/80 dark:hover:text-[#D4AF37] dark:hover:bg-white/5'
              }`}
            >
              <Home className="w-4 h-4 text-neutral-500 dark:text-white/50 shrink-0" />
              <span className="whitespace-nowrap">Home</span>
            </button>

            {/* Properties Accordion */}
            <div className="flex flex-col">
              <div
                className={`flex items-center justify-between px-3.5 py-3 rounded-xl text-xs uppercase tracking-widest font-medium text-left transition-colors cursor-pointer ${
                  currentPath.startsWith('/properties')
                    ? 'text-[#D4AF37] bg-black/5 dark:bg-white/5 font-bold'
                    : 'text-neutral-800 hover:text-[#D4AF37] hover:bg-black/5 dark:text-white/80 dark:hover:text-[#D4AF37] dark:hover:bg-white/5'
                }`}
                onClick={() => setMobilePropertiesExpanded(!mobilePropertiesExpanded)}
              >
                <div className="flex items-center gap-3" onClick={(e) => { e.stopPropagation(); handleNav('/properties'); }}>
                  <Building2 className="w-4 h-4 text-neutral-500 dark:text-white/50 shrink-0" />
                  <span className="whitespace-nowrap">Properties</span>
                </div>
                <ChevronDown
                  className={`w-4 h-4 text-neutral-500 dark:text-white/50 transition-transform duration-200 ${
                    mobilePropertiesExpanded ? 'rotate-180 text-[#D4AF37]' : ''
                  }`}
                />
              </div>

              {mobilePropertiesExpanded && (
                <div className="pl-10 pr-2 py-1 flex flex-col gap-1 border-l-2 border-[#D4AF37]/40 ml-5 my-1">
                  <button
                    onClick={() => handleNav('/properties')}
                    className="py-2 text-left text-xs uppercase tracking-wider text-neutral-700 hover:text-[#D4AF37] dark:text-white/70 dark:hover:text-[#D4AF37] transition-colors"
                  >
                    All Properties
                  </button>
                  <button
                    onClick={() => handleNav('/properties/sale')}
                    className="py-2 text-left text-xs uppercase tracking-wider text-neutral-700 hover:text-[#D4AF37] dark:text-white/70 dark:hover:text-[#D4AF37] transition-colors"
                  >
                    Properties for Sale
                  </button>
                  <button
                    onClick={() => handleNav('/properties/rent')}
                    className="py-2 text-left text-xs uppercase tracking-wider text-neutral-700 hover:text-[#D4AF37] dark:text-white/70 dark:hover:text-[#D4AF37] transition-colors"
                  >
                    Properties for Rent
                  </button>
                </div>
              )}
            </div>

            <button
              onClick={() => handleNav('/shortlets')}
              className={`flex items-center gap-3 px-3.5 py-3 rounded-xl text-xs uppercase tracking-widest font-medium text-left transition-colors ${
                currentPath.startsWith('/shortlets')
                  ? 'text-[#D4AF37] bg-black/5 dark:bg-white/5 font-bold'
                  : 'text-neutral-800 hover:text-[#D4AF37] hover:bg-black/5 dark:text-white/80 dark:hover:text-[#D4AF37] dark:hover:bg-white/5'
              }`}
            >
              <Building2 className="w-4 h-4 text-neutral-500 dark:text-white/50 shrink-0" />
              <span className="whitespace-nowrap">Shortlets</span>
            </button>

            <button
              onClick={() => handleNav('/cars')}
              className={`flex items-center gap-3 px-3.5 py-3 rounded-xl text-xs uppercase tracking-widest font-medium text-left transition-colors ${
                currentPath.startsWith('/cars')
                  ? 'text-[#D4AF37] bg-black/5 dark:bg-white/5 font-bold'
                  : 'text-neutral-800 hover:text-[#D4AF37] hover:bg-black/5 dark:text-white/80 dark:hover:text-[#D4AF37] dark:hover:bg-white/5'
              }`}
            >
              <Car className="w-4 h-4 text-neutral-500 dark:text-white/50 shrink-0" />
              <span className="whitespace-nowrap">Luxury Cars</span>
            </button>

            <button
              onClick={() => handleNav('/services')}
              className={`flex items-center gap-3 px-3.5 py-3 rounded-xl text-xs uppercase tracking-widest font-medium text-left transition-colors ${
                currentPath.startsWith('/services')
                  ? 'text-[#D4AF37] bg-black/5 dark:bg-white/5 font-bold'
                  : 'text-neutral-800 hover:text-[#D4AF37] hover:bg-black/5 dark:text-white/80 dark:hover:text-[#D4AF37] dark:hover:bg-white/5'
              }`}
            >
              <SlidersHorizontal className="w-4 h-4 text-neutral-500 dark:text-white/50 shrink-0" />
              <span className="whitespace-nowrap">Services</span>
            </button>

            <button
              onClick={() => handleNav('/about')}
              className={`flex items-center gap-3 px-3.5 py-3 rounded-xl text-xs uppercase tracking-widest font-medium text-left transition-colors ${
                currentPath === '/about'
                  ? 'text-[#D4AF37] bg-black/5 dark:bg-white/5 font-bold'
                  : 'text-neutral-800 hover:text-[#D4AF37] hover:bg-black/5 dark:text-white/80 dark:hover:text-[#D4AF37] dark:hover:bg-white/5'
              }`}
            >
              <Building2 className="w-4 h-4 text-neutral-500 dark:text-white/50 shrink-0" />
              <span className="whitespace-nowrap">About</span>
            </button>

            <button
              onClick={() => handleNav('/contact')}
              className={`flex items-center gap-3 px-3.5 py-3 rounded-xl text-xs uppercase tracking-widest font-medium text-left transition-colors ${
                currentPath === '/contact'
                  ? 'text-[#D4AF37] bg-black/5 dark:bg-white/5 font-bold'
                  : 'text-neutral-800 hover:text-[#D4AF37] hover:bg-black/5 dark:text-white/80 dark:hover:text-[#D4AF37] dark:hover:bg-white/5'
              }`}
            >
              <Phone className="w-4 h-4 text-neutral-500 dark:text-white/50 shrink-0" />
              <span className="whitespace-nowrap">Contact</span>
            </button>

            {/* Mobile Theme Switcher */}
            <div className="pt-2">
              <ThemeSwitcher variant="row" id="mobile-drawer-theme-switcher" />
            </div>

            {/* Bottom Action CTAs inside Drawer */}
            <div className="pt-3 mt-1 border-t border-black/10 dark:border-white/10 flex flex-col gap-2.5">
              <button
                onClick={() => {
                  closeMenus();
                  handleNav('/properties');
                }}
                className="w-full py-3 px-4 rounded-full bg-neutral-900 text-white dark:bg-white dark:text-black hover:bg-[#D4AF37] hover:text-black font-bold text-xs tracking-widest uppercase transition-colors text-center whitespace-nowrap shadow-md"
              >
                Find Property
              </button>

              <button
                onClick={() => {
                  closeMenus();
                  openRequestModal();
                }}
                className="w-full py-3 px-4 rounded-full bg-black/5 hover:bg-black/10 dark:bg-white/10 dark:hover:bg-white/15 text-neutral-900 dark:text-white font-medium text-xs tracking-wider uppercase transition-colors text-center whitespace-nowrap border border-black/10 dark:border-white/10"
              >
                Request Custom Search
              </button>

              <a
                href={whatsappDirect}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-full border border-emerald-600/30 dark:border-emerald-500/40 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-100 font-semibold text-xs uppercase tracking-wider transition-colors whitespace-nowrap"
              >
                <MessageSquare className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span className="whitespace-nowrap">Chat on WhatsApp</span>
              </a>

              {currentUser ? (
                <button
                  onClick={() => handleNav('/admin')}
                  className="w-full py-2.5 px-4 rounded-xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-[#D4AF37] text-xs font-medium uppercase tracking-wider"
                >
                  Admin Dashboard ({currentUser.name})
                </button>
              ) : (
                <button
                  onClick={() => handleNav('/login')}
                  className="w-full py-2.5 px-4 rounded-xl bg-black/5 hover:bg-black/10 dark:bg-white/5 dark:hover:bg-white/10 text-neutral-500 dark:text-white/50 hover:text-neutral-900 dark:hover:text-white text-xs font-medium text-center"
                >
                  Admin Portal Login
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
