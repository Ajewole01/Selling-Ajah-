import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Property } from '../types';
import { PropertyCard } from '../components/PropertyCard';
import { Heart, Building2, ArrowRight, MessageSquare, Trash2 } from 'lucide-react';
import { formatWhatsAppUrl, formatNaira } from '../utils/formatters';

export const FavoritesView: React.FC = () => {
  const { favorites, clearFavorites, navigate, settings } = useApp();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch('/api/properties')
      .then(res => res.json())
      .then((data: Property[]) => {
        if (Array.isArray(data)) {
          setProperties(data.filter(p => favorites.includes(p.id)));
        }
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [favorites]);

  const savedTitles = properties.map(p => `• ${p.title} (${formatNaira(p.price)})`).join('\n');
  const whatsappPortfolioMsg = `Hello Selling Ajah, I have saved the following properties to my wishlist and would like to arrange inspections:\n\n${savedTitles}`;
  const whatsappPortfolioUrl = formatWhatsAppUrl(settings.whatsapp, whatsappPortfolioMsg);

  return (
    <div className="min-h-screen bg-[#FAF9F5] dark:bg-[#050505] text-neutral-900 dark:text-[#F5F5F0] pb-24 transition-colors duration-200">
      {/* Header Banner */}
      <div className="bg-white dark:bg-[#0a0a0a] border-b border-black/8 dark:border-white/10 pt-10 pb-8 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold text-rose-500 dark:text-rose-400 uppercase tracking-widest mb-1.5 font-mono">
                <Heart className="w-3.5 h-3.5 fill-rose-500 text-rose-500" />
                <span>My Saved Properties</span>
              </div>
              <h1 className="font-serif text-3xl sm:text-4xl font-bold text-neutral-900 dark:text-white">
                Saved Portfolio ({properties.length})
              </h1>
              <p className="text-xs sm:text-sm text-neutral-600 dark:text-white/60 mt-1 max-w-xl font-light">
                Compare your saved residences in Ajah, share them with family, or request a collective portfolio inspection with our advisors.
              </p>
            </div>

            {properties.length > 0 && (
              <div className="flex items-center gap-3">
                <button
                  onClick={clearFavorites}
                  className="p-2.5 rounded-xl bg-white dark:bg-[#111111] border border-black/10 dark:border-white/10 text-neutral-600 dark:text-white/60 hover:text-rose-500 text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Clear All</span>
                </button>

                <a
                  href={whatsappPortfolioUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-colors shadow-lg shadow-emerald-600/20"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Inspect Saved on WhatsApp</span>
                </a>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Grid Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-80 rounded-2xl bg-neutral-200 dark:bg-[#111111] animate-pulse border border-black/8 dark:border-white/10" />
            ))}
          </div>
        ) : properties.length === 0 ? (
          <div className="py-24 text-center bg-white dark:bg-[#111111] rounded-3xl border border-black/8 dark:border-white/10 p-8 max-w-xl mx-auto shadow-sm dark:shadow-none">
            <Heart className="w-12 h-12 text-neutral-300 dark:text-white/20 mx-auto mb-4" />
            <h3 className="font-serif text-xl font-bold text-neutral-900 dark:text-white mb-2">
              No saved properties yet
            </h3>
            <p className="text-xs sm:text-sm text-neutral-600 dark:text-white/60 mb-6 font-light">
              When browsing verified properties in Ajah and Lekki, click the heart icon on any listing to bookmark it here for easy comparison.
            </p>
            <button
              onClick={() => navigate('/properties')}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#D4AF37] hover:bg-[#c49f2e] text-black font-bold text-xs uppercase tracking-wider transition-all shadow-md cursor-pointer"
            >
              <Building2 className="w-4 h-4" />
              <span>Explore Ajah Properties</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {properties.map(p => (
              <PropertyCard key={p.id} property={p} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
