import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { X, ShieldCheck, CheckCircle2, Loader2, Sparkles, Send } from 'lucide-react';

export const CustomPropertyRequestModal: React.FC = () => {
  const { isRequestModalOpen, closeRequestModal, requestPrefill, addToast } = useApp();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [service, setService] = useState('property_sale');
  const [location, setLocation] = useState('Ajah');
  const [bedrooms, setBedrooms] = useState('4');
  const [budget, setBudget] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (requestPrefill) {
      if (requestPrefill.service) setService(requestPrefill.service);
      if (requestPrefill.location) setLocation(requestPrefill.location);
      if (requestPrefill.budget) setBudget(requestPrefill.budget);
    }
  }, [requestPrefill]);

  if (!isRequestModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || (!phone.trim() && !email.trim())) {
      addToast('Please provide your name and phone number or email.', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        name,
        phone,
        email,
        whatsapp: whatsapp || phone,
        service,
        listingType: 'custom_request',
        preferredLocation: location,
        budget: budget ? `₦${budget}` : 'Not specified',
        message: `Custom Request: [${bedrooms} Bedrooms in ${location}, Budget: ${budget}]. Notes: ${message}`
      };

      const res = await fetch('/api/enquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) throw new Error('Failed to submit enquiry');

      setSubmitted(true);
      addToast('Your request has been received! Our acquisition specialist will contact you.', 'success');
      setTimeout(() => {
        setSubmitted(false);
        closeRequestModal();
      }, 2500);
    } catch (err: any) {
      console.error(err);
      addToast('An error occurred submitting your request. Please try WhatsApp.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="w-full max-w-lg bg-white dark:bg-brand-black border border-black/10 dark:border-brand-gold/20 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-black/8 dark:border-white/10 flex items-center justify-between bg-neutral-50 dark:bg-brand-black-deep">
          <div>
            <div className="flex items-center gap-1.5 text-xs text-brand-gold font-semibold uppercase tracking-wider mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Bespoke Property Sourcing</span>
            </div>
            <h3 className="font-serif text-lg sm:text-xl font-bold text-neutral-900 dark:text-white">
              Can't find your ideal property?
            </h3>
          </div>
          <button
            onClick={closeRequestModal}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-5 sm:p-6 overflow-y-auto">
          {submitted ? (
            <div className="py-12 text-center">
              <CheckCircle2 className="w-12 h-12 text-emerald-500 dark:text-emerald-400 mx-auto mb-4 animate-bounce" />
              <h4 className="text-xl font-bold font-serif text-neutral-900 dark:text-white mb-2">Request Received!</h4>
              <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 max-w-sm mx-auto">
                Thank you, {name}. Our Senior Property Acquisition Advisor in Ajah will review your criteria and contact you within 2 business hours.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed mb-4">
                Tell us your exact preferences. We have exclusive access to off-market developments and private listings in Ajah, Lekki, and Lagos before they go public.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">Your Full Name *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="e.g., Tunde Adeleke"
                    className="w-full bg-neutral-50 dark:bg-brand-black-deep border border-black/10 dark:border-white/10 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-neutral-900 dark:text-white placeholder-neutral-400 dark:placeholder-white/40 focus:border-brand-gold outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">Phone / WhatsApp *</label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    placeholder="+234 800 000 0000"
                    className="w-full bg-neutral-50 dark:bg-brand-black-deep border border-black/10 dark:border-white/10 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-neutral-900 dark:text-white placeholder-neutral-400 dark:placeholder-white/40 focus:border-brand-gold outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full bg-neutral-50 dark:bg-brand-black-deep border border-black/10 dark:border-white/10 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-neutral-900 dark:text-white placeholder-neutral-400 dark:placeholder-white/40 focus:border-brand-gold outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">Interest</label>
                  <select
                    value={service}
                    onChange={e => setService(e.target.value)}
                    className="w-full bg-neutral-50 dark:bg-brand-black-deep border border-black/10 dark:border-white/10 rounded-xl px-3 py-2.5 text-xs text-neutral-900 dark:text-white focus:border-brand-gold outline-none"
                  >
                    <option value="property_sale" className="bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white">Buy Property</option>
                    <option value="property_lease" className="bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white">Rent / Lease</option>
                    <option value="shortlet" className="bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white">Serviced Shortlet</option>
                    <option value="car_rental" className="bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white">Luxury Car Rental</option>
                    <option value="consultation" className="bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white">Land / Title Advisory</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">Preferred Area</label>
                  <select
                    value={location}
                    onChange={e => setLocation(e.target.value)}
                    className="w-full bg-neutral-50 dark:bg-brand-black-deep border border-black/10 dark:border-white/10 rounded-xl px-3 py-2.5 text-xs text-neutral-900 dark:text-white focus:border-brand-gold outline-none"
                  >
                    <option value="Ajah" className="bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white">Ajah</option>
                    <option value="Abraham Adesanya" className="bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white">Abraham Adesanya</option>
                    <option value="Sangotedo" className="bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white">Sangotedo</option>
                    <option value="Chevron" className="bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white">Chevron Toll Gate</option>
                    <option value="VGC" className="bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white">Victoria Garden City (VGC)</option>
                    <option value="Ikota" className="bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white">Ikota Villa</option>
                    <option value="Orchid" className="bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white">Orchid Road</option>
                    <option value="Lekki Phase 1" className="bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white">Lekki Phase 1</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">Bedrooms</label>
                  <select
                    value={bedrooms}
                    onChange={e => setBedrooms(e.target.value)}
                    className="w-full bg-neutral-50 dark:bg-brand-black-deep border border-black/10 dark:border-white/10 rounded-xl px-3 py-2.5 text-xs text-neutral-900 dark:text-white focus:border-brand-gold outline-none"
                  >
                    <option value="1" className="bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white">1 Bedroom / Studio</option>
                    <option value="2" className="bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white">2 Bedrooms</option>
                    <option value="3" className="bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white">3 Bedrooms</option>
                    <option value="4" className="bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white">4 Bedrooms</option>
                    <option value="5" className="bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white">5+ Bedrooms</option>
                    <option value="Land" className="bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white">Bare Land / Plot</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">Approximate Budget (₦ Naira)</label>
                <input
                  type="text"
                  value={budget}
                  onChange={e => setBudget(e.target.value)}
                  placeholder="e.g., ₦120,000,000 or ₦5,000,000/yr"
                  className="w-full bg-neutral-50 dark:bg-brand-black-deep border border-black/10 dark:border-white/10 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-neutral-900 dark:text-white placeholder-neutral-400 dark:placeholder-white/40 focus:border-brand-gold outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">Specific Requirements or Features</label>
                <textarea
                  rows={3}
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  placeholder="e.g., Swimming pool, cinema, BQ, Governor's Consent, close to Lekki expressway..."
                  className="w-full bg-neutral-50 dark:bg-brand-black-deep border border-black/10 dark:border-white/10 rounded-xl p-3 text-xs sm:text-sm text-neutral-900 dark:text-white placeholder-neutral-400 dark:placeholder-white/40 focus:border-brand-gold outline-none resize-none"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-brand-gold-deep via-brand-gold to-brand-gold-deep hover:brightness-110 text-brand-black-deep font-bold text-xs uppercase tracking-wider transition-all shadow-lg shadow-brand-gold/20 flex items-center justify-center gap-2 cursor-pointer"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Submitting Request...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Submit Property Request</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
