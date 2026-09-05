import React from 'react';
import { ServicedApartment } from '../types';
import { useApp } from '../context/AppContext';
import { formatNaira, formatWhatsAppUrl } from '../utils/formatters';
import { Users, Bed, MapPin, Zap, Wifi, ArrowUpRight, MessageSquare, ShieldCheck } from 'lucide-react';
import apt2Image from '../assets/images/regenerated_image_1788542609416.jpg';

interface ApartmentCardProps {
  apartment: ServicedApartment;
}

export const ApartmentCard: React.FC<ApartmentCardProps> = ({ apartment }) => {
  const { navigate, settings } = useApp();

  const handleCardClick = () => {
    navigate(`/shortlets/${apartment.slug}`);
  };

  const whatsappMessage = `Hello Selling Ajah, I want to inquire about booking the serviced shortlet: "${apartment.name}" located at ${apartment.location}. Price: ${formatNaira(apartment.pricePerNight)}/night. What is the availability?`;
  const whatsappUrl = formatWhatsAppUrl(settings.whatsapp, whatsappMessage);

  const displayImage = apartment.id === 'apt-2' 
    ? apt2Image 
    : apartment.mainImage;

  return (
    <div
      id={`apartment-card-${apartment.id}`}
      onClick={handleCardClick}
      className="group bg-white dark:bg-[#111111] hover:bg-neutral-50/80 dark:hover:bg-[#151515] border border-black/8 dark:border-white/10 hover:border-[#D4AF37]/60 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl dark:shadow-none dark:hover:shadow-[0_10px_30px_rgba(0,0,0,0.8)] transition-all duration-300 flex flex-col cursor-pointer"
    >
      {/* Image */}
      <div className="relative aspect-[16/10] overflow-hidden bg-neutral-900">
        <img
          src={displayImage}
          alt={apartment.name}
          loading="lazy"
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out opacity-95 group-hover:opacity-100"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-black/25" />

        <div className="absolute top-3.5 left-3.5 flex items-center gap-2">
          <span className="bg-[#D4AF37] text-black text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider shadow-sm">
            Serviced Stay
          </span>
          <span className="bg-black/75 backdrop-blur-md border border-emerald-500/40 text-emerald-400 text-[10px] font-semibold px-2.5 py-0.5 rounded-full flex items-center gap-1.5 shadow-sm">
            <Zap className="w-3 h-3 text-emerald-400" /> 24/7 Power
          </span>
        </div>

        <div className="absolute bottom-3.5 left-3.5 right-3.5 flex items-end justify-between z-10">
          <div>
            <span className="text-[9px] text-white/70 uppercase tracking-widest block mb-0.5 font-bold">Nightly Rate</span>
            <div className="text-xl sm:text-2xl font-serif font-bold text-[#D4AF37] tracking-tight drop-shadow-md">
              {formatNaira(apartment.pricePerNight)}
              <span className="text-xs font-sans text-white/80 font-normal"> /night</span>
            </div>
          </div>
          <span className="text-[10px] text-[#D4AF37] font-semibold bg-black/80 backdrop-blur-md px-2.5 py-0.5 rounded-full border border-[#D4AF37]/40 uppercase tracking-wider">
            {apartment.area}
          </span>
        </div>
      </div>

      {/* Details */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
        <div>
          <h3 className="font-serif text-lg font-bold text-neutral-900 dark:text-white group-hover:text-[#D4AF37] dark:group-hover:text-[#D4AF37] transition-colors line-clamp-1 mb-2 leading-snug">
            {apartment.name}
          </h3>

          <div className="flex items-center gap-1.5 text-xs text-neutral-500 dark:text-white/60 mb-3">
            <MapPin className="w-3.5 h-3.5 text-[#D4AF37] shrink-0" />
            <span className="truncate">{apartment.location}</span>
          </div>

          <p className="text-xs text-neutral-600 dark:text-white/60 line-clamp-2 mb-4 font-light leading-relaxed">
            {apartment.description}
          </p>

          {/* Quick Perks */}
          <div className="flex flex-wrap gap-1.5 mb-4">
            <span className="text-[10px] bg-black/5 dark:bg-white/5 border border-black/8 dark:border-white/10 text-neutral-700 dark:text-white/70 px-2.5 py-1 rounded-lg flex items-center gap-1.5 font-medium">
              <Users className="w-3 h-3 text-[#D4AF37]" /> Up to {apartment.maxGuests} guests
            </span>
            <span className="text-[10px] bg-black/5 dark:bg-white/5 border border-black/8 dark:border-white/10 text-neutral-700 dark:text-white/70 px-2.5 py-1 rounded-lg flex items-center gap-1.5 font-medium">
              <Bed className="w-3 h-3 text-[#D4AF37]" /> {apartment.bedrooms} Bedrooms
            </span>
            <span className="text-[10px] bg-black/5 dark:bg-white/5 border border-black/8 dark:border-white/10 text-neutral-700 dark:text-white/70 px-2.5 py-1 rounded-lg flex items-center gap-1.5 font-medium">
              <Wifi className="w-3 h-3 text-[#D4AF37]" /> Starlink WiFi
            </span>
          </div>
        </div>

        {/* Buttons */}
        <div className="pt-3 border-t border-black/8 dark:border-white/10 flex items-center gap-2">
          <button
            onClick={handleCardClick}
            className="flex-1 py-2 px-3.5 rounded-full bg-black/5 hover:bg-[#D4AF37] hover:text-black dark:bg-white/10 dark:hover:bg-[#D4AF37] dark:hover:text-black text-neutral-900 dark:text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-all uppercase tracking-wider group/btn"
          >
            <span>Reserve Stay</span>
            <ArrowUpRight className="w-3.5 h-3.5 text-neutral-400 dark:text-white/50 group-hover/btn:text-black group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" />
          </button>

          <a
            id={`apt-whatsapp-${apartment.id}`}
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
