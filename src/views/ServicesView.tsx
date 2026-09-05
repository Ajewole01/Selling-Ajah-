import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Building2,
  Key,
  Car,
  Sparkles,
  ArrowRight,
  MessageSquare,
  CheckCircle2,
  Compass,
  ArrowUpRight,
  PhoneCall
} from 'lucide-react';
import { formatWhatsAppUrl } from '../utils/formatters';
import { motion, AnimatePresence } from 'motion/react';

export const ServicesView: React.FC = () => {
  const { navigate, openRequestModal, settings } = useApp();

  const services = [
    {
      num: '01',
      id: 'property_sale',
      title: 'Property Sales & Acquisitions',
      category: 'Residential & Commercial Architecture',
      description:
        'Curated luxury homes, contemporary detached duplexes, and prime residential lands across Ajah, Abraham Adesanya, Badore, and Lekki. We handle private buyer representation with direct developer access.',
      deliverables: [
        'Direct developer & private portfolio allocations',
        'Physical on-site inspections & remote video walkthroughs',
        'Transparent title & coordinates conveyance reviews',
        'Stage-of-construction progress documentation'
      ],
      image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80',
      actionLabel: 'Explore Homes For Sale',
      action: () => navigate('/properties?listingType=sale')
    },
    {
      num: '02',
      id: 'property_lease',
      title: 'Long-Term Leasing & Tenancy',
      category: 'Executive Residential Estates',
      description:
        'Representing high-demand gated estates and family residences in secure residential corridors. We match discerning tenants with vetted properties offering seamless documentation.',
      deliverables: [
        'Strictly gated communities with 24/7 security protocol',
        'Clear lease agreements & verified landlord representations',
        'Prompt key handover & move-in condition audits',
        'Commercial & corporate staff accommodation sourcing'
      ],
      image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
      actionLabel: 'Browse Rental Portfolio',
      action: () => navigate('/properties?listingType=rent')
    },
    {
      num: '03',
      id: 'shortlet',
      title: 'Serviced Stays & Shortlets',
      category: 'Concierge Hospitality',
      description:
        'Turnkey serviced apartments and waterfront penthouses crafted for diaspora vacationers, business travelers, and executive weekend retreats. Every stay guarantees uninterrupted comforts.',
      deliverables: [
        '24/7 guaranteed electricity with backup inverter systems',
        'Unlimited high-speed Starlink WiFi connectivity',
        'Private security within guarded estate enclaves',
        'Optional private chef, laundry & housekeeping services'
      ],
      image: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80',
      actionLabel: 'Discover Serviced Stays',
      action: () => navigate('/shortlets')
    },
    {
      num: '04',
      id: 'car_rental',
      title: 'Executive Luxury Mobility',
      category: 'Chauffeured Fleet',
      description:
        'Chauffeured luxury SUVs, Mercedes-Benz G63 AMG, Range Rover Autobiography, and executive vehicles for airport VIP protocols, business conferences, and daily private retainers.',
      deliverables: [
        'Trained, security-vetted professional executive chauffeurs',
        'Murtala Muhammed International Airport (MMIA) greetings',
        'Pristine interior detailing with chilled refreshments',
        'Flexible daily, multi-day, or wedding convoy bookings'
      ],
      image: 'https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=1200&q=80',
      actionLabel: 'View Executive Fleet',
      action: () => navigate('/cars')
    },
    {
      num: '05',
      id: 'consultation',
      title: 'Bespoke Property Sourcing & Consultation',
      category: 'Private Client Advisory',
      description:
        'Searching for specific architectural specifications, unlisted off-market plots, or custom investment packages? Our senior advisors source tailored real estate options matching your precise brief.',
      deliverables: [
        'Custom acquisition searches across the Lekki Peninsula',
        'Diaspora portfolio representation & virtual consultation',
        'Neighborhood livability, flood assessment & road network reviews',
        'Direct coordination with certified conveyancing surveyors'
      ],
      image: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80',
      actionLabel: 'Request Private Consultation',
      action: () => openRequestModal({ service: 'consultation' })
    }
  ];

  const [activeServiceIndex, setActiveServiceIndex] = useState(0);
  const activeService = services[activeServiceIndex];

  return (
    <div className="min-h-screen bg-[#FAF9F5] dark:bg-[#050505] text-neutral-900 dark:text-[#F5F5F0] pb-24 transition-colors duration-200">
      
      {/* Header Banner */}
      <section className="border-b border-black/8 dark:border-white/10 pt-14 pb-16 bg-white dark:bg-[#080808] transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <div className="flex items-center gap-2 mb-3 font-mono">
              <span className="w-6 h-[1.5px] bg-[#D4AF37]" />
              <span className="text-xs font-bold uppercase tracking-widest text-[#D4AF37]">
                Comprehensive Portfolio
              </span>
            </div>
            <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-light text-neutral-900 dark:text-white mb-4 leading-tight">
              Our Services
            </h1>
            <p className="text-neutral-600 dark:text-white/70 text-sm sm:text-base leading-relaxed font-light">
              From residential acquisition and luxury leasing to boutique hospitality and chauffeured mobility, Selling Ajah delivers an integrated standard of excellence across the Lekki Peninsula.
            </p>
          </div>
        </div>
      </section>

      {/* Editorial Interactive Services Index */}
      <section className="py-16 sm:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          {/* Left Column: Editorial Numbered List */}
          <div className="lg:col-span-7 space-y-4">
            {services.map((srv, idx) => {
              const isSelected = activeServiceIndex === idx;
              return (
                <div
                  key={srv.id}
                  onMouseEnter={() => setActiveServiceIndex(idx)}
                  onClick={() => setActiveServiceIndex(idx)}
                  className={`p-6 sm:p-8 rounded-3xl border transition-all duration-300 cursor-pointer ${
                    isSelected
                      ? 'bg-white dark:bg-[#111111] border-[#D4AF37] shadow-xl dark:shadow-none ring-1 ring-[#D4AF37]/30'
                      : 'bg-transparent hover:bg-white/60 dark:hover:bg-[#111111]/60 border-black/8 dark:border-white/10'
                  }`}
                >
                  <div className="flex items-baseline gap-4 mb-2">
                    <span className="font-mono text-base sm:text-lg font-bold text-[#D4AF37]">
                      {srv.num}
                    </span>
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
                        <span className="text-[10px] uppercase font-bold tracking-widest text-neutral-500 dark:text-white/50 font-mono">
                          {srv.category}
                        </span>
                        <ArrowUpRight
                          className={`w-4 h-4 transition-transform duration-300 ${
                            isSelected ? 'text-[#D4AF37] translate-x-0.5 -translate-y-0.5' : 'text-neutral-400 opacity-40'
                          }`}
                        />
                      </div>
                      <h2 className="font-serif text-xl sm:text-2xl font-bold text-neutral-900 dark:text-white group-hover:text-[#D4AF37] transition-colors">
                        {srv.title}
                      </h2>
                    </div>
                  </div>

                  <p className="text-xs sm:text-sm text-neutral-600 dark:text-white/70 leading-relaxed font-light pl-8 sm:pl-9 mb-4">
                    {srv.description}
                  </p>

                  {/* Expanded details when selected */}
                  {isSelected && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="pl-8 sm:pl-9 pt-4 border-t border-black/5 dark:border-white/5 space-y-3"
                    >
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-neutral-700 dark:text-white/80">
                        {srv.deliverables.map((d, dIdx) => (
                          <div key={dIdx} className="flex items-center gap-2">
                            <CheckCircle2 className="w-3.5 h-3.5 text-[#D4AF37] shrink-0" />
                            <span>{d}</span>
                          </div>
                        ))}
                      </div>

                      <div className="pt-4 flex items-center gap-3">
                        <button
                          onClick={e => {
                            e.stopPropagation();
                            srv.action();
                          }}
                          className="px-5 py-2.5 rounded-full bg-[#D4AF37] hover:bg-[#c49f2f] text-black font-bold text-xs uppercase tracking-wider transition-colors shadow-md shadow-[#D4AF37]/20 flex items-center gap-2 font-mono"
                        >
                          <span>{srv.actionLabel}</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </motion.div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Right Column: Sticky Editorial Showcase Preview (Desktop) */}
          <div className="hidden lg:block lg:col-span-5 sticky top-28">
            <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-black/10 dark:border-white/10 aspect-[4/5] bg-neutral-900">
              <AnimatePresence mode="wait">
                <motion.img
                  key={activeService.image}
                  src={activeService.image}
                  alt={activeService.title}
                  initial={{ opacity: 0, scale: 1.04 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.45 }}
                  className="w-full h-full object-cover"
                />
              </AnimatePresence>

              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />

              <div className="absolute bottom-6 left-6 right-6 text-white">
                <div className="text-xs uppercase font-bold tracking-widest text-[#D4AF37] mb-1 font-mono">
                  {activeService.num} // {activeService.category}
                </div>
                <h3 className="font-serif text-2xl font-bold mb-2">
                  {activeService.title}
                </h3>
                <p className="text-xs text-white/80 line-clamp-3 font-light leading-relaxed">
                  {activeService.description}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Direct Advisory Desk Banner */}
      <section className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-neutral-100 dark:bg-[#111111] border border-black/8 dark:border-white/10 rounded-3xl p-8 sm:p-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <span className="text-[#D4AF37] text-xs font-bold uppercase tracking-widest block mb-1 font-mono">
              Direct Engagement
            </span>
            <h3 className="font-serif text-2xl font-bold text-neutral-900 dark:text-white mb-1">
              Need a personalized recommendation?
            </h3>
            <p className="text-xs text-neutral-600 dark:text-white/60 font-light">
              Speak directly with an advisor regarding inspections, acquisition briefs, or stay reservations.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <a
              href={formatWhatsAppUrl(settings.whatsapp, "Hello Selling Ajah, I'd like to inquire about your services.")}
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 py-3 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs uppercase tracking-wider flex items-center gap-2 transition-colors shadow-md shadow-emerald-600/20 font-mono"
            >
              <MessageSquare className="w-4 h-4" />
              <span>WhatsApp Direct</span>
            </a>
            <button
              onClick={() => openRequestModal()}
              className="px-5 py-3 rounded-full bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20 text-neutral-900 dark:text-white font-semibold text-xs uppercase tracking-wider transition-colors border border-black/10 dark:border-transparent font-mono"
            >
              Custom Brief Form
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
