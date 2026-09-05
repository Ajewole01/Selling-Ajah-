import React, { useState, useEffect, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { LuxuryVehicle } from '../types';
import { VehicleCard } from '../components/VehicleCard';
import {
  Car,
  Search,
  UserCheck,
  ShieldCheck,
  Sparkles,
  Plane,
  X,
  Clock
} from 'lucide-react';

export const CarsView: React.FC = () => {
  const { openAiModal } = useApp();
  const [vehicles, setVehicles] = useState<LuxuryVehicle[]>([]);
  const [loading, setLoading] = useState(true);

  const [category, setCategory] = useState('all');
  const [keyword, setKeyword] = useState('');

  useEffect(() => {
    setLoading(true);
    fetch('/api/vehicles')
      .then(res => res.json())
      .then(data => {
        setVehicles(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const filteredVehicles = useMemo(() => {
    return vehicles.filter(veh => {
      if (category !== 'all' && veh.category.toLowerCase() !== category.toLowerCase()) return false;
      if (keyword.trim()) {
        const q = keyword.toLowerCase();
        const matchName = veh.name.toLowerCase().includes(q);
        const matchBrand = veh.brand.toLowerCase().includes(q);
        const matchDesc = veh.description.toLowerCase().includes(q);
        if (!matchName && !matchBrand && !matchDesc) return false;
      }
      return true;
    });
  }, [vehicles, category, keyword]);

  const categories = [
    { label: 'All Fleet', value: 'all' },
    { label: 'Luxury SUVs', value: 'SUV' },
    { label: 'Executive Sedans', value: 'Luxury Sedan' },
    { label: 'Ultra Luxury', value: 'Ultra Luxury' }
  ];

  return (
    <div className="min-h-screen bg-[#FAF9F5] dark:bg-[#050505] text-neutral-900 dark:text-[#F5F5F0] pb-24 transition-colors duration-200">
      {/* Header Banner */}
      <div className="bg-white dark:bg-[#050505] border-b border-black/8 dark:border-white/10 pt-10 pb-8 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-[11px] font-bold text-[#D4AF37] uppercase tracking-widest mb-1.5 font-mono">
                <Car className="w-3.5 h-3.5" />
                <span>Executive Mobility Fleet</span>
              </div>
              <h1 className="font-serif text-3xl sm:text-4xl font-bold text-neutral-900 dark:text-white">
                Luxury Car Rentals in Ajah & Lagos
              </h1>
              <p className="text-xs sm:text-sm text-neutral-600 dark:text-white/60 mt-1 max-w-xl font-light">
                Arrive with unyielding authority. Premium SUVs and executive sedans complete with professional, security-vetted chauffeurs.
              </p>
            </div>

            <button
              onClick={() => openAiModal('I need a luxury rental car with chauffeur')}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-[#D4AF37]/15 hover:bg-[#D4AF37]/25 border border-[#D4AF37]/30 text-[#D4AF37] text-xs font-semibold transition-all shadow-sm shrink-0"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>Ask AI Fleet Assistant</span>
            </button>
          </div>

          {/* Service Pillars */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-8 pt-6 border-t border-black/8 dark:border-white/10">
            <div className="flex items-center gap-2 text-xs text-neutral-600 dark:text-white/70">
              <UserCheck className="w-4 h-4 text-[#D4AF37]" />
              <span>Professional Vetted Chauffeurs</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-neutral-600 dark:text-white/70">
              <Plane className="w-4 h-4 text-[#D4AF37]" />
              <span>VIP Airport Meet & Greets</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-neutral-600 dark:text-white/70">
              <ShieldCheck className="w-4 h-4 text-[#D4AF37]" />
              <span>Optional Armed Security Escort</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-neutral-600 dark:text-white/70">
              <Clock className="w-4 h-4 text-[#D4AF37]" />
              <span>Flexible Daily & Weekly Retainers</span>
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
              placeholder="Search fleet by brand or model (e.g., G63, Range Rover, Lexus LX600)..."
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

          <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
            {categories.map(c => (
              <button
                key={c.value}
                onClick={() => setCategory(c.value)}
                className={`px-3.5 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
                  category === c.value
                    ? 'bg-[#D4AF37] text-black shadow-md'
                    : 'bg-neutral-100 dark:bg-[#050505] text-neutral-700 dark:text-white/60 hover:text-neutral-900 dark:hover:text-white border border-black/10 dark:border-white/10'
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>

        {/* Fleet Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-80 rounded-2xl bg-neutral-200 dark:bg-[#111111] animate-pulse border border-black/8 dark:border-white/10" />
            ))}
          </div>
        ) : filteredVehicles.length === 0 ? (
          <div className="py-20 text-center bg-white dark:bg-[#111111] rounded-3xl border border-black/8 dark:border-white/10 p-8 shadow-sm dark:shadow-none">
            <Car className="w-12 h-12 text-[#D4AF37]/40 mx-auto mb-4" />
            <h3 className="font-serif text-xl font-bold text-neutral-900 dark:text-white mb-2">No vehicles found</h3>
            <button
              onClick={() => {
                setCategory('all');
                setKeyword('');
              }}
              className="px-5 py-2 rounded-full bg-black/5 hover:bg-black/10 dark:bg-white/10 dark:hover:bg-white/15 text-neutral-900 dark:text-white text-xs font-semibold mt-4 uppercase tracking-wider transition-colors"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredVehicles.map(veh => (
              <VehicleCard key={veh.id} vehicle={veh} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
