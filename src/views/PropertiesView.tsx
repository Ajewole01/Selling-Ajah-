import React, { useState, useEffect, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { Property } from '../types';
import { PropertyCard } from '../components/PropertyCard';
import {
  Search,
  Filter,
  SlidersHorizontal,
  LayoutGrid,
  List,
  X,
  RotateCcw,
  Sparkles,
  Building2,
  ChevronDown
} from 'lucide-react';

interface PropertiesViewProps {
  initialListingType?: 'sale' | 'rent';
}

export const PropertiesView: React.FC<PropertiesViewProps> = ({ initialListingType }) => {
  const { currentPath, navigate, openRequestModal, openAiModal } = useApp();

  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  // Parse URL query parameters
  const getUrlParams = () => {
    const search = window.location.search;
    const params = new URLSearchParams(search);
    return {
      listingType: initialListingType || params.get('listingType') || (currentPath.includes('/sale') ? 'sale' : currentPath.includes('/rent') ? 'rent' : 'all'),
      area: params.get('area') || 'all',
      type: params.get('type') || 'all',
      bedrooms: params.get('bedrooms') || 'all',
      maxPrice: params.get('maxPrice') || 'all',
      minPrice: params.get('minPrice') || 'all',
      keyword: params.get('keyword') || ''
    };
  };

  const initialParams = getUrlParams();

  // Filters State
  const [listingType, setListingType] = useState<string>(initialParams.listingType);
  const [area, setArea] = useState<string>(initialParams.area);
  const [propertyType, setPropertyType] = useState<string>(initialParams.type);
  const [bedrooms, setBedrooms] = useState<string>(initialParams.bedrooms);
  const [maxPrice, setMaxPrice] = useState<string>(initialParams.maxPrice);
  const [minPrice, setMinPrice] = useState<string>(initialParams.minPrice);
  const [keyword, setKeyword] = useState<string>(initialParams.keyword);
  const [sortBy, setSortBy] = useState<'featured' | 'price-asc' | 'price-desc' | 'newest'>('featured');
  const [layout, setLayout] = useState<'grid' | 'list'>('grid');
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetch('/api/properties')
      .then(res => res.json())
      .then(data => {
        setProperties(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  // Filter properties client-side
  const filteredProperties = useMemo(() => {
    return properties
      .filter(p => {
        if (listingType !== 'all' && p.listingType !== listingType) return false;
        if (area !== 'all' && !p.area.toLowerCase().includes(area.toLowerCase()) && !p.location.toLowerCase().includes(area.toLowerCase())) return false;
        if (propertyType !== 'all' && p.propertyType !== propertyType) return false;
        if (bedrooms !== 'all' && p.bedrooms < parseInt(bedrooms, 10)) return false;
        if (maxPrice !== 'all' && p.price > parseInt(maxPrice, 10)) return false;
        if (minPrice !== 'all' && p.price < parseInt(minPrice, 10)) return false;
        if (keyword.trim()) {
          const q = keyword.toLowerCase();
          const matchTitle = p.title.toLowerCase().includes(q);
          const matchLoc = p.location.toLowerCase().includes(q);
          const matchRef = p.refNumber.toLowerCase().includes(q);
          const matchDesc = p.shortDescription.toLowerCase().includes(q);
          if (!matchTitle && !matchLoc && !matchRef && !matchDesc) return false;
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'price-asc') return a.price - b.price;
        if (sortBy === 'price-desc') return b.price - a.price;
        if (sortBy === 'newest') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        return (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0);
      });
  }, [properties, listingType, area, propertyType, bedrooms, maxPrice, minPrice, keyword, sortBy]);

  const resetFilters = () => {
    setListingType('all');
    setArea('all');
    setPropertyType('all');
    setBedrooms('all');
    setMaxPrice('all');
    setMinPrice('all');
    setKeyword('');
    setSortBy('featured');
  };

  const hasActiveFilters =
    listingType !== 'all' ||
    area !== 'all' ||
    propertyType !== 'all' ||
    bedrooms !== 'all' ||
    maxPrice !== 'all' ||
    minPrice !== 'all' ||
    keyword !== '';

  const areasList = [
    { label: 'All Locations', value: 'all' },
    { label: 'Ajah Main', value: 'Ajah' },
    { label: 'Abraham Adesanya', value: 'Abraham Adesanya' },
    { label: 'Sangotedo', value: 'Sangotedo' },
    { label: 'Chevron Toll Gate', value: 'Chevron' },
    { label: 'Victoria Garden City (VGC)', value: 'VGC' },
    { label: 'Ikota Villa', value: 'Ikota' },
    { label: 'Orchid Road', value: 'Orchid' },
    { label: 'Lekki Phase 1', value: 'Lekki Phase 1' }
  ];

  const typesList = [
    { label: 'All Types', value: 'all' },
    { label: 'Detached Duplex', value: 'Detached Duplex' },
    { label: 'Semi Detached', value: 'Semi Detached' },
    { label: 'Terrace Duplex', value: 'Terrace' },
    { label: 'Penthouse', value: 'Penthouse' },
    { label: 'Apartment', value: 'Apartment' },
    { label: 'Mansion', value: 'Mansion' },
    { label: 'Land', value: 'Land' }
  ];

  return (
    <div className="min-h-screen bg-[#FAF9F5] dark:bg-[#050505] text-neutral-900 dark:text-[#F5F5F0] pb-24 transition-colors duration-200">
      {/* Page Header Banner */}
      <div className="bg-white dark:bg-[#050505] border-b border-black/8 dark:border-white/10 pt-10 pb-8 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-[11px] font-bold text-[#D4AF37] uppercase tracking-widest mb-1.5 font-mono">
                <Building2 className="w-3.5 h-3.5" />
                <span>Verified Lagos Properties</span>
              </div>
              <h1 className="font-serif text-3xl sm:text-4xl font-bold text-neutral-900 dark:text-white">
                {listingType === 'sale'
                  ? 'Properties for Sale in Ajah & Lekki'
                  : listingType === 'rent'
                  ? 'Properties for Rent / Lease in Ajah'
                  : 'All Properties in Ajah & Lekki'}
              </h1>
              <p className="text-xs sm:text-sm text-neutral-600 dark:text-white/60 mt-1 max-w-xl font-light">
                Browse our verified inventory of duplexes, terraces, penthouses, and lands with clean Governor's Consent and C of O titles.
              </p>
            </div>

            {/* Quick stats & action */}
            <div className="flex items-center gap-3">
              <button
                id="prop-request-custom-btn"
                onClick={() => openRequestModal({ service: listingType === 'rent' ? 'property_lease' : 'property_sale' })}
                className="px-4 py-2.5 rounded-full bg-black/5 hover:bg-black/10 dark:bg-white/5 dark:hover:bg-white/10 border border-black/10 dark:border-white/10 text-neutral-700 dark:text-white/80 hover:text-neutral-900 dark:hover:text-white text-xs font-medium transition-colors"
              >
                Can't find your property?
              </button>
              <button
                id="prop-ai-filter-btn"
                onClick={() => openAiModal('Help me find a property in Ajah')}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-[#D4AF37]/15 hover:bg-[#D4AF37]/25 border border-[#D4AF37]/30 text-[#D4AF37] text-xs font-semibold transition-all shadow-sm"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#D4AF37] animate-pulse" />
                <span>AI Search Assistant</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {/* Top Filter Bar */}
        <div className="bg-white dark:bg-[#111111] border border-black/8 dark:border-white/10 rounded-2xl p-4 mb-8 shadow-sm dark:shadow-xl transition-colors">
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
            {/* Search input */}
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 dark:text-white/40" />
              <input
                type="text"
                value={keyword}
                onChange={e => setKeyword(e.target.value)}
                placeholder="Search by title, location, reference number (e.g. SA-AJH-001)..."
                className="w-full bg-neutral-100 dark:bg-[#050505] border border-black/10 dark:border-white/10 rounded-full pl-10 pr-4 py-2.5 text-xs sm:text-sm text-neutral-900 dark:text-white placeholder-neutral-400 dark:placeholder-white/40 outline-none focus:border-[#D4AF37] transition-colors"
              />
              {keyword && (
                <button
                  onClick={() => setKeyword('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-900 dark:text-white/40 dark:hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Desktop Filters Row */}
            <div className="hidden lg:flex items-center gap-3">
              {/* Type toggle: All, Buy, Rent */}
              <div className="flex items-center bg-neutral-100 dark:bg-[#050505] p-1 rounded-full border border-black/10 dark:border-white/10 transition-colors">
                <button
                  onClick={() => setListingType('all')}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                    listingType === 'all' ? 'bg-[#D4AF37] text-black font-bold shadow-sm' : 'text-neutral-600 hover:text-neutral-900 dark:text-white/60 dark:hover:text-white'
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setListingType('sale')}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                    listingType === 'sale' ? 'bg-[#D4AF37] text-black font-bold shadow-sm' : 'text-neutral-600 hover:text-neutral-900 dark:text-white/60 dark:hover:text-white'
                  }`}
                >
                  For Sale
                </button>
                <button
                  onClick={() => setListingType('rent')}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                    listingType === 'rent' ? 'bg-[#D4AF37] text-black font-bold shadow-sm' : 'text-neutral-600 hover:text-neutral-900 dark:text-white/60 dark:hover:text-white'
                  }`}
                >
                  For Rent
                </button>
              </div>

              {/* Area select */}
              <select
                value={area}
                onChange={e => setArea(e.target.value)}
                className="bg-neutral-100 dark:bg-[#050505] border border-black/10 dark:border-white/10 rounded-full px-3 py-2 text-xs text-neutral-900 dark:text-white outline-none focus:border-[#D4AF37] transition-colors"
              >
                {areasList.map(a => (
                  <option key={a.value} value={a.value}>{a.label}</option>
                ))}
              </select>

              {/* Property Type select */}
              <select
                value={propertyType}
                onChange={e => setPropertyType(e.target.value)}
                className="bg-neutral-100 dark:bg-[#050505] border border-black/10 dark:border-white/10 rounded-full px-3 py-2 text-xs text-neutral-900 dark:text-white outline-none focus:border-[#D4AF37] transition-colors"
              >
                {typesList.map(t => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>

              {/* Bedrooms select */}
              <select
                value={bedrooms}
                onChange={e => setBedrooms(e.target.value)}
                className="bg-neutral-100 dark:bg-[#050505] border border-black/10 dark:border-white/10 rounded-full px-3 py-2 text-xs text-neutral-900 dark:text-white outline-none focus:border-[#D4AF37] transition-colors"
              >
                <option value="all">Any Beds</option>
                <option value="2">2+ Beds</option>
                <option value="3">3+ Beds</option>
                <option value="4">4+ Beds</option>
                <option value="5">5+ Beds</option>
              </select>
            </div>

            {/* Layout Toggle & Mobile Filter Button */}
            <div className="flex items-center justify-between lg:justify-end gap-2 pt-2 lg:pt-0 border-t lg:border-t-0 border-black/8 dark:border-white/10">
              <button
                id="mobile-filters-trigger"
                onClick={() => setMobileFilterOpen(true)}
                className="lg:hidden flex items-center gap-1.5 px-3 py-2 rounded-xl bg-black/5 dark:bg-white/10 text-neutral-800 dark:text-neutral-200 text-xs font-medium"
              >
                <SlidersHorizontal className="w-4 h-4" />
                <span>Filters {hasActiveFilters && '(Active)'}</span>
              </button>

              {/* Sort By Dropdown */}
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-neutral-500 dark:text-white/40 hidden sm:inline">Sort:</span>
                <select
                  value={sortBy}
                  onChange={e => setSortBy(e.target.value as any)}
                  className="bg-neutral-100 dark:bg-[#050505] border border-black/10 dark:border-white/10 rounded-xl px-3 py-2 text-xs text-neutral-900 dark:text-white outline-none focus:border-[#D4AF37] transition-colors"
                >
                  <option value="featured">Featured First</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                  <option value="newest">Recently Added</option>
                </select>
              </div>

              {/* Layout Toggle */}
              <div className="flex items-center bg-neutral-100 dark:bg-[#050505] p-1 rounded-xl border border-black/10 dark:border-white/10">
                <button
                  onClick={() => setLayout('grid')}
                  aria-label="Grid layout"
                  className={`p-1.5 rounded-lg transition-colors ${
                    layout === 'grid' ? 'bg-white dark:bg-neutral-800 text-[#D4AF37] shadow-sm' : 'text-neutral-500 dark:text-white/40 hover:text-neutral-900 dark:hover:text-white'
                  }`}
                >
                  <LayoutGrid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setLayout('list')}
                  aria-label="List layout"
                  className={`p-1.5 rounded-lg transition-colors ${
                    layout === 'list' ? 'bg-white dark:bg-neutral-800 text-[#D4AF37] shadow-sm' : 'text-neutral-500 dark:text-white/40 hover:text-neutral-900 dark:hover:text-white'
                  }`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Active Filter Chips */}
          {hasActiveFilters && (
            <div className="flex flex-wrap items-center gap-2 mt-4 pt-3 border-t border-black/8 dark:border-white/10 text-xs">
              <span className="text-neutral-500 dark:text-neutral-400 font-medium">Active Filters:</span>
              {listingType !== 'all' && (
                <span className="bg-black/5 dark:bg-white/10 text-[#D4AF37] border border-[#D4AF37]/20 px-2.5 py-0.5 rounded-full flex items-center gap-1 font-medium">
                  Type: {listingType === 'sale' ? 'Sale' : 'Rent'}
                  <X className="w-3 h-3 cursor-pointer" onClick={() => setListingType('all')} />
                </span>
              )}
              {area !== 'all' && (
                <span className="bg-black/5 dark:bg-white/10 text-[#D4AF37] border border-[#D4AF37]/20 px-2.5 py-0.5 rounded-full flex items-center gap-1 font-medium">
                  Location: {area}
                  <X className="w-3 h-3 cursor-pointer" onClick={() => setArea('all')} />
                </span>
              )}
              {propertyType !== 'all' && (
                <span className="bg-black/5 dark:bg-white/10 text-[#D4AF37] border border-[#D4AF37]/20 px-2.5 py-0.5 rounded-full flex items-center gap-1 font-medium">
                  Property: {propertyType}
                  <X className="w-3 h-3 cursor-pointer" onClick={() => setPropertyType('all')} />
                </span>
              )}
              {bedrooms !== 'all' && (
                <span className="bg-black/5 dark:bg-white/10 text-[#D4AF37] border border-[#D4AF37]/20 px-2.5 py-0.5 rounded-full flex items-center gap-1 font-medium">
                  {bedrooms}+ Bedrooms
                  <X className="w-3 h-3 cursor-pointer" onClick={() => setBedrooms('all')} />
                </span>
              )}
              {keyword && (
                <span className="bg-black/5 dark:bg-white/10 text-[#D4AF37] border border-[#D4AF37]/20 px-2.5 py-0.5 rounded-full flex items-center gap-1 font-medium">
                  Keyword: "{keyword}"
                  <X className="w-3 h-3 cursor-pointer" onClick={() => setKeyword('')} />
                </span>
              )}
              <button
                onClick={resetFilters}
                className="text-xs text-rose-500 hover:underline flex items-center gap-1 ml-auto"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset All Filters</span>
              </button>
            </div>
          )}
        </div>

        {/* Results Counter */}
        <div className="flex items-center justify-between mb-6 text-xs text-neutral-500 dark:text-neutral-400">
          <div>
            Showing <span className="text-neutral-900 dark:text-white font-bold">{filteredProperties.length}</span> verified properties in Ajah & Lekki
          </div>
        </div>

        {/* Listings Grid / List */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="h-80 rounded-2xl bg-neutral-200 dark:bg-[#111111] animate-pulse border border-black/5 dark:border-white/5" />
            ))}
          </div>
        ) : filteredProperties.length === 0 ? (
          <div className="py-20 text-center bg-white dark:bg-[#111111] rounded-3xl border border-black/8 dark:border-white/10 p-8 shadow-sm dark:shadow-none">
            <Building2 className="w-12 h-12 text-[#D4AF37]/50 mx-auto mb-4" />
            <h3 className="font-serif text-xl font-bold text-neutral-900 dark:text-white mb-2">
              No matching properties found
            </h3>
            <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 max-w-md mx-auto mb-6">
              We couldn't find listings matching all your selected filters. Try broadening your criteria or let our acquisition team source it for you.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <button
                onClick={resetFilters}
                className="px-4 py-2 rounded-xl bg-black/5 hover:bg-black/10 dark:bg-white/10 dark:hover:bg-white/15 text-neutral-900 dark:text-white text-xs font-semibold"
              >
                Clear All Filters
              </button>
              <button
                onClick={() => openRequestModal()}
                className="px-4 py-2 rounded-xl bg-[#D4AF37] hover:bg-[#c49f2f] text-black text-xs font-bold uppercase tracking-wider shadow-sm"
              >
                Request Custom Property
              </button>
            </div>
          </div>
        ) : (
          <div
            className={
              layout === 'grid'
                ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
                : 'space-y-4'
            }
          >
            {filteredProperties.map(prop => (
              <PropertyCard key={prop.id} property={prop} layout={layout} />
            ))}
          </div>
        )}
      </div>

      {/* Mobile Filters Slide-Over / Bottom Sheet Drawer */}
      {mobileFilterOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 dark:bg-black/80 backdrop-blur-sm lg:hidden animate-in fade-in duration-200">
          <div
            className="w-full bg-white dark:bg-[#111111] border-t sm:border border-black/8 dark:border-white/10 rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl max-h-[85vh] overflow-y-auto animate-in slide-in-from-bottom duration-200"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-4 border-b border-black/8 dark:border-white/10 mb-6">
              <h3 className="font-serif text-lg font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-[#D4AF37]" />
                Filter Properties
              </h3>
              <button
                onClick={() => setMobileFilterOpen(false)}
                className="p-1 text-neutral-400 hover:text-neutral-900 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-left">
              {/* Listing Type */}
              <div>
                <label className="block text-xs font-semibold text-neutral-500 dark:text-neutral-400 mb-1.5">Listing Intent</label>
                <div className="grid grid-cols-3 gap-2">
                  {['all', 'sale', 'rent'].map(t => (
                    <button
                      key={t}
                      onClick={() => setListingType(t)}
                      className={`py-2 text-xs rounded-xl border transition-colors ${
                        listingType === t
                          ? 'bg-[#D4AF37] text-black font-bold border-[#D4AF37]'
                          : 'bg-neutral-100 dark:bg-[#050505] text-neutral-700 dark:text-neutral-300 border-black/10 dark:border-white/10'
                      }`}
                    >
                      {t === 'all' ? 'All' : t === 'sale' ? 'For Sale' : 'For Rent'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Area */}
              <div>
                <label className="block text-xs font-semibold text-neutral-500 dark:text-neutral-400 mb-1.5">Location</label>
                <select
                  value={area}
                  onChange={e => setArea(e.target.value)}
                  className="w-full bg-neutral-100 dark:bg-[#050505] border border-black/10 dark:border-white/10 rounded-xl p-3 text-xs text-neutral-900 dark:text-white outline-none focus:border-[#D4AF37]"
                >
                  {areasList.map(a => (
                    <option key={a.value} value={a.value}>{a.label}</option>
                  ))}
                </select>
              </div>

              {/* Property Type */}
              <div>
                <label className="block text-xs font-semibold text-neutral-500 dark:text-neutral-400 mb-1.5">Property Type</label>
                <select
                  value={propertyType}
                  onChange={e => setPropertyType(e.target.value)}
                  className="w-full bg-neutral-100 dark:bg-[#050505] border border-black/10 dark:border-white/10 rounded-xl p-3 text-xs text-neutral-900 dark:text-white outline-none focus:border-[#D4AF37]"
                >
                  {typesList.map(t => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </div>

              {/* Bedrooms */}
              <div>
                <label className="block text-xs font-semibold text-neutral-500 dark:text-neutral-400 mb-1.5">Minimum Bedrooms</label>
                <select
                  value={bedrooms}
                  onChange={e => setBedrooms(e.target.value)}
                  className="w-full bg-neutral-100 dark:bg-[#050505] border border-black/10 dark:border-white/10 rounded-xl p-3 text-xs text-neutral-900 dark:text-white outline-none focus:border-[#D4AF37]"
                >
                  <option value="all">Any Bedrooms</option>
                  <option value="1">1+ Bedroom</option>
                  <option value="2">2+ Bedrooms</option>
                  <option value="3">3+ Bedrooms</option>
                  <option value="4">4+ Bedrooms</option>
                  <option value="5">5+ Bedrooms</option>
                </select>
              </div>

              <div className="pt-4 flex items-center gap-3">
                <button
                  onClick={resetFilters}
                  className="flex-1 py-3 rounded-xl bg-neutral-100 hover:bg-neutral-200 dark:bg-white/10 dark:hover:bg-white/15 text-neutral-700 dark:text-neutral-300 text-xs font-medium transition-colors"
                >
                  Reset
                </button>
                <button
                  onClick={() => setMobileFilterOpen(false)}
                  className="flex-1 py-3 rounded-xl bg-[#D4AF37] hover:bg-[#c49f2f] text-black font-bold text-xs uppercase tracking-wider transition-colors shadow-sm"
                >
                  Show Results ({filteredProperties.length})
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
