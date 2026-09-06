import React, { useRef } from 'react';
import { ArrowRight, ArrowUpRight, Instagram, MessageSquare } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatWhatsAppUrl } from '../utils/formatters';
import { useEditorialMotion } from '../hooks/useEditorialMotion';

const brands = [
  ['01', 'Dolyn Real Estate', "Premium property sales across Lagos' most prestigious addresses: Lekki, Ikoyi, VI, and beyond.", '@Thedolynglobal', 'https://instagram.com/thedolynglobal'],
  ['02', 'Dolyn Rentals', 'Long-term residential and commercial leasing with expert management from start to finish.', '@Dolynrentals', 'https://instagram.com/dolynrentals'],
  ['03', 'Selling Ajah', 'Your go-to source for the best property deals in the fast-growing Ajah corridor and beyond.', '@sellingajah', 'https://www.instagram.com/sellingajah/'],
  ['04', 'Dolyn Interiors', 'Bespoke interior decoration that turns empty spaces into breathtaking, magazine-worthy homes.', '@Thedolynglobal', 'https://instagram.com/thedolynglobal'],
  ['05', 'Dolyn Luxury Car Rentals', 'Premium vehicles for weddings, corporate events, airport transfers, and special occasions.', '@Thedolynglobal', 'https://instagram.com/thedolynglobal'],
  ['06', 'Dolyn Lagos Land', 'Verified land acquisition across prime Lagos corridors, including the fast-growing Ajah axis.', '@DolynlagosLand', 'https://instagram.com/dolynlagosland']
] as const;

const values = [
  ['I', 'Excellence', 'Every property and service meets the highest standard with no compromises.'],
  ['II', 'Integrity', 'Honesty is non-negotiable. Every deal is handled with complete transparency.'],
  ['III', 'Trust', 'Earned through consistent delivery and genuine care for every single client.'],
  ['IV', 'Innovation', 'We embrace technology to give clients a decisive edge in the market.']
] as const;

export const AboutView: React.FC = () => {
  const { navigate, settings } = useApp();
  const pageRef = useRef<HTMLDivElement>(null);
  useEditorialMotion(pageRef);
  const whatsappUrl = formatWhatsAppUrl(settings.whatsapp, 'Hello Selling Ajah, I would like to speak with the team.');

  return (
    <div ref={pageRef} className="sa-about-page sa-editorial-page min-h-screen pb-24">
      <section className="sa-about-founder-hero">
        <div className="sa-about-founder-portrait"><img src="/assets/images/founder-chisom.jpg" alt="Dr. Amb. Chisom Chiejina, Founder and CEO of DOLYN Global Investments Ltd" /></div>
        <div className="sa-about-founder-copy"><p className="sa-about-eyebrow">The story behind Selling Ajah</p><h1>A Vision Built on<br /><em>The Power of Trust</em></h1><div className="sa-about-founder-meta"><strong>Dr. Amb. Chisom Chiejina</strong><span>Founder & CEO</span><span>DOLYN Global Investments Ltd</span></div><p className="sa-about-hero-note">Before Selling Ajah became a focused property platform, there was a wider story of trust, service and real-estate experience.</p></div>
      </section>

      <section className="sa-about-story sa-about-wrap"><div className="sa-about-section-label"><span>01</span><p>Where it started</p></div><div className="sa-about-story-copy"><h2>Before Selling Ajah,<br /><em>there was DOLYN.</em></h2><div className="sa-about-prose"><p>Amb. Chisom Chiejina is a Nigerian-based realtor who founded THE DOLYN GLOBAL INVESTMENT LIMITED with one clear purpose: to provide exceptional leasing, sales, and property management services that clients can trust completely.</p><p>Born and raised in Benin, Nigeria, Chisom's passion for real estate is fuelled by her desire to guide buyers to the best value for their dream home, and to give sellers a smooth, stress-free journey to closing.</p><p>With deep expertise in communication, sales, and market intelligence, she has her fingers firmly on the pulse of the Lagos property market.</p></div><blockquote>“Think money, think real estate with Chisom.”</blockquote><p className="sa-about-prose sa-about-prose--short">Beyond real estate, Chisom partners with NGOs to fight poverty by investing in the younger generation.</p></div></section>

      <section className="sa-about-group"><div className="sa-about-wrap sa-about-group-grid"><div><p className="sa-about-eyebrow">The foundation</p><h2>Built Around Trust,<br /><em>Service and Opportunity.</em></h2><p className="sa-about-group-kicker">The Power of Trust</p></div><div className="sa-about-prose"><p>DOLYN was created to connect people with exceptional properties and lifestyle services, making luxury real estate attainable for every client, with integrity at the centre of every deal.</p><p>Its vision is to become Africa's most trusted and innovative real estate brand, celebrated for world-class service, verified listings, and investment opportunities that build generational wealth.</p></div></div><div className="sa-about-wrap sa-about-mission-grid"><div><span>Mission</span><p>To connect people with exceptional properties and lifestyle services, making luxury real estate attainable for every client, with integrity at the centre of every deal.</p></div><div><span>Vision</span><p>To become Africa's most trusted and innovative real estate brand, celebrated for world-class service, verified listings, and investment opportunities that build generational wealth.</p></div></div><div className="sa-about-wrap sa-about-credentials sa-about-credentials--group"><span>SCUML Certified</span><span>LASRERA Registered</span><span>REDAN Member</span></div></section>

      <section className="sa-about-bridge sa-about-wrap"><div className="sa-about-section-label"><span>02</span><p>Why Ajah?</p></div><div className="sa-about-bridge-copy"><h2>A Growing Market<br /><em>Needed a Sharper Focus.</em></h2><div className="sa-about-prose"><p>Selling Ajah was born from a simple idea: give one of Lagos' most active property corridors the focused attention it deserves.</p><p>Building on DOLYN's experience in real estate, the brand was created to concentrate attention on property opportunities around Ajah and its surrounding communities. It gives that part of the market a dedicated identity rather than making it only one small category inside the broader DOLYN business.</p></div></div></section>

      <section className="sa-about-selling"><div className="sa-about-wrap sa-about-selling-grid"><div><p className="sa-about-eyebrow">A DOLYN brand</p><h2>Meet<br /><em>Selling Ajah.</em></h2></div><div className="sa-about-selling-copy"><p>Selling Ajah is DOLYN's focused property platform for discovering opportunities across the Ajah corridor and beyond.</p><p>It creates a more focused experience for people searching for properties for sale, homes for rent, shortlet stays, property opportunities and related lifestyle services available through the wider DOLYN ecosystem.</p><div className="sa-about-actions"><button onClick={() => navigate('/properties')}>Explore Properties <ArrowRight size={16} /></button><button onClick={() => navigate('/contact')}>Speak With Us <ArrowRight size={16} /></button></div></div></div></section>

      <section className="sa-about-brands sa-about-wrap"><div className="sa-about-section-label"><span>03</span><p>The DOLYN family</p></div><div className="sa-about-brands-heading"><h2>Six Brands.<br /><em>One Vision.</em></h2><p>DOLYN has grown into a collection of specialist brands, each serving a different part of the property and lifestyle market while sharing the same commitment to quality and trust.</p></div><div className="sa-about-brands-list">{brands.map(([number, name, description, handle, link]) => <article key={name} className={name === 'Selling Ajah' ? 'is-current' : ''}><span className="sa-about-brand-number">{number}</span><div><h3>{name}</h3><p>{description}</p><a href={link} target="_blank" rel="noreferrer"><Instagram size={14} /> {handle} <ArrowUpRight size={14} /></a></div></article>)}</div><div className="sa-about-instagram"><span><Instagram size={16} /> Follow us on Instagram</span><a href="https://instagram.com/thedolynglobal" target="_blank" rel="noreferrer">@Thedolynglobal</a><a href="https://instagram.com/dolynrentals" target="_blank" rel="noreferrer">@Dolynrentals</a><a href="https://www.instagram.com/sellingajah/" target="_blank" rel="noreferrer">@sellingajah</a><a href="https://instagram.com/dolynlagosland" target="_blank" rel="noreferrer">@DolynlagosLand</a></div></section>

      <section className="sa-about-video"><div className="sa-about-wrap"><div className="sa-about-video-heading"><div><p className="sa-about-eyebrow">The story, in her words</p><h2>Hear From<br /><em>Chisom Directly</em></h2></div><p>Hear Dr. Amb. Chisom Chiejina share the story behind DOLYN, the values that shaped the company, and the vision behind the brands it has built.</p></div><div className="sa-about-video-frame"><video controls preload="metadata" poster="/assets/images/dolyn-video-thumbnail.png"><source src="/assets/images/dolyn-founder-story.mp4" type="video/mp4" />Your browser does not support the founder story video.</video></div><p className="sa-about-caption">Dr. Amb. Chisom Chiejina<br /><span>Founder & CEO, DOLYN Global Investments Ltd</span></p></div></section>

      <section className="sa-about-values sa-about-wrap"><div className="sa-about-section-label"><span>04</span><p>What drives us</p></div><div className="sa-about-values-content"><h2>The Values Behind<br /><em>Every DOLYN Brand.</em></h2><div className="sa-about-values-list">{values.map(([roman, title, copy]) => <article key={roman}><span>{roman}</span><h3>{title}</h3><p>{copy}</p></article>)}</div></div></section>

      <section className="sa-about-final"><div><p className="sa-about-eyebrow">Built by DOLYN. Focused on Ajah.</p><h2>Find Your Place<br /><em>With Selling Ajah.</em></h2><p>Backed by the values and real-estate experience of DOLYN, Selling Ajah gives property seekers and investors a focused way to explore opportunities across Ajah and beyond.</p><div className="sa-about-actions"><button onClick={() => navigate('/properties')}>Explore Properties <ArrowRight size={16} /></button><a href={whatsappUrl} target="_blank" rel="noreferrer">Talk To Us <MessageSquare size={16} /></a></div></div></section>
    </div>
  );
};
