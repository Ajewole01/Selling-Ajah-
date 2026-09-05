import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Property, ServicedApartment, LuxuryVehicle, Testimonial } from '../types';
import { PropertyCard } from '../components/PropertyCard';
import { ApartmentCard } from '../components/ApartmentCard';
import { VehicleCard } from '../components/VehicleCard';
import {
  Search,
  Building2,
  Key,
  Car,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  MapPin,
  Star,
  Users,
  Video,
  ChevronRight,
  PhoneCall,
  MessageSquare,
  Bed,
  Bath,
  ArrowUpRight,
  Compass,
  FileCheck,
  Zap,
  SlidersHorizontal
} from 'lucide-react';
import { formatNaira, formatWhatsAppUrl } from '../utils/formatters';
import { motion } from 'motion/react';

export const HomeView: React.FC = () => {
  const { navigate, openAiModal, openRequestModal, settings, isFavorite, toggleFavorite, addToast } = useApp();

  const [properties, setProperties] = useState<Property[]>([]);
  const [apartments, setApartments] = useState<ServicedApartment[]>([]);
  const [vehicles, setVehicles] = useState<LuxuryVehicle[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);

  // Hero Search Filter State
  const [searchTab, setSearchTab] = useState<'sale' | 'rent' | 'shortlet'>('sale');
  const [selectedArea, setSelectedArea] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedBeds, setSelectedBeds] = useState('all');
  const [selectedMaxPrice, setSelectedMaxPrice] = useState('all');

  // Location showcase active tab
  const [activeLocationIndex, setActiveLocationIndex] = useState(0);

  useEffect(() => {
    Promise.all([
      fetch('/api/properties?featured=true').then(r => r.json()),
      fetch('/api/apartments?featured=true').then(r => r.json()),
      fetch('/api/vehicles?featured=true').then(r => r.json()),
      fetch('/api/testimonials').then(r => r.json())
    ])
      .then(([props, apts, vehs, tests]) => {
        setProperties(Array.isArray(props) ? props : []);
        setApartments(Array.isArray(apts) ? apts : []);
        setVehicles(Array.isArray(vehs) ? vehs : []);
        setTestimonials(Array.isArray(tests) ? tests : []);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const handleHeroSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTab === 'shortlet') {
      let query = `/shortlets?`;
      if (selectedArea !== 'all') query += `area=${encodeURIComponent(selectedArea)}&`;
      navigate(query);
      return;
    }

    let query = `/properties?listingType=${searchTab}&`;
    if (selectedArea !== 'all') query += `area=${encodeURIComponent(selectedArea)}&`;
    if (selectedType !== 'all') query += `type=${encodeURIComponent(selectedType)}&`;
    if (selectedBeds !== 'all') query += `bedrooms=${selectedBeds}&`;
    if (selectedMaxPrice !== 'all') query += `maxPrice=${selectedMaxPrice}&`;
    navigate(query);
  };

  const areas = [
    { label: 'Ajah Main', value: 'Ajah' },
    { label: 'Badore', value: 'Badore' },
    { label: 'Abraham Adesanya', value: 'Abraham Adesanya' },
    { label: 'Sangotedo', value: 'Sangotedo' },
    { label: 'Chevron Toll Gate', value: 'Chevron' },
    { label: 'Victoria Garden City (VGC)', value: 'VGC' },
    { label: 'Ikota', value: 'Ikota' },
    { label: 'Orchid Road', value: 'Orchid' }
  ];

  const locationStories = [
    {
      name: 'Ajah & Badore',
      tagline: 'Coastal Waterfront & Established Enclaves',
      description: 'Lush waterfront developments, private boat jetties, and serene family residential estates with direct access to Lekki.',
      image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
      areaQuery: 'Ajah',
      vibe: 'Waterfront & Tranquil'
    },
    {
      name: 'Abraham Adesanya',
      tagline: 'The Contemporary Expansion Corridor',
      description: 'Rapidly emerging luxury gated communities, newly developed contemporary duplexes, and prime accessibility along the expressway.',
      image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80',
      areaQuery: 'Abraham Adesanya',
      vibe: 'Modern Residential'
    },
    {
      name: 'Victoria Garden City & Ikota',
      tagline: 'Legacy Prestige & High-Density Luxury',
      description: 'Mature infrastructure, tight estate security, paved boulevards, and elite architectural residences favoured by corporate leaders.',
      image: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80',
      areaQuery: 'VGC',
      vibe: 'Legacy & Prestige'
    },
    {
      name: 'Orchid Road & Chevron',
      tagline: 'Dynamic PropTech & High Rental Yields',
      description: 'High rental demand axis featuring luxury serviced apartments, boutique penthouses, and vibrant hospitality hotspots.',
      image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80',
      areaQuery: 'Orchid',
      vibe: 'High Yield & Hospitality'
    }
  ];

  const primaryFeatured = properties[0];
  const supportingFeatured = properties.slice(1, 3);
  const remainingFeatured = properties.slice(3, 6);

  return (
    <div className="min-h-screen bg-[#FAF9F5] dark:bg-[#050505] text-neutral-900 dark:text-[#F5F5F0] selection:bg-[#D4AF37] selection:text-black transition-colors duration-200">
      
      {/* 1. CINEMATIC EDITORIAL HERO CHAPTER */}
      <section className="relative min-h-[92vh] flex flex-col justify-center pt-8 sm:pt-12 pb-16 sm:pb-24 overflow-hidden">
        {/* Architectural photography background with controlled exposure */}
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=2400&q=85"
            alt="Selling Ajah Luxury Real Estate in Lagos"
            className="w-full h-full object-cover object-center filter brightness-[0.42] contrast-[1.08] scale-100 transition-transform duration-1000 ease-out"
          />
          {/* Subtle multi-tier gradient mask allowing architecture to remain visible */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#050505]/75 via-[#050505]/50 to-[#FAF9F5] dark:to-[#050505]" />
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-[#D4AF37]/12 rounded-full blur-[180px] pointer-events-none" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          {/* Refined Eyebrow */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex items-center justify-center gap-2 mb-6"
          >
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-black/60 backdrop-blur-md border border-[#D4AF37]/40 text-[#D4AF37] text-[11px] font-semibold tracking-widest uppercase font-mono">
              <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
              Ajah & Lekki Real Estate & Lifestyle
            </span>
          </motion.div>

          {/* Editorial Display Headline */}
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="text-center mb-8 max-w-5xl mx-auto"
          >
            <h1 className="font-serif text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-light tracking-tight text-white mb-6 leading-[1.06]">
              Find Your Place <br className="hidden sm:inline" /> in{' '}
              <span className="text-[#D4AF37] font-normal italic drop-shadow-sm">Ajah.</span>
            </h1>

            <p className="text-white/85 text-base sm:text-lg md:text-xl max-w-2xl mx-auto leading-relaxed font-light">
              Curated residences for sale and rent, serviced waterfront shortlets, and executive chauffeur mobility across Ajah, Lekki, and greater Lagos.
            </p>
          </motion.div>

          {/* Integrated Search Console Card */}
          <motion.div
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="max-w-4xl mx-auto bg-white/95 dark:bg-[#111111]/92 backdrop-blur-2xl border border-black/10 dark:border-white/10 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-2xl transition-colors"
          >
            {/* Search Tabs: Buy / Rent / Shortlets */}
            <div className="flex items-center gap-2 border-b border-black/8 dark:border-white/10 pb-3.5 mb-5">
              <button
                id="hero-tab-buy"
                type="button"
                onClick={() => setSearchTab('sale')}
                className={`px-5 py-2 rounded-xl text-xs sm:text-sm font-semibold uppercase tracking-wider transition-all cursor-pointer ${
                  searchTab === 'sale'
                    ? 'bg-[#D4AF37] text-black shadow-md shadow-[#D4AF37]/20 font-bold'
                    : 'text-neutral-600 hover:text-neutral-900 hover:bg-black/5 dark:text-white/60 dark:hover:text-white dark:hover:bg-white/5'
                }`}
              >
                Buy Properties
              </button>
              <button
                id="hero-tab-rent"
                type="button"
                onClick={() => setSearchTab('rent')}
                className={`px-5 py-2 rounded-xl text-xs sm:text-sm font-semibold uppercase tracking-wider transition-all cursor-pointer ${
                  searchTab === 'rent'
                    ? 'bg-[#D4AF37] text-black shadow-md shadow-[#D4AF37]/20 font-bold'
                    : 'text-neutral-600 hover:text-neutral-900 hover:bg-black/5 dark:text-white/60 dark:hover:text-white dark:hover:bg-white/5'
                }`}
              >
                Rent / Lease
              </button>
              <button
                id="hero-tab-shortlet"
                type="button"
                onClick={() => setSearchTab('shortlet')}
                className={`px-5 py-2 rounded-xl text-xs sm:text-sm font-semibold uppercase tracking-wider transition-all cursor-pointer ${
                  searchTab === 'shortlet'
                    ? 'bg-[#D4AF37] text-black shadow-md shadow-[#D4AF37]/20 font-bold'
                    : 'text-neutral-600 hover:text-neutral-900 hover:bg-black/5 dark:text-white/60 dark:hover:text-white dark:hover:bg-white/5'
                }`}
              >
                Serviced Shortlets
              </button>
            </div>

            {/* Filter Controls Form */}
            <form onSubmit={handleHeroSearch} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-left">
              {/* Location */}
              <div>
                <label className="block text-[10px] font-bold text-neutral-500 dark:text-white/50 uppercase tracking-widest mb-1.5 px-1 font-mono">
                  Location
                </label>
                <select
                  value={selectedArea}
                  onChange={e => setSelectedArea(e.target.value)}
                  className="w-full bg-neutral-100 dark:bg-[#050505] border border-black/10 dark:border-white/15 rounded-xl px-3 py-2.5 text-xs text-neutral-900 dark:text-white outline-none focus:border-[#D4AF37] transition-colors"
                >
                  <option value="all">All Locations (Ajah & Lekki)</option>
                  <option value="Ajah">Ajah Main</option>
                  <option value="Badore">Badore Waterfront</option>
                  <option value="Abraham Adesanya">Abraham Adesanya</option>
                  <option value="Sangotedo">Sangotedo</option>
                  <option value="Chevron">Chevron Toll Gate</option>
                  <option value="VGC">Victoria Garden City (VGC)</option>
                  <option value="Ikota">Ikota</option>
                  <option value="Orchid">Orchid Road</option>
                </select>
              </div>

              {/* Property Type or Group Size */}
              {searchTab === 'shortlet' ? (
                <div>
                  <label className="block text-[10px] font-bold text-neutral-500 dark:text-white/50 uppercase tracking-widest mb-1.5 px-1 font-mono">
                    Guests
                  </label>
                  <select
                    value={selectedBeds}
                    onChange={e => setSelectedBeds(e.target.value)}
                    className="w-full bg-neutral-100 dark:bg-[#050505] border border-black/10 dark:border-white/15 rounded-xl px-3 py-2.5 text-xs text-neutral-900 dark:text-white outline-none focus:border-[#D4AF37] transition-colors"
                  >
                    <option value="all">Any Group Size</option>
                    <option value="2">Up to 2 Guests</option>
                    <option value="4">Up to 4 Guests</option>
                    <option value="6">Up to 6 Guests</option>
                    <option value="8">8+ Guests (Luxury Villas)</option>
                  </select>
                </div>
              ) : (
                <div>
                  <label className="block text-[10px] font-bold text-neutral-500 dark:text-white/50 uppercase tracking-widest mb-1.5 px-1 font-mono">
                    Property Type
                  </label>
                  <select
                    value={selectedType}
                    onChange={e => setSelectedType(e.target.value)}
                    className="w-full bg-neutral-100 dark:bg-[#050505] border border-black/10 dark:border-white/15 rounded-xl px-3 py-2.5 text-xs text-neutral-900 dark:text-white outline-none focus:border-[#D4AF37] transition-colors"
                  >
                    <option value="all">All Property Types</option>
                    <option value="Detached Duplex">Detached Duplex</option>
                    <option value="Semi Detached">Semi-Detached</option>
                    <option value="Terrace">Terrace Duplex</option>
                    <option value="Penthouse">Penthouse / Luxury Flat</option>
                    <option value="Mansion">Luxury Mansion</option>
                    <option value="Land">Land / Plots</option>
                  </select>
                </div>
              )}

              {/* Bedrooms or Price */}
              <div>
                <label className="block text-[10px] font-bold text-neutral-500 dark:text-white/50 uppercase tracking-widest mb-1.5 px-1 font-mono">
                  {searchTab === 'shortlet' ? 'Nightly Budget' : 'Bedrooms'}
                </label>
                {searchTab === 'shortlet' ? (
                  <select
                    value={selectedMaxPrice}
                    onChange={e => setSelectedMaxPrice(e.target.value)}
                    className="w-full bg-neutral-100 dark:bg-[#050505] border border-black/10 dark:border-white/15 rounded-xl px-3 py-2.5 text-xs text-neutral-900 dark:text-white outline-none focus:border-[#D4AF37] transition-colors"
                  >
                    <option value="all">Any Price</option>
                    <option value="100000">Up to ₦100,000 / night</option>
                    <option value="200000">Up to ₦200,000 / night</option>
                    <option value="300000">Up to ₦300,000 / night</option>
                  </select>
                ) : (
                  <select
                    value={selectedBeds}
                    onChange={e => setSelectedBeds(e.target.value)}
                    className="w-full bg-neutral-100 dark:bg-[#050505] border border-black/10 dark:border-white/15 rounded-xl px-3 py-2.5 text-xs text-neutral-900 dark:text-white outline-none focus:border-[#D4AF37] transition-colors"
                  >
                    <option value="all">Any Bedrooms</option>
                    <option value="2">2+ Bedrooms</option>
                    <option value="3">3+ Bedrooms</option>
                    <option value="4">4+ Bedrooms</option>
                    <option value="5">5+ Bedrooms</option>
                  </select>
                )}
              </div>

              {/* Search CTA Button */}
              <div className="flex items-end">
                <button
                  id="hero-search-submit-btn"
                  type="submit"
                  className="w-full py-2.5 px-4 rounded-xl bg-[#D4AF37] hover:bg-[#c49f2f] text-black font-bold text-xs uppercase tracking-wider transition-all shadow-lg shadow-[#D4AF37]/25 flex items-center justify-center gap-2 h-[42px] cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
                >
                  <Search className="w-4 h-4" />
                  <span>Search Portfolio</span>
                </button>
              </div>
            </form>
          </motion.div>

          {/* Quick Location Pills */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 mt-8 text-[11px] uppercase tracking-wider text-neutral-300"
          >
            <span className="font-bold text-white/50 font-mono">Trending Sectors:</span>
            {areas.map(area => (
              <button
                key={area.value}
                onClick={() => navigate(`/properties?area=${encodeURIComponent(area.value)}`)}
                className="hover:text-[#D4AF37] transition-colors cursor-pointer border-b border-transparent hover:border-[#D4AF37]"
              >
                {area.label}
              </button>
            ))}
          </motion.div>
        </div>
      </section>

      {/* 2. EDITORIAL PROPERTY DISCOVERY & FLAGSHIP RESIDENCE CHAPTER */}
      <section className="py-20 sm:py-28 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-black/8 dark:border-white/10 pb-6 mb-12 gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2 font-mono">
              <span className="w-6 h-[1.5px] bg-[#D4AF37]" />
              <span className="text-xs font-bold uppercase tracking-widest text-[#D4AF37]">
                Curated Architecture
              </span>
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-light text-neutral-900 dark:text-white">
              Featured Properties
            </h2>
            <p className="text-neutral-500 dark:text-white/60 text-xs sm:text-sm mt-2 max-w-xl font-light">
              Selected contemporary residences, detached duplexes, and executive homes across prime Ajah residential corridors.
            </p>
          </div>

          <button
            id="view-all-properties-home-btn"
            onClick={() => navigate('/properties')}
            className="inline-flex items-center gap-2 text-xs uppercase tracking-widest font-bold text-[#D4AF37] hover:text-[#b89528] transition-colors group cursor-pointer self-start md:self-auto font-mono"
          >
            <span>Explore All Properties</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-96 rounded-2xl bg-neutral-200 dark:bg-[#111111] animate-pulse border border-black/5 dark:border-white/5" />
            ))}
          </div>
        ) : (
          <div className="space-y-8">
            {/* Primary Asymmetric Showcase Card (1 Major Flagship + 2 Supporting) */}
            {primaryFeatured && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
                {/* Large Heroic Featured Property (Spans 7 columns on desktop) */}
                <div
                  id={`primary-featured-card-${primaryFeatured.id}`}
                  onClick={() => navigate(`/properties/${primaryFeatured.slug}`)}
                  className="lg:col-span-7 group relative bg-white dark:bg-[#111111] border border-black/8 dark:border-white/10 hover:border-[#D4AF37]/60 rounded-3xl overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 flex flex-col cursor-pointer"
                >
                  <div className="relative aspect-[16/10] sm:aspect-[16/9] lg:aspect-auto lg:h-[460px] overflow-hidden bg-neutral-900">
                    <img
                      src={primaryFeatured.mainImage}
                      alt={primaryFeatured.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/25 to-black/30" />

                    {/* Badges */}
                    <div className="absolute top-4 left-4 flex items-center gap-2 z-10">
                      <span className="bg-[#D4AF37] text-black text-[11px] font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-md font-mono">
                        Flagship Residence
                      </span>
                      <span className="bg-black/80 backdrop-blur-md border border-[#D4AF37]/40 text-[#D4AF37] text-[10px] font-medium px-2.5 py-0.5 rounded-full uppercase tracking-wider font-mono">
                        {primaryFeatured.area}
                      </span>
                    </div>

                    {/* Floating Price & Meta on image bottom */}
                    <div className="absolute bottom-5 left-5 right-5 z-10">
                      <div className="text-2xl sm:text-3xl lg:text-4xl font-serif font-bold text-[#D4AF37] tracking-tight drop-shadow-md mb-2">
                        {formatNaira(primaryFeatured.price)}
                      </div>
                      <h3 className="font-serif text-xl sm:text-2xl font-bold text-white mb-2 line-clamp-1 group-hover:text-[#D4AF37] transition-colors">
                        {primaryFeatured.title}
                      </h3>
                      <div className="flex items-center gap-2 text-xs text-white/80">
                        <MapPin className="w-3.5 h-3.5 text-[#D4AF37]" />
                        <span>{primaryFeatured.location}</span>
                      </div>
                    </div>
                  </div>

                  {/* Primary card summary footer */}
                  <div className="p-6 flex flex-wrap items-center justify-between gap-4 border-t border-black/8 dark:border-white/10 bg-neutral-50/50 dark:bg-[#0c0c0c]">
                    <div className="flex items-center gap-5 text-xs text-neutral-600 dark:text-white/70 font-medium">
                      {primaryFeatured.bedrooms > 0 && (
                        <div className="flex items-center gap-1.5">
                          <Bed className="w-4 h-4 text-[#D4AF37]" />
                          <span>{primaryFeatured.bedrooms} Bedrooms</span>
                        </div>
                      )}
                      {primaryFeatured.bathrooms > 0 && (
                        <div className="flex items-center gap-1.5">
                          <Bath className="w-4 h-4 text-[#D4AF37]" />
                          <span>{primaryFeatured.bathrooms} Baths</span>
                        </div>
                      )}
                      <div className="flex items-center gap-1.5 font-mono text-[#D4AF37]">
                        <span>Ref: {primaryFeatured.refNumber}</span>
                      </div>
                    </div>

                    <span className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-[#D4AF37] group-hover:translate-x-1 transition-transform font-mono">
                      <span>View Dossier</span>
                      <ArrowUpRight className="w-4 h-4" />
                    </span>
                  </div>
                </div>

                {/* 2 Supporting Properties (Spans 5 columns on desktop) */}
                <div className="lg:col-span-5 flex flex-col gap-6">
                  {supportingFeatured.map(prop => (
                    <PropertyCard key={prop.id} property={prop} />
                  ))}
                </div>
              </div>
            )}

            {/* Next Row of Curated Properties */}
            {remainingFeatured.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
                {remainingFeatured.map(prop => (
                  <PropertyCard key={prop.id} property={prop} />
                ))}
              </div>
            )}
          </div>
        )}
      </section>

      {/* 3. LOCATION DISCOVERY CHAPTER: AJAH MICRO-MARKETS */}
      <section className="py-20 sm:py-28 bg-neutral-100/70 dark:bg-[#080808] border-t border-black/8 dark:border-white/10 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mb-12">
            <div className="flex items-center gap-2 mb-2 font-mono">
              <span className="w-6 h-[1.5px] bg-[#D4AF37]" />
              <span className="text-xs font-bold uppercase tracking-widest text-[#D4AF37]">
                Local Expertise
              </span>
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-light text-neutral-900 dark:text-white">
              The Ajah Micro-Markets
            </h2>
            <p className="text-neutral-500 dark:text-white/60 text-xs sm:text-sm mt-2 font-light">
              From waterfront tranquil havens in Badore to prestigious gated enclaves in VGC, explore neighborhoods tailored to your lifestyle.
            </p>
          </div>

          {/* Interactive Location Showcase Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {locationStories.map((loc, idx) => (
              <div
                key={idx}
                onClick={() => navigate(`/properties?area=${encodeURIComponent(loc.areaQuery)}`)}
                className="group relative bg-white dark:bg-[#111111] border border-black/8 dark:border-white/10 hover:border-[#D4AF37]/60 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col cursor-pointer"
              >
                <div className="relative aspect-[4/3] overflow-hidden bg-neutral-900">
                  <img
                    src={loc.image}
                    alt={loc.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
                  <span className="absolute top-3 left-3 bg-black/75 backdrop-blur-md border border-[#D4AF37]/40 text-[#D4AF37] text-[10px] font-mono font-semibold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                    {loc.vibe}
                  </span>
                  <div className="absolute bottom-3 left-3 right-3 text-white">
                    <h3 className="font-serif text-lg font-bold group-hover:text-[#D4AF37] transition-colors">
                      {loc.name}
                    </h3>
                    <p className="text-[11px] text-white/70 font-light truncate">
                      {loc.tagline}
                    </p>
                  </div>
                </div>

                <div className="p-4 flex-1 flex flex-col justify-between">
                  <p className="text-xs text-neutral-600 dark:text-white/60 font-light leading-relaxed mb-4">
                    {loc.description}
                  </p>
                  <div className="flex items-center justify-between text-xs font-mono font-bold text-[#D4AF37] pt-3 border-t border-black/5 dark:border-white/5">
                    <span>Explore Properties</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. LUXURY SERVICED SHORTLET HOSPITALITY CHAPTER */}
      <section className="py-20 sm:py-28 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-black/8 dark:border-white/10 pb-6 mb-12 gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2 font-mono">
              <span className="w-6 h-[1.5px] bg-[#D4AF37]" />
              <span className="text-xs font-bold uppercase tracking-widest text-[#D4AF37]">
                Hospitality & Comfort
              </span>
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-light text-neutral-900 dark:text-white">
              Stay Differently
            </h2>
            <p className="text-neutral-500 dark:text-white/60 text-xs sm:text-sm mt-2 max-w-xl font-light">
              Concierge serviced apartments and waterfront penthouses. 24/7 power, private security, high-speed Starlink internet, and premium housekeeping.
            </p>
          </div>

          <button
            id="view-all-shortlets-home-btn"
            onClick={() => navigate('/shortlets')}
            className="inline-flex items-center gap-2 text-xs uppercase tracking-widest font-bold text-[#D4AF37] hover:text-[#b89528] transition-colors group cursor-pointer self-start md:self-auto font-mono"
          >
            <span>Explore Stays</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {apartments.slice(0, 3).map(apt => (
            <ApartmentCard key={apt.id} apartment={apt} />
          ))}
        </div>
      </section>

      {/* 5. LUXURY CARS: EXECUTIVE MOBILITY CHAPTER */}
      <section className="py-20 sm:py-28 bg-[#0a0a0a] text-white border-t border-white/10 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-white/10 pb-6 mb-12 gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2 font-mono">
                <span className="w-6 h-[1.5px] bg-[#D4AF37]" />
                <span className="text-xs font-bold uppercase tracking-widest text-[#D4AF37]">
                  Executive Mobility
                </span>
              </div>
              <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-light text-white">
                Move in Style
              </h2>
              <p className="text-white/60 text-xs sm:text-sm mt-2 max-w-xl font-light">
                Mercedes-Benz G63 AMG, Range Rover Autobiography, and Lexus LX600 with professional security-vetted executive chauffeurs.
              </p>
            </div>

            <button
              id="view-all-cars-home-btn"
              onClick={() => navigate('/cars')}
              className="inline-flex items-center gap-2 text-xs uppercase tracking-widest font-bold text-[#D4AF37] hover:text-[#b89528] transition-colors group cursor-pointer self-start md:self-auto font-mono"
            >
              <span>View Full Fleet</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {vehicles.slice(0, 3).map(veh => (
              <VehicleCard key={veh.id} vehicle={veh} />
            ))}
          </div>
        </div>
      </section>

      {/* 6. TRUST & THE SELLING AJAH STANDARD CHAPTER */}
      <section className="py-20 sm:py-28 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center mb-16">
          <div className="lg:col-span-7">
            <div className="flex items-center gap-2 mb-3 font-mono">
              <span className="w-6 h-[1.5px] bg-[#D4AF37]" />
              <span className="text-xs font-bold uppercase tracking-widest text-[#D4AF37]">
                The Selling Ajah Standard
              </span>
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-light text-neutral-900 dark:text-white mb-6 leading-tight">
              A Bespoke Approach to Real Estate in Ajah & Lekki.
            </h2>
            <p className="text-neutral-600 dark:text-white/70 text-sm sm:text-base leading-relaxed mb-6 font-light">
              Acquiring property or securing extended serviced accommodation in Lagos should be an inspiring, seamless experience. We prioritize thorough listing curation, architectural quality, and transparent client communication for local residents and international diaspora buyers alike.
            </p>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 pt-4 border-t border-black/8 dark:border-white/10">
              <div>
                <div className="font-serif text-xl sm:text-2xl font-bold text-[#D4AF37]">Curated</div>
                <div className="text-[11px] text-neutral-500 dark:text-white/50 uppercase tracking-wider font-mono mt-0.5">Verified Listings</div>
              </div>
              <div>
                <div className="font-serif text-xl sm:text-2xl font-bold text-[#D4AF37]">Direct</div>
                <div className="text-[11px] text-neutral-500 dark:text-white/50 uppercase tracking-wider font-mono mt-0.5">Senior Advisory</div>
              </div>
              <div>
                <div className="font-serif text-xl sm:text-2xl font-bold text-[#D4AF37]">Turnkey</div>
                <div className="text-[11px] text-neutral-500 dark:text-white/50 uppercase tracking-wider font-mono mt-0.5">Lifestyle Solutions</div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 relative">
            <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-black/10 dark:border-white/10 aspect-[4/3]">
              <img
                src="https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80"
                alt="Selling Ajah Architecture and Advisory"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
              <div className="absolute bottom-5 left-5 right-5 text-white">
                <div className="text-xs uppercase font-bold tracking-widest text-[#D4AF37] mb-1 font-mono">
                  Personalized Guidance
                </div>
                <div className="text-sm font-light">
                  From initial property exploration to final handover and lifestyle check-in.
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 4 Pillars of Experience */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white dark:bg-[#111111] border border-black/8 dark:border-white/10 p-7 rounded-2xl shadow-sm dark:shadow-none hover:border-[#D4AF37]/50 transition-colors">
            <div className="w-12 h-12 rounded-xl bg-[#D4AF37]/10 border border-[#D4AF37]/20 flex items-center justify-center text-[#D4AF37] mb-5">
              <FileCheck className="w-6 h-6" />
            </div>
            <h3 className="font-serif text-lg font-bold text-neutral-900 dark:text-white mb-2.5">
              Curated Portfolios
            </h3>
            <p className="text-xs text-neutral-600 dark:text-white/60 leading-relaxed font-light">
              Every home, land plot, or apartment is physically inspected and evaluated for architectural integrity, estate infrastructure, and access road quality.
            </p>
          </div>

          <div className="bg-white dark:bg-[#111111] border border-black/8 dark:border-white/10 p-7 rounded-2xl shadow-sm dark:shadow-none hover:border-[#D4AF37]/50 transition-colors">
            <div className="w-12 h-12 rounded-xl bg-[#D4AF37]/10 border border-[#D4AF37]/20 flex items-center justify-center text-[#D4AF37] mb-5">
              <Video className="w-6 h-6" />
            </div>
            <h3 className="font-serif text-lg font-bold text-neutral-900 dark:text-white mb-2.5">
              Virtual Video Tours
            </h3>
            <p className="text-xs text-neutral-600 dark:text-white/60 leading-relaxed font-light">
              For overseas diaspora clients and remote executives, we provide comprehensive high-resolution video walkthroughs and live interactive video inspections.
            </p>
          </div>

          <div className="bg-white dark:bg-[#111111] border border-black/8 dark:border-white/10 p-7 rounded-2xl shadow-sm dark:shadow-none hover:border-[#D4AF37]/50 transition-colors">
            <div className="w-12 h-12 rounded-xl bg-[#D4AF37]/10 border border-[#D4AF37]/20 flex items-center justify-center text-[#D4AF37] mb-5">
              <Zap className="w-6 h-6" />
            </div>
            <h3 className="font-serif text-lg font-bold text-neutral-900 dark:text-white mb-2.5">
              24/7 Serviced Hospitality
            </h3>
            <p className="text-xs text-neutral-600 dark:text-white/60 leading-relaxed font-light">
              Our shortlets feature round-the-clock power solutions, Starlink connectivity, and private security in guarded estates for absolute peace of mind.
            </p>
          </div>

          <div className="bg-white dark:bg-[#111111] border border-black/8 dark:border-white/10 p-7 rounded-2xl shadow-sm dark:shadow-none hover:border-[#D4AF37]/50 transition-colors">
            <div className="w-12 h-12 rounded-xl bg-[#D4AF37]/10 border border-[#D4AF37]/20 flex items-center justify-center text-[#D4AF37] mb-5">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="font-serif text-lg font-bold text-neutral-900 dark:text-white mb-2.5">
              Turnkey Concierge
            </h3>
            <p className="text-xs text-neutral-600 dark:text-white/60 leading-relaxed font-light">
              From chauffeured airport pickup to luxury apartment check-in and property inspection coordination — all unified under one trusted brand.
            </p>
          </div>
        </div>
      </section>

      {/* 7. CLIENT STORIES CHAPTER */}
      {testimonials.length > 0 && (
        <section className="py-20 sm:py-28 bg-neutral-100/70 dark:bg-[#080808] border-t border-black/8 dark:border-white/10 transition-colors">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <div className="inline-flex items-center gap-2 mb-2 font-mono">
                <span className="w-6 h-[1.5px] bg-[#D4AF37]" />
                <span className="text-xs font-bold uppercase tracking-widest text-[#D4AF37]">
                  Client Experiences
                </span>
                <span className="w-6 h-[1.5px] bg-[#D4AF37]" />
              </div>
              <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-light text-neutral-900 dark:text-white mb-3">
                Voices of Our Clients
              </h2>
              <p className="text-neutral-500 dark:text-white/60 text-xs sm:text-sm font-light">
                Feedback from homeowners, shortlet guests, and executives who engaged Selling Ajah.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {testimonials.map(t => (
                <div key={t.id} className="bg-white dark:bg-[#111111] border border-black/8 dark:border-white/10 p-8 rounded-3xl flex flex-col justify-between shadow-sm dark:shadow-none hover:border-[#D4AF37]/40 transition-colors">
                  <div>
                    <div className="flex items-center gap-1 text-[#D4AF37] mb-5">
                      {[...Array(t.rating)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-[#D4AF37]" />
                      ))}
                    </div>
                    <p className="font-serif text-base sm:text-lg text-neutral-800 dark:text-white/90 italic leading-relaxed mb-8">
                      "{t.text}"
                    </p>
                  </div>

                  <div className="flex items-center gap-4 pt-5 border-t border-black/8 dark:border-white/10">
                    <img
                      src={t.avatar}
                      alt={t.name}
                      className="w-12 h-12 rounded-full object-cover border-2 border-[#D4AF37]/40"
                    />
                    <div>
                      <h4 className="text-sm font-bold text-neutral-900 dark:text-white">{t.name}</h4>
                      <p className="text-xs text-neutral-500 dark:text-white/50 font-light">{t.role}</p>
                      <span className="text-[11px] text-[#D4AF37] font-semibold font-mono">{t.serviceOrProperty}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 8. CONCIERGE & BESPOKE ACQUISITION BANNER */}
      <section className="py-20 sm:py-28 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-[#D4AF37]/15 via-white to-neutral-50 dark:from-[#D4AF37]/10 dark:via-[#111111] dark:to-[#111111] border border-[#D4AF37]/35 rounded-3xl p-8 sm:p-14 shadow-xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-10 transition-colors">
          <div className="max-w-2xl">
            <span className="text-[#D4AF37] text-xs font-bold uppercase tracking-widest block mb-2.5 font-mono">
              Bespoke Advisory Desk
            </span>
            <h2 className="font-serif text-2xl sm:text-4xl lg:text-5xl font-light text-neutral-900 dark:text-white mb-4 leading-snug">
              Looking for something specific?
            </h2>
            <p className="text-neutral-600 dark:text-white/70 text-xs sm:text-sm leading-relaxed mb-8 font-light">
              Tell us your preferred location, budget, and architectural requirements. Our team curates tailored options across Ajah and Lekki, including unlisted opportunities.
            </p>
            <div className="flex flex-wrap items-center gap-4">
              <button
                id="bespoke-request-btn"
                onClick={() => openRequestModal()}
                className="px-6 py-3.5 rounded-full bg-[#D4AF37] hover:bg-[#c49f2f] text-black font-bold text-xs uppercase tracking-widest transition-all shadow-lg shadow-[#D4AF37]/20 cursor-pointer hover:scale-105 active:scale-95 font-mono"
              >
                Submit Custom Search Request
              </button>
              <button
                id="ai-advisor-hero-cta"
                onClick={() => openAiModal()}
                className="px-5 py-3.5 rounded-full bg-black/5 hover:bg-black/10 dark:bg-white/10 dark:hover:bg-white/15 text-neutral-900 dark:text-white font-semibold text-xs transition-colors flex items-center gap-2 uppercase tracking-wider border border-black/10 dark:border-transparent cursor-pointer font-mono"
              >
                <Sparkles className="w-4 h-4 text-[#D4AF37]" />
                <span>Selling Ajah Concierge</span>
              </button>
            </div>
          </div>

          <div className="w-full md:w-80 p-7 rounded-2xl bg-white dark:bg-[#050505] border border-black/8 dark:border-white/10 text-center shrink-0 shadow-lg dark:shadow-none transition-colors">
            <PhoneCall className="w-9 h-9 text-[#D4AF37] mx-auto mb-3.5" />
            <h3 className="font-serif text-base font-bold text-neutral-900 dark:text-white mb-1.5">
              Direct Property Consultation
            </h3>
            <p className="text-xs text-neutral-500 dark:text-white/50 mb-5 leading-relaxed font-light">
              Have questions about an inspection schedule, pricing, or estate accessibility?
            </p>
            <a
              id="whatsapp-executive-cta"
              href={formatWhatsAppUrl(settings.whatsapp, "Hello Selling Ajah, I would like to consult with an advisor regarding properties in Ajah.")}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold uppercase tracking-wider transition-colors shadow-md shadow-emerald-600/20 font-mono"
            >
              <MessageSquare className="w-4 h-4" />
              <span>WhatsApp Us Directly</span>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};
