import React, { useRef, useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Property } from '../types';
import { formatNaira, formatWhatsAppUrl } from '../utils/formatters';
import { ShareModal } from '../components/ShareModal';
import { PropertyCard } from '../components/PropertyCard';
import { useEditorialMotion } from '../hooks/useEditorialMotion';
import {
  MapPin,
  Bed,
  Bath,
  Car,
  ShieldCheck,
  Heart,
  Share2,
  Phone,
  MessageSquare,
  Calendar,
  Video,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Calculator,
  Loader2,
  Send,
  Building,
  Sparkles,
  ExternalLink
} from 'lucide-react';

interface PropertyDetailViewProps {
  slug: string;
}

export const PropertyDetailView: React.FC<PropertyDetailViewProps> = ({ slug }) => {
  const { navigate, isFavorite, toggleFavorite, addToast, settings, openAiModal } = useApp();
  const pageRef = useRef<HTMLDivElement>(null);
  useEditorialMotion(pageRef);

  const [property, setProperty] = useState<Property | null>(null);
  const [similarProperties, setSimilarProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  // Inspection booking form state
  const [inspectionName, setInspectionName] = useState('');
  const [inspectionPhone, setInspectionPhone] = useState('');
  const [inspectionEmail, setInspectionEmail] = useState('');
  const [inspectionDate, setInspectionDate] = useState('');
  const [inspectionType, setInspectionType] = useState<'physical' | 'video'>('physical');
  const [submittingInspection, setSubmittingInspection] = useState(false);
  const [inspectionSuccess, setInspectionSuccess] = useState(false);

  // Mortgage / Payment plan calculator state
  const [downPaymentPercent, setDownPaymentPercent] = useState<number>(20);
  const [mortgageYears, setMortgageYears] = useState<number>(15);
  const [interestRate, setInterestRate] = useState<number>(18); // Nigerian mortgage avg

  useEffect(() => {
    setLoading(true);
    fetch(`/api/properties/${slug}`)
      .then(res => {
        if (!res.ok) throw new Error('Property not found');
        return res.json();
      })
      .then((data: Property) => {
        setProperty(data);
        setActiveImageIndex(0);
        setLoading(false);

        // Fetch similar properties
        fetch(`/api/properties?area=${encodeURIComponent(data.area)}`)
          .then(r => r.json())
          .then(sim => {
            if (Array.isArray(sim)) {
              setSimilarProperties(sim.filter(p => p.id !== data.id).slice(0, 3));
            }
          });
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAF9F5] dark:bg-[#050505] flex items-center justify-center text-neutral-500 dark:text-white/50">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-brand-gold" />
          <p className="text-xs uppercase tracking-widest font-semibold">Curating Property Dossier...</p>
        </div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="min-h-screen bg-[#FAF9F5] dark:bg-brand-black-deep flex items-center justify-center p-6 text-center">
        <div className="max-w-md">
          <h2 className="font-serif text-2xl font-bold text-neutral-900 dark:text-white mb-2">Property Not Found</h2>
          <p className="text-xs text-neutral-600 dark:text-white/60 mb-6 font-light">
            The property you're looking for may have been sold or unlisted.
          </p>
          <button
            onClick={() => navigate('/properties')}
            className="px-5 py-2.5 rounded-xl bg-brand-gold hover:bg-brand-gold-deep text-brand-black-deep font-bold text-xs uppercase tracking-wider shadow-sm transition-colors"
          >
            Browse All Properties
          </button>
        </div>
      </div>
    );
  }

  const liked = isFavorite(property.id);

  const handleToggleFavorite = () => {
    toggleFavorite(property.id);
    addToast(
      liked
        ? `Removed "${property.title}" from favorites`
        : `Added "${property.title}" to favorites!`,
      liked ? 'info' : 'success'
    );
  };

  const images = property.images && property.images.length > 0 ? property.images : [property.mainImage];

  const handlePrevImage = () => {
    setActiveImageIndex(prev => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNextImage = () => {
    setActiveImageIndex(prev => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const whatsappMessage = `Hello Selling Ajah, I'd like to inspect "${property.title}" (Ref: ${property.refNumber}) priced at ${formatNaira(property.price)}. Please share availability and documentation details.`;
  const whatsappUrl = formatWhatsAppUrl(settings.whatsapp, whatsappMessage);

  const handleInspectionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inspectionName || !inspectionPhone) {
      addToast('Please provide your name and contact phone number.', 'error');
      return;
    }

    setSubmittingInspection(true);
    try {
      const payload = {
        name: inspectionName,
        phone: inspectionPhone,
        email: inspectionEmail || 'not-provided@sellingajah.com',
        whatsapp: inspectionPhone,
        service: 'inspection',
        propertyId: property.id,
        propertyTitle: property.title,
        message: `Inspection request for ${property.title} (${property.refNumber}). Type: ${inspectionType}. Requested Date: ${inspectionDate || 'ASAP'}`
      };

      const res = await fetch('/api/enquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) throw new Error('Failed to submit inspection');

      setInspectionSuccess(true);
      addToast('Inspection scheduled! An advisor will call to confirm.', 'success');
    } catch (err) {
      console.error(err);
      addToast('Failed to schedule. Please connect via WhatsApp.', 'error');
    } finally {
      setSubmittingInspection(false);
    }
  };

  // Payment calculator calculations
  const downPaymentAmount = (property.price * downPaymentPercent) / 100;
  const loanPrincipal = property.price - downPaymentAmount;
  const monthlyRate = interestRate / 100 / 12;
  const totalMonths = mortgageYears * 12;
  const monthlyPayment =
    monthlyRate > 0
      ? (loanPrincipal * (monthlyRate * Math.pow(1 + monthlyRate, totalMonths))) /
        (Math.pow(1 + monthlyRate, totalMonths) - 1)
      : loanPrincipal / totalMonths;

  return (
    <div ref={pageRef} className="sa-detail sa-detail--property min-h-screen bg-[#FAF9F5] dark:bg-brand-black-deep text-neutral-900 dark:text-neutral-100 pb-28 transition-colors duration-200">
      {/* Back breadcrumb */}
      <div className="border-b border-black/8 dark:border-white/10 bg-white dark:bg-brand-black-deep py-3.5 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between text-xs text-neutral-600 dark:text-white/60">
          <button
            onClick={() => navigate('/properties')}
            className="flex items-center gap-1.5 hover:text-brand-gold dark:hover:text-brand-gold transition-colors font-medium"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Back to all properties</span>
          </button>

          <div className="flex items-center gap-2">
            <span className="font-mono text-[11px] text-brand-gold bg-black/5 dark:bg-white/5 px-2.5 py-0.5 rounded-full border border-brand-gold/30">
              REF: {property.refNumber}
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {/* Title & Action Row */}
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6 mb-8">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span className={`text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider ${
                property.listingType === 'sale' ? 'bg-brand-gold text-brand-black-deep shadow-sm' : 'bg-emerald-600 text-white shadow-sm'
              }`}>
                {property.listingType === 'sale' ? 'For Sale' : 'For Rent'}
              </span>
              <span className="text-xs bg-black/5 dark:bg-white/10 text-neutral-700 dark:text-white/80 px-3 py-1 rounded-full font-medium">
                {property.propertyType}
              </span>
              {property.titleDocument && (
                <span className="text-xs bg-emerald-500/10 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-600/30 px-3 py-1 rounded-full font-medium flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  {property.titleDocument}
                </span>
              )}
            </div>

            <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-neutral-900 dark:text-white mb-2.5 leading-tight">
              {property.title}
            </h1>

            <div className="flex items-center gap-2 text-xs sm:text-sm text-neutral-600 dark:text-white/60 font-light">
              <MapPin className="w-4 h-4 text-brand-gold shrink-0" />
              <span>{property.location}</span>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              id="property-toggle-fav-btn"
              onClick={handleToggleFavorite}
              className={`p-3 rounded-2xl border transition-all flex items-center gap-2 text-xs font-semibold ${
                liked
                  ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-300 dark:border-rose-600/60 text-rose-600 dark:text-rose-400'
                  : 'bg-white dark:bg-brand-black-soft border-black/10 dark:border-white/10 text-neutral-700 dark:text-white/70 hover:text-neutral-900 dark:hover:text-white shadow-sm'
              }`}
            >
              <Heart className={`w-4 h-4 ${liked ? 'fill-rose-500 text-rose-500' : ''}`} />
              <span className="hidden sm:inline">{liked ? 'Saved' : 'Save'}</span>
            </button>

            <button
              id="property-share-btn"
              onClick={() => setIsShareModalOpen(true)}
              className="p-3 rounded-2xl bg-white dark:bg-brand-black-soft border border-black/10 dark:border-white/10 text-neutral-700 dark:text-white/70 hover:text-neutral-900 dark:hover:text-white transition-colors flex items-center gap-2 text-xs font-semibold shadow-sm cursor-pointer"
            >
              <Share2 className="w-4 h-4 text-brand-gold" />
              <span className="hidden sm:inline">Share</span>
            </button>
          </div>
        </div>

        {/* 1. IMAGE GALLERY */}
        <div className="mb-12">
          <div className="relative aspect-[16/9] md:aspect-[21/9] rounded-3xl overflow-hidden bg-neutral-900 border border-black/8 dark:border-white/10 shadow-xl dark:shadow-2xl">
            <img
              src={images[activeImageIndex]}
              alt={property.title}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover transition-opacity duration-300"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/20 pointer-events-none" />

            {/* Prev / Next controls */}
            {images.length > 1 && (
              <>
                <button
                  onClick={handlePrevImage}
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-black/60 hover:bg-black/90 backdrop-blur-md border border-white/20 text-white flex items-center justify-center transition-all hover:scale-110 cursor-pointer"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={handleNextImage}
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-black/60 hover:bg-black/90 backdrop-blur-md border border-white/20 text-white flex items-center justify-center transition-all hover:scale-110 cursor-pointer"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </>
            )}

            {/* Image counter indicator */}
            <div className="absolute bottom-4 right-4 bg-black/75 backdrop-blur-md border border-white/20 text-white text-xs px-3.5 py-1.5 rounded-full font-mono font-medium">
              {activeImageIndex + 1} / {images.length} Photos
            </div>
          </div>

          {/* Thumbnails row */}
          {images.length > 1 && (
            <div className="flex gap-3 mt-4 overflow-x-auto pb-2 scrollbar-thin">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImageIndex(idx)}
                  className={`w-20 h-14 sm:w-24 sm:h-16 rounded-xl overflow-hidden shrink-0 border-2 transition-all cursor-pointer ${
                    activeImageIndex === idx
                      ? 'border-brand-gold scale-105 shadow-md'
                      : 'border-transparent opacity-60 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* 2. MAIN DETAILS & STICKY ASIDE LAYOUT */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Left 2 Columns: Specs, Description, Features, Legal, Calculator */}
          <div className="lg:col-span-2 space-y-10">
            {/* Quick Key Specs Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-5 rounded-2xl bg-white dark:bg-brand-black-soft border border-black/8 dark:border-white/10 shadow-sm dark:shadow-none">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-brand-gold/10 border border-brand-gold/20 flex items-center justify-center text-brand-gold shrink-0">
                  <Bed className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[11px] text-neutral-500 dark:text-white/50 uppercase tracking-wider block font-medium">Bedrooms</span>
                  <span className="text-sm sm:text-base font-bold text-neutral-900 dark:text-white">{property.bedrooms} Ensuite</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-brand-gold/10 border border-brand-gold/20 flex items-center justify-center text-brand-gold shrink-0">
                  <Bath className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[11px] text-neutral-500 dark:text-white/50 uppercase tracking-wider block font-medium">Bathrooms</span>
                  <span className="text-sm sm:text-base font-bold text-neutral-900 dark:text-white">{property.bathrooms} Baths</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-brand-gold/10 border border-brand-gold/20 flex items-center justify-center text-brand-gold shrink-0">
                  <Car className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[11px] text-neutral-500 dark:text-white/50 uppercase tracking-wider block font-medium">Parking</span>
                  <span className="text-sm sm:text-base font-bold text-neutral-900 dark:text-white">{property.parkingSpaces} Vehicles</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-brand-gold/10 border border-brand-gold/20 flex items-center justify-center text-brand-gold shrink-0">
                  <Building className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[11px] text-neutral-500 dark:text-white/50 uppercase tracking-wider block font-medium">Size / Type</span>
                  <span className="text-sm sm:text-base font-bold text-neutral-900 dark:text-white truncate block max-w-[120px]">
                    {property.propertySize || property.propertyType}
                  </span>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="bg-white dark:bg-brand-black-soft border border-black/8 dark:border-white/10 rounded-3xl p-6 sm:p-8 shadow-sm dark:shadow-none">
              <h3 className="font-serif text-xl font-bold text-neutral-900 dark:text-white mb-4">
                Property Overview
              </h3>
              <div className="text-neutral-700 dark:text-white/70 text-xs sm:text-sm leading-relaxed whitespace-pre-line space-y-3 font-light">
                {property.description}
              </div>
            </div>

            {/* Features / Amenities list */}
            {property.features && property.features.length > 0 && (
              <div className="bg-white dark:bg-brand-black-soft border border-black/8 dark:border-white/10 rounded-3xl p-6 sm:p-8 shadow-sm dark:shadow-none">
                <h3 className="font-serif text-xl font-bold text-neutral-900 dark:text-white mb-6">
                  Key Features & Amenities
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {property.features.map((feat, idx) => (
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
            )}

            {/* Title & Conveyancing Information */}
            <div className="bg-white dark:bg-brand-black-soft border border-black/8 dark:border-white/10 rounded-3xl p-6 sm:p-8 shadow-sm dark:shadow-none">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-brand-gold/10 border border-brand-gold/25 flex items-center justify-center text-brand-gold shrink-0">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-serif text-lg font-bold text-neutral-900 dark:text-white mb-1">
                    Documentation & Title Inquiries: {property.titleDocument || "Available Upon Request"}
                  </h4>
                  <p className="text-xs text-neutral-600 dark:text-white/70 leading-relaxed mb-3 font-light">
                    Title records, survey plan coordinates, and deed documentation are reviewed directly with buyers during private advisory sessions or scheduled property inspections.
                  </p>
                  <div className="flex flex-wrap gap-2 text-[11px] text-neutral-700 dark:text-white/70 font-mono">
                    <span className="flex items-center gap-1">✓ Registered Survey Reference</span>
                    <span className="flex items-center gap-1">✓ Physical Inspection Available</span>
                    <span className="flex items-center gap-1">✓ Direct Developer / Owner Engagement</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Interactive Payment / Mortgage Calculator */}
            {property.listingType === 'sale' && (
              <div className="bg-white dark:bg-brand-black-soft border border-black/8 dark:border-white/10 rounded-3xl p-6 sm:p-8 shadow-sm dark:shadow-none">
                <div className="flex items-center gap-2 mb-6">
                  <Calculator className="w-5 h-5 text-brand-gold" />
                  <h3 className="font-serif text-xl font-bold text-neutral-900 dark:text-white">
                    Mortgage & Equity Calculator
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                  <div>
                    <label className="block text-xs font-semibold text-neutral-600 dark:text-white/60 mb-1">
                      Down Payment ({downPaymentPercent}%)
                    </label>
                    <select
                      value={downPaymentPercent}
                      onChange={e => setDownPaymentPercent(Number(e.target.value))}
                      className="w-full bg-neutral-100 dark:bg-brand-black-deep border border-black/10 dark:border-white/10 rounded-xl p-2.5 text-xs text-neutral-900 dark:text-white outline-none focus:border-brand-gold"
                    >
                      <option value={10}>10% - {formatNaira((property.price * 10) / 100)}</option>
                      <option value={20}>20% - {formatNaira((property.price * 20) / 100)}</option>
                      <option value={30}>30% - {formatNaira((property.price * 30) / 100)}</option>
                      <option value={50}>50% - {formatNaira((property.price * 50) / 100)}</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-neutral-600 dark:text-white/60 mb-1">
                      Loan Term
                    </label>
                    <select
                      value={mortgageYears}
                      onChange={e => setMortgageYears(Number(e.target.value))}
                      className="w-full bg-neutral-100 dark:bg-brand-black-deep border border-black/10 dark:border-white/10 rounded-xl p-2.5 text-xs text-neutral-900 dark:text-white outline-none focus:border-brand-gold"
                    >
                      <option value={5}>5 Years (60 Months)</option>
                      <option value={10}>10 Years (120 Months)</option>
                      <option value={15}>15 Years (180 Months)</option>
                      <option value={20}>20 Years (240 Months)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-neutral-600 dark:text-white/60 mb-1">
                      Mortgage Rate (%)
                    </label>
                    <input
                      type="number"
                      value={interestRate}
                      onChange={e => setInterestRate(Number(e.target.value))}
                      className="w-full bg-neutral-100 dark:bg-brand-black-deep border border-black/10 dark:border-white/10 rounded-xl p-2.5 text-xs text-neutral-900 dark:text-white outline-none focus:border-brand-gold"
                    />
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-neutral-50 dark:bg-brand-black-deep border border-black/8 dark:border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div>
                    <span className="text-xs text-neutral-500 dark:text-white/50 block mb-0.5 font-medium">Estimated Monthly Commitment</span>
                    <div className="text-2xl font-serif font-bold text-brand-gold">
                      {formatNaira(Math.round(monthlyPayment))}
                      <span className="text-xs font-sans text-neutral-500 dark:text-white/50 font-normal"> / month</span>
                    </div>
                  </div>
                  <button
                    onClick={() => openAiModal(`Can you explain the payment structure and options for ${property.title}?`)}
                    className="text-xs bg-black/5 hover:bg-black/10 dark:bg-white/10 dark:hover:bg-white/15 text-brand-gold px-4 py-2.5 rounded-xl flex items-center gap-1.5 transition-colors font-medium border border-black/5 dark:border-transparent cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-brand-gold" />
                    <span>Ask AI About Payment Plans</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Sticky Pricing & Action Console */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-6">
              {/* Pricing Card */}
              <div className="bg-white dark:bg-[#111111] border border-black/8 dark:border-white/10 rounded-3xl p-6 shadow-md dark:shadow-2xl">
                <span className="text-xs text-neutral-500 dark:text-white/50 uppercase tracking-widest block mb-1 font-bold">
                  Guide Price
                </span>
                <div className="text-3xl sm:text-4xl font-serif font-bold text-neutral-900 dark:text-white mb-4">
                  {formatNaira(property.price)}
                  {property.pricePeriod && (
                    <span className="text-xs font-sans text-neutral-500 dark:text-white/50 font-normal"> /{property.pricePeriod}</span>
                  )}
                </div>

                {/* Instant WhatsApp CTA */}
                <a
                  id="property-whatsapp-main-cta"
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-600/20 mb-3"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Chat with Agent on WhatsApp</span>
                </a>

                {/* Direct Phone Call */}
                <a
                  href={`tel:${settings.phone.replace(/[^0-9+]/g, '')}`}
                  className="w-full py-3 px-4 rounded-xl bg-black/5 hover:bg-black/10 dark:bg-white/10 dark:hover:bg-white/15 text-neutral-900 dark:text-white font-semibold text-xs flex items-center justify-center gap-2 transition-colors mb-6 border border-black/5 dark:border-transparent cursor-pointer"
                >
                  <Phone className="w-4 h-4 text-brand-gold" />
                  <span>Call: {settings.phone}</span>
                </a>

                {/* Inspection Booking Form */}
                <div className="pt-6 border-t border-black/8 dark:border-white/10">
                  <h4 className="font-serif text-base font-bold text-neutral-900 dark:text-white mb-2 flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-brand-gold" />
                    Book an Inspection
                  </h4>
                  <p className="text-xs text-neutral-500 dark:text-white/50 mb-4 font-light">
                    Physical accompanied tour or 4K live video walkthrough for diaspora clients.
                  </p>

                  {inspectionSuccess ? (
                    <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800/40 text-center">
                      <CheckCircle2 className="w-8 h-8 text-emerald-600 dark:text-emerald-400 mx-auto mb-2" />
                      <h5 className="font-bold text-neutral-900 dark:text-white text-xs mb-1">Inspection Requested!</h5>
                      <p className="text-[11px] text-neutral-600 dark:text-white/60">
                        Our Ajah property agent will contact you shortly to confirm your booking.
                      </p>
                    </div>
                  ) : (
                    <form onSubmit={handleInspectionSubmit} className="space-y-3">
                      {/* Type toggle: Physical or Video */}
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => setInspectionType('physical')}
                          className={`py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 border transition-all cursor-pointer ${
                            inspectionType === 'physical'
                              ? 'bg-brand-gold text-brand-black-deep border-brand-gold font-bold shadow-sm'
                              : 'bg-neutral-100 dark:bg-brand-black-deep text-neutral-600 dark:text-white/60 border-black/10 dark:border-white/10'
                          }`}
                        >
                          <MapPin className="w-3.5 h-3.5" />
                          <span>Physical</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setInspectionType('video')}
                          className={`py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 border transition-all cursor-pointer ${
                            inspectionType === 'video'
                              ? 'bg-brand-gold text-brand-black-deep border-brand-gold font-bold shadow-sm'
                              : 'bg-neutral-100 dark:bg-brand-black-deep text-neutral-600 dark:text-white/60 border-black/10 dark:border-white/10'
                          }`}
                        >
                          <Video className="w-3.5 h-3.5" />
                          <span>Diaspora Video</span>
                        </button>
                      </div>

                      <input
                        type="text"
                        required
                        placeholder="Your Full Name"
                        value={inspectionName}
                        onChange={e => setInspectionName(e.target.value)}
                        className="w-full bg-neutral-100 dark:bg-brand-black-deep border border-black/10 dark:border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-neutral-900 dark:text-white outline-none focus:border-brand-gold"
                      />

                      <input
                        type="tel"
                        required
                        placeholder="WhatsApp Phone Number"
                        value={inspectionPhone}
                        onChange={e => setInspectionPhone(e.target.value)}
                        className="w-full bg-neutral-100 dark:bg-brand-black-deep border border-black/10 dark:border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-neutral-900 dark:text-white outline-none focus:border-brand-gold"
                      />

                      <input
                        type="date"
                        value={inspectionDate}
                        onChange={e => setInspectionDate(e.target.value)}
                        className="w-full bg-neutral-100 dark:bg-brand-black-deep border border-black/10 dark:border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-neutral-900 dark:text-white outline-none focus:border-brand-gold"
                      />

                      <button
                        type="submit"
                        disabled={submittingInspection}
                        className="w-full py-3 rounded-xl bg-brand-gold hover:bg-brand-gold-deep text-brand-black-deep font-bold text-xs uppercase tracking-wider transition-colors flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
                      >
                        {submittingInspection ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Send className="w-4 h-4" />
                        )}
                        <span>Confirm Inspection Date</span>
                      </button>
                    </form>
                  )}
                </div>
              </div>

              {/* Agent Profile Box */}
              <div className="bg-white dark:bg-brand-black-soft border border-black/8 dark:border-white/10 rounded-3xl p-5 flex items-center gap-4 shadow-sm dark:shadow-none">
                <img
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80"
                  alt="Agent"
                  className="w-14 h-14 rounded-2xl object-cover border border-brand-gold/30"
                />
                <div>
                  <h5 className="font-serif text-sm font-bold text-neutral-900 dark:text-white">Chidinma Okonjo</h5>
                  <p className="text-[11px] text-brand-gold font-semibold">Senior Property Acquisition Lead</p>
                  <p className="text-[11px] text-neutral-500 dark:text-white/50 mt-0.5 font-light">Ajah & Lekki Real Estate Specialist</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 3. SIMILAR PROPERTIES IN AJAH */}
        {similarProperties.length > 0 && (
          <div className="mt-20 pt-12 border-t border-black/8 dark:border-white/10">
            <div className="flex items-center justify-between mb-8">
              <div>
                <span className="text-brand-gold text-xs font-bold uppercase tracking-wider block mb-1">
                  Similar Opportunities
                </span>
                <h3 className="font-serif text-2xl font-bold text-neutral-900 dark:text-white">
                  More Properties in {property.area}
                </h3>
              </div>

              <button
                onClick={() => navigate(`/properties?area=${encodeURIComponent(property.area)}`)}
                className="text-xs font-semibold text-brand-gold hover:underline cursor-pointer"
              >
                View Area Listings →
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {similarProperties.map(sim => (
                <PropertyCard key={sim.id} property={sim} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Share Modal */}
      <ShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        title={property.title}
        url={`/properties/${property.slug}`}
      />
    </div>
  );
};
