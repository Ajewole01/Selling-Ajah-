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
      className={`sa-vehicle-card group ${featured ? 'sa-vehicle-card--featured' : ''} cursor-pointer`}
    >
      {/* Vehicle Image */}
      <div className="sa-vehicle-card__image relative aspect-[16/10] overflow-hidden bg-neutral-900">
        <img
          src={vehicle.mainImage}
          alt={vehicle.name}
          loading="lazy"
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out opacity-95 group-hover:opacity-100"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/25 to-black/35 pointer-events-none" />

        <div className="sa-vehicle-card__labels absolute top-3.5 left-3.5 right-3.5 flex items-center justify-between z-10">
          <span className="sa-vehicle-card__category bg-brand-gold text-brand-black-deep text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-sm">
            {vehicle.category}
          </span>
          <span className="text-[11px] text-white/90 font-medium bg-black/70 backdrop-blur-md px-2.5 py-0.5 rounded-full border border-white/15 shadow-sm">
            {vehicle.year}
          </span>
        </div>

        <div className="absolute bottom-3.5 left-3.5 right-3.5 flex items-end justify-between z-10">
          <div>
            <span className="text-[9px] text-white/75 uppercase tracking-widest block mb-0.5 font-bold">Daily rate</span>
            <div className="text-xl sm:text-2xl font-serif font-bold text-brand-gold tracking-tight drop-shadow-md">
              {formatNaira(vehicle.dailyRate)}
              <span className="text-xs font-sans text-white/80 font-normal"> /day</span>
            </div>
          </div>
          <span className="text-[10px] text-brand-gold bg-black/70 backdrop-blur-md px-2.5 py-1 rounded-md border border-brand-gold/30 font-medium flex items-center gap-1">
            Chauffeur ready
          </span>
        </div>
      </div>

      {/* Details */}
      <div className="sa-vehicle-card__body p-4 sm:p-5 flex flex-col gap-3">
        <div>
          <div className="text-[10px] font-bold text-brand-gold uppercase tracking-widest mb-1">
            {vehicle.brand}
          </div>
          <h3 className="font-serif text-lg sm:text-xl font-bold text-neutral-900 dark:text-white group-hover:text-brand-gold dark:group-hover:text-brand-gold transition-colors line-clamp-1 mb-1.5 leading-snug">
            {vehicle.name}
          </h3>

          <p className="text-xs text-neutral-600 dark:text-neutral-300 line-clamp-2 mb-3 font-normal leading-relaxed">
            {vehicle.shortDescription || vehicle.description}
          </p>

          <div className="sa-vehicle-card__specs flex flex-wrap gap-2 text-xs">
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
        </div>

        {/* Action buttons */}
        <div className="pt-3 border-t border-black/8 dark:border-white/10 flex items-center gap-2">
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
