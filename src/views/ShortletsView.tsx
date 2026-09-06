import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { ServicedApartment } from '../types';
import { ApartmentCard } from '../components/ApartmentCard';
import {
  Key,
  Search,
  Zap,
  Wifi,
  ShieldCheck,
  Users,
  Sparkles,
  SlidersHorizontal,
  X,
  AlertCircle
} from 'lucide-react';
import { useEditorialMotion } from '../hooks/useEditorialMotion';

export const ShortletsView: React.FC = () => {
  const pageRef = useRef<HTMLDivElement>(null);
  useEditorialMotion(pageRef);
  const { navigate, openAiModal, settings } = useApp();
  const [apartments, setApartments] = useState<ServicedApartment[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [selectedArea, setSelectedArea] = useState('all');
  const [selectedGuests, setSelectedGuests] = useState('all');
  const [keyword, setKeyword] = useState('');

  const [loadError, setLoadError] = useState(false);

  const fetchApartments = () => {
    setLoading(true);
    setLoadError(false);
    fetch('/api/apartments')
      .then(res => {
        if (!res.ok) throw new Error('Failed to load apartments');
        return res.json();
      })
      .then(data => {
        setApartments(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching apartments:', err);
        setLoadError(true);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchApartments();
  }, []);

  const filteredApartments = useMemo(() => {
    return apartments.filter(apt => {
      if (selectedArea !== 'all' && !apt.area.toLowerCase().includes(selectedArea.toLowerCase())) return false;
      if (selectedGuests !== 'all' && apt.maxGuests < parseInt(selectedGuests, 10)) return false;
      if (keyword.trim()) {
        const q = keyword.toLowerCase();
        const matchName = apt.name.toLowerCase().includes(q);
        const matchLoc = apt.location.toLowerCase().includes(q);
        const matchDesc = apt.description.toLowerCase().includes(q);
        if (!matchName && !matchLoc && !matchDesc) return false;
      }
      return true;
    });
  }, [apartments, selectedArea, selectedGuests, keyword]);

  return (
    <div ref={pageRef} className="sa-catalogue sa-catalogue--stays min-h-screen bg-[#FAF9F5] dark:bg-[#050505] text-neutral-900 dark:text-[#F5F5F0] pb-24 transition-colors duration-200">
      {/* Header Banner */}
      <div className="sa-catalogue__masthead bg-white dark:bg-[#050505] border-b border-black/8 dark:border-white/10 pt-10 pb-8 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-[11px] font-bold text-[#D4AF37] uppercase tracking-widest mb-1.5 font-mono">
                <Key className="w-3.5 h-3.5" />
                <span>Luxury Serviced Living</span>
              </div>
              <h1 className="font-serif text-3xl sm:text-4xl font-bold text-neutral-900 dark:text-white">
                Serviced Apartments & Shortlets in Ajah & Lekki
              </h1>
              <p className="text-xs sm:text-sm text-neutral-600 dark:text-white/60 mt-1 max-w-xl font-light">
                Guaranteed 24/7 electricity, high-speed Starlink WiFi, private chef options, and dedicated concierge in prime secure estates.
              </p>
            </div>

            <button
              onClick={() => openAiModal('Find me a luxury serviced shortlet in Ajah')}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-[#D4AF37]/15 hover:bg-[#D4AF37]/25 border border-[#D4AF37]/30 text-[#D4AF37] text-xs font-semibold transition-all shadow-sm shrink-0"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>Ask AI Shortlet Concierge</span>
            </button>
          </div>

          {/* Guarantee Badges */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-8 pt-6 border-t border-black/8 dark:border-white/10">
            <div className="flex items-center gap-2 text-xs text-neutral-600 dark:text-white/70">
              <Zap className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
              <span>24/7 Constant Power (Dual Inverters)</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-neutral-600 dark:text-white/70">
              <Wifi className="w-4 h-4 text-[#D4AF37]" />
              <span>Unlimited Starlink WiFi</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-neutral-600 dark:text-white/70">
              <ShieldCheck className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
              <span>Gated Estate 24/7 Armed Security</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-neutral-600 dark:text-white/70">
              <Users className="w-4 h-4 text-[#D4AF37]" />
              <span>Daily Housekeeping Included</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {/* Filter Bar */}
        <div className="bg-white dark:bg-[#111111] border border-black/8 dark:border-white/10 rounded-2xl p-4 mb-8 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm dark:shadow-none">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 dark:text-white/40" />
            <input
              type="text"
              value={keyword}
              onChange={e => setKeyword(e.target.value)}
              placeholder="Search shortlets by name or location (e.g., Waterfront, Lekki, Ajah)..."
              className="w-full bg-neutral-100 dark:bg-[#050505] border border-black/10 dark:border-white/10 rounded-full pl-10 pr-4 py-2.5 text-xs sm:text-sm text-neutral-900 dark:text-white placeholder-neutral-400 dark:placeholder-white/40 outline-none focus:border-[#D4AF37]"
            />
            {keyword && (
              <button
                onClick={() => setKeyword('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 dark:text-white/40 hover:text-neutral-900 dark:hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <select
              value={selectedArea}
              onChange={e => setSelectedArea(e.target.value)}
              className="bg-neutral-100 dark:bg-[#050505] border border-black/10 dark:border-white/10 rounded-full px-3 py-2.5 text-xs text-neutral-900 dark:text-white outline-none focus:border-[#D4AF37] w-full sm:w-auto"
            >
              <option value="all">All Locations</option>
              <option value="Ajah">Ajah</option>
              <option value="Lekki Phase 1">Lekki Phase 1</option>
              <option value="Chevron">Chevron Drive</option>
            </select>

            <select
              value={selectedGuests}
              onChange={e => setSelectedGuests(e.target.value)}
              className="bg-neutral-100 dark:bg-[#050505] border border-black/10 dark:border-white/10 rounded-full px-3 py-2.5 text-xs text-neutral-900 dark:text-white outline-none focus:border-[#D4AF37] w-full sm:w-auto"
            >
              <option value="all">Any Guests</option>
              <option value="2">2+ Guests</option>
              <option value="4">4+ Guests</option>
              <option value="6">6+ Guests</option>
            </select>
          </div>
        </div>

        {/* Results */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-80 rounded-2xl bg-neutral-200 dark:bg-[#111111] animate-pulse border border-black/8 dark:border-white/10" />
            ))}
          </div>
        ) : loadError ? (
          <div className="py-20 text-center bg-white dark:bg-slate-900/40 rounded-3xl border border-rose-500/20 p-8 shadow-sm dark:shadow-none">
            <AlertCircle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
            <h3 className="font-serif text-xl font-bold text-neutral-900 dark:text-white mb-2">
              Unable to load serviced apartments
            </h3>
            <p className="text-xs sm:text-sm text-neutral-600 dark:text-slate-400 max-w-md mx-auto mb-6">
              We encountered a temporary connection issue loading shortlet stays. Please try again or reach out on WhatsApp.
            </p>
            <button
              onClick={fetchApartments}
              className="px-5 py-2.5 rounded-xl bg-[#D4AF37] hover:bg-[#c49f2f] text-black text-xs font-bold uppercase tracking-wider shadow-sm transition-colors"
            >
              Retry Loading
            </button>
          </div>
        ) : filteredApartments.length === 0 ? (
          <div className="py-20 text-center bg-white dark:bg-slate-900/40 rounded-3xl border border-black/8 dark:border-slate-800 p-8 shadow-sm dark:shadow-none">
            <Key className="w-12 h-12 text-emerald-500/40 dark:text-emerald-400/40 mx-auto mb-4" />
            <h3 className="font-serif text-xl font-bold text-neutral-900 dark:text-white mb-2">
              No shortlets found
            </h3>
            <p className="text-xs sm:text-sm text-neutral-600 dark:text-slate-400 max-w-md mx-auto mb-6">
              We couldn't find serviced shortlets matching your search. Clear filters or contact our concierge directly on WhatsApp.
            </p>
            <button
              onClick={() => {
                setSelectedArea('all');
                setSelectedGuests('all');
                setKeyword('');
              }}
              className="px-4 py-2 rounded-xl bg-black/5 hover:bg-black/10 dark:bg-slate-800 dark:hover:bg-slate-700 text-neutral-900 dark:text-white text-xs font-semibold transition-colors"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredApartments.map(apt => (
              <ApartmentCard key={apt.id} apartment={apt} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
