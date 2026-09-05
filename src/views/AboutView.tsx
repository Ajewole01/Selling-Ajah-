import React from 'react';
import { useApp } from '../context/AppContext';
import {
  Compass,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Building2,
  Sparkles,
  MapPin,
  MessageSquare
} from 'lucide-react';
import { formatWhatsAppUrl } from '../utils/formatters';

export const AboutView: React.FC = () => {
  const { navigate, openRequestModal, settings } = useApp();

  return (
    <div className="min-h-screen bg-[#FAF9F5] dark:bg-[#050505] text-neutral-900 dark:text-[#F5F5F0] pb-24 transition-colors duration-200">
      
      {/* 1. Large Selling Ajah Statement */}
      <section className="pt-16 sm:pt-24 pb-16 sm:pb-20 border-b border-black/8 dark:border-white/10 bg-white dark:bg-[#080808] transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl">
            <div className="flex items-center gap-2 mb-4 font-mono">
              <span className="w-6 h-[1.5px] bg-[#D4AF37]" />
              <span className="text-xs font-bold uppercase tracking-widest text-[#D4AF37]">
                Editorial Brand Story
              </span>
            </div>
            <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-light text-neutral-900 dark:text-white leading-[1.08] mb-8">
              We believe finding a home in Ajah should feel inspiring, transparent, and refined.
            </h1>
            <p className="text-base sm:text-xl text-neutral-600 dark:text-white/70 font-light leading-relaxed max-w-3xl">
              Selling Ajah was established to bridge the gap between contemporary architecture and discerning property seekers across the Lekki Peninsula corridor.
            </p>
          </div>
        </div>
      </section>

      {/* 2. Architectural & Lagos Imagery Showcase */}
      <section className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          <div className="md:col-span-8 rounded-3xl overflow-hidden shadow-xl aspect-[16/9] bg-neutral-900">
            <img
              src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1600&q=80"
              alt="Selling Ajah Coastal Architecture"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="md:col-span-4 rounded-3xl overflow-hidden shadow-xl aspect-[4/3] md:aspect-auto bg-neutral-900">
            <img
              src="https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=800&q=80"
              alt="Luxury Living in Ajah"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </section>

      {/* 3. Company Story & Purpose */}
      <section className="py-16 sm:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          <div className="lg:col-span-5">
            <div className="text-xs uppercase font-bold tracking-widest text-[#D4AF37] mb-2 font-mono">
              The Origin
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl font-light text-neutral-900 dark:text-white leading-tight">
              An Elevated Approach to Peninsula Real Estate
            </h2>
          </div>

          <div className="lg:col-span-7 space-y-6 text-sm sm:text-base text-neutral-600 dark:text-white/70 font-light leading-relaxed">
            <p>
              The urban landscape of Ajah and the greater Lekki axis is evolving rapidly. From tranquil waterfront residential clusters in Badore to bustling contemporary developments around Abraham Adesanya and Sangotedo, the peninsula represents one of the most vibrant growth nodes in West Africa.
            </p>
            <p>
              However, navigating real estate listings often entails fragmented information, inconsistent property representations, and communication delays. Selling Ajah was conceived as a curated destination where architectural photography, upfront details, and genuine advisory intersect.
            </p>
            <p>
              Whether you are an overseas buyer looking for a vacation retreat, an executive seeking a secure family home, or a visitor desiring turnkey shortlet hospitality, we provide clear pathways and dedicated support.
            </p>
          </div>
        </div>
      </section>

      {/* 4. Core Mission & Local Expertise */}
      <section className="py-16 sm:py-20 bg-neutral-100/70 dark:bg-[#080808] border-y border-black/8 dark:border-white/10 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mb-12">
            <div className="text-xs uppercase font-bold tracking-widest text-[#D4AF37] mb-2 font-mono">
              Local Mastery
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl font-light text-neutral-900 dark:text-white">
              Rooted in the Nuances of Ajah
            </h2>
            <p className="text-xs sm:text-sm text-neutral-500 dark:text-white/60 mt-2 font-light">
              We focus on the micro-geographies that make each neighborhood distinctive.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            <div className="p-6 rounded-2xl bg-white dark:bg-[#111111] border border-black/8 dark:border-white/10">
              <div className="font-mono text-xs font-bold text-[#D4AF37] uppercase tracking-wider mb-2">01 // Access & Topography</div>
              <h3 className="font-serif text-lg font-bold text-neutral-900 dark:text-white mb-2">Estate Infrastructure</h3>
              <p className="text-xs text-neutral-600 dark:text-white/60 font-light leading-relaxed">
                Evaluating drainage infrastructure, road network paved conditions, and rainy-season access across all property enclaves before recommendation.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white dark:bg-[#111111] border border-black/8 dark:border-white/10">
              <div className="font-mono text-xs font-bold text-[#D4AF37] uppercase tracking-wider mb-2">02 // Developer Due Diligence</div>
              <h3 className="font-serif text-lg font-bold text-neutral-900 dark:text-white mb-2">Quality & Finishing</h3>
              <p className="text-xs text-neutral-600 dark:text-white/60 font-light leading-relaxed">
                Direct relationships with established developers and private property owners to verify building construction standards and finishing materials.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white dark:bg-[#111111] border border-black/8 dark:border-white/10">
              <div className="font-mono text-xs font-bold text-[#D4AF37] uppercase tracking-wider mb-2">03 // Transparent Conveyance</div>
              <h3 className="font-serif text-lg font-bold text-neutral-900 dark:text-white mb-2">Clear Records</h3>
              <p className="text-xs text-neutral-600 dark:text-white/60 font-light leading-relaxed">
                Facilitating buyer access to survey records, title classifications, and coordinates for legal conveyance reviews without ambiguity.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Trust Principles */}
      <section className="py-16 sm:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mb-12">
          <div className="text-xs uppercase font-bold tracking-widest text-[#D4AF37] mb-2 font-mono">
            Guiding Philosophy
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl font-light text-neutral-900 dark:text-white">
            Our Guiding Standards
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="flex gap-4 p-6 rounded-2xl bg-white dark:bg-[#111111] border border-black/8 dark:border-white/10">
            <CheckCircle2 className="w-5 h-5 text-[#D4AF37] shrink-0 mt-1" />
            <div>
              <h3 className="font-serif text-base font-bold text-neutral-900 dark:text-white mb-1">Authentic Visuals</h3>
              <p className="text-xs text-neutral-600 dark:text-white/60 font-light leading-relaxed">
                We photograph and film real spaces. What you see online reflects the true dimensions, natural light, and finishes of the residence.
              </p>
            </div>
          </div>

          <div className="flex gap-4 p-6 rounded-2xl bg-white dark:bg-[#111111] border border-black/8 dark:border-white/10">
            <CheckCircle2 className="w-5 h-5 text-[#D4AF37] shrink-0 mt-1" />
            <div>
              <h3 className="font-serif text-base font-bold text-neutral-900 dark:text-white mb-1">Responsive Advisory</h3>
              <p className="text-xs text-neutral-600 dark:text-white/60 font-light leading-relaxed">
                Real conversations via WhatsApp, phone, and scheduled video inspections. We prioritize your timeline and peace of mind.
              </p>
            </div>
          </div>

          <div className="flex gap-4 p-6 rounded-2xl bg-white dark:bg-[#111111] border border-black/8 dark:border-white/10">
            <CheckCircle2 className="w-5 h-5 text-[#D4AF37] shrink-0 mt-1" />
            <div>
              <h3 className="font-serif text-base font-bold text-neutral-900 dark:text-white mb-1">Bespoke Concierge</h3>
              <p className="text-xs text-neutral-600 dark:text-white/60 font-light leading-relaxed">
                Beyond standard listings, we connect clients with serviced luxury shortlets and chauffeured vehicles for an integrated lifestyle solution.
              </p>
            </div>
          </div>

          <div className="flex gap-4 p-6 rounded-2xl bg-white dark:bg-[#111111] border border-black/8 dark:border-white/10">
            <CheckCircle2 className="w-5 h-5 text-[#D4AF37] shrink-0 mt-1" />
            <div>
              <h3 className="font-serif text-base font-bold text-neutral-900 dark:text-white mb-1">Respect for Privacy</h3>
              <p className="text-xs text-neutral-600 dark:text-white/60 font-light leading-relaxed">
                Discreet handling of high-value transactions, private inspections, and executive client confidentiality at every touchpoint.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Closing Editorial CTA */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white dark:bg-[#111111] border border-black/8 dark:border-white/10 rounded-3xl p-8 sm:p-12 text-center max-w-3xl mx-auto shadow-sm">
          <h2 className="font-serif text-3xl sm:text-4xl font-light text-neutral-900 dark:text-white mb-4">
            Begin Your Ajah Journey
          </h2>
          <p className="text-xs sm:text-sm text-neutral-600 dark:text-white/60 font-light leading-relaxed mb-8 max-w-xl mx-auto">
            Whether inquiring about an active listing or requesting custom sourcing, our advisors are ready to assist.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <button
              onClick={() => navigate('/properties')}
              className="px-6 py-3.5 rounded-full bg-[#D4AF37] hover:bg-[#c49f2f] text-black font-bold text-xs uppercase tracking-wider transition-colors shadow-md font-mono"
            >
              Browse Properties
            </button>
            <a
              href={formatWhatsAppUrl(settings.whatsapp, "Hello Selling Ajah, I'd like to consult with an advisor.")}
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3.5 rounded-full bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20 text-neutral-900 dark:text-white font-semibold text-xs uppercase tracking-wider transition-colors font-mono"
            >
              WhatsApp Consultation
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};
