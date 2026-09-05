import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { ServicedApartment } from '../types';
import { formatNaira, formatWhatsAppUrl } from '../utils/formatters';
import { ShareModal } from '../components/ShareModal';
import apt2Image from '../assets/images/regenerated_image_1788542609416.jpg';
import {
  Key,
  MapPin,
  Users,
  Bed,
  Bath,
  Zap,
  Wifi,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  MessageSquare,
  ChevronLeft,
  ChevronRight,
  Share2,
  Loader2,
  Send,
  Sparkles,
  Info
} from 'lucide-react';

interface ShortletDetailViewProps {
  slug: string;
}

export const ShortletDetailView: React.FC<ShortletDetailViewProps> = ({ slug }) => {
  const { navigate, addToast, settings, openAiModal } = useApp();

  const [apartment, setApartment] = useState<ServicedApartment | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  // Booking form state
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [guestCount, setGuestCount] = useState('2');
  const [guestName, setGuestName] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [specialRequests, setSpecialRequests] = useState('');
  const [submittingBooking, setSubmittingBooking] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/apartments/${slug}`)
      .then(res => {
        if (!res.ok) throw new Error('Apartment not found');
        return res.json();
      })
      .then((data: ServicedApartment) => {
        setApartment(data);
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
      <div className="min-h-screen bg-[#FAF9F5] dark:bg-[#050505] flex items-center justify-center text-neutral-500 dark:text-white/50">
        <Loader2 className="w-8 h-8 animate-spin text-[#D4AF37]" />
      </div>
    );
  }

  if (!apartment) {
    return (
      <div className="min-h-screen bg-[#FAF9F5] dark:bg-[#050505] flex items-center justify-center p-6 text-center">
        <div className="max-w-md">
          <h2 className="font-serif text-2xl font-bold text-neutral-900 dark:text-white mb-2">Apartment Not Found</h2>
          <button
            onClick={() => navigate('/shortlets')}
            className="px-5 py-2.5 rounded-full bg-[#D4AF37] text-black font-bold text-xs uppercase tracking-wider shadow-sm"
          >
            Browse All Shortlets
          </button>
        </div>
      </div>
    );
  }

  const rawImages = (apartment.gallery && apartment.gallery.length > 0)
    ? apartment.gallery
    : (apartment.images && apartment.images.length > 0 ? apartment.images : [apartment.mainImage]);

  const images = rawImages.map((img, idx) => {
    if (apartment.id === 'apt-2' && (idx === 0 || img.includes('regenerated_image_1788542609416') || img === apartment.mainImage)) {
      return apt2Image;
    }
    return img;
  });

  // Calculate nights & total
  const calculateNights = () => {
    if (!checkIn || !checkOut) return 1;
    const d1 = new Date(checkIn);
    const d2 = new Date(checkOut);
    const diffTime = d2.getTime() - d1.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 1;
  };

  const nights = calculateNights();
  const totalPrice = apartment.pricePerNight * nights;

  const whatsappMessage = `Hello Selling Ajah, I'd like to book "${apartment.name}" (${formatNaira(apartment.pricePerNight)}/night) from ${checkIn || 'soon'} to ${checkOut || 'soon'} for ${guestCount} guests. Please confirm availability.`;
  const whatsappUrl = formatWhatsAppUrl(settings.whatsapp, whatsappMessage);

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!guestName || !guestPhone) {
      addToast('Please provide your name and phone number.', 'error');
      return;
    }

    setSubmittingBooking(true);
    try {
      const payload = {
        name: guestName,
        phone: guestPhone,
        email: 'shortlet-guest@sellingajah.com',
        whatsapp: guestPhone,
        service: 'shortlet',
        propertyId: apartment.id,
        propertyTitle: apartment.name,
        message: `Shortlet Booking Request for "${apartment.name}". Dates: ${checkIn || 'Unspecified'} to ${checkOut || 'Unspecified'} (${nights} nights). Guests: ${guestCount}. Estimated Total: ${formatNaira(totalPrice)}. Special requests: ${specialRequests}`
      };

      const res = await fetch('/api/enquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) throw new Error('Failed to submit booking');

      setBookingSuccess(true);
      addToast('Reservation requested! Our hospitality host will contact you.', 'success');
    } catch (err) {
      console.error(err);
      addToast('Failed to submit. Please book directly on WhatsApp.', 'error');
    } finally {
      setSubmittingBooking(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF9F5] dark:bg-[#070a10] text-neutral-900 dark:text-slate-100 pb-28 transition-colors duration-200">
      {/* Breadcrumb */}
      <div className="border-b border-black/8 dark:border-slate-800/80 bg-white dark:bg-slate-950/60 py-3 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between text-xs text-neutral-600 dark:text-slate-400">
          <button
            onClick={() => navigate('/shortlets')}
            className="flex items-center gap-1 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Back to all shortlets</span>
          </button>
          <span className="text-emerald-600 dark:text-emerald-400 font-medium">Verified 24/7 Power Shortlet</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {/* Title and Share */}
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-emerald-600 text-white text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                Serviced Shortlet
              </span>
              <span className="text-xs bg-black/5 dark:bg-slate-800 text-neutral-700 dark:text-slate-300 px-2.5 py-0.5 rounded-full font-medium">
                {apartment.area}
              </span>
            </div>

            <h1 className="font-serif text-2xl sm:text-3xl md:text-4xl font-bold text-neutral-900 dark:text-white mb-2">
              {apartment.name}
            </h1>

            <div className="flex items-center gap-2 text-xs sm:text-sm text-neutral-600 dark:text-slate-400">
              <MapPin className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>{apartment.location}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setIsShareModalOpen(true)}
              className="p-3 rounded-2xl bg-white dark:bg-slate-900 border border-black/10 dark:border-slate-800 text-neutral-700 dark:text-slate-300 hover:text-neutral-900 dark:hover:text-white transition-colors flex items-center gap-2 text-xs font-semibold shadow-sm"
            >
              <Share2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Share</span>
            </button>
          </div>
        </div>

        {/* Gallery */}
        <div className="mb-10">
          <div className="relative aspect-[16/9] md:aspect-[21/9] rounded-3xl overflow-hidden bg-neutral-900 border border-black/8 dark:border-slate-800 shadow-xl dark:shadow-2xl">
            <img
              src={images[activeImageIndex]}
              alt={apartment.name}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover transition-opacity duration-300"
            />
            {images.length > 1 && (
              <>
                <button
                  onClick={() => setActiveImageIndex(prev => (prev === 0 ? images.length - 1 : prev - 1))}
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/60 hover:bg-black/90 text-white flex items-center justify-center backdrop-blur-md border border-white/20"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setActiveImageIndex(prev => (prev === images.length - 1 ? 0 : prev + 1))}
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/60 hover:bg-black/90 text-white flex items-center justify-center backdrop-blur-md border border-white/20"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </>
            )}
            <div className="absolute bottom-4 right-4 bg-black/70 backdrop-blur-md border border-white/20 text-white text-xs px-3 py-1.5 rounded-full font-mono">
              {activeImageIndex + 1} / {images.length} Photos
            </div>
          </div>

          {images.length > 1 && (
            <div className="flex gap-2.5 mt-3 overflow-x-auto pb-2">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImageIndex(idx)}
                  className={`w-20 h-14 rounded-xl overflow-hidden shrink-0 border-2 transition-all ${
                    activeImageIndex === idx ? 'border-emerald-500 scale-105 shadow-md' : 'border-transparent opacity-60 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Details & Booking Console Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Left 2 Cols: Details, Specs, Amenities */}
          <div className="lg:col-span-2 space-y-10">
            {/* Quick Specs */}
            <div className="grid grid-cols-3 gap-4 p-5 rounded-2xl bg-white dark:bg-slate-900/80 border border-black/8 dark:border-slate-800 shadow-sm dark:shadow-none">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[11px] text-neutral-500 dark:text-slate-400 uppercase tracking-wider block">Max Guests</span>
                  <span className="text-sm sm:text-base font-bold text-neutral-900 dark:text-white">Up to {apartment.maxGuests}</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
                  <Bed className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[11px] text-neutral-500 dark:text-slate-400 uppercase tracking-wider block">Bedrooms</span>
                  <span className="text-sm sm:text-base font-bold text-neutral-900 dark:text-white">{apartment.bedrooms} Ensuite</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
                  <Bath className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[11px] text-neutral-500 dark:text-slate-400 uppercase tracking-wider block">Bathrooms</span>
                  <span className="text-sm sm:text-base font-bold text-neutral-900 dark:text-white">{apartment.bathrooms} Baths</span>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="bg-white dark:bg-slate-900/60 border border-black/8 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm dark:shadow-none">
              <h3 className="font-serif text-xl font-bold text-neutral-900 dark:text-white mb-4">
                About this Serviced Residence
              </h3>
              <p className="text-neutral-700 dark:text-slate-300 text-xs sm:text-sm leading-relaxed whitespace-pre-line">
                {apartment.description}
              </p>
            </div>

            {/* Amenities Grid */}
            <div className="bg-white dark:bg-slate-900/60 border border-black/8 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm dark:shadow-none">
              <h3 className="font-serif text-xl font-bold text-neutral-900 dark:text-white mb-6">
                Included Amenities & Hospitality
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {apartment.amenities.map((amenity, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2 p-3 rounded-xl bg-neutral-50 dark:bg-slate-950/80 border border-black/5 dark:border-slate-800/80 text-xs text-neutral-800 dark:text-slate-200"
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <span>{amenity}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* House Rules & Policies */}
            <div className="bg-white dark:bg-slate-900/60 border border-black/8 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm dark:shadow-none">
              <h3 className="font-serif text-xl font-bold text-neutral-900 dark:text-white mb-4 flex items-center gap-2">
                <Info className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                House Rules & Policies
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-neutral-700 dark:text-slate-300">
                <div className="p-3 bg-neutral-50 dark:bg-slate-950 rounded-xl border border-black/5 dark:border-slate-800">
                  <span className="text-neutral-500 dark:text-slate-400 block mb-1 font-semibold">Check-in / Check-out</span>
                  <p>Check-in: From 2:00 PM | Check-out: 11:00 AM</p>
                </div>
                <div className="p-3 bg-neutral-50 dark:bg-slate-950 rounded-xl border border-black/5 dark:border-slate-800">
                  <span className="text-neutral-500 dark:text-slate-400 block mb-1 font-semibold">Parties & Gatherings</span>
                  <p>Strict quiet hours from 11:00 PM. No loud external parties without written concierge clearance.</p>
                </div>
                <div className="p-3 bg-neutral-50 dark:bg-slate-950 rounded-xl border border-black/5 dark:border-slate-800">
                  <span className="text-neutral-500 dark:text-slate-400 block mb-1 font-semibold">Security Deposit (Caution Fee)</span>
                  <p>Refundable caution fee applies, refunded within 2 hours of checkout inspection.</p>
                </div>
                <div className="p-3 bg-neutral-50 dark:bg-slate-950 rounded-xl border border-black/5 dark:border-slate-800">
                  <span className="text-neutral-500 dark:text-slate-400 block mb-1 font-semibold">Smoking Policy</span>
                  <p>Smoking permitted strictly in open balcony/patio areas only.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Col: Sticky Booking Console */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-6">
              <div className="bg-white dark:bg-slate-900 border border-black/8 dark:border-slate-800 rounded-3xl p-6 shadow-md dark:shadow-2xl">
                <span className="text-xs text-neutral-500 dark:text-slate-400 uppercase tracking-widest block mb-1">
                  Nightly Rate
                </span>
                <div className="text-3xl font-serif font-bold text-neutral-900 dark:text-white mb-4">
                  {formatNaira(apartment.pricePerNight)}
                  <span className="text-xs font-sans text-neutral-500 dark:text-slate-400 font-normal"> / night</span>
                </div>

                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-600/20 mb-4"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Instant WhatsApp Reservation</span>
                </a>

                {/* Direct Booking Form */}
                <div className="pt-4 border-t border-black/8 dark:border-slate-800">
                  <h4 className="font-serif text-sm font-bold text-neutral-900 dark:text-white mb-3 flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    Reserve Online
                  </h4>

                  {bookingSuccess ? (
                    <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800/40 text-center">
                      <CheckCircle2 className="w-8 h-8 text-emerald-600 dark:text-emerald-400 mx-auto mb-2" />
                      <h5 className="font-bold text-neutral-900 dark:text-white text-xs mb-1">Booking Submitted!</h5>
                      <p className="text-[11px] text-neutral-600 dark:text-slate-400">
                        Our guest host is processing your dates and will contact you directly.
                      </p>
                    </div>
                  ) : (
                    <form onSubmit={handleBookingSubmit} className="space-y-3">
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[10px] text-neutral-600 dark:text-slate-400 uppercase font-semibold mb-1">Check-in</label>
                          <input
                            type="date"
                            required
                            value={checkIn}
                            onChange={e => setCheckIn(e.target.value)}
                            className="w-full bg-neutral-100 dark:bg-slate-950 border border-black/10 dark:border-slate-800 rounded-xl px-2.5 py-2 text-xs text-neutral-900 dark:text-slate-300 outline-none focus:border-emerald-500"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] text-neutral-600 dark:text-slate-400 uppercase font-semibold mb-1">Check-out</label>
                          <input
                            type="date"
                            required
                            value={checkOut}
                            onChange={e => setCheckOut(e.target.value)}
                            className="w-full bg-neutral-100 dark:bg-slate-950 border border-black/10 dark:border-slate-800 rounded-xl px-2.5 py-2 text-xs text-neutral-900 dark:text-slate-300 outline-none focus:border-emerald-500"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[10px] text-neutral-600 dark:text-slate-400 uppercase font-semibold mb-1">Guests</label>
                        <select
                          value={guestCount}
                          onChange={e => setGuestCount(e.target.value)}
                          className="w-full bg-neutral-100 dark:bg-slate-950 border border-black/10 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-neutral-900 dark:text-white outline-none focus:border-emerald-500"
                        >
                          {[...Array(apartment.maxGuests)].map((_, i) => (
                            <option key={i + 1} value={i + 1}>
                              {i + 1} {i === 0 ? 'Guest' : 'Guests'}
                            </option>
                          ))}
                        </select>
                      </div>

                      <input
                        type="text"
                        required
                        placeholder="Your Full Name"
                        value={guestName}
                        onChange={e => setGuestName(e.target.value)}
                        className="w-full bg-neutral-100 dark:bg-slate-950 border border-black/10 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-neutral-900 dark:text-white outline-none focus:border-emerald-500"
                      />

                      <input
                        type="tel"
                        required
                        placeholder="WhatsApp Phone Number"
                        value={guestPhone}
                        onChange={e => setGuestPhone(e.target.value)}
                        className="w-full bg-neutral-100 dark:bg-slate-950 border border-black/10 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-neutral-900 dark:text-white outline-none focus:border-emerald-500"
                      />

                      {/* Pricing calculation summary */}
                      <div className="p-3 bg-neutral-50 dark:bg-slate-950 rounded-xl border border-black/8 dark:border-slate-800/80 text-xs space-y-1">
                        <div className="flex justify-between text-neutral-600 dark:text-slate-400">
                          <span>{formatNaira(apartment.pricePerNight)} × {nights} {nights === 1 ? 'night' : 'nights'}</span>
                          <span>{formatNaira(totalPrice)}</span>
                        </div>
                        <div className="flex justify-between text-neutral-900 dark:text-white font-bold pt-1 border-t border-black/8 dark:border-slate-800">
                          <span>Total</span>
                          <span className="text-emerald-600 dark:text-emerald-400">{formatNaira(totalPrice)}</span>
                        </div>
                      </div>

                      <button
                        type="submit"
                        disabled={submittingBooking}
                        className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-wider transition-colors flex items-center justify-center gap-1.5 shadow-md shadow-emerald-600/20"
                      >
                        {submittingBooking ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                        <span>Request Reservation</span>
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
        title={apartment.name}
        url={`/shortlets/${apartment.slug}`}
      />
    </div>
  );
};
