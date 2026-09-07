import React, { useRef, useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { LuxuryVehicle } from '../types';
import { formatNaira, formatWhatsAppUrl } from '../utils/formatters';
import { ShareModal } from '../components/ShareModal';
import { useEditorialMotion } from '../hooks/useEditorialMotion';
import {
  Car,
  UserCheck,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  MessageSquare,
  ChevronLeft,
  ChevronRight,
  Share2,
  Loader2,
  Send,
  Users,
  Fuel,
  Info,
  ArrowUpRight
} from 'lucide-react';

interface CarDetailViewProps {
  slug: string;
}

export const CarDetailView: React.FC<CarDetailViewProps> = ({ slug }) => {
  const { navigate, addToast, settings } = useApp();
  const pageRef = useRef<HTMLDivElement>(null);
  useEditorialMotion(pageRef);

  const [vehicle, setVehicle] = useState<LuxuryVehicle | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  // Reservation form
  const [startDate, setStartDate] = useState('');
  const [durationDays, setDurationDays] = useState(1);
  const [withSecurityEscort, setWithSecurityEscort] = useState(false);
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [pickupLocation, setPickupLocation] = useState('Ajah / Lekki');
  const [submittingBooking, setSubmittingBooking] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/vehicles/${slug}`)
      .then(res => {
        if (!res.ok) throw new Error('Vehicle not found');
        return res.json();
      })
      .then((data: LuxuryVehicle) => {
        setVehicle(data);
        setActiveImageIndex(0);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAF9F5] dark:bg-brand-black-deep flex items-center justify-center text-neutral-500 dark:text-white/50">
        <Loader2 className="w-8 h-8 animate-spin text-brand-gold" />
      </div>
    );
  }

  if (!vehicle) {
    return (
      <div className="min-h-screen bg-[#FAF9F5] dark:bg-brand-black-deep flex items-center justify-center p-6 text-center">
        <div className="max-w-md">
          <h2 className="font-serif text-2xl font-bold text-neutral-900 dark:text-white mb-2">Vehicle Not Found</h2>
          <button
            onClick={() => navigate('/cars')}
            className="px-5 py-2.5 rounded-full bg-brand-gold hover:bg-brand-gold-deep text-brand-black-deep font-bold text-xs uppercase tracking-wider shadow-sm font-mono cursor-pointer"
          >
            Browse Fleet
          </button>
        </div>
      </div>
    );
  }

  const images = vehicle.images && vehicle.images.length > 0 ? vehicle.images : [vehicle.mainImage];
  const securityAddonPerDay = 100000;
  const baseTotal = vehicle.dailyRate * durationDays;
  const escortTotal = withSecurityEscort ? securityAddonPerDay * durationDays : 0;
  const grandTotal = baseTotal + escortTotal;

  const whatsappMessage = `Hello Selling Ajah, I'd like to reserve "${vehicle.name}" (${formatNaira(vehicle.dailyRate)}/day) for ${durationDays} day(s) starting ${startDate || 'soon'}. Armed escort: ${withSecurityEscort ? 'Yes' : 'No'}. Pickup: ${pickupLocation}. Please confirm availability.`;
  const whatsappUrl = formatWhatsAppUrl(settings.whatsapp, whatsappMessage);

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName || !clientPhone) {
      addToast('Please provide your name and WhatsApp number.', 'error');
      return;
    }

    setSubmittingBooking(true);
    try {
      const payload = {
        name: clientName,
        phone: clientPhone,
        email: 'car-hire@sellingajah.com',
        whatsapp: clientPhone,
        service: 'car_rental',
        propertyId: vehicle.id,
        propertyTitle: vehicle.name,
        message: `Car Rental Request: "${vehicle.name}". Duration: ${durationDays} day(s) from ${startDate || 'ASAP'}. Armed Escort: ${withSecurityEscort ? 'YES' : 'NO'}. Pickup: ${pickupLocation}. Total Estimate: ${formatNaira(grandTotal)}.`
      };

      const res = await fetch('/api/enquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) throw new Error('Failed to submit car booking');

      setBookingSuccess(true);
      addToast('Reservation requested! Our executive dispatcher will contact you immediately.', 'success');
    } catch (err) {
      console.error(err);
      addToast('Failed to submit. Please chat on WhatsApp directly.', 'error');
    } finally {
      setSubmittingBooking(false);
    }
  };

  return (
    <div ref={pageRef} className="sa-detail sa-car-brochure sa-detail--car min-h-screen bg-[#FAF9F5] dark:bg-brand-black-deep text-neutral-900 dark:text-[#F5F5F0] pb-28 transition-colors duration-200">
      
      {/* Breadcrumb Header */}
      <div className="border-b border-black/8 dark:border-white/10 bg-white dark:bg-brand-black-soft py-3.5 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between text-xs text-neutral-600 dark:text-white/60">
          <button
            onClick={() => navigate('/cars')}
            className="flex items-center gap-1 hover:text-brand-gold transition-colors font-mono cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Back to fleet</span>
          </button>
          <span className="text-brand-gold font-mono font-medium">Vehicle dossier · {vehicle.category}</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        
        {/* Title row */}
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2 mb-2 font-mono">
              <span className="bg-brand-gold text-brand-black-deep text-[10px] font-bold px-3 py-0.5 rounded-full uppercase tracking-wider">
                {vehicle.category}
              </span>
              <span className="text-xs bg-black/5 dark:bg-white/10 text-neutral-700 dark:text-white/70 px-3 py-0.5 rounded-full font-medium">
                {vehicle.brand} • {vehicle.year}
              </span>
            </div>

            <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-light text-neutral-900 dark:text-white mb-2">
              {vehicle.name}
            </h1>
            <p className="text-xs sm:text-sm text-neutral-600 dark:text-white/60 font-light">
              {vehicle.brand} {vehicle.model} · {vehicle.year} · Available for direct enquiry
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setIsShareModalOpen(true)}
              className="p-3 rounded-2xl bg-white dark:bg-brand-black-soft border border-black/10 dark:border-white/10 text-neutral-700 dark:text-white/70 hover:text-neutral-900 dark:hover:text-white transition-colors flex items-center gap-2 text-xs font-semibold shadow-sm cursor-pointer"
            >
              <Share2 className="w-4 h-4 text-brand-gold" />
              <span>Share</span>
            </button>
          </div>
        </div>

        {/* Gallery */}
        <div className="mb-10">
          <div className="relative aspect-[16/9] md:aspect-[21/9] rounded-3xl overflow-hidden bg-neutral-900 border border-black/8 dark:border-white/10 shadow-xl dark:shadow-2xl">
            <img
              src={images[activeImageIndex]}
              alt={vehicle.name}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover transition-opacity duration-300"
            />
            {images.length > 1 && (
              <>
                <button
                  onClick={() => setActiveImageIndex(prev => (prev === 0 ? images.length - 1 : prev - 1))}
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/60 hover:bg-black/90 text-white flex items-center justify-center backdrop-blur-md border border-white/20 cursor-pointer"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setActiveImageIndex(prev => (prev === images.length - 1 ? 0 : prev + 1))}
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/60 hover:bg-black/90 text-white flex items-center justify-center backdrop-blur-md border border-white/20 cursor-pointer"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </>
            )}
            <div className="absolute bottom-4 right-4 bg-black/70 backdrop-blur-md border border-white/20 text-white text-xs px-3.5 py-1.5 rounded-full font-mono">
              {activeImageIndex + 1} / {images.length} Photos
            </div>
          </div>

          {images.length > 1 && (
            <div className="flex gap-2.5 mt-3 overflow-x-auto pb-2">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImageIndex(idx)}
                  className={`w-20 h-14 rounded-xl overflow-hidden shrink-0 border-2 transition-all cursor-pointer ${
                    activeImageIndex === idx ? 'border-brand-gold scale-105 shadow-md' : 'border-transparent opacity-60 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Details & Booking Console */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 space-y-10">
            
            {/* Quick Specs */}
            <div className="grid grid-cols-3 gap-4 p-5 rounded-2xl bg-white dark:bg-brand-black-soft border border-black/8 dark:border-white/10 shadow-sm dark:shadow-none">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-brand-gold/10 border border-brand-gold/20 flex items-center justify-center text-brand-gold shrink-0">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[11px] text-neutral-500 dark:text-white/50 uppercase tracking-wider block font-mono">Seats</span>
                  <span className="text-sm sm:text-base font-bold text-neutral-900 dark:text-white">{vehicle.seats} Passengers</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-brand-gold/10 border border-brand-gold/20 flex items-center justify-center text-brand-gold shrink-0">
                  <Car className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[11px] text-neutral-500 dark:text-white/50 uppercase tracking-wider block font-mono">Transmission</span>
                  <span className="text-sm sm:text-base font-bold text-neutral-900 dark:text-white">{vehicle.transmission}</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-brand-gold/10 border border-brand-gold/20 flex items-center justify-center text-brand-gold shrink-0">
                  <Fuel className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[11px] text-neutral-500 dark:text-white/50 uppercase tracking-wider block font-mono">Fuel / Engine</span>
                  <span className="text-sm sm:text-base font-bold text-neutral-900 dark:text-white">{vehicle.fuelType}</span>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="bg-white dark:bg-brand-black-soft border border-black/8 dark:border-white/10 rounded-3xl p-6 sm:p-8 shadow-sm dark:shadow-none">
              <h3 className="font-serif text-xl font-bold text-neutral-900 dark:text-white mb-4">
                Vehicle Overview
              </h3>
              <p className="text-neutral-700 dark:text-white/70 text-xs sm:text-sm leading-relaxed whitespace-pre-line font-light">
                {vehicle.description}
              </p>
            </div>

            {/* Features */}
            <div className="bg-white dark:bg-brand-black-soft border border-black/8 dark:border-white/10 rounded-3xl p-6 sm:p-8 shadow-sm dark:shadow-none">
              <h3 className="font-serif text-xl font-bold text-neutral-900 dark:text-white mb-6">
                Fleet Features & Specifications
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {vehicle.features.map((feat, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2 p-3 rounded-xl bg-neutral-50 dark:bg-brand-black-deep border border-black/5 dark:border-white/10 text-xs text-neutral-800 dark:text-white/80"
                  >
                    <CheckCircle2 className="w-4 h-4 text-brand-gold shrink-0" />
                    <span>{feat}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Rental Guidelines */}
            <div className="bg-white dark:bg-brand-black-soft border border-black/8 dark:border-white/10 rounded-3xl p-6 sm:p-8 shadow-sm dark:shadow-none">
              <h3 className="font-serif text-xl font-bold text-neutral-900 dark:text-white mb-4 flex items-center gap-2">
                <Info className="w-5 h-5 text-brand-gold" />
                Rental Terms & Coverage
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-neutral-700 dark:text-white/70">
                <div className="p-4 bg-neutral-50 dark:bg-brand-black-deep rounded-xl border border-black/5 dark:border-white/10">
                  <span className="text-neutral-900 dark:text-white block mb-1 font-semibold">Chauffeur Service Window</span>
                  <p className="font-light">Standard 12-hour daily window within Lagos. Chauffeur overtime rate applies after 12 hours.</p>
                </div>
                <div className="p-4 bg-neutral-50 dark:bg-brand-black-deep rounded-xl border border-black/5 dark:border-white/10">
                  <span className="text-neutral-900 dark:text-white block mb-1 font-semibold">Fueling Protocol</span>
                  <p className="font-light">Delivered with full tank; client is responsible for fueling during rental usage or returned on same level.</p>
                </div>
                <div className="p-4 bg-neutral-50 dark:bg-brand-black-deep rounded-xl border border-black/5 dark:border-white/10">
                  <span className="text-neutral-900 dark:text-white block mb-1 font-semibold">Interstate Travel</span>
                  <p className="font-light">Interstate trips (outside Lagos State) require prior clearance and customized daily rates.</p>
                </div>
                <div className="p-4 bg-neutral-50 dark:bg-brand-black-deep rounded-xl border border-black/5 dark:border-white/10">
                  <span className="text-neutral-900 dark:text-white block mb-1 font-semibold">Security Escort Add-on</span>
                  <p className="font-light">Armed police mobile escort vehicle and personnel available upon advance request.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Col: Booking Console */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-6">
              <div className="bg-white dark:bg-brand-black-soft border border-black/8 dark:border-white/10 rounded-3xl p-6 sm:p-7 shadow-xl">
                <span className="text-xs text-neutral-500 dark:text-white/50 uppercase tracking-widest block mb-1 font-mono">
                  Daily Rental Rate
                </span>
                <div className="text-3xl font-serif font-bold text-brand-gold mb-4">
                  {formatNaira(vehicle.dailyRate)}
                  <span className="text-xs font-sans text-neutral-500 dark:text-white/50 font-normal"> / day</span>
                </div>

                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3.5 px-4 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-md shadow-emerald-600/20 mb-4 font-mono"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Instant WhatsApp Reservation</span>
                </a>

                {/* Direct Booking Form */}
                <div className="pt-4 border-t border-black/8 dark:border-white/10">
                  <h4 className="font-serif text-sm font-bold text-neutral-900 dark:text-white mb-3 flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-brand-gold" />
                    Reserve Online
                  </h4>

                  {bookingSuccess ? (
                    <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800/40 text-center">
                      <CheckCircle2 className="w-8 h-8 text-emerald-600 dark:text-emerald-400 mx-auto mb-2" />
                      <h5 className="font-bold text-neutral-900 dark:text-white text-xs mb-1">Reservation Received!</h5>
                      <p className="text-[11px] text-neutral-600 dark:text-white/60">
                        Our executive fleet manager will confirm your dispatch details.
                      </p>
                    </div>
                  ) : (
                    <form onSubmit={handleBookingSubmit} className="space-y-3">
                      <div>
                        <label className="block text-[10px] text-neutral-600 dark:text-white/50 uppercase font-semibold mb-1 font-mono">Start Date</label>
                        <input
                          type="date"
                          required
                          value={startDate}
                          onChange={e => setStartDate(e.target.value)}
                          className="w-full bg-neutral-100 dark:bg-brand-black-deep border border-black/10 dark:border-white/15 rounded-xl px-3 py-2 text-xs text-neutral-900 dark:text-white outline-none focus:border-brand-gold"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] text-neutral-600 dark:text-white/50 uppercase font-semibold mb-1 font-mono">Duration (Days)</label>
                        <select
                          value={durationDays}
                          onChange={e => setDurationDays(Number(e.target.value))}
                          className="w-full bg-neutral-100 dark:bg-brand-black-deep border border-black/10 dark:border-white/15 rounded-xl px-3 py-2 text-xs text-neutral-900 dark:text-white outline-none focus:border-brand-gold"
                        >
                          {[1, 2, 3, 4, 5, 7, 14, 30].map(d => (
                            <option key={d} value={d}>{d} {d === 1 ? 'Day' : 'Days'}</option>
                          ))}
                        </select>
                      </div>

                      {/* Security Addon Checkbox */}
                      <label className="flex items-center gap-2.5 p-3 rounded-xl bg-neutral-50 dark:bg-brand-black-deep border border-black/10 dark:border-white/10 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={withSecurityEscort}
                          onChange={e => setWithSecurityEscort(e.target.checked)}
                          className="w-4 h-4 rounded text-brand-gold bg-white dark:bg-brand-black-charcoal border-neutral-300 dark:border-white/20"
                        />
                        <div className="text-xs">
                          <span className="text-neutral-900 dark:text-white font-medium block">Add Armed Escort (+₦100,000/day)</span>
                          <span className="text-[10px] text-neutral-500 dark:text-white/50">MOPOL security escort unit</span>
                        </div>
                      </label>

                      <input
                        type="text"
                        required
                        placeholder="Your Full Name"
                        value={clientName}
                        onChange={e => setClientName(e.target.value)}
                        className="w-full bg-neutral-100 dark:bg-brand-black-deep border border-black/10 dark:border-white/15 rounded-xl px-3 py-2 text-xs text-neutral-900 dark:text-white outline-none focus:border-brand-gold"
                      />

                      <input
                        type="tel"
                        required
                        placeholder="WhatsApp Phone Number"
                        value={clientPhone}
                        onChange={e => setClientPhone(e.target.value)}
                        className="w-full bg-neutral-100 dark:bg-brand-black-deep border border-black/10 dark:border-white/15 rounded-xl px-3 py-2 text-xs text-neutral-900 dark:text-white outline-none focus:border-brand-gold"
                      />

                      <input
                        type="text"
                        placeholder="Pickup Location (e.g. Ajah, Lekki, Airport)"
                        value={pickupLocation}
                        onChange={e => setPickupLocation(e.target.value)}
                        className="w-full bg-neutral-100 dark:bg-brand-black-deep border border-black/10 dark:border-white/15 rounded-xl px-3 py-2 text-xs text-neutral-900 dark:text-white outline-none focus:border-brand-gold"
                      />

                      {/* Pricing Summary */}
                      <div className="p-3.5 bg-neutral-50 dark:bg-brand-black-deep rounded-xl border border-black/8 dark:border-white/10 text-xs space-y-1">
                        <div className="flex justify-between text-neutral-600 dark:text-white/60">
                          <span>Rate ({durationDays} days)</span>
                          <span>{formatNaira(baseTotal)}</span>
                        </div>
                        {withSecurityEscort && (
                          <div className="flex justify-between text-neutral-600 dark:text-white/60">
                            <span>Armed Escort</span>
                            <span>{formatNaira(escortTotal)}</span>
                          </div>
                        )}
                        <div className="flex justify-between text-neutral-900 dark:text-white font-bold pt-1.5 border-t border-black/8 dark:border-white/10">
                          <span>Total</span>
                          <span className="text-brand-gold">{formatNaira(grandTotal)}</span>
                        </div>
                      </div>

                      <button
                        type="submit"
                        disabled={submittingBooking}
                        className="w-full py-3.5 rounded-full bg-brand-gold hover:bg-brand-gold-deep text-brand-black-deep font-bold text-xs uppercase tracking-wider transition-colors flex items-center justify-center gap-1.5 shadow-md shadow-brand-gold/20 font-mono cursor-pointer"
                      >
                        {submittingBooking ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                        <span>Request Vehicle Dispatch</span>
                      </button>
                    </form>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <ShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        title={vehicle.name}
        url={`/cars/${vehicle.slug}`}
      />
    </div>
  );
};
