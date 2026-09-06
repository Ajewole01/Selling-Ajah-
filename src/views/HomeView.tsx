import React, { useEffect, useRef, useState } from 'react';
import { ArrowRight, ArrowUpRight, BedDouble, Building2, Car, MapPin, Users } from 'lucide-react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useApp } from '../context/AppContext';
import { Property, ServicedApartment, LuxuryVehicle } from '../types';
import { formatNaira, formatWhatsAppUrl } from '../utils/formatters';
import { useEditorialMotion } from '../hooks/useEditorialMotion';
import { CinematicHeroCarousel } from '../components/CinematicHeroCarousel';

export const HomeView: React.FC = () => {
  const { navigate, openRequestModal, settings } = useApp();
  const pageRef = useRef<HTMLDivElement>(null);
  useEditorialMotion(pageRef);
  const [properties, setProperties] = useState<Property[]>([]);
  const [apartments, setApartments] = useState<ServicedApartment[]>([]);
  const [vehicles, setVehicles] = useState<LuxuryVehicle[]>([]);
  useEffect(() => {
    Promise.all([
      fetch('/api/properties?featured=true').then(r => r.json()),
      fetch('/api/apartments?featured=true').then(r => r.json()),
      fetch('/api/vehicles?featured=true').then(r => r.json())
    ]).then(([p, a, v]) => {
      setProperties(Array.isArray(p) ? p : []);
      setApartments(Array.isArray(a) ? a : []);
      setVehicles(Array.isArray(v) ? v : []);
      setTimeout(() => ScrollTrigger.refresh(), 100);
    }).catch(console.error);
  }, []);
  const feature = properties[0];
  return <div ref={pageRef} className="sa-home">
    <div id="locations-fixed-viewport-layer" className="sa-locations-fixed-viewport-layer" aria-hidden="true">
      <img id="locations-fixed-image" className="sa-locations-fixed-image" src="https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=2200&q=85" alt="Modern residence exterior" loading="eager" />
    </div>
    <CinematicHeroCarousel />
    <section className="sa-intro sa-section"><p className="sa-kicker sa-kicker--dark">A considered way to move</p><div className="sa-intro__line"><h2 style={{ color: '#c6a15b' }}>More than an address.<br /><em>A way of living.</em></h2><p>We bring together residential discovery, furnished stays and private mobility in one considered Ajah experience.</p></div><div className="sa-intro__services">{([['01', 'Properties', 'Homes selected for how life is actually lived.', '/properties', Building2], ['02', 'Shortlets', 'Spaces that make every Lagos stay feel settled.', '/shortlets', BedDouble], ['03', 'Mobility', 'Executive vehicles for the journey between.', '/cars', Car]] as const).map(([number, title, copy, path, Icon]) => <button key={title} id={`home-service-btn-${title.toLowerCase()}`} aria-label={`Explore ${title}`} onClick={() => navigate(path)} className="sa-service"><span>{number}</span><Icon size={21} /><h3 style={{ color: '#c6a15b' }}>{title}</h3><p>{copy}</p><ArrowRight size={20} className="sa-service__arrow" style={{ color: '#c6a15b' }} /></button>)}</div></section>
    <section className="sa-feature sa-section"><div className="sa-feature__heading"><p className="sa-kicker sa-kicker--dark">Selected residence</p><h2>Designed for<br /><em>arrival.</em></h2></div>{feature ? <article className="sa-residence"><button className="sa-residence__image" onClick={() => navigate(`/properties/${feature.slug}`)}><img src={feature.mainImage} alt={feature.title} /><span>View residence <ArrowUpRight /></span></button><div className="sa-residence__details"><p>{feature.listingType === 'sale' ? 'For sale' : 'For rent'} · {feature.area}</p><h3>{feature.title}</h3><strong>{formatNaira(feature.price)}{feature.pricePeriod ? ` ${feature.pricePeriod}` : ''}</strong><div><span><BedDouble size={16} /> {feature.bedrooms} beds</span><span><MapPin size={16} /> {feature.location}</span></div></div></article> : <div className="sa-loading">Curating the collection…</div>}</section>
    <section id="locations-fixed-window" className="sa-locations sa-locations--window"><img className="sa-locations__mobile-image" src="https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=2200&q=85" alt="Modern residence exterior" loading="lazy" /><div><p className="sa-kicker">The local edit</p><h2>Ajah is<br /><em>opening up.</em></h2><p>From waterfront calm to the pulse of Lekki, explore the neighbourhoods shaping what comes next.</p><button onClick={() => navigate('/properties')} className="sa-text-link">Explore the collection <ArrowRight size={18} /></button></div></section>
    <section className="sa-section sa-stays"><div className="sa-section__top"><div><p className="sa-kicker sa-kicker--dark">Serviced stays</p><h2 style={{ color: '#c6a15b' }}>Stay a little<br /><em>longer.</em></h2></div><button onClick={() => navigate('/shortlets')} style={{ borderColor: '#c6a15b' }} className="sa-circle-link" aria-label="Explore shortlets"><ArrowRight style={{ color: '#c6a15b' }} /></button></div><div className="sa-stays__grid">{apartments.slice(0, 3).map((apartment, index) => <button className={`sa-stay sa-stay--${index}`} onClick={() => navigate(`/shortlets/${apartment.slug}`)} key={apartment.id}><img src={apartment.mainImage} alt={apartment.name} loading="lazy" /><div><p>{apartment.area} · From {formatNaira(apartment.pricePerNight)} / night</p><h3 style={{ color: '#000000' }}>{apartment.name}</h3><span><Users size={15} /> Up to {apartment.maxGuests} guests</span></div></button>)}</div></section>
    <section className="sa-mobility"><div><p className="sa-kicker">Private mobility</p><h2>Command<br />the <em>road.</em></h2><p>Move through Lagos with a vehicle and service experience that matches your destination.</p><button onClick={() => navigate('/cars')} className="sa-outline-light">Explore mobility <ArrowRight size={18} /></button></div>{vehicles[0] && <button className="sa-mobility__vehicle" onClick={() => navigate(`/cars/${vehicles[0].slug}`)}><img src={vehicles[0].mainImage} alt={vehicles[0].name} loading="lazy" /><span>{vehicles[0].name}</span><strong>{formatNaira(vehicles[0].dailyRate)} / day</strong></button>}</section>
    <section className="sa-concierge"><p className="sa-kicker">Private advisory</p><h2>There is always<br />another way <em>home.</em></h2><p>Tell us what you have in mind. We will help make the search feel more personal.</p><div><button onClick={() => openRequestModal()} className="sa-button">Start a private request <ArrowRight size={18} /></button><a href={formatWhatsAppUrl(settings.whatsapp, 'Hello Selling Ajah, I would like to speak with an advisor.')} target="_blank" rel="noreferrer">Talk on WhatsApp</a></div></section>
  </div>;
};
