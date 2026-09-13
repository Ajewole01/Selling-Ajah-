import React from 'react';
import { LuxuryVehicle } from '../types';
import { useApp } from '../context/AppContext';
import { formatNaira, formatWhatsAppUrl } from '../utils/formatters';
import { Users, Fuel, ArrowUpRight, MessageSquare } from 'lucide-react';

interface VehicleCardProps {
  vehicle: LuxuryVehicle;
  featured?: boolean;
}

export const VehicleCard: React.FC<VehicleCardProps> = ({ vehicle, featured = false }) => {
  const { navigate, settings } = useApp();

  const handleCardClick = () => {
    navigate(`/cars/${vehicle.slug}`);
  };

  const whatsappMessage = `Hello Selling Ajah, I want to inquire about renting the luxury vehicle: "${vehicle.name}" (${formatNaira(vehicle.dailyRate)}/day). Please let me know available dates and chauffeur options.`;
  const whatsappUrl = formatWhatsAppUrl(settings.whatsapp, whatsappMessage);

  return (
    <div
      id={`vehicle-card-${vehicle.id}`}
      onClick={handleCardClick}
      className={`sa-vehicle-card group self-start h-auto ${featured ? 'sa-vehicle-card--featured' : ''} cursor-pointer`}
    >
      {/* 1. Vehicle Image */}
      <div className="sa-vehicle-card__image relative aspect-[16/10] overflow-hidden bg-neutral-900 shrink-0">
        <img
          src={vehicle.mainImage}
          alt={vehicle.name}
          loading="lazy"
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out opacity-95 group-hover:opacity-100"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/25 pointer-events-none" />

        {/* Category & Year Badges */}
        <div className="sa-vehicle-card__labels absolute top-3 left-3 right-3 flex items-center justify-between z-10">
          <span className="sa-vehicle-card__category bg-brand-gold text-brand-black-deep text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-sm">
            {vehicle.category}
          </span>
          <span className="text-[11px] text-white/90 font-medium bg-black/70 backdrop-blur-md px-2.5 py-0.5 rounded-full border border-white/15 shadow-sm">
            {vehicle.year}
          </span>
        </div>
      </div>

      {/* 2. Details Body: Natural vertical flow */}
      <div className="sa-vehicle-card__body p-4 sm:p-5 flex flex-col gap-2.5">
        {/* Daily Rate */}
        <div className="flex items-baseline justify-between gap-2">
          <div>
            <span className="text-[10px] text-neutral-400 dark:text-white/40 uppercase tracking-widest block font-bold leading-tight">
              Daily rate
            </span>
            <div className="text-xl sm:text-2xl font-serif font-bold text-brand-gold tracking-tight">
              {formatNaira(vehicle.dailyRate)}
              <span className="text-xs font-sans text-neutral-500 dark:text-white/50 font-normal"> /day</span>
            </div>
          </div>
          <span className="text-[10px] text-brand-gold bg-brand-gold/10 px-2 py-0.5 rounded border border-brand-gold/30 font-medium">
            Chauffeur ready
          </span>
        </div>

        {/* Brand / Type */}
        <div className="text-[10px] font-bold text-neutral-800 dark:text-white/90 uppercase tracking-widest">
          {vehicle.brand} • {vehicle.category}
        </div>

        {/* Vehicle Name */}
        <h3 className="font-serif text-lg sm:text-xl font-bold text-neutral-900 dark:text-white group-hover:text-brand-gold dark:group-hover:text-brand-gold transition-colors line-clamp-1 leading-snug">
          {vehicle.name}
        </h3>

        {/* Short Description */}
        <p className="text-xs text-neutral-600 dark:text-neutral-300 line-clamp-2 font-normal leading-relaxed">
          {vehicle.shortDescription || vehicle.description}
        </p>

        {/* Feature Pills */}
        <div className="sa-vehicle-card__specs flex flex-wrap gap-2 text-xs pt-1">
          <span className="text-[11px] px-2.5 py-1 rounded-lg flex items-center gap-1.5 font-medium">
            <Users className="w-3.5 h-3.5 text-brand-gold" /> {vehicle.seats} Seats
          </span>
          <span className="text-[11px] px-2.5 py-1 rounded-lg flex items-center gap-1.5 font-medium">
            {vehicle.transmission}
          </span>
          <span className="text-[11px] px-2.5 py-1 rounded-lg flex items-center gap-1.5 font-medium">
            <Fuel className="w-3.5 h-3.5 text-brand-gold" /> {vehicle.fuelType}
          </span>
        </div>

        {/* CTA / Message */}
        <div className="pt-2.5 border-t border-black/8 dark:border-white/10 flex items-center gap-2">
          <button
            onClick={handleCardClick}
            className="flex-1 py-2.5 px-4 rounded-xl bg-neutral-900 hover:bg-brand-gold hover:text-brand-black-deep dark:bg-white/10 dark:hover:bg-brand-gold dark:hover:text-brand-black-deep text-white text-xs font-semibold flex items-center justify-center gap-2 transition-all uppercase tracking-wider group/btn"
          >
            <span>View dossier</span>
            <ArrowUpRight className="w-3.5 h-3.5 text-brand-gold group-hover/btn:text-brand-black-deep group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" />
          </button>

          <a
            id={`veh-whatsapp-${vehicle.id}`}
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={e => e.stopPropagation()}
            title="Book via WhatsApp"
            className="p-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white transition-all shadow-md shadow-emerald-600/20 hover:scale-105 active:scale-95 flex items-center justify-center"
          >
            <MessageSquare className="w-4 h-4" />
          </a>
        </div>
      </div>
    </div>
  );
};
