import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { Search, X, Building2, Key, Car, ArrowRight, Loader2 } from 'lucide-react';
import { Property, ServicedApartment, LuxuryVehicle } from '../types';
import { formatNaira } from '../utils/formatters';

export const GlobalSearchModal: React.FC = () => {
  const { isSearchModalOpen, closeSearchModal, navigate } = useApp();
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<{
    properties: Property[];
    apartments: ServicedApartment[];
    vehicles: LuxuryVehicle[];
  }>({ properties: [], apartments: [], vehicles: [] });

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isSearchModalOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
      setResults({ properties: [], apartments: [], vehicles: [] });
    }
  }, [isSearchModalOpen]);

  useEffect(() => {
    if (!query.trim()) {
      setResults({ properties: [], apartments: [], vehicles: [] });
      return;
    }

    const timer = setTimeout(() => {
      setLoading(true);
      fetch(`/api/search?q=${encodeURIComponent(query)}`)
        .then(res => res.json())
        .then(data => {
          setResults(data);
          setLoading(false);
        })
        .catch(err => {
          console.error(err);
          setLoading(false);
        });
    }, 250);

    return () => clearTimeout(timer);
  }, [query]);

  if (!isSearchModalOpen) return null;

  const handleSelect = (path: string) => {
    closeSearchModal();
    navigate(path);
  };

  const totalResults = results.properties.length + results.apartments.length + results.vehicles.length;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 sm:p-6 md:p-20 bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="w-full max-w-2xl bg-white dark:bg-[#111111] border border-black/10 dark:border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-200"
        onClick={e => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="p-4 border-b border-black/8 dark:border-white/10 flex items-center gap-3 bg-neutral-50 dark:bg-black/50">
          <Search className="w-5 h-5 text-[#D4AF37] shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search Ajah, Lekki, Sangotedo, Duplex, Shortlet, G-Wagon..."
            className="w-full bg-transparent text-neutral-900 dark:text-white placeholder-neutral-400 dark:placeholder-white/40 text-sm sm:text-base outline-none"
          />
          {loading && <Loader2 className="w-4 h-4 text-[#D4AF37] animate-spin shrink-0" />}
          <button
            id="close-search-modal-btn"
            onClick={closeSearchModal}
            className="p-1 rounded-lg text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Results Container */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {query.trim() === '' ? (
            <div className="py-8 text-center">
              <p className="text-xs uppercase tracking-widest text-neutral-400 dark:text-neutral-500 font-semibold mb-3">
                Quick Suggestions
              </p>
              <div className="flex flex-wrap items-center justify-center gap-2 max-w-md mx-auto">
                {['5 Bed Duplex Ajah', 'Abraham Adesanya', 'VGC Mansion', 'Onyx Shortlet', 'G63 AMG Rental', 'Sangotedo Land', 'Chevron Toll Gate'].map(tag => (
                  <button
                    key={tag}
                    onClick={() => setQuery(tag)}
                    className="text-xs bg-black/5 hover:bg-black/10 dark:bg-white/5 dark:hover:bg-white/10 text-neutral-700 dark:text-white/80 px-3 py-1.5 rounded-full border border-black/8 dark:border-white/10 transition-colors"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          ) : totalResults === 0 && !loading ? (
            <div className="py-12 text-center text-neutral-500 dark:text-white/50">
              <p className="text-sm font-medium text-neutral-800 dark:text-neutral-200 mb-1">No exact listings found for "{query}"</p>
              <p className="text-xs text-neutral-500 dark:text-white/50 max-w-sm mx-auto">
                Try searching for broader locations like "Ajah", "Lekki", or property types like "Duplex" or "Shortlet".
              </p>
            </div>
          ) : (
            <>
              {/* Properties */}
              {results.properties.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 text-xs font-semibold text-[#D4AF37] uppercase tracking-wider mb-2">
                    <Building2 className="w-3.5 h-3.5" />
                    <span>Properties ({results.properties.length})</span>
                  </div>
                  <div className="divide-y divide-black/5 dark:divide-white/5">
                    {results.properties.map(p => (
                      <div
                        key={p.id}
                        onClick={() => handleSelect(`/properties/${p.slug}`)}
                        className="py-2.5 px-3 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 flex items-center justify-between gap-3 cursor-pointer group transition-colors"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <img
                            src={p.mainImage}
                            alt=""
                            className="w-12 h-12 rounded-lg object-cover bg-neutral-900 shrink-0"
                          />
                          <div className="min-w-0">
                            <h4 className="text-xs sm:text-sm font-medium text-neutral-900 dark:text-white group-hover:text-[#D4AF37] dark:group-hover:text-[#D4AF37] truncate">
                              {p.title}
                            </h4>
                            <p className="text-[11px] text-neutral-500 dark:text-white/50 truncate">
                              {p.area} • {p.bedrooms} Beds • {p.propertyType}
                            </p>
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="text-xs sm:text-sm font-bold text-neutral-900 dark:text-white font-serif block">
                            {formatNaira(p.price)}
                          </span>
                          <span className="text-[10px] text-[#D4AF37] uppercase font-medium">
                            {p.listingType === 'sale' ? 'For Sale' : 'For Rent'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Serviced Apartments */}
              {results.apartments.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider mb-2">
                    <Key className="w-3.5 h-3.5" />
                    <span>Serviced Shortlets ({results.apartments.length})</span>
                  </div>
                  <div className="divide-y divide-black/5 dark:divide-white/5">
                    {results.apartments.map(a => (
                      <div
                        key={a.id}
                        onClick={() => handleSelect(`/shortlets/${a.slug}`)}
                        className="py-2.5 px-3 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 flex items-center justify-between gap-3 cursor-pointer group transition-colors"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <img
                            src={a.mainImage}
                            alt=""
                            className="w-12 h-12 rounded-lg object-cover bg-neutral-900 shrink-0"
                          />
                          <div className="min-w-0">
                            <h4 className="text-xs sm:text-sm font-medium text-neutral-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 truncate">
                              {a.name}
                            </h4>
                            <p className="text-[11px] text-neutral-500 dark:text-white/50 truncate">
                              {a.location} • Up to {a.maxGuests} Guests
                            </p>
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="text-xs sm:text-sm font-bold text-neutral-900 dark:text-white font-serif block">
                            {formatNaira(a.pricePerNight)}
                          </span>
                          <span className="text-[10px] text-neutral-500 dark:text-white/50">/ night</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Luxury Vehicles */}
              {results.vehicles.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 text-xs font-semibold text-sky-600 dark:text-sky-400 uppercase tracking-wider mb-2">
                    <Car className="w-3.5 h-3.5" />
                    <span>Luxury Vehicles ({results.vehicles.length})</span>
                  </div>
                  <div className="divide-y divide-black/5 dark:divide-white/5">
                    {results.vehicles.map(v => (
                      <div
                        key={v.id}
                        onClick={() => handleSelect(`/cars/${v.slug}`)}
                        className="py-2.5 px-3 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 flex items-center justify-between gap-3 cursor-pointer group transition-colors"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <img
                            src={v.mainImage}
                            alt=""
                            className="w-12 h-12 rounded-lg object-cover bg-neutral-900 shrink-0"
                          />
                          <div className="min-w-0">
                            <h4 className="text-xs sm:text-sm font-medium text-neutral-900 dark:text-white group-hover:text-sky-600 dark:group-hover:text-sky-400 truncate">
                              {v.name}
                            </h4>
                            <p className="text-[11px] text-neutral-500 dark:text-white/50 truncate">
                              {v.category} • {v.seats} Seats • Chauffeur Included
                            </p>
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="text-xs sm:text-sm font-bold text-neutral-900 dark:text-white font-serif block">
                            {formatNaira(v.dailyRate)}
                          </span>
                          <span className="text-[10px] text-neutral-500 dark:text-white/50">/ day</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
