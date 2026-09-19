import React from 'react';
import { Property } from '../types';
import { useApp } from '../context/AppContext';
import { formatNaira, formatWhatsAppUrl } from '../utils/formatters';
import {
  Bed,
  Bath,
  Car,
  MapPin,
  Heart,
  MessageSquare,
  ArrowUpRight,
  ShieldCheck
} from 'lucide-react';

interface PropertyCardProps {
  property: Property;
  layout?: 'grid' | 'list';
}

export const PropertyCard: React.FC<PropertyCardProps> = ({
  property,
  layout = 'grid'
}) => {
  const { navigate, isFavorite, toggleFavorite, addToast, settings } = useApp();
  const liked = isFavorite(property.id);

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleFavorite(property.id);
    addToast(
      liked
        ? `Removed "${property.title.slice(0, 25)}..." from favorites`
        : `Saved "${property.title.slice(0, 25)}..." to favorites!`,
      liked ? 'info' : 'success'
    );
  };

  const handleCardClick = () => {
    navigate(`/properties/${property.slug}`);
  };

  const whatsappMessage = `Hello Selling Ajah, I'm interested in inspecting this property: "${property.title}" (Ref: ${property.refNumber}) listed at ${formatNaira(property.price)}. Please share more details.`;
  const whatsappUrl = formatWhatsAppUrl(settings.whatsapp, whatsappMessage);

  const handleWhatsAppClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
  };

  const statusBadge = () => {
    if (property.status === 'sold') {
      return <span className="bg-rose-600/90 text-white text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider shadow-sm">Sold</span>;
    }
    if (property.status === 'rented') {
      return <span className="bg-amber-600/90 text-white text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider shadow-sm">Rented</span>;
    }
    if (property.listingType === 'sale') {
      return <span className="bg-brand-green-primary text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider shadow-sm">For Sale</span>;
    }
    return <span className="bg-brand-green-muted text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider shadow-sm">For Rent</span>;
  };

  if (layout === 'list') {
    return (
      <div
        id={`property-card-${property.id}`}
        onClick={handleCardClick}
        className="group relative bg-white dark:bg-[#0E1710] hover:bg-neutral-50/80 dark:hover:bg-[#121E14] border border-black/8 dark:border-white/10 hover:border-brand-green-primary/50 dark:hover:border-brand-green-sage/40 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl dark:shadow-none dark:hover:shadow-[0_10px_30px_rgba(0,0,0,0.8)] transition-all duration-300 flex flex-col md:flex-row cursor-pointer"
      >
        {/* Image side */}
        <div className="md:w-72 lg:w-80 h-60 md:h-auto relative shrink-0 overflow-hidden bg-neutral-900">
          <img
            src={property.mainImage}
            alt={property.title}
            loading="lazy"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out opacity-95 group-hover:opacity-100"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20" />
          
          {/* Badges on image */}
          <div className="absolute top-3.5 left-3.5 flex items-center gap-2 z-10">
            {statusBadge()}
            {property.isFeatured && (
              <span className="bg-black/75 backdrop-blur-md border border-brand-green-sage/50 text-brand-green-sage text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-widest">
                Featured
              </span>
            )}
          </div>

          <button
            id={`fav-btn-list-${property.id}`}
            onClick={handleToggleFavorite}
            aria-label="Save to favorites"
            className="absolute top-3.5 right-3.5 z-10 w-8 h-8 rounded-full bg-black/60 hover:bg-black/90 backdrop-blur-md border border-white/20 flex items-center justify-center transition-all hover:scale-110 active:scale-95"
          >
            <Heart className={`w-4 h-4 ${liked ? 'text-brand-green-primary dark:text-brand-green-sage fill-brand-green-primary dark:fill-brand-green-sage' : 'text-white'}`} />
          </button>
        </div>

        {/* Info side */}
        <div className="p-5 sm:p-6 flex-1 flex flex-col gap-3 justify-center">
          <div>
            <div className="flex items-center justify-between gap-2 mb-1.5 text-xs text-neutral-500 dark:text-white/50">
              <span className="font-mono text-brand-green-primary dark:text-brand-green-sage text-[11px] font-bold tracking-wider">{property.refNumber}</span>
              <span className="bg-black/5 dark:bg-white/5 text-neutral-700 dark:text-white/70 text-[10px] uppercase tracking-wider px-2.5 py-0.5 rounded-full font-semibold">{property.propertyType}</span>
            </div>

            <h3 className="font-serif text-lg sm:text-xl font-bold text-neutral-900 dark:text-white group-hover:text-brand-green-primary dark:group-hover:text-brand-green-sage transition-colors line-clamp-2 mb-1.5">
              {property.title}
            </h3>

            <div className="flex items-center gap-1.5 text-xs text-neutral-500 dark:text-white/60 mb-2">
              <MapPin className="w-3.5 h-3.5 text-brand-green-primary dark:text-brand-green-sage shrink-0" />
              <span className="line-clamp-1">{property.location}</span>
            </div>

            {property.shortDescription && (
              <p className="text-xs sm:text-sm text-neutral-600 dark:text-white/60 line-clamp-2 mb-2 font-light leading-relaxed">
                {property.shortDescription}
              </p>
            )}
          </div>

          {/* Specs & Pricing */}
          <div className="pt-3 border-t border-black/8 dark:border-white/10 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-4 text-xs text-neutral-600 dark:text-white/60 font-medium">
              {property.bedrooms > 0 && (
                <div className="flex items-center gap-1.5" title={`${property.bedrooms} Bedrooms`}>
                  <Bed className="w-3.5 h-3.5 text-neutral-400 dark:text-white/40" />
                  <span>{property.bedrooms} Beds</span>
                </div>
              )}
              {property.bathrooms > 0 && (
                <div className="flex items-center gap-1.5" title={`${property.bathrooms} Bathrooms`}>
                  <Bath className="w-3.5 h-3.5 text-neutral-400 dark:text-white/40" />
                  <span>{property.bathrooms} Baths</span>
                </div>
              )}
              {property.parkingSpaces > 0 && (
                <div className="flex items-center gap-1.5" title={`${property.parkingSpaces} Parking Spaces`}>
                  <Car className="w-3.5 h-3.5 text-neutral-400 dark:text-white/40" />
                  <span>{property.parkingSpaces} Cars</span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-3">
              <div className="text-right">
                <span className="text-[10px] text-neutral-400 dark:text-white/40 block font-bold uppercase tracking-wider">Guide Price</span>
                <div className="text-lg sm:text-xl font-bold text-brand-green-primary dark:text-brand-green-sage font-serif">
                  {formatNaira(property.price)}
                  {property.pricePeriod && (
                    <span className="text-xs font-sans text-neutral-500 dark:text-white/50 font-normal"> /{property.pricePeriod}</span>
                  )}
                </div>
              </div>

              <button
                id={`whatsapp-card-list-${property.id}`}
                onClick={handleWhatsAppClick}
                title="Chat with agent on WhatsApp"
                className="p-2.5 rounded-full bg-brand-green-primary hover:bg-brand-green-deep text-white shadow-md hover:scale-105 active:scale-95 transition-all"
              >
                <MessageSquare className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Grid layout (Standard)
  return (
    <div
      id={`property-card-${property.id}`}
      onClick={handleCardClick}
      className="group relative self-start h-auto bg-white dark:bg-[#0E1710] hover:bg-neutral-50/80 dark:hover:bg-[#121E14] border border-black/8 dark:border-white/10 hover:border-brand-green-primary/50 dark:hover:border-brand-green-sage/40 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl dark:shadow-none dark:hover:shadow-[0_10px_30px_rgba(0,0,0,0.8)] transition-all duration-300 flex flex-col cursor-pointer"
    >
      {/* 1. Image */}
      <div className="relative aspect-[16/10] overflow-hidden bg-neutral-900 shrink-0">
        <img
          src={property.mainImage}
          alt={property.title}
          loading="lazy"
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out opacity-95 group-hover:opacity-100"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/25 pointer-events-none" />

        {/* Status Badges */}
        <div className="absolute top-3 left-3 flex items-center gap-1.5 z-10">
          {statusBadge()}
          {property.isFeatured && (
            <span className="bg-black/75 backdrop-blur-md border border-brand-green-sage/50 text-brand-green-sage text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-widest">
              Featured
            </span>
          )}
        </div>

        {/* Favorite Heart Button */}
        <button
          id={`fav-btn-${property.id}`}
          onClick={handleToggleFavorite}
          aria-label="Save to favorites"
          className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-black/60 hover:bg-black/90 backdrop-blur-md border border-white/20 flex items-center justify-center transition-all hover:scale-110 active:scale-95"
        >
          <Heart className={`w-4 h-4 ${liked ? 'text-brand-green-primary dark:text-brand-green-sage fill-brand-green-primary dark:fill-brand-green-sage' : 'text-white'}`} />
        </button>
      </div>

      {/* 2. Body Content: Natural vertical flow */}
      <div className="p-4 sm:p-5 flex flex-col gap-2.5">
        {/* Price & Reference */}
        <div className="flex items-baseline justify-between gap-2">
          <div>
            <span className="text-[10px] uppercase font-bold tracking-wider text-neutral-400 dark:text-white/40 block leading-tight">
              Guide Price
            </span>
            <div className="text-xl sm:text-2xl font-bold text-brand-green-primary dark:text-brand-green-sage font-serif tracking-tight">
              {formatNaira(property.price)}
              {property.pricePeriod && (
                <span className="text-xs font-sans text-neutral-500 dark:text-white/50 font-normal"> /{property.pricePeriod}</span>
              )}
            </div>
          </div>
          <span className="font-mono text-[11px] font-bold text-brand-green-primary dark:text-brand-green-sage px-2 py-0.5 rounded bg-brand-green-primary/10 border border-brand-green-primary/25 shrink-0">
            {property.refNumber}
          </span>
        </div>

        {/* Property Type & Area */}
        <div className="flex items-center gap-2 text-[11px] font-medium">
          <span className="uppercase tracking-wider font-bold text-neutral-800 dark:text-white/90">
            {property.propertyType}
          </span>
          <span className="text-neutral-300 dark:text-white/20">•</span>
          <span className="text-neutral-500 dark:text-white/60 truncate">
            {property.area}
          </span>
        </div>

        {/* Title */}
        <h3 className="font-serif text-base sm:text-lg font-bold text-neutral-900 dark:text-white group-hover:text-brand-green-primary dark:group-hover:text-brand-green-sage transition-colors line-clamp-2 leading-snug">
          {property.title}
        </h3>

        {/* Location */}
        <div className="flex items-center gap-1.5 text-xs text-neutral-500 dark:text-white/60">
          <MapPin className="w-3.5 h-3.5 text-brand-green-primary dark:text-brand-green-sage shrink-0" />
          <span className="truncate">{property.location}</span>
        </div>

        {/* Optional Description if present */}
        {property.shortDescription && (
          <p className="text-xs text-neutral-600 dark:text-neutral-300 line-clamp-2 font-light leading-relaxed">
            {property.shortDescription}
          </p>
        )}

        {/* Beds / Baths / Size */}
        <div className="pt-2.5 border-t border-black/8 dark:border-white/10 flex items-center justify-between text-xs text-neutral-600 dark:text-white/60 font-medium">
          <div className="flex items-center gap-3">
            {property.bedrooms > 0 && (
              <div className="flex items-center gap-1" title={`${property.bedrooms} Bedrooms`}>
                <Bed className="w-3.5 h-3.5 text-brand-green-primary dark:text-brand-green-sage" />
                <span>{property.bedrooms} Beds</span>
              </div>
            )}
            {property.bathrooms > 0 && (
              <div className="flex items-center gap-1" title={`${property.bathrooms} Bathrooms`}>
                <Bath className="w-3.5 h-3.5 text-brand-green-primary dark:text-brand-green-sage" />
                <span>{property.bathrooms} Baths</span>
              </div>
            )}
          </div>

          {property.propertySize && (
            <span className="text-[11px] text-neutral-500 dark:text-white/40 font-mono">{property.propertySize}</span>
          )}
        </div>

        {/* Explore / Message CTA */}
        <div className="flex items-center gap-2 pt-1">
          <button
            onClick={handleCardClick}
            className="flex-1 py-2 px-3.5 rounded-xl bg-black/5 hover:bg-brand-green-primary hover:text-white dark:bg-white/10 dark:hover:bg-brand-green-primary dark:hover:text-white text-neutral-900 dark:text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-all uppercase tracking-wider group/btn"
          >
            <span>Explore</span>
            <ArrowUpRight className="w-3.5 h-3.5 text-neutral-400 dark:text-white/50 group-hover/btn:text-white group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" />
          </button>

          <button
            id={`card-whatsapp-${property.id}`}
            onClick={handleWhatsAppClick}
            title="Chat on WhatsApp"
            className="p-2 rounded-xl bg-brand-green-primary hover:bg-brand-green-deep text-white transition-all shadow-md hover:scale-105 active:scale-95"
          >
            <MessageSquare className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
