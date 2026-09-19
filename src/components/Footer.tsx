import React from 'react';
import { useApp } from '../context/AppContext';
import { BrandLogo } from './BrandLogo';
import {
  MapPin,
  Phone,
  Mail,
  MessageSquare,
  ShieldCheck,
  Clock,
  ArrowRight,
  Instagram,
  Facebook,
  Twitter,
  Linkedin,
  Youtube
} from 'lucide-react';
import { formatWhatsAppUrl } from '../utils/formatters';

export const Footer: React.FC = () => {
  const { navigate, settings, openRequestModal } = useApp();

  const areas = [
    { name: 'Ajah', query: 'Ajah' },
    { name: 'Abraham Adesanya', query: 'Abraham Adesanya' },
    { name: 'Sangotedo', query: 'Sangotedo' },
    { name: 'Ikota', query: 'Ikota' },
    { name: 'Chevron', query: 'Chevron' },
    { name: 'VGC', query: 'VGC' },
    { name: 'Orchid Road', query: 'Orchid Road' }
  ];

  const quickLinks = [
    { label: 'Properties for Sale', path: '/properties/sale' },
    { label: 'Properties for Rent', path: '/properties/rent' },
    { label: 'Serviced Shortlets', path: '/shortlets' },
    { label: 'Our Services', path: '/services' },
    { label: 'About Selling Ajah', path: '/about' },
    { label: 'Frequently Asked Questions', path: '/faq' },
    { label: 'Contact Us', path: '/contact' }
  ];

  const whatsappUrl = formatWhatsAppUrl(settings.whatsapp, "Hello Selling Ajah, I would like to make an enquiry.");

  return (
    <footer className="sa-footer bg-neutral-100 dark:bg-[#070D09] text-neutral-600 dark:text-white/70 border-t border-black/10 dark:border-brand-green-sage/20 pt-16 pb-24 lg:pb-12 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Call to Action Banner */}
        <div id="footer-cta-banner" className="relative rounded-2xl bg-white dark:bg-[#0E1710] border border-brand-green-sage/25 p-8 sm:p-10 mb-16 overflow-hidden shadow-xl dark:shadow-2xl transition-colors">
          <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-brand-green-primary/5 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div>
              <span id="footer-advisors-badge" className="text-brand-green-primary dark:text-brand-green-sage text-[11px] font-bold uppercase tracking-widest flex items-center gap-1.5 mb-2">
                <ShieldCheck className="w-4 h-4 text-brand-green-primary dark:text-brand-green-sage" />
                Trusted Ajah Property Advisors
              </span>
              <h3 id="footer-custom-search-heading" className="font-serif text-2xl sm:text-3xl font-bold text-neutral-900 dark:text-white mb-2">
                Looking for a specific property or land in Ajah?
              </h3>
              <p id="footer-custom-search-description" className="text-neutral-600 dark:text-neutral-300 text-sm max-w-2xl font-light">
                Our local advisory team curates verified off-market listings, affordable homes, and payment-plan opportunities tailored precisely to your budget and investment goals.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <button
                id="footer-request-custom-btn"
                onClick={() => openRequestModal()}
                className="px-6 py-3 rounded-full bg-brand-green-primary hover:bg-brand-green-deep text-white font-bold text-xs uppercase tracking-wider transition-all shadow-lg flex items-center gap-2"
              >
                <span>Request Custom Search</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <a
                id="footer-whatsapp-btn"
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3 rounded-full border border-brand-green-sage/50 hover:border-brand-green-sage text-brand-green-primary dark:text-brand-green-sage hover:bg-brand-green-sage/10 font-semibold text-xs tracking-wider transition-all flex items-center gap-2"
              >
                <MessageSquare className="w-4 h-4" />
                <span>WhatsApp Advisor</span>
              </a>
            </div>
          </div>
        </div>

        {/* 4-Column Directory Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 mb-14">
          {/* Brand Info */}
          <div className="lg:col-span-2">
            <BrandLogo size="lg" className="mb-4" />
            <p className="text-neutral-600 dark:text-white/60 text-xs sm:text-sm leading-relaxed mb-6 max-w-sm font-light">
              Selling Ajah is your verified guide to prime residential homes, flexible payment-plan developments, commercial land, and serviced shortlets across the Ajah corridor.
            </p>
            <div className="flex items-center gap-3">
              <a
                href={settings.socialLinks.instagram || '#'}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-white dark:bg-[#121E14] border border-black/8 dark:border-white/10 flex items-center justify-center text-neutral-500 dark:text-white/50 hover:text-brand-green-primary dark:hover:text-brand-green-sage hover:border-brand-green-sage/40 transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a
                href={settings.socialLinks.facebook || '#'}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-white dark:bg-[#121E14] border border-black/8 dark:border-white/10 flex items-center justify-center text-neutral-500 dark:text-white/50 hover:text-brand-green-primary dark:hover:text-brand-green-sage hover:border-brand-green-sage/40 transition-colors"
                aria-label="Facebook"
              >
                <Facebook className="w-4 h-4" />
              </a>
              <a
                href={settings.socialLinks.twitter || '#'}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-white dark:bg-[#121E14] border border-black/8 dark:border-white/10 flex items-center justify-center text-neutral-500 dark:text-white/50 hover:text-brand-green-primary dark:hover:text-brand-green-sage hover:border-brand-green-sage/40 transition-colors"
                aria-label="Twitter"
              >
                <Twitter className="w-4 h-4" />
              </a>
              <a
                href={settings.socialLinks.linkedin || '#'}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-white dark:bg-[#121E14] border border-black/8 dark:border-white/10 flex items-center justify-center text-neutral-500 dark:text-white/50 hover:text-brand-green-primary dark:hover:text-brand-green-sage hover:border-brand-green-sage/40 transition-colors"
                aria-label="LinkedIn"
              >
                <Linkedin className="w-4 h-4" />
              </a>
              <a
                href={settings.socialLinks.youtube || '#'}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-white dark:bg-[#121E14] border border-black/8 dark:border-white/10 flex items-center justify-center text-neutral-500 dark:text-white/50 hover:text-brand-green-primary dark:hover:text-brand-green-sage hover:border-brand-green-sage/40 transition-colors"
                aria-label="YouTube"
              >
                <Youtube className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Explore Links */}
          <div>
            <h4 className="text-brand-green-primary dark:text-brand-green-sage text-xs uppercase tracking-widest font-bold mb-4 font-mono">
              Explore
            </h4>
            <ul className="space-y-2.5">
              {quickLinks.map(link => (
                <li key={link.path}>
                  <button
                    onClick={() => navigate(link.path)}
                    className="text-neutral-600 dark:text-white/60 hover:text-brand-green-primary dark:hover:text-brand-green-sage text-xs sm:text-sm transition-colors text-left"
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Key Locations */}
          <div>
            <h4 className="text-brand-green-primary dark:text-brand-green-sage text-xs uppercase tracking-widest font-bold mb-4 font-mono">
              Ajah Corridor
            </h4>
            <ul className="space-y-2.5">
              {areas.map(area => (
                <li key={area.name}>
                  <button
                    onClick={() => navigate(`/properties?area=${encodeURIComponent(area.query)}`)}
                    className="text-neutral-600 dark:text-white/60 hover:text-brand-green-primary dark:hover:text-brand-green-sage text-xs sm:text-sm transition-colors text-left"
                  >
                    {area.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Details */}
          <div>
            <h4 className="text-brand-green-primary dark:text-brand-green-sage text-xs uppercase tracking-widest font-bold mb-4 font-mono">
              Ajah Office
            </h4>
            <div className="space-y-3.5 text-xs text-neutral-600 dark:text-white/60">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-brand-green-primary dark:text-brand-green-sage shrink-0 mt-0.5" />
                <span className="leading-snug">{settings.officeAddress}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-brand-green-primary dark:text-brand-green-sage shrink-0" />
                <a href={`tel:${settings.phone.replace(/[^0-9+]/g, '')}`} className="hover:text-neutral-900 dark:hover:text-white transition-colors">
                  {settings.phone}
                </a>
              </div>
              <div className="flex items-center gap-2.5">
                <MessageSquare className="w-4 h-4 text-brand-green-primary dark:text-brand-green-sage shrink-0" />
                <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="hover:text-neutral-900 dark:hover:text-white transition-colors">
                  WhatsApp: {settings.whatsapp}
                </a>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-brand-green-primary dark:text-brand-green-sage shrink-0" />
                <a href={`mailto:${settings.email}`} className="hover:text-neutral-900 dark:hover:text-white transition-colors">
                  {settings.email}
                </a>
              </div>
              <div className="flex items-center gap-2.5">
                <Clock className="w-4 h-4 text-neutral-400 dark:text-white/40 shrink-0" />
                <span>{settings.businessHours}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar: Copyright, Legal & Admin Link */}
        <div className="border-t border-black/8 dark:border-white/10 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-neutral-500 dark:text-white/40">
          <p>© {new Date().getFullYear()} Selling Ajah Ltd. All rights reserved. RC: 1892041.</p>
          <div className="flex items-center gap-6">
            <button onClick={() => navigate('/privacy')} className="hover:text-neutral-900 dark:hover:text-white transition-colors">
              Privacy Policy
            </button>
            <button onClick={() => navigate('/terms')} className="hover:text-neutral-900 dark:hover:text-white transition-colors">
              Terms of Service
            </button>
            <button onClick={() => navigate('/login')} className="hover:text-neutral-900 dark:hover:text-white transition-colors">
              Staff Portal
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
