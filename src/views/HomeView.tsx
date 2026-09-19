import React, { useEffect, useRef, useState } from 'react';
import { ArrowRight, ArrowUpRight, BedDouble, Building2, MapPin, Users } from 'lucide-react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useApp } from '../context/AppContext';
import { Property, ServicedApartment } from '../types';
import { formatNaira, formatWhatsAppUrl } from '../utils/formatters';
import { useEditorialMotion } from '../hooks/useEditorialMotion';
import { CinematicHeroCarousel } from '../components/CinematicHeroCarousel';

export const HomeView: React.FC = () => {
  const { navigate, openRequestModal, settings } = useApp();
  const pageRef = useRef<HTMLDivElement>(null);
  useEditorialMotion(pageRef);
  const [properties, setProperties] = useState<Property[]>([]);
  const [apartments, setApartments] = useState<ServicedApartment[]>([]);
  useEffect(() => {
    Promise.all([
      fetch('/api/properties?featured=true').then(r => r.json()),
      fetch('/api/apartments?featured=true').then(r => r.json())
    ]).then(([p, a]) => {
      setProperties(Array.isArray(p) ? p : []);
      setApartments(Array.isArray(a) ? a : []);
      setTimeout(() => ScrollTrigger.refresh(), 100);
    }).catch(console.error);
  }, []);
  const feature = properties[0];
  return <div ref={pageRef} className="sa-home">
    <div id="locations-fixed-viewport-layer" className="sa-locations-fixed-viewport-layer" aria-hidden="true">
      <img id="locations-fixed-image" className="sa-locations-fixed-image" src="https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=2200&q=85" alt="Modern residence exterior" loading="eager" />
    </div>
    <CinematicHeroCarousel />
    <section className="sa-intro sa-section">
      <p className="sa-kicker sa-kicker--dark">Buy Smart. Own Smart.</p>
      <div className="sa-intro__line">
        <h2>Ajah Properties.<br /><em className="sa-gold-text">Built for Growth.</em></h2>
        <p>We help first-time buyers, salary earners, tenants and investors discover verified homes, rentals, land and property opportunities across the Ajah corridor.</p>
      </div>
      <div className="sa-intro__services">
        {([
          ['01', 'Property Sales', 'Verified homes, affordable developments and structured payment plans.', '/properties/sale', Building2],
          ['02', 'Residential Rentals', 'Quality apartments, terraces and family duplexes ready for move-in.', '/properties/rent', Building2],
          ['03', 'Serviced Shortlets', 'Curated apartments that make every Lagos stay feel effortless.', '/shortlets', BedDouble]
        ] as const).map(([number, title, copy, path, Icon]) => (
          <button
            key={title}
            id={`home-service-btn-${title.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}
            aria-label={`Explore ${title}`}
            onClick={() => navigate(path)}
            className="sa-service"
          >
            <span>{number}</span>
            <Icon size={21} className="text-brand-green-primary dark:text-brand-green-sage" />
            <h3 className="text-brand-green-primary dark:text-brand-green-sage">{title}</h3>
            <p>{copy}</p>
            <ArrowRight size={20} className="sa-service__arrow text-brand-green-primary dark:text-brand-green-sage" />
          </button>
        ))}
      </div>
    </section>
    <section className="sa-feature sa-section">
      <div className="sa-feature__heading">
        <p className="sa-kicker sa-kicker--dark">Selected residence</p>
        <h2>Designed for<br /><em className="sa-gold-text">arrival.</em></h2>
      </div>
      {feature ? (
        <article className="sa-residence flex flex-col lg:grid">
          <button className="sa-residence__image" onClick={() => navigate(`/properties/${feature.slug}`)}>
            <img src={feature.mainImage} alt={feature.title} />
            <span>View residence <ArrowUpRight /></span>
          </button>
          <div className="sa-residence__details">
            <p>{feature.listingType === 'sale' ? 'For sale' : 'For rent'} · {feature.area}</p>
            <h3>{feature.title}</h3>
            <strong>{formatNaira(feature.price)}{feature.pricePeriod ? ` ${feature.pricePeriod}` : ''}</strong>
            <div>
              <span><BedDouble size={16} className="text-brand-green-primary dark:text-brand-green-sage" /> {feature.bedrooms} beds</span>
              <span><MapPin size={16} /> {feature.location}</span>
            </div>
          </div>
        </article>
      ) : (
        <div className="sa-loading">Curating the collection…</div>
      )}
    </section>
    <section id="locations-fixed-window" className="sa-locations sa-locations--window">
      <img className="sa-locations__mobile-image" src="https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=2200&q=85" alt="Modern residence exterior" loading="lazy" />
      <div>
        <p className="sa-kicker">The Ajah Corridor</p>
        <h2>Ajah is where<br /><em className="sa-gold-text">home begins.</em></h2>
        <p>Explore verified opportunities in Ajah, Abraham Adesanya, Sangotedo and Ikota—alongside other locations only as active inventory supports them.</p>
        <button onClick={() => navigate('/properties')} className="sa-text-link">Explore the collection <ArrowRight size={18} /></button>
      </div>
    </section>
    <section className="sa-section sa-stays">
      <div className="sa-section__top">
        <div>
          <p className="sa-kicker sa-kicker--dark">Serviced stays</p>
          <h2>Stay a little<br /><em className="sa-gold-text">longer.</em></h2>
        </div>
        <button onClick={() => navigate('/shortlets')} className="sa-circle-link border-brand-green-sage/40" aria-label="Explore shortlets">
          <ArrowRight className="text-brand-green-primary dark:text-brand-green-sage" />
        </button>
      </div>
      <div className="sa-stays__grid">
        {apartments.slice(0, 3).map((apartment, index) => (
          <button className={`sa-stay sa-stay--${index}`} onClick={() => navigate(`/shortlets/${apartment.slug}`)} key={apartment.id}>
            <img src={apartment.mainImage} alt={apartment.name} loading="lazy" />
            <div>
              <p>{apartment.area} · From {formatNaira(apartment.pricePerNight)} / night</p>
              <h3 className="text-neutral-900 dark:text-white font-medium">{apartment.name}</h3>
              <span><Users size={15} /> Up to {apartment.maxGuests} guests</span>
            </div>
          </button>
        ))}
      </div>
    </section>
    <section className="sa-concierge">
      <p className="sa-kicker">Private advisory</p>
      <h2>There is always<br />another way <em className="sa-gold-text">home.</em></h2>
      <p>Tell us what you have in mind. We will help make the search feel more personal.</p>
      <div>
        <button onClick={() => openRequestModal()} className="sa-button">Start a private request <ArrowRight size={18} /></button>
        <a href={formatWhatsAppUrl(settings.whatsapp, 'Hello Selling Ajah, I would like to speak with an advisor.')} target="_blank" rel="noreferrer">Talk on WhatsApp</a>
      </div>
    </section>
  </div>;
};
