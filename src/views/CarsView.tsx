import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { LuxuryVehicle } from '../types';
import { VehicleCard } from '../components/VehicleCard';
import { formatNaira, formatWhatsAppUrl } from '../utils/formatters';
import {
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  Car,
  MessageSquare,
  Search,
  Sparkles,
  X,
  AlertCircle
} from 'lucide-react';
import { useEditorialMotion } from '../hooks/useEditorialMotion';

export const CarsView: React.FC = () => {
  const pageRef = useRef<HTMLDivElement>(null);
  useEditorialMotion(pageRef);
  const { openAiModal, navigate, settings } = useApp();
  const [vehicles, setVehicles] = useState<LuxuryVehicle[]>([]);
  const [loading, setLoading] = useState(true);

  const [category, setCategory] = useState('all');
  const [keyword, setKeyword] = useState('');

  const [loadError, setLoadError] = useState(false);

  const fetchVehicles = () => {
    setLoading(true);
    setLoadError(false);
    fetch('/api/vehicles')
      .then(res => {
        if (!res.ok) throw new Error('Failed to load vehicles');
        return res.json();
      })
      .then(data => {
        setVehicles(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching vehicles:', err);
        setLoadError(true);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchVehicles();
  }, []);

  const filteredVehicles = useMemo(() => {
    return vehicles.filter(veh => {
      if (category !== 'all' && veh.category.toLowerCase() !== category.toLowerCase()) return false;
      if (keyword.trim()) {
        const q = keyword.toLowerCase();
        const matchName = veh.name.toLowerCase().includes(q);
        const matchBrand = veh.brand.toLowerCase().includes(q);
        const matchDesc = veh.description.toLowerCase().includes(q);
        if (!matchName && !matchBrand && !matchDesc) return false;
      }
      return true;
    });
  }, [vehicles, category, keyword]);

  const categories = [
    { label: 'All Fleet', value: 'all' },
    { label: 'Luxury SUVs', value: 'SUV' },
    { label: 'Executive Sedans', value: 'Luxury Sedan' },
    { label: 'Ultra Luxury', value: 'Ultra Luxury' }
  ];

  const heroVehicle = vehicles.find(vehicle => vehicle.isFeatured) || vehicles[0];
  const whatsappUrl = formatWhatsAppUrl(
    settings.whatsapp,
    'Hello Selling Ajah, I would like to enquire about your luxury vehicle fleet.'
  );

  return (
    <div ref={pageRef} className="sa-cars-page sa-catalogue--cars min-h-screen pb-24 transition-colors duration-200">
      <section className="sa-cars-hero">
        {heroVehicle ? <img src={heroVehicle.mainImage} alt={heroVehicle.name} className="sa-cars-hero__image" fetchPriority="high" /> : <div className="sa-cars-hero__placeholder" />}
        <div className="sa-cars-hero__shade" />
        <div className="sa-cars-hero__grid" aria-hidden="true" />
        <div className="sa-cars-hero__content">
          <p className="sa-cars-eyebrow"><Car size={14} /> Executive mobility</p>
          <h1>Luxury moves<br /><em>differently.</em></h1>
          <p>Explore a curated selection of executive and luxury vehicles available across Ajah and Lagos.</p>
          <div className="sa-cars-hero__actions">
            <button onClick={() => document.getElementById('cars-collection')?.scrollIntoView({ behavior: 'smooth' })} className="sa-cars-button sa-cars-button--light">Explore vehicles <ArrowDownRight size={17} /></button>
            <a href={whatsappUrl} target="_blank" rel="noreferrer" className="sa-cars-hero__link"><MessageSquare size={16} /> Enquire on WhatsApp</a>
          </div>
        </div>
        {heroVehicle && <div className="sa-cars-hero__vehicle"><span>{heroVehicle.brand}</span><strong>{heroVehicle.model}</strong><small>{formatNaira(heroVehicle.dailyRate)} / day</small></div>}
        <div className="sa-cars-hero__footer"><span>01 — Fleet</span><ArrowDownRight size={18} /><span>Ajah / Lagos</span></div>
      </section>

      <section className="sa-cars-intro sa-cars-wrap">
        <p className="sa-cars-eyebrow sa-cars-eyebrow--dark">A considered way to move</p>
        <div className="sa-cars-intro__layout"><h2>Executive mobility<br /><em>for the way Lagos moves.</em></h2><p>Choose from a focused collection of luxury SUVs, executive vehicles and premium cars. Browse the fleet, open a vehicle dossier, then send a direct enquiry for dates and arrangements.</p></div>
        <div className="sa-cars-principles"><div><span>01</span><strong>Curated fleet</strong><p>Selected vehicles presented with the details available for each model.</p></div><div><span>02</span><strong>Direct enquiry</strong><p>Move from vehicle discovery to a personal WhatsApp or booking enquiry.</p></div><div><span>03</span><strong>Lagos access</strong><p>A focused rental collection for Ajah, Lekki and wider Lagos journeys.</p></div></div>
      </section>

      <section id="cars-collection" className="sa-cars-collection sa-cars-wrap">
        <div className="sa-cars-section-heading"><div><p className="sa-cars-eyebrow sa-cars-eyebrow--dark">The collection</p><h2>Choose your<br /><em>next drive.</em></h2></div><button onClick={() => openAiModal('Help me choose a luxury rental vehicle')} className="sa-cars-text-button"><Sparkles size={15} /> Ask the concierge</button></div>
        <div className="sa-cars-filter-rail"><label><Search size={16} /><input value={keyword} onChange={e => setKeyword(e.target.value)} placeholder="Search by brand or model" />{keyword && <button onClick={() => setKeyword('')} aria-label="Clear search"><X size={15} /></button>}</label><div className="sa-cars-categories">{categories.map(c => <button key={c.value} onClick={() => setCategory(c.value)} className={category === c.value ? 'is-active' : ''}>{c.label}</button>)}</div></div>
        {loading ? (
          <div className="sa-cars-loading">Loading the collection</div>
        ) : loadError ? (
          <div className="sa-cars-empty border border-rose-500/20">
            <AlertCircle size={32} className="text-amber-500 mx-auto" />
            <h3>Unable to load luxury fleet</h3>
            <p>We encountered a temporary connection issue. Please retry or contact our concierge.</p>
            <button onClick={fetchVehicles} className="sa-cars-button">
              Retry Loading
            </button>
          </div>
        ) : filteredVehicles.length === 0 ? (
          <div className="sa-cars-empty">
            <Car size={32} />
            <h3>No vehicles found</h3>
            <p>Try another model, brand or category.</p>
            <button onClick={() => { setCategory('all'); setKeyword(''); }} className="sa-cars-button">
              Reset filters
            </button>
          </div>
        ) : (
          <div className="sa-cars-featured-grid">
            {filteredVehicles.map((vehicle, index) => (
              <VehicleCard key={vehicle.id} vehicle={vehicle} featured={index === 0 && !keyword && category === 'all'} />
            ))}
          </div>
        )}
      </section>

      <section className="sa-cars-process"><div className="sa-cars-wrap"><p className="sa-cars-eyebrow">The simple route</p><div className="sa-cars-process__head"><h2>From browsing<br /><em>to moving.</em></h2><p>Every vehicle page keeps the next step clear: inspect the details, choose your dates, and send an enquiry.</p></div><div className="sa-cars-steps"><div><span>01</span><h3>Browse the fleet</h3><p>Explore the current collection by category, brand or model.</p></div><div><span>02</span><h3>Select a vehicle</h3><p>Open the vehicle dossier for verified rental information and available details.</p></div><div><span>03</span><h3>Send your enquiry</h3><p>Use WhatsApp or the reservation form to share your dates and requirements.</p></div></div></div></section>

      <section className="sa-cars-media"><div className="sa-cars-media__image" style={{ backgroundImage: `url(${heroVehicle?.gallery?.[1] || heroVehicle?.mainImage || 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=2200&q=85'})` }} /><div className="sa-cars-media__copy"><p className="sa-cars-eyebrow">The road ahead</p><h2>Arrive with<br /><em>intention.</em></h2></div></section>
      <section className="sa-cars-cta"><div><p className="sa-cars-eyebrow">Private vehicle enquiries</p><h2>Ready when<br /><em>you are.</em></h2><p>Tell us which vehicle caught your eye and when you need it. Our existing enquiry and WhatsApp channels are ready when you are.</p><div className="sa-cars-hero__actions"><a href={whatsappUrl} target="_blank" rel="noreferrer" className="sa-cars-button sa-cars-button--light"><MessageSquare size={16} /> Talk on WhatsApp</a><button onClick={() => navigate('/contact')} className="sa-cars-hero__link">Contact the team <ArrowRight size={16} /></button></div></div></section>
    </div>
  );
};
