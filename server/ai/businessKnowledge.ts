/**
 * Selling Ajah Central Verified Business Knowledge Layer
 *
 * Grounded strictly in authentic project data from:
 * - AboutView.tsx (Founder Dr. Amb. Chisom Chiejina, DOLYN Global Investments Ltd, credentials, 6 brands)
 * - ContactView.tsx & Footer.tsx (Admiralty Way / Ajah Jubilee Bridge office, phone, whatsapp, email)
 * - SiteSettings & Database (phone, whatsapp, email, address, social links)
 *
 * DO NOT invent unverified claims or unsupported biographical facts.
 */

import type { SiteSettings } from '../../src/types.js';

export interface SellingAjahBusinessProfile {
  companyName: string;
  legalEntity: string;
  rcNumber: string;
  parentCompany: string;
  ceoAndFounder: {
    fullName: string;
    title: string;
    companyRole: string;
    backgroundSummary: string;
    quote: string;
    communityInvolvement: string;
    credentials: string[];
  };
  dolynFamilyBrands: Array<{
    number: string;
    name: string;
    description: string;
    handle: string;
    link: string;
    isCurrent: boolean;
  }>;
  services: Array<{
    title: string;
    description: string;
  }>;
  operatingCorridor: string[];
  office: {
    address: string;
    landmark: string;
    hours: string;
  };
  contact: {
    phone: string;
    whatsapp: string;
    email: string;
  };
  verifiedSocials: {
    instagram: { handle: string; url: string };
    facebook?: { url: string };
    twitter?: { handle: string; url: string };
    linkedin?: { url: string };
    youtube?: { url: string };
  };
}

export function getVerifiedBusinessProfile(settings?: Partial<SiteSettings>): SellingAjahBusinessProfile {
  const phone = settings?.phone || '+234 810 901 2192';
  const whatsapp = settings?.whatsapp || '+234 810 901 2192';
  const email = settings?.email || 'info@sellingajah.com';
  const address = settings?.officeAddress || 'Suite 4B, Admiralty Way / Lekki-Epe Expressway, Beside Ajah Jubilee Bridge, Lagos, Nigeria';
  const hours = settings?.businessHours || 'Monday - Saturday: 8:00 AM - 7:00 PM | Sunday: By Appointment';

  const socialLinks = settings?.socialLinks || {};

  return {
    companyName: 'Selling Ajah',
    legalEntity: 'Selling Ajah Ltd',
    rcNumber: 'RC: 1892041',
    parentCompany: 'DOLYN Global Investments Ltd (THE DOLYN GLOBAL INVESTMENT LIMITED)',
    ceoAndFounder: {
      fullName: 'Dr. Amb. Chisom Chiejina',
      title: 'Dr. Amb. Chisom Chiejina',
      companyRole: 'Founder & CEO, DOLYN Global Investments Ltd',
      backgroundSummary: 'A Nigerian-based realtor who founded THE DOLYN GLOBAL INVESTMENT LIMITED with the mission to connect people with exceptional properties and lifestyle services, making luxury real estate attainable with integrity at the centre of every deal. Born and raised in Benin, Nigeria, her passion is guiding buyers to value and giving sellers a smooth, stress-free closing.',
      quote: 'Think money, think real estate with Chisom.',
      communityInvolvement: 'Beyond real estate, Chisom partners with NGOs to fight poverty by investing in the younger generation.',
      credentials: ['SCUML Certified', 'LASRERA Registered', 'REDAN Member']
    },
    dolynFamilyBrands: [
      {
        number: '01',
        name: 'Dolyn Real Estate',
        description: "Premium property sales across Lagos' most prestigious addresses: Lekki, Ikoyi, VI, and beyond.",
        handle: '@Thedolynglobal',
        link: 'https://instagram.com/thedolynglobal',
        isCurrent: false
      },
      {
        number: '02',
        name: 'Dolyn Rentals',
        description: 'Long-term residential and commercial leasing with expert management from start to finish.',
        handle: '@Dolynrentals',
        link: 'https://instagram.com/dolynrentals',
        isCurrent: false
      },
      {
        number: '03',
        name: 'Selling Ajah',
        description: 'Your go-to source for the best property deals in the fast-growing Ajah corridor and beyond.',
        handle: '@sellingajah',
        link: 'https://www.instagram.com/sellingajah/',
        isCurrent: true
      },
      {
        number: '04',
        name: 'Dolyn Interiors',
        description: 'Bespoke interior decoration that turns empty spaces into breathtaking, magazine-worthy homes.',
        handle: '@Thedolynglobal',
        link: 'https://instagram.com/thedolynglobal',
        isCurrent: false
      },
      {
        number: '06',
        name: 'Dolyn Lagos Land',
        description: 'Verified land acquisition across prime Lagos corridors, including the fast-growing Ajah axis.',
        handle: '@DolynlagosLand',
        link: 'https://instagram.com/dolynlagosland',
        isCurrent: false
      }
    ],
    services: [
      {
        title: 'Verified Property Sales',
        description: 'Luxury fully detached duplexes, semi-detached houses, terraces, and residential apartments across Ajah and Lekki with verified titles.'
      },
      {
        title: 'Long-Term Rentals & Leasing',
        description: 'Quality residential homes and duplexes for yearly tenancy with verified estate management.'
      },
      {
        title: 'Verified Land Acquisitions',
        description: 'Dry residential and commercial plots with Governor\'s Consent, C of O, or gazetted titles along the Ajah-Lekki corridor.'
      },
      {
        title: 'Serviced Shortlet Apartments',
        description: 'Fully furnished, executive 1 to 3-bedroom serviced apartments for short-term and holiday stays.'
      },
      {
        title: 'Physical & Virtual Property Inspections',
        description: 'Guided site viewings coordinated directly with our advisory team.'
      }
    ],
    operatingCorridor: [
      'Ajah (Ajah Jubilee, Badore, Ogombo, Awoyaya)',
      'Abraham Adesanya',
      'Sangotedo (Novare Mall axis)',
      'Chevron Toll Gate / Chevron Drive',
      'Victoria Garden City (VGC)',
      'Ikota Villa Estate',
      'Orchid Road',
      'Lekki Phase 1 and wider Eti-Osa communities'
    ],
    office: {
      address,
      landmark: 'Beside Ajah Jubilee Bridge, Lekki-Epe Expressway',
      hours
    },
    contact: {
      phone,
      whatsapp,
      email
    },
    verifiedSocials: {
      instagram: {
        handle: '@sellingajah',
        url: socialLinks.instagram || 'https://instagram.com/sellingajah'
      },
      facebook: {
        url: socialLinks.facebook || 'https://facebook.com/sellingajah'
      },
      twitter: {
        handle: '@sellingajah',
        url: socialLinks.twitter || 'https://x.com/sellingajah'
      },
      linkedin: {
        url: socialLinks.linkedin || 'https://linkedin.com/company/sellingajah'
      },
      youtube: {
        url: socialLinks.youtube || 'https://youtube.com/@sellingajah'
      }
    }
  };
}
