import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { useTheme } from '../context/ThemeContext';
import { BrandLogo } from './BrandLogo';
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

  const { isDark } = useTheme();

  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [propertiesDropdownOpen, setPropertiesDropdownOpen] = useState(false);
  const [mobilePropertiesExpanded, setMobilePropertiesExpanded] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
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

  const isHomePage = currentPath === '/';
  const isTransparentHero = isHomePage && !isScrolled;

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
      className={`sa-navbar ${
        isHomePage ? 'fixed top-0 left-0 right-0 z-40 w-full' : 'sticky top-0 z-40 w-full'
      } ${
        isTransparentHero ? 'sa-navbar--home-top' : 'is-scrolled-state'
      } transition-all duration-300 ease-out ${
        mobileMenuOpen
          ? isDark
            ? 'bg-[#0A120C] border-b border-brand-green-sage/20 text-[#F5F5F0]'
            : 'bg-[#FAF7F2] border-b border-black/10 text-[#171717]'
          : isTransparentHero
            ? 'py-3 sm:py-3.5 text-[#F5F5F5]'
            : isDark
              ? 'bg-[#0A120C]/96 backdrop-blur-md border-b border-brand-green-sage/15 py-2.5 sm:py-3 text-[#F5F5F0] shadow-xl shadow-black/40'
              : 'bg-[#FAF7F2]/96 backdrop-blur-md border-b border-black/10 py-2.5 sm:py-3 text-[#171717] shadow-md shadow-black/5'
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

          {/* 2. CENTER ZONE: Primary Desktop Navigation */}
          <nav
            aria-label="Primary Navigation"
            className="hidden xl:flex items-center justify-center gap-1.5 xl:gap-2 2xl:gap-5 text-[11px] xl:text-xs font-semibold uppercase tracking-wider min-w-0"
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
                          ? isTransparentHero || isDark
                            ? 'text-brand-green-sage font-bold'
                            : 'text-brand-green-primary font-bold'
                          : isTransparentHero
                            ? 'text-[#F5F5F5] hover:text-brand-green-sage font-medium'
                            : isDark
                              ? 'text-[#E5E5E5] hover:text-brand-green-sage font-medium'
                              : 'text-neutral-800 hover:text-brand-green-primary font-semibold'
                      }`}
                    >
                      <span className="whitespace-nowrap">{link.label}</span>
                      <ChevronDown
                        className={`w-3.5 h-3.5 transition-transform duration-200 ${
                          propertiesDropdownOpen
                            ? isTransparentHero || isDark ? 'rotate-180 text-brand-green-sage' : 'rotate-180 text-brand-green-primary'
                            : ''
                        } ${
                          isTransparentHero
                            ? 'text-[#F5F5F5]'
                            : isDark
                              ? 'text-[#F5F5F5]'
                              : 'text-neutral-700'
                        }`}
                      />
                    </button>

                    {/* Submenu / Dropdown with guaranteed state styling */}
                    {propertiesDropdownOpen && (
                      <div className="absolute top-full left-0 w-56 pt-2 z-50 animate-in fade-in-50 slide-in-from-top-1 duration-150">
                        <div
                          className={`rounded-xl p-1.5 backdrop-blur-xl border shadow-2xl ${
                            isDark
                              ? 'bg-[#0E1710]/98 border-brand-green-sage/30 shadow-black/85 text-[#F5F5F0]'
                              : 'bg-white/98 border-black/10 shadow-black/15 text-neutral-800'
                          }`}
                        >
                          {link.subItems?.map(sub => {
                            const isSubActive = currentPath === sub.path;
                            return (
                              <button
                                key={sub.path}
                                onClick={() => {
                                  setPropertiesDropdownOpen(false);
                                  handleNav(sub.path);
                                }}
                                className={`sa-dropdown-item w-full text-left px-3.5 py-2.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors uppercase tracking-wider ${
                                  isSubActive
                                    ? isDark
                                      ? 'text-brand-green-sage bg-brand-green-sage/15 font-bold'
                                      : 'text-brand-green-primary bg-brand-green-primary/10 font-bold'
                                    : isDark
                                      ? 'text-[#F5F5F5] hover:text-brand-green-sage hover:bg-white/10'
                                      : 'text-neutral-700 hover:text-brand-green-primary hover:bg-black/5'
                                }`}
                              >
                                <span className="whitespace-nowrap">{sub.label}</span>
                              </button>
                            );
                          })}
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
                      ? isTransparentHero || isDark
                        ? 'text-brand-green-sage font-bold'
                        : 'text-brand-green-primary font-bold'
                      : isTransparentHero
                        ? 'text-[#F5F5F5] hover:text-brand-green-sage font-medium'
                        : isDark
                          ? 'text-[#E5E5E5] hover:text-brand-green-sage font-medium'
                          : 'text-neutral-800 hover:text-brand-green-primary font-semibold'
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
              className={`hidden xl:flex items-center gap-1.5 xl:gap-2 px-2.5 xl:px-3 py-1.5 xl:py-2 rounded-full transition-all text-xs w-[120px] xl:w-[145px] 2xl:w-[200px] max-w-[240px] min-w-[100px] flex-shrink group select-none cursor-pointer border ${
                isTransparentHero
                  ? 'bg-white/10 hover:bg-white/20 text-[#F5F5F5] border-white/25 hover:border-brand-green-sage/60'
                  : isDark
                    ? 'bg-white/5 hover:bg-white/10 text-[#F5F5F5] border-white/15 hover:border-brand-green-sage/40'
                    : 'bg-black/5 hover:bg-black/10 text-[#171717] border-black/10 hover:border-brand-green-primary/30'
              }`}
            >
              <Search
                className={`w-3.5 h-3.5 shrink-0 transition-colors ${
                  isTransparentHero
                    ? 'text-[#F5F5F5] group-hover:text-brand-green-sage'
                    : isDark
                      ? 'text-[#F5F5F5] group-hover:text-brand-green-sage'
                      : 'text-neutral-700 group-hover:text-brand-green-primary'
                }`}
              />
              <span
                className={`truncate whitespace-nowrap overflow-hidden text-ellipsis text-[11px] xl:text-xs select-none font-medium ${
                  isTransparentHero
                    ? 'text-[#E5E5E5] group-hover:text-white'
                    : isDark
                      ? 'text-[#B8B8B8] group-hover:text-white'
                      : 'text-neutral-600 group-hover:text-neutral-900'
                }`}
              >
                Search Ajah...
              </span>
            </button>

            {/* Tablet & Mobile Search Icon Trigger */}
            <button
              id="search-trigger-mobile"
              onClick={openSearchModal}
              title="Search listings"
              className={`xl:hidden p-2 sm:p-2.5 rounded-full transition-all shrink-0 flex items-center justify-center border ${
                isTransparentHero
                  ? 'bg-white/10 hover:bg-white/20 text-[#F5F5F5] border-white/25 hover:border-brand-green-sage/60'
                  : isDark
                    ? 'bg-white/5 hover:bg-white/10 text-[#F5F5F5] border-white/15 hover:border-brand-green-sage/40'
                    : 'bg-black/5 hover:bg-black/10 text-[#171717] border-black/10 hover:border-brand-green-primary/30'
              }`}
              aria-label="Open Search"
            >
              <Search
                className={`w-4 h-4 ${
                  isTransparentHero
                    ? 'text-[#F5F5F5]'
                    : isDark
                      ? 'text-[#F5F5F5]'
                      : 'text-neutral-800'
                }`}
              />
            </button>

            {/* Saved Favorites Trigger */}
            <button
              id="favorites-trigger-btn"
              onClick={() => handleNav('/favorites')}
              title="Saved Properties"
              className={`relative p-2 sm:p-2.5 rounded-full transition-all shrink-0 flex items-center justify-center border ${
                isTransparentHero
                  ? 'bg-white/10 hover:bg-white/20 text-[#F5F5F5] border-white/25 hover:border-brand-green-sage/60'
                  : isDark
                    ? 'bg-white/5 hover:bg-white/10 text-[#F5F5F5] border-white/15 hover:border-brand-green-sage/40'
                    : 'bg-black/5 hover:bg-black/10 text-[#171717] border-black/10 hover:border-brand-green-primary/30'
              }`}
              aria-label="View Saved Wishlist"
            >
              <Heart
                className={`w-3.5 h-3.5 sm:w-4 sm:h-4 transition-colors ${
                  favorites.length > 0
                    ? 'text-rose-500 fill-rose-500'
                    : isTransparentHero
                      ? 'text-[#F5F5F5]'
                      : isDark
                        ? 'text-[#F5F5F5]'
                        : 'text-neutral-700'
                }`}
              />
              {favorites.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-brand-green-primary text-white text-[10px] font-bold rounded-full h-3.5 w-3.5 sm:h-4 sm:w-4 flex items-center justify-center shadow-lg">
                  {favorites.length}
                </span>
              )}
            </button>

            {/* "FIND PROPERTY" CTA */}
            <button
              id="navbar-find-property-btn"
              onClick={() => handleNav('/properties')}
              className={`hidden sm:inline-flex items-center justify-center whitespace-nowrap shrink-0 px-3.5 xl:px-4 py-1.5 xl:py-2 text-[11px] xl:text-xs font-bold uppercase tracking-wider 2xl:tracking-widest rounded-full transition-all active:scale-95 border ${
                isTransparentHero
                  ? 'bg-brand-green-primary hover:bg-brand-green-deep text-white border-brand-green-sage/50 hover:border-brand-green-sage shadow-lg shadow-black/40'
                  : 'bg-brand-green-primary hover:bg-brand-green-deep text-white border-transparent shadow-sm'
              }`}
            >
              <span className="whitespace-nowrap">Find Property</span>
            </button>

            {/* WhatsApp CTA */}
            <a
              id="navbar-whatsapp-cta"
              href={whatsappDirect}
              target="_blank"
              rel="noopener noreferrer"
              className={`hidden sm:inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 px-2.5 xl:px-3 2xl:px-3.5 py-1.5 xl:py-2 rounded-full border text-[11px] xl:text-xs font-semibold uppercase tracking-wider transition-all active:scale-95 ${
                isTransparentHero
                  ? 'border-brand-green-sage/60 bg-brand-green-deep/40 text-brand-green-sage hover:bg-brand-green-deep/60'
                  : isDark
                    ? 'border-brand-green-sage/40 hover:border-brand-green-sage text-brand-green-sage hover:bg-white/5'
                    : 'border-brand-green-primary/40 hover:border-brand-green-primary text-brand-green-primary hover:bg-brand-green-primary/5'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5 text-brand-green-primary dark:text-brand-green-sage shrink-0" />
              <span className="whitespace-nowrap">WhatsApp</span>
            </a>

            {/* Admin Dashboard shortcut if authenticated */}
            {currentUser && (
              <button
                id="navbar-admin-btn"
                onClick={() => handleNav('/admin')}
                className={`hidden 2xl:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium uppercase tracking-wider whitespace-nowrap shrink-0 border ${
                  isTransparentHero
                    ? 'bg-white/10 hover:bg-white/20 text-[#F5F5F5] border-white/25'
                    : isDark
                      ? 'bg-white/5 hover:bg-white/10 text-[#F5F5F5] border-white/15'
                      : 'bg-black/5 hover:bg-black/10 text-[#171717] border-black/12'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5 text-brand-green-primary dark:text-brand-green-sage shrink-0" />
                <span className="whitespace-nowrap">Admin</span>
              </button>
            )}

            {/* Mobile & Tablet Menu Hamburger Toggle */}
            <button
              id="mobile-menu-toggle-btn"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className={`xl:hidden p-2 sm:p-2.5 rounded-full border transition-colors shrink-0 flex items-center justify-center ${
                isTransparentHero
                  ? 'bg-white/10 hover:bg-white/20 text-[#F5F5F5] border-white/25'
                  : isDark
                    ? 'bg-white/5 hover:bg-white/10 text-[#F5F5F5] border-white/15'
                    : 'bg-black/5 hover:bg-black/10 text-[#171717] border-black/12'
              }`}
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? (
                <X className="w-5 h-5 text-brand-green-primary dark:text-brand-green-sage" />
              ) : (
                <Menu
                  className={`w-5 h-5 ${
                    isTransparentHero
                      ? 'text-[#F5F5F5]'
                      : isDark
                        ? 'text-[#F5F5F5]'
                        : 'text-[#171717]'
                  }`}
                />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile & Tablet Drawer Menu */}
      {mobileMenuOpen && (
        <div className={`xl:hidden border-t px-4 pt-4 pb-8 shadow-2xl animate-in slide-in-from-top-2 duration-200 max-h-[calc(100vh-70px)] overflow-y-auto ${
          isDark
            ? 'bg-[#0A120C] border-brand-green-sage/20 text-[#F5F5F0]'
            : 'bg-[#FAF7F2] border-black/10 text-neutral-900'
        }`}>
          <div className="flex flex-col gap-1 max-w-lg mx-auto">
            {/* Quick Search inside Drawer */}
            <div className="mb-3">
              <button
                onClick={() => {
                  closeMenus();
                  openSearchModal();
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border text-xs transition-colors ${
                  isDark
                    ? 'bg-white/5 border-white/10 text-white/70 hover:text-white'
                    : 'bg-black/5 border-black/10 text-neutral-600 hover:text-neutral-900'
                }`}
              >
                <Search className="w-4 h-4 text-brand-green-primary dark:text-brand-green-sage" />
                <span className="whitespace-nowrap">Search Ajah properties and shortlets...</span>
              </button>
            </div>

            {/* Nav links */}
            <button
              onClick={() => handleNav('/')}
              className={`flex items-center gap-3 px-3.5 py-3 rounded-xl text-xs uppercase tracking-widest font-medium text-left transition-colors ${
                currentPath === '/'
                  ? isDark
                    ? 'text-brand-green-sage bg-white/10 font-bold'
                    : 'text-brand-green-primary bg-black/5 font-bold'
                  : isDark
                    ? 'text-white/80 hover:text-brand-green-sage hover:bg-white/5'
                    : 'text-neutral-800 hover:text-brand-green-primary hover:bg-black/5'
              }`}
            >
              <Home className={`w-4 h-4 shrink-0 ${isDark ? 'text-white/50' : 'text-neutral-500'}`} />
              <span className="whitespace-nowrap">Home</span>
            </button>

            {/* Properties Accordion */}
            <div className="flex flex-col">
              <div
                className={`flex items-center justify-between px-3.5 py-3 rounded-xl text-xs uppercase tracking-widest font-medium text-left transition-colors cursor-pointer ${
                  currentPath.startsWith('/properties')
                    ? isDark
                      ? 'text-brand-green-sage bg-white/10 font-bold'
                      : 'text-brand-green-primary bg-black/5 font-bold'
                    : isDark
                      ? 'text-white/80 hover:text-brand-green-sage hover:bg-white/5'
                      : 'text-neutral-800 hover:text-brand-green-primary hover:bg-black/5'
                }`}
                onClick={() => setMobilePropertiesExpanded(!mobilePropertiesExpanded)}
              >
                <div className="flex items-center gap-3" onClick={(e) => { e.stopPropagation(); handleNav('/properties'); }}>
                  <Building2 className={`w-4 h-4 shrink-0 ${isDark ? 'text-white/50' : 'text-neutral-500'}`} />
                  <span className="whitespace-nowrap">Properties</span>
                </div>
                <ChevronDown
                  className={`w-4 h-4 transition-transform duration-200 ${
                    mobilePropertiesExpanded ? 'rotate-180 text-brand-green-primary dark:text-brand-green-sage' : isDark ? 'text-white/50' : 'text-neutral-500'
                  }`}
                />
              </div>

              {mobilePropertiesExpanded && (
                <div className="pl-10 pr-2 py-1 flex flex-col gap-1 border-l-2 border-brand-green-sage/40 ml-5 my-1">
                  <button
                    onClick={() => handleNav('/properties')}
                    className={`py-2 text-left text-xs uppercase tracking-wider transition-colors ${
                      currentPath === '/properties'
                        ? 'text-brand-green-primary dark:text-brand-green-sage font-bold'
                        : isDark
                          ? 'text-white/70 hover:text-brand-green-sage'
                          : 'text-neutral-700 hover:text-brand-green-primary'
                    }`}
                  >
                    All Properties
                  </button>
                  <button
                    onClick={() => handleNav('/properties/sale')}
                    className={`py-2 text-left text-xs uppercase tracking-wider transition-colors ${
                      currentPath === '/properties/sale'
                        ? 'text-brand-green-primary dark:text-brand-green-sage font-bold'
                        : isDark
                          ? 'text-white/70 hover:text-brand-green-sage'
                          : 'text-neutral-700 hover:text-brand-green-primary'
                    }`}
                  >
                    Properties for Sale
                  </button>
                  <button
                    onClick={() => handleNav('/properties/rent')}
                    className={`py-2 text-left text-xs uppercase tracking-wider transition-colors ${
                      currentPath === '/properties/rent'
                        ? 'text-brand-green-primary dark:text-brand-green-sage font-bold'
                        : isDark
                          ? 'text-white/70 hover:text-brand-green-sage'
                          : 'text-neutral-700 hover:text-brand-green-primary'
                    }`}
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
                  ? isDark
                    ? 'text-brand-green-sage bg-white/10 font-bold'
                    : 'text-brand-green-primary bg-black/5 font-bold'
                  : isDark
                    ? 'text-white/80 hover:text-brand-green-sage hover:bg-white/5'
                    : 'text-neutral-800 hover:text-brand-green-primary hover:bg-black/5'
              }`}
            >
              <Building2 className={`w-4 h-4 shrink-0 ${isDark ? 'text-white/50' : 'text-neutral-500'}`} />
              <span className="whitespace-nowrap">Shortlets</span>
            </button>

            <button
              onClick={() => handleNav('/services')}
              className={`flex items-center gap-3 px-3.5 py-3 rounded-xl text-xs uppercase tracking-widest font-medium text-left transition-colors ${
                currentPath.startsWith('/services')
                  ? isDark
                    ? 'text-brand-green-sage bg-white/10 font-bold'
                    : 'text-brand-green-primary bg-black/5 font-bold'
                  : isDark
                    ? 'text-white/80 hover:text-brand-green-sage hover:bg-white/5'
                    : 'text-neutral-800 hover:text-brand-green-primary hover:bg-black/5'
              }`}
            >
              <SlidersHorizontal className={`w-4 h-4 shrink-0 ${isDark ? 'text-white/50' : 'text-neutral-500'}`} />
              <span className="whitespace-nowrap">Services</span>
            </button>

            <button
              onClick={() => handleNav('/about')}
              className={`flex items-center gap-3 px-3.5 py-3 rounded-xl text-xs uppercase tracking-widest font-medium text-left transition-colors ${
                currentPath === '/about'
                  ? isDark
                    ? 'text-brand-green-sage bg-white/10 font-bold'
                    : 'text-brand-green-primary bg-black/5 font-bold'
                  : isDark
                    ? 'text-white/80 hover:text-brand-green-sage hover:bg-white/5'
                    : 'text-neutral-800 hover:text-brand-green-primary hover:bg-black/5'
              }`}
            >
              <Building2 className={`w-4 h-4 shrink-0 ${isDark ? 'text-white/50' : 'text-neutral-500'}`} />
              <span className="whitespace-nowrap">About</span>
            </button>

            <button
              onClick={() => handleNav('/contact')}
              className={`flex items-center gap-3 px-3.5 py-3 rounded-xl text-xs uppercase tracking-widest font-medium text-left transition-colors ${
                currentPath === '/contact'
                  ? isDark
                    ? 'text-brand-green-sage bg-white/10 font-bold'
                    : 'text-brand-green-primary bg-black/5 font-bold'
                  : isDark
                    ? 'text-white/80 hover:text-brand-green-sage hover:bg-white/5'
                    : 'text-neutral-800 hover:text-brand-green-primary hover:bg-black/5'
              }`}
            >
              <Phone className={`w-4 h-4 shrink-0 ${isDark ? 'text-white/50' : 'text-neutral-500'}`} />
              <span className="whitespace-nowrap">Contact</span>
            </button>

            {/* Bottom Action CTAs inside Drawer */}
            <div className={`pt-3 mt-1 border-t flex flex-col gap-2.5 ${isDark ? 'border-white/10' : 'border-black/10'}`}>
              <button
                onClick={() => {
                  closeMenus();
                  handleNav('/properties');
                }}
                className="w-full py-3 px-4 rounded-full bg-brand-green-primary hover:bg-brand-green-deep text-white font-bold text-xs tracking-widest uppercase transition-colors text-center whitespace-nowrap shadow-md"
              >
                Find Property
              </button>

              <button
                onClick={() => {
                  closeMenus();
                  openRequestModal();
                }}
                className={`w-full py-3 px-4 rounded-full font-medium text-xs tracking-wider uppercase transition-colors text-center whitespace-nowrap border ${
                  isDark
                    ? 'bg-white/10 hover:bg-white/15 text-white border-white/10'
                    : 'bg-black/5 hover:bg-black/10 text-neutral-900 border-black/10'
                }`}
              >
                Request Custom Search
              </button>

              <a
                href={whatsappDirect}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-full border border-brand-green-sage/40 bg-brand-green-sage/10 text-brand-green-primary dark:text-brand-green-sage hover:bg-brand-green-sage/20 font-semibold text-xs uppercase tracking-wider transition-colors whitespace-nowrap"
              >
                <MessageSquare className="w-4 h-4 text-brand-green-primary dark:text-brand-green-sage shrink-0" />
                <span className="whitespace-nowrap">Chat on WhatsApp</span>
              </a>

              {currentUser ? (
                <button
                  onClick={() => handleNav('/admin')}
                  className={`w-full py-2.5 px-4 rounded-xl border text-brand-green-primary dark:text-brand-green-sage text-xs font-medium uppercase tracking-wider ${
                    isDark ? 'bg-white/5 border-white/10' : 'bg-black/5 border-black/10'
                  }`}
                >
                  Admin Dashboard ({currentUser.name})
                </button>
              ) : (
                <button
                  onClick={() => handleNav('/login')}
                  className={`w-full py-2.5 px-4 rounded-xl border text-xs font-medium text-center ${
                    isDark
                      ? 'bg-white/5 hover:bg-white/10 border-white/10 text-white/60 hover:text-white'
                      : 'bg-black/5 hover:bg-black/10 border-black/10 text-neutral-600 hover:text-neutral-900'
                  }`}
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
