import React, { useRef } from 'react';
import { ArrowRight, ArrowUpRight, Instagram, MessageSquare } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatWhatsAppUrl } from '../utils/formatters';
import { useEditorialMotion } from '../hooks/useEditorialMotion';

const brands = [
  {
    number: '01',
    name: 'Dolyn Real Estate',
    description: "Premium property sales across Lagos' most prestigious addresses: Lekki, Ikoyi, VI, and beyond.",
    handle: '@Thedolynglobal',
    link: 'https://instagram.com/thedolynglobal',
    isCurrent: false,
  },
  {
    number: '02',
    name: 'Dolyn Rentals',
    description: 'Long-term residential and commercial leasing with expert management from start to finish.',
    handle: '@Dolynrentals',
    link: 'https://instagram.com/dolynrentals',
    isCurrent: false,
  },
  {
    number: '03',
    name: 'Selling Ajah',
    description: 'Your go-to source for the best property deals in the fast-growing Ajah corridor and beyond.',
    handle: '@sellingajah',
    link: 'https://www.instagram.com/sellingajah/',
    isCurrent: true,
  },
  {
    number: '04',
    name: 'Dolyn Interiors',
    description: 'Bespoke interior decoration that turns empty spaces into breathtaking, magazine-worthy homes.',
    handle: '@Thedolynglobal',
    link: 'https://instagram.com/thedolynglobal',
    isCurrent: false,
  },
  {
    number: '05',
    name: 'Dolyn Luxury Car Rentals',
    description: 'Premium vehicles for weddings, corporate events, airport transfers, and special occasions.',
    handle: '@Thedolynglobal',
    link: 'https://instagram.com/thedolynglobal',
    isCurrent: false,
  },
  {
    number: '06',
    name: 'Dolyn Lagos Land',
    description: 'Verified land acquisition across prime Lagos corridors, including the fast-growing Ajah axis.',
    handle: '@DolynlagosLand',
    link: 'https://instagram.com/dolynlagosland',
    isCurrent: false,
  },
] as const;

const values = [
  {
    roman: 'I',
    title: 'Excellence',
    description: 'Every property and service meets the highest standard with no compromises.',
  },
  {
    roman: 'II',
    title: 'Integrity',
    description: 'Honesty is non-negotiable. Every deal is handled with complete transparency.',
  },
  {
    roman: 'III',
    title: 'Trust',
    description: 'Earned through consistent delivery and genuine care for every single client.',
  },
  {
    roman: 'IV',
    title: 'Innovation',
    description: 'We embrace technology to give clients a decisive edge in the market.',
  },
] as const;

export const AboutView: React.FC = () => {
  const { navigate, settings } = useApp();
  const pageRef = useRef<HTMLDivElement>(null);
  useEditorialMotion(pageRef);
  const whatsappUrl = formatWhatsAppUrl(settings.whatsapp, 'Hello Selling Ajah, I would like to speak with the team.');

  return (
    <div ref={pageRef} className="sa-about-page sa-editorial-page min-h-screen pb-24">
      {/* SECTION 01 — FOUNDER HERO */}
      <section className="sa-about-founder-hero">
        <div className="sa-about-founder-portrait">
          <img
            src="/assets/images/founder-chisom.jpg"
            alt="Dr. Amb. Chisom Chiejina, Founder and CEO of DOLYN Global Investments Ltd"
            loading="eager"
          />
        </div>
        <div className="sa-about-founder-copy">
          <p className="sa-about-eyebrow">The story behind Selling Ajah</p>
          <h1>
            A Vision Built on<br />
            <em>The Power of Trust</em>
          </h1>
          <div className="sa-about-founder-meta">
            <strong>Dr. Amb. Chisom Chiejina</strong>
            <span>Founder &amp; CEO</span>
            <span>DOLYN Global Investments Ltd</span>
          </div>
          <p className="sa-about-hero-note">
            Before Selling Ajah became a focused property platform, there was a wider story of trust, service and real-estate experience.
          </p>
        </div>
      </section>

      {/* SECTION 02 — BEFORE SELLING AJAH */}
      <section className="sa-about-story sa-about-wrap">
        <div className="sa-about-section-label">
          <span>01</span>
          <p>Where it started</p>
        </div>
        <div className="sa-about-story-copy">
          <h2>
            Before Selling Ajah,<br />
            <em>there was DOLYN.</em>
          </h2>
          <div className="sa-about-prose">
            <p>
              Amb. Chisom Chiejina is a Nigerian-based realtor who founded THE DOLYN GLOBAL INVESTMENT LIMITED with one clear purpose: to provide exceptional leasing, sales, and property management services that clients can trust completely.
            </p>
            <p>
              Born and raised in Benin, Nigeria, Chisom&apos;s passion for real estate is fuelled by her desire to guide buyers to the best value for their dream home, and to give sellers a smooth, stress-free journey to closing.
            </p>
            <p>
              With deep expertise in communication, sales, and market intelligence, she has her fingers firmly on the pulse of the Lagos property market.
            </p>
          </div>
          <blockquote>“Think money, think real estate with Chisom.”</blockquote>
          <p className="sa-about-prose sa-about-prose--short">
            Beyond real estate, Chisom partners with NGOs to fight poverty by investing in the younger generation.
          </p>
        </div>
      </section>

      {/* SECTION 03 — DOLYN FOUNDATION & CREDENTIALS */}
      <section className="sa-about-group">
        <div className="sa-about-wrap sa-about-group-grid">
          <div>
            <p className="sa-about-eyebrow sa-about-eyebrow--gold">The foundation</p>
            <h2>
              Built Around Trust,<br />
              <em>Service and Opportunity.</em>
            </h2>
            <p className="sa-about-group-kicker">The Power of Trust</p>
          </div>
          <div className="sa-about-prose">
            <p>
              DOLYN was created to connect people with exceptional properties and lifestyle services, making luxury real estate attainable for every client, with integrity at the centre of every deal.
            </p>
            <p>
              Its vision is to become Africa&apos;s most trusted and innovative real estate brand, celebrated for world-class service, verified listings, and investment opportunities that build generational wealth.
            </p>
          </div>
        </div>

        <div className="sa-about-wrap sa-about-mission-grid">
          <div>
            <span>Mission</span>
            <p>
              To connect people with exceptional properties and lifestyle services, making luxury real estate attainable for every client, with integrity at the centre of every deal.
            </p>
          </div>
          <div>
            <span>Vision</span>
            <p>
              To become Africa&apos;s most trusted and innovative real estate brand, celebrated for world-class service, verified listings, and investment opportunities that build generational wealth.
            </p>
          </div>
        </div>

        <div className="sa-about-wrap sa-about-credentials sa-about-credentials--group">
          <span>SCUML Certified</span>
          <span className="sa-about-sep" aria-hidden="true">/</span>
          <span>LASRERA Registered</span>
          <span className="sa-about-sep" aria-hidden="true">/</span>
          <span>REDAN Member</span>
        </div>
      </section>

      {/* SECTION 04 — THE AJAH BRIDGE (WHY AJAH?) */}
      <section className="sa-about-bridge">
        <div className="sa-about-bridge-watermark" aria-hidden="true">AJAH</div>
        <div className="sa-about-wrap sa-about-bridge-inner">
          <div className="sa-about-section-label sa-about-section-label--ivory">
            <span>02</span>
            <p>Why Ajah?</p>
          </div>
          <div className="sa-about-bridge-copy">
            <h2>
              A Growing Market<br />
              <em>Needed a Sharper Focus.</em>
            </h2>
            <div className="sa-about-prose sa-about-prose--ivory">
              <p>
                Selling Ajah was born from a simple idea: give one of Lagos&apos; most active property corridors the focused attention it deserves.
              </p>
              <p>
                Building on DOLYN&apos;s experience in real estate, the brand was created to make discovering property opportunities around Ajah and its surrounding communities more focused, accessible and intentional. Rather than remaining just one location tag in a broader portfolio, the Ajah corridor earned its own dedicated specialist identity.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 05 — MEET SELLING AJAH */}
      <section className="sa-about-selling">
        <div className="sa-about-wrap sa-about-selling-grid">
          <div>
            <p className="sa-about-eyebrow sa-about-eyebrow--gold">A DOLYN brand</p>
            <h2>
              Meet<br />
              <em>Selling Ajah.</em>
            </h2>
          </div>
          <div className="sa-about-selling-copy">
            <p>
              Selling Ajah is DOLYN&apos;s focused property platform for discovering opportunities across the Ajah corridor and beyond.
            </p>
            <p>
              It creates a dedicated home for verified properties for sale, long-term rentals, serviced shortlet stays, land acquisitions, and executive concierge lifestyle services powered by the wider DOLYN ecosystem.
            </p>
            <div className="sa-about-actions">
              <button
                type="button"
                id="about-explore-properties-btn"
                onClick={() => navigate('/properties')}
              >
                Explore Properties <ArrowRight size={16} />
              </button>
              <button
                type="button"
                id="about-speak-with-us-btn"
                onClick={() => navigate('/contact')}
              >
                Speak With Us <ArrowRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 06 — THE DOLYN FAMILY */}
      <section className="sa-about-brands sa-about-wrap">
        <div className="sa-about-section-label">
          <span>03</span>
          <p>The DOLYN family</p>
        </div>
        <div className="sa-about-brands-heading">
          <h2>
            Six Brands.<br />
            <em>One Vision.</em>
          </h2>
          <p>
            DOLYN has grown into a collection of specialist brands, each serving a different part of the property and lifestyle market while sharing the same commitment to quality and trust.
          </p>
        </div>
        <div className="sa-about-brands-list">
          {brands.map((brand) => (
            <article
              key={brand.name}
              className={brand.isCurrent ? 'is-current' : ''}
              id={`about-brand-${brand.number}`}
            >
              <span className="sa-about-brand-number">{brand.number}</span>
              <div>
                <h3>
                  {brand.name}
                  {brand.isCurrent && (
                    <span className="sa-about-current-badge">Flagship Portal</span>
                  )}
                </h3>
                <p>{brand.description}</p>
                <a
                  href={brand.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`Visit ${brand.name} on Instagram (${brand.handle})`}
                >
                  <Instagram size={14} /> {brand.handle} <ArrowUpRight size={14} />
                </a>
              </div>
            </article>
          ))}
        </div>
        <div className="sa-about-instagram">
          <span>
            <Instagram size={16} /> Follow us on Instagram
          </span>
          <a href="https://instagram.com/thedolynglobal" target="_blank" rel="noopener noreferrer">
            @Thedolynglobal
          </a>
          <a href="https://instagram.com/dolynrentals" target="_blank" rel="noopener noreferrer">
            @Dolynrentals
          </a>
          <a href="https://www.instagram.com/sellingajah/" target="_blank" rel="noopener noreferrer">
            @sellingajah
          </a>
          <a href="https://instagram.com/dolynlagosland" target="_blank" rel="noopener noreferrer">
            @DolynlagosLand
          </a>
        </div>
      </section>

      {/* SECTION 07 — REAL FOUNDER VIDEO */}
      <section className="sa-about-video">
        <div className="sa-about-wrap">
          <div className="sa-about-video-heading">
            <div>
              <p className="sa-about-eyebrow sa-about-eyebrow--gold">The story, in her words</p>
              <h2>
                Hear From<br />
                <em>Chisom Directly</em>
              </h2>
            </div>
            <p>
              Hear Dr. Amb. Chisom Chiejina share the story behind DOLYN, the values that shaped the company, and the vision behind the brands it has built.
            </p>
          </div>
          <div className="sa-about-video-frame">
            <video
              id="founder-story-video"
              controls
              playsInline
              preload="metadata"
              poster="/assets/images/dolyn-video-thumbnail.png"
              className="w-full h-full object-cover"
              aria-label="Dr. Amb. Chisom Chiejina founder story video"
            >
              <source
                src="/assets/images/dolyn_IG.mp4"
                type="video/mp4"
              />
              Your browser does not support the founder story video.
            </video>
          </div>
          <p className="sa-about-caption">
            Dr. Amb. Chisom Chiejina<br />
            <span>Founder &amp; CEO, DOLYN Global Investments Ltd</span>
          </p>
        </div>
      </section>

      {/* SECTION 08 — CORE VALUES */}
      <section className="sa-about-values sa-about-wrap">
        <div className="sa-about-section-label">
          <span>04</span>
          <p>What drives us</p>
        </div>
        <div className="sa-about-values-content">
          <h2>
            The Values Behind<br />
            <em>Every DOLYN Brand.</em>
          </h2>
          <div className="sa-about-values-list">
            {values.map((val) => (
              <article key={val.roman} id={`about-val-${val.roman}`}>
                <span>{val.roman}</span>
                <h3>{val.title}</h3>
                <p>{val.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 09 — SELLING AJAH CLOSING */}
      <section className="sa-about-final">
        <div>
          <p className="sa-about-eyebrow sa-about-eyebrow--gold">Built by DOLYN. Focused on Ajah.</p>
          <h2>
            Find Your Place<br />
            <em>With Selling Ajah.</em>
          </h2>
          <p>
            Backed by the values and real-estate experience of DOLYN, Selling Ajah gives property seekers and investors a focused way to explore opportunities across Ajah and beyond.
          </p>
          <div className="sa-about-actions">
            <button
              type="button"
              id="about-final-explore-btn"
              onClick={() => navigate('/properties')}
            >
              Explore Properties <ArrowRight size={16} />
            </button>
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              id="about-final-whatsapp-btn"
            >
              Talk To Us <MessageSquare size={16} />
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};
