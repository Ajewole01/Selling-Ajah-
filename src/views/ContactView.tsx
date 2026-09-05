import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  MessageSquare,
  Send,
  Loader2,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  HelpCircle,
  PhoneCall,
  Sparkles,
  ArrowUpRight
} from 'lucide-react';
import { formatWhatsAppUrl } from '../utils/formatters';
import { FAQItem } from '../types';

export const ContactView: React.FC = () => {
  const { settings, addToast } = useApp();

  const [faqs, setFaqs] = useState<FAQItem[]>([]);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  // Form State
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [service, setService] = useState('property_sale');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    fetch('/api/faqs')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setFaqs(data);
      })
      .catch(console.error);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || (!phone && !email)) {
      addToast('Please provide your name and phone number or email.', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/enquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          phone,
          email,
          whatsapp: phone,
          service,
          message: `Contact Page Inquiry: ${message}`
        })
      });

      if (!res.ok) throw new Error('Submission failed');

      setSubmitted(true);
      addToast('Inquiry sent! Our advisor will contact you shortly.', 'success');
      setName('');
      setPhone('');
      setEmail('');
      setMessage('');
    } catch (err) {
      console.error(err);
      addToast('Error sending message. Please chat on WhatsApp directly.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const whatsappDirectUrl = formatWhatsAppUrl(
    settings.whatsapp,
    "Hello Selling Ajah, I'd like to inquire about your properties and services."
  );

  return (
    <div className="min-h-screen bg-[#FAF9F5] dark:bg-[#050505] text-neutral-900 dark:text-[#F5F5F0] pb-24 transition-colors duration-200">
      
      {/* Header Banner */}
      <section className="pt-16 pb-14 border-b border-black/8 dark:border-white/10 bg-white dark:bg-[#080808] transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <div className="flex items-center gap-2 mb-3 font-mono">
              <span className="w-6 h-[1.5px] bg-[#D4AF37]" />
              <span className="text-xs font-bold uppercase tracking-widest text-[#D4AF37]">
                Connect With Selling Ajah
              </span>
            </div>
            <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-light text-neutral-900 dark:text-white mb-4">
              Get in Touch
            </h1>
            <p className="text-neutral-600 dark:text-white/70 text-sm sm:text-base leading-relaxed font-light">
              Connect with our property advisors regarding active listings, virtual video inspections, serviced stays, or bespoke private acquisitions.
            </p>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 space-y-20">
        
        {/* Nigerian Customer Priority Channels (WhatsApp + Call + Office) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* 1. Priority WhatsApp Card */}
          <div className="bg-white dark:bg-[#111111] border border-emerald-500/40 rounded-3xl p-7 shadow-sm flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-4">
                <MessageSquare className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-bold font-mono uppercase tracking-widest text-emerald-600 dark:text-emerald-400 block mb-1">
                Fastest Response
              </span>
              <h3 className="font-serif text-xl font-bold text-neutral-900 dark:text-white mb-2">
                WhatsApp Desk
              </h3>
              <p className="text-xs text-neutral-600 dark:text-white/60 font-light leading-relaxed mb-6">
                Direct chat with a senior advisor for instant video tours, brochures, and inspection bookings.
              </p>
            </div>

            <a
              id="contact-whatsapp-btn"
              href={whatsappDirectUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3 px-4 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-colors shadow-md shadow-emerald-600/20 font-mono"
            >
              <MessageSquare className="w-4 h-4" />
              <span>Message on WhatsApp</span>
            </a>
          </div>

          {/* 2. Direct Call Card */}
          <div className="bg-white dark:bg-[#111111] border border-black/8 dark:border-white/10 rounded-3xl p-7 shadow-sm flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-[#D4AF37]/15 border border-[#D4AF37]/30 flex items-center justify-center text-[#D4AF37] mb-4">
                <PhoneCall className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-bold font-mono uppercase tracking-widest text-neutral-500 dark:text-white/50 block mb-1">
                Phone Direct
              </span>
              <h3 className="font-serif text-xl font-bold text-neutral-900 dark:text-white mb-2">
                Telephone Advisory
              </h3>
              <p className="text-xs text-neutral-600 dark:text-white/60 font-light leading-relaxed mb-6">
                Available Monday – Saturday, 8:00 AM – 6:00 PM WAT for telephone consultations.
              </p>
            </div>

            <a
              id="contact-phone-btn"
              href={`tel:${settings.phone}`}
              className="w-full py-3 px-4 rounded-full bg-black/5 hover:bg-black/10 dark:bg-white/10 dark:hover:bg-white/15 text-neutral-900 dark:text-white font-semibold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-colors font-mono"
            >
              <Phone className="w-4 h-4 text-[#D4AF37]" />
              <span>{settings.phone}</span>
            </a>
          </div>

          {/* 3. Office & Location Card */}
          <div className="bg-white dark:bg-[#111111] border border-black/8 dark:border-white/10 rounded-3xl p-7 shadow-sm flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-black/5 dark:bg-white/10 border border-black/8 dark:border-white/10 flex items-center justify-center text-neutral-700 dark:text-white/80 mb-4">
                <MapPin className="w-6 h-6 text-[#D4AF37]" />
              </div>
              <span className="text-[10px] font-bold font-mono uppercase tracking-widest text-neutral-500 dark:text-white/50 block mb-1">
                Office Location
              </span>
              <h3 className="font-serif text-xl font-bold text-neutral-900 dark:text-white mb-2">
                Ajah, Lagos
              </h3>
              <p className="text-xs text-neutral-600 dark:text-white/60 font-light leading-relaxed mb-6">
                {settings.address}
              </p>
            </div>

            <div className="py-2.5 px-4 rounded-full bg-black/5 dark:bg-white/5 text-center text-xs text-neutral-500 dark:text-white/50 font-mono">
              In-person meetings by appointment
            </div>
          </div>
        </div>

        {/* Focused Inquiry Form & Context Split */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          {/* Left Context Narrative */}
          <div className="lg:col-span-5 space-y-6">
            <div className="text-xs uppercase font-bold tracking-widest text-[#D4AF37] font-mono">
              Private Inquiry Desk
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl font-light text-neutral-900 dark:text-white leading-tight">
              Tell Us What You're Looking For
            </h2>
            <p className="text-xs sm:text-sm text-neutral-600 dark:text-white/70 font-light leading-relaxed">
              Whether you wish to schedule an on-site property inspection, request virtual video footage for diaspora acquisition, or inquire about extended stays, submit your details below.
            </p>

            <div className="p-6 rounded-2xl bg-white dark:bg-[#111111] border border-black/8 dark:border-white/10 space-y-4">
              <div className="flex items-center gap-3 text-xs text-neutral-700 dark:text-white/80">
                <CheckCircle2 className="w-4 h-4 text-[#D4AF37] shrink-0" />
                <span>Prompt callback from a designated Ajah advisor</span>
              </div>
              <div className="flex items-center gap-3 text-xs text-neutral-700 dark:text-white/80">
                <CheckCircle2 className="w-4 h-4 text-[#D4AF37] shrink-0" />
                <span>Complete confidentiality for private acquisitions</span>
              </div>
              <div className="flex items-center gap-3 text-xs text-neutral-700 dark:text-white/80">
                <CheckCircle2 className="w-4 h-4 text-[#D4AF37] shrink-0" />
                <span>Digital brochures and coordinates sent via WhatsApp/Email</span>
              </div>
            </div>
          </div>

          {/* Right: Clean, Focused Inquiry Form */}
          <div className="lg:col-span-7 bg-white dark:bg-[#111111] border border-black/8 dark:border-white/10 rounded-3xl p-8 sm:p-10 shadow-sm">
            {submitted ? (
              <div className="py-12 text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="font-serif text-2xl font-bold text-neutral-900 dark:text-white">
                  Inquiry Received
                </h3>
                <p className="text-xs sm:text-sm text-neutral-600 dark:text-white/60 font-light max-w-md mx-auto">
                  Thank you for reaching out. An advisor will review your request and connect with you shortly.
                </p>
                <button
                  onClick={() => setSubmitted(false)}
                  className="px-6 py-2.5 rounded-full bg-[#D4AF37] text-black font-bold text-xs uppercase tracking-wider font-mono"
                >
                  Send Another Inquiry
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4 text-left">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-500 dark:text-white/50 mb-1 font-mono">
                      Your Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={e => setName(e.target.value)}
                      placeholder="e.g. Adeyemi Adeleke"
                      className="w-full bg-neutral-100 dark:bg-[#050505] border border-black/10 dark:border-white/15 rounded-xl px-4 py-3 text-xs text-neutral-900 dark:text-white outline-none focus:border-[#D4AF37] transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-500 dark:text-white/50 mb-1 font-mono">
                      WhatsApp / Phone Number *
                    </label>
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={e => setPhone(e.target.value)}
                      placeholder="e.g. +234 801 234 5678"
                      className="w-full bg-neutral-100 dark:bg-[#050505] border border-black/10 dark:border-white/15 rounded-xl px-4 py-3 text-xs text-neutral-900 dark:text-white outline-none focus:border-[#D4AF37] transition-colors"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-500 dark:text-white/50 mb-1 font-mono">
                      Email Address (Optional)
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="e.g. adeyemi@example.com"
                      className="w-full bg-neutral-100 dark:bg-[#050505] border border-black/10 dark:border-white/15 rounded-xl px-4 py-3 text-xs text-neutral-900 dark:text-white outline-none focus:border-[#D4AF37] transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-500 dark:text-white/50 mb-1 font-mono">
                      Service Interest
                    </label>
                    <select
                      value={service}
                      onChange={e => setService(e.target.value)}
                      className="w-full bg-neutral-100 dark:bg-[#050505] border border-black/10 dark:border-white/15 rounded-xl px-4 py-3 text-xs text-neutral-900 dark:text-white outline-none focus:border-[#D4AF37] transition-colors"
                    >
                      <option value="property_sale">Buying a Property</option>
                      <option value="property_lease">Renting a Property</option>
                      <option value="shortlet">Serviced Shortlet Booking</option>
                      <option value="car_rental">Luxury Car Rental</option>
                      <option value="consultation">Bespoke Advisory / Inspection</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-500 dark:text-white/50 mb-1 font-mono">
                    Message or Preferred Location
                  </label>
                  <textarea
                    rows={4}
                    value={message}
                    onChange={e => setMessage(e.target.value)}
                    placeholder="Tell us about the property, preferred neighborhood (e.g. Badore, Abraham Adesanya), budget, or inspection timeline..."
                    className="w-full bg-neutral-100 dark:bg-[#050505] border border-black/10 dark:border-white/15 rounded-xl px-4 py-3 text-xs text-neutral-900 dark:text-white outline-none focus:border-[#D4AF37] transition-colors resize-none"
                  />
                </div>

                <button
                  id="submit-contact-form-btn"
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3.5 px-6 rounded-xl bg-[#D4AF37] hover:bg-[#c49f2f] text-black font-bold text-xs uppercase tracking-widest transition-colors flex items-center justify-center gap-2 shadow-md shadow-[#D4AF37]/20 disabled:opacity-50 cursor-pointer font-mono"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Transmitting...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Submit Inquiry</span>
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Frequently Asked Questions */}
        {faqs.length > 0 && (
          <div className="pt-12 border-t border-black/8 dark:border-white/10 max-w-4xl mx-auto">
            <div className="text-center mb-10">
              <div className="text-xs uppercase font-bold tracking-widest text-[#D4AF37] mb-2 font-mono">
                Clarifications & Guidance
              </div>
              <h2 className="font-serif text-3xl font-light text-neutral-900 dark:text-white">
                Frequently Asked Questions
              </h2>
            </div>

            <div className="space-y-3">
              {faqs.map((faq, idx) => {
                const isOpen = openFaqIndex === idx;
                return (
                  <div
                    key={faq.id}
                    className="rounded-2xl border border-black/8 dark:border-white/10 bg-white dark:bg-[#111111] overflow-hidden transition-colors"
                  >
                    <button
                      onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                      className="w-full p-5 text-left flex items-center justify-between gap-4 cursor-pointer"
                    >
                      <span className="font-serif text-base font-bold text-neutral-900 dark:text-white">
                        {faq.question}
                      </span>
                      {isOpen ? (
                        <ChevronUp className="w-4 h-4 text-[#D4AF37] shrink-0" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-neutral-400 shrink-0" />
                      )}
                    </button>

                    {isOpen && (
                      <div className="px-5 pb-5 text-xs text-neutral-600 dark:text-white/70 font-light leading-relaxed border-t border-black/5 dark:border-white/5 pt-3">
                        {faq.answer}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
