import React from 'react';
import { LuxuryVehicle } from '../types';
import { useApp } from '../context/AppContext';
import { formatNaira, formatWhatsAppUrl } from '../utils/formatters';
import { ShieldCheck, UserCheck, Users, Fuel, ArrowUpRight, MessageSquare } from 'lucide-react';

interface VehicleCardProps {
  vehicle: LuxuryVehicle;
}

export const VehicleCard: React.FC<VehicleCardProps> = ({ vehicle }) => {
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
      className="group bg-white dark:bg-[#111111] hover:bg-neutral-50/80 dark:hover:bg-[#151515] border border-black/8 dark:border-white/10 hover:border-[#D4AF37]/60 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl dark:shadow-none dark:hover:shadow-[0_10px_30px_rgba(0,0,0,0.8)] transition-all duration-300 flex flex-col cursor-pointer"
    >
      {/* Vehicle Image */}
      <div className="relative aspect-[16/10] overflow-hidden bg-neutral-900">
        <img
          src={vehicle.mainImage}
          alt={vehicle.name}
          loading="lazy"
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out opacity-95 group-hover:opacity-100"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-black/25" />

        <div className="absolute top-3.5 left-3.5 flex items-center gap-2">
          <span className="bg-[#D4AF37] text-black text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider shadow-sm">
            {vehicle.category}
          </span>
          <span className="bg-black/75 backdrop-blur-md border border-[#D4AF37]/40 text-[#D4AF37] text-[10px] font-semibold px-2.5 py-0.5 rounded-full flex items-center gap-1.5 shadow-sm">
            <UserCheck className="w-3 h-3 text-[#D4AF37]" /> Chauffeur Included
          </span>
        </div>

        <div className="absolute bottom-3.5 left-3.5 right-3.5 flex items-end justify-between z-10">
          <div>
            <span className="text-[9px] text-white/70 uppercase tracking-widest block mb-0.5 font-bold">Daily Chauffeur Rate</span>
            <div className="text-xl sm:text-2xl font-serif font-bold text-[#D4AF37] tracking-tight drop-shadow-md">
              {formatNaira(vehicle.dailyRate)}
              <span className="text-xs font-sans text-white/80 font-normal"> /day</span>
            </div>
          </div>
          <span className="text-[10px] text-white/90 font-semibold bg-black/80 backdrop-blur-md px-2.5 py-0.5 rounded-full border border-white/20">
            {vehicle.year}
          </span>
        </div>
      </div>

      {/* Details */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
        <div>
          <div className="text-[10px] font-bold text-[#D4AF37] uppercase tracking-widest mb-1">
            {vehicle.brand}
          </div>
          <h3 className="font-serif text-lg font-bold text-neutral-900 dark:text-white group-hover:text-[#D4AF37] dark:group-hover:text-[#D4AF37] transition-colors line-clamp-1 mb-2 leading-snug">
            {vehicle.name}
          </h3>

          <p className="text-xs text-neutral-600 dark:text-white/60 line-clamp-2 mb-4 font-light leading-relaxed">
            {vehicle.shortDescription || vehicle.description}
          </p>

          <div className="flex flex-wrap gap-1.5 text-xs text-neutral-700 dark:text-white/70 mb-4">
            <span className="text-[10px] bg-black/5 dark:bg-white/5 border border-black/8 dark:border-white/10 text-neutral-700 dark:text-white/70 px-2.5 py-1 rounded-lg flex items-center gap-1.5 font-medium">
              <Users className="w-3 h-3 text-[#D4AF37]" /> {vehicle.seats} Seats
            </span>
            <span className="text-[10px] bg-black/5 dark:bg-white/5 border border-black/8 dark:border-white/10 text-neutral-700 dark:text-white/70 px-2.5 py-1 rounded-lg font-medium">
              {vehicle.transmission}
            </span>
            <span className="text-[10px] bg-black/5 dark:bg-white/5 border border-black/8 dark:border-white/10 text-neutral-700 dark:text-white/70 px-2.5 py-1 rounded-lg flex items-center gap-1.5 font-medium">
              <Fuel className="w-3 h-3 text-[#D4AF37]" /> {vehicle.fuelType}
            </span>
          </div>
        </div>

        {/* Action buttons */}
        <div className="pt-3 border-t border-black/8 dark:border-white/10 flex items-center gap-2">
          <button
            onClick={handleCardClick}
            className="flex-1 py-2 px-3.5 rounded-full bg-black/5 hover:bg-[#D4AF37] hover:text-black dark:bg-white/10 dark:hover:bg-[#D4AF37] dark:hover:text-black text-neutral-900 dark:text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-all uppercase tracking-wider group/btn"
          >
            <span>Book Chauffeur</span>
            <ArrowUpRight className="w-3.5 h-3.5 text-neutral-400 dark:text-white/50 group-hover/btn:text-black group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" />
          </button>

          <a
            id={`veh-whatsapp-${vehicle.id}`}
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={e => e.stopPropagation()}
            title="Book via WhatsApp"
            className="p-2 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white transition-all shadow-md shadow-emerald-600/20 hover:scale-105 active:scale-95"
          >
            <MessageSquare className="w-4 h-4" />
          </a>
        </div>
      </div>
    </div>
  );
};
