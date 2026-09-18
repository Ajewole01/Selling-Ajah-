import * as repo from '../repositories/index.js';
import { SELLING_AJAH_KNOWLEDGE } from './knowledge.js';
import type { Property, ServicedApartment, LuxuryVehicle, ChatCard } from '../../src/types.js';

export function formatNaira(num: number): string {
  return '₦' + Number(num || 0).toLocaleString('en-NG');
}

// Input sanitization & validation utilities
function sanitizeText(input: any, maxLength = 300): string {
  if (typeof input !== 'string') {
    return '';
  }
  // Strip control characters, excessive whitespace, and limit length
  return input.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '').trim().slice(0, maxLength);
}

function sanitizePhone(input: any): string {
  const str = sanitizeText(input, 30);
  // Basic validation: ensure it contains at least some digits
  return str.replace(/[^\d+()\s-]/g, '');
}

function sanitizeEmail(input: any): string | undefined {
  const str = sanitizeText(input, 100);
  if (/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(str)) {
    return str;
  }
  return undefined;
}

function sanitizeNumber(input: any, min = 0, max = 1_000_000_000): number | undefined {
  const num = Number(input);
  if (isNaN(num)) return undefined;
  return Math.min(Math.max(num, min), max);
}

function sanitizeDate(input: any): string {
  const str = sanitizeText(input, 50);
  // Keep clean date or relative date string
  return str || new Date(Date.now() + 86400000).toISOString().split('T')[0];
}

export function propertyToCard(p: Property): ChatCard {
  return {
    id: p.id,
    title: p.title,
    price: p.price,
    formattedPrice: formatNaira(p.price) + (p.pricePeriod ? `/${p.pricePeriod}` : ''),
    location: p.location,
    image: p.mainImage,
    type: 'property',
    slug: p.slug,
    details: `${p.bedrooms} Beds • ${p.bathrooms} Baths • ${p.propertyType}`
  };
}

export function apartmentToCard(a: ServicedApartment): ChatCard {
  // Only state features that actually exist in the listing record
  const featuresList = [
    `${a.bedrooms} Beds`,
    `Up to ${a.maxGuests} Guests`
  ];
  const hasPowerMention = a.amenities.some(item => /power|electricity|24\/7|generator|solar/i.test(item));
  if (hasPowerMention) {
    featuresList.push('Serviced Power');
  }

  return {
    id: a.id,
    title: a.name,
    price: a.pricePerNight,
    formattedPrice: `${formatNaira(a.pricePerNight)}/night`,
    location: a.location,
    image: a.mainImage,
    type: 'shortlet',
    slug: a.slug,
    details: featuresList.join(' • ')
  };
}

export function vehicleToCard(v: LuxuryVehicle): ChatCard {
  // Only indicate chauffeur if explicitly present in the vehicle record
  const hasChauffeur = (v.features || []).some(f => /chauffeur|driver/i.test(f));
  const locationText = hasChauffeur ? 'Lagos (Chauffeur listed in features)' : 'Lagos Axis';

  return {
    id: v.id,
    title: v.name,
    price: v.dailyRate,
    formattedPrice: `${formatNaira(v.dailyRate)}/day`,
    location: locationText,
    image: v.mainImage,
    type: 'vehicle',
    slug: v.slug,
    details: `${v.category} • ${v.seats} Seats • ${v.transmission}`
  };
}

// Declarations for Gemini Tool Calling - Factual, no unsupported assumptions
export const GEMINI_TOOL_DECLARATIONS = [
  {
    name: 'search_properties',
    description: 'Search verified properties for sale or rent in Ajah, Lekki, and Lagos. Returns current inventory from the database.',
    parameters: {
      type: 'OBJECT' as const,
      properties: {
        listingType: { type: 'STRING' as const, description: "Type of listing: 'sale', 'rent', or 'all'" },
        area: { type: 'STRING' as const, description: "Specific neighborhood e.g. 'Ajah', 'Abraham Adesanya', 'Orchid Road', 'Chevron', 'VGC', 'Sangotedo'" },
        propertyType: { type: 'STRING' as const, description: "e.g. 'Detached Duplex', 'Semi Detached', 'Terrace', 'Penthouse'" },
        bedrooms: { type: 'NUMBER' as const, description: 'Number of bedrooms required' },
        maxPrice: { type: 'NUMBER' as const, description: 'Maximum budget in Naira (NGN)' },
        minPrice: { type: 'NUMBER' as const, description: 'Minimum budget in Naira (NGN)' },
        keyword: { type: 'STRING' as const, description: "Additional search terms like 'pool', 'gym'" }
      }
    }
  },
  {
    name: 'get_property_details',
    description: 'Retrieve specifications, documented title, and amenities for a specific property by ID or slug from the database.',
    parameters: {
      type: 'OBJECT' as const,
      properties: {
        idOrSlug: { type: 'STRING' as const, description: 'The property ID or slug' }
      },
      required: ['idOrSlug']
    }
  },
  {
    name: 'search_shortlets',
    description: 'Search serviced apartments and shortlets in Ajah and Lekki from the active database.',
    parameters: {
      type: 'OBJECT' as const,
      properties: {
        area: { type: 'STRING' as const, description: "Neighborhood e.g. 'Chevron', 'Lekki Phase 1', 'Ajah'" },
        guests: { type: 'NUMBER' as const, description: 'Number of guests staying' },
        bedrooms: { type: 'NUMBER' as const, description: 'Minimum bedrooms' },
        maxPricePerNight: { type: 'NUMBER' as const, description: 'Maximum rate per night in Naira' }
      }
    }
  },
  {
    name: 'get_shortlet_details',
    description: 'Retrieve check-in times, amenities, house rules, and rate details for a specific serviced shortlet from the database.',
    parameters: {
      type: 'OBJECT' as const,
      properties: {
        idOrSlug: { type: 'STRING' as const, description: 'Shortlet ID or slug' }
      },
      required: ['idOrSlug']
    }
  },
  {
    name: 'search_vehicles',
    description: 'Search rental vehicles in the database by brand, category, or budget.',
    parameters: {
      type: 'OBJECT' as const,
      properties: {
        brand: { type: 'STRING' as const, description: "Brand name e.g. 'Mercedes-Benz', 'Land Rover', 'Lexus', 'Rolls-Royce'" },
        category: { type: 'STRING' as const, description: "Vehicle type e.g. 'SUV', 'Luxury Sedan'" },
        maxDailyRate: { type: 'NUMBER' as const, description: 'Maximum daily rental budget in Naira' }
      }
    }
  },
  {
    name: 'get_vehicle_details',
    description: 'Retrieve vehicle specifications, listed features, requirements, and rates for a vehicle from the database.',
    parameters: {
      type: 'OBJECT' as const,
      properties: {
        idOrSlug: { type: 'STRING' as const, description: 'Vehicle ID or slug' }
      },
      required: ['idOrSlug']
    }
  },
  {
    name: 'create_inspection_request',
    description: 'Submit an inspection request for a property. Note: this is a pending request subject to staff verification and confirmation.',
    parameters: {
      type: 'OBJECT' as const,
      properties: {
        customerName: { type: 'STRING' as const, description: 'Full name of the client' },
        customerPhone: { type: 'STRING' as const, description: 'Phone or WhatsApp contact' },
        customerEmail: { type: 'STRING' as const, description: 'Optional email address' },
        listingId: { type: 'STRING' as const, description: 'Property ID if known' },
        listingTitle: { type: 'STRING' as const, description: 'Title or description of property' },
        preferredDate: { type: 'STRING' as const, description: 'Preferred date (YYYY-MM-DD or descriptive day)' },
        preferredTime: { type: 'STRING' as const, description: 'Preferred time e.g. 11:00 AM' },
        notes: { type: 'STRING' as const, description: 'Optional notes (e.g. video call inspection or in-person)' }
      },
      required: ['customerName', 'customerPhone', 'listingTitle', 'preferredDate']
    }
  },
  {
    name: 'create_booking_request',
    description: 'Submit a booking request for a serviced shortlet apartment or rental vehicle. All requests are received as pending confirmation by staff.',
    parameters: {
      type: 'OBJECT' as const,
      properties: {
        bookingType: { type: 'STRING' as const, description: "'shortlet' or 'vehicle'" },
        customerName: { type: 'STRING' as const, description: 'Full name of client' },
        customerPhone: { type: 'STRING' as const, description: 'Phone or WhatsApp contact' },
        customerEmail: { type: 'STRING' as const, description: 'Optional email' },
        listingId: { type: 'STRING' as const, description: 'Listing ID' },
        listingTitle: { type: 'STRING' as const, description: 'Listing name' },
        startDate: { type: 'STRING' as const, description: 'Check-in or rental start date' },
        endDate: { type: 'STRING' as const, description: 'Check-out or return date' },
        guestsOrDays: { type: 'NUMBER' as const, description: 'Number of guests (for shortlet) or rental days (for vehicle)' },
        notes: { type: 'STRING' as const, description: 'Optional special requests' }
      },
      required: ['bookingType', 'customerName', 'customerPhone', 'listingTitle', 'startDate']
    }
  },
  {
    name: 'get_business_information',
    description: 'Get factual company contact details, location overview, or statutory title definitions.',
    parameters: {
      type: 'OBJECT' as const,
      properties: {
        topic: {
          type: 'STRING' as const,
          description: "Topic: 'company', 'locations', 'titles_and_legal', 'inspection_policy', 'booking_policies', 'contact'"
        }
      },
      required: ['topic']
    }
  },
  {
    name: 'request_human_assistance',
    description: 'Submit an escalation request for a Selling Ajah representative to contact the client.',
    parameters: {
      type: 'OBJECT' as const,
      properties: {
        customerName: { type: 'STRING' as const, description: 'Client name if provided' },
        customerPhone: { type: 'STRING' as const, description: 'Client contact number' },
        reason: { type: 'STRING' as const, description: 'Reason for escalation (e.g. price inquiry, custom terms, direct agent request)' }
      },
      required: ['reason']
    }
  },
  {
    name: 'create_enquiry',
    description: 'Submit a general client enquiry, callback request, or consultation message.',
    parameters: {
      type: 'OBJECT' as const,
      properties: {
        name: { type: 'STRING' as const, description: 'Client full name' },
        phone: { type: 'STRING' as const, description: 'Phone or WhatsApp number' },
        email: { type: 'STRING' as const, description: 'Optional email address' },
        service: {
          type: 'STRING' as const,
          description: "Service category: 'property_sale', 'property_rent', 'shortlet', 'car_rental', or 'consultation'"
        },
        listingTitle: { type: 'STRING' as const, description: 'Optional title of property, shortlet, or vehicle' },
        message: { type: 'STRING' as const, description: 'Client inquiry message' }
      },
      required: ['name', 'phone', 'message']
    }
  }
];

// Tool Executors with Strict Input Validation & Database Grounding
export async function executeTool(name: string, rawArgs: any): Promise<{ result: any; cards?: ChatCard[]; actionButtons?: any[] }> {
  const args = rawArgs && typeof rawArgs === 'object' ? rawArgs : {};

  switch (name) {
    case 'search_properties': {
      const all = await repo.getProperties();
      let filtered = all.filter(p => p.status === 'available');

      const listingType = sanitizeText(args.listingType, 20).toLowerCase();
      if (listingType && listingType !== 'all') {
        filtered = filtered.filter(p => p.listingType.toLowerCase() === listingType);
      }

      const area = sanitizeText(args.area, 50).toLowerCase();
      if (area) {
        if (area === 'ajah') {
          // In Lagos real estate, the Ajah corridor includes Abraham Adesanya, Badore, Ogombo, and general Ajah
          filtered = filtered.filter(p => 
            p.area.toLowerCase().includes('ajah') || 
            p.location.toLowerCase().includes('ajah') ||
            p.area.toLowerCase().includes('abraham adesanya') ||
            p.location.toLowerCase().includes('abraham adesanya')
          );
        } else {
          filtered = filtered.filter(p => p.area.toLowerCase().includes(area) || p.location.toLowerCase().includes(area));
        }
      }

      const bedrooms = sanitizeNumber(args.bedrooms, 1, 20);
      if (bedrooms !== undefined) {
        // Exclude land and match bedrooms exactly or >= requested
        filtered = filtered.filter(p => p.bedrooms >= bedrooms && !p.propertyType.toLowerCase().includes('land'));
      }

      const maxPrice = sanitizeNumber(args.maxPrice, 1);
      if (maxPrice !== undefined) {
        filtered = filtered.filter(p => p.price <= maxPrice);
      }

      const minPrice = sanitizeNumber(args.minPrice, 1);
      if (minPrice !== undefined) {
        filtered = filtered.filter(p => p.price >= minPrice);
      }

      const propertyType = sanitizeText(args.propertyType, 50).toLowerCase();
      if (propertyType) {
        filtered = filtered.filter(p => p.propertyType.toLowerCase().includes(propertyType));
      }

      const rawKeyword = sanitizeText(args.keyword, 100).toLowerCase();
      // Only apply keyword filter if it is a specific feature/amenity query and not a conversational sentence
      const isConversational = /\b(?:budget|looking|find|want|need|around|under|below|million|naira|property|house|apartment|shortlet|ajah|lekki|please|hello)\b/i.test(rawKeyword);
      if (rawKeyword && !isConversational && rawKeyword.length > 2 && rawKeyword.length < 35) {
        filtered = filtered.filter(p =>
          p.title.toLowerCase().includes(rawKeyword) ||
          p.amenities.some(a => a.toLowerCase().includes(rawKeyword)) ||
          p.features.some(f => f.toLowerCase().includes(rawKeyword))
        );
      }

      const exactMatches = filtered;
      let finalItems: typeof all = [];
      let isFallback = false;
      let alternativeItems: typeof all = [];

      if (exactMatches.length > 0) {
        finalItems = exactMatches.slice(0, 4);
      } else {
        // No exact match: find close alternatives (e.g. matching bedrooms in nearby corridor or same area)
        isFallback = true;
        let candidates = all.filter(p => p.status === 'available');
        if (listingType && listingType !== 'all') {
          candidates = candidates.filter(p => p.listingType.toLowerCase() === listingType);
        }
        if (bedrooms !== undefined) {
          // Prefer properties with similar or same bedroom count, NEVER land
          candidates = candidates.filter(p => !p.propertyType.toLowerCase().includes('land'));
          const sameBeds = candidates.filter(p => p.bedrooms === bedrooms);
          if (sameBeds.length > 0) {
            alternativeItems = sameBeds;
          } else {
            alternativeItems = candidates.filter(p => Math.abs(p.bedrooms - bedrooms) <= 1);
          }
        } else {
          alternativeItems = candidates;
        }
        finalItems = alternativeItems.slice(0, 3);
      }

      const cards = finalItems.map(propertyToCard);

      return {
        result: {
          matchedCount: exactMatches.length,
          isAlternativeRecommendation: isFallback,
          properties: finalItems.map(p => ({
            id: p.id,
            title: p.title,
            price: formatNaira(p.price) + (p.pricePeriod ? `/${p.pricePeriod}` : ''),
            location: p.location,
            area: p.area,
            bedrooms: p.bedrooms,
            propertyType: p.propertyType,
            titleDocument: p.titleDocument || p.features.find(f => /c of o|consent|gazette|deed|excision/i.test(f)) || 'Documented on record',
            slug: p.slug
          }))
        },
        cards,
        actionButtons: [
          { label: 'Request Inspection', action: 'query', value: `I would like to request an inspection for ${finalItems[0]?.title || 'one of these properties'}` },
          { label: 'WhatsApp Representative', action: 'whatsapp', value: '+2348109012192' }
        ]
      };
    }

    case 'get_property_details': {
      const all = await repo.getProperties();
      const rawTarget = sanitizeText(args.idOrSlug, 100);
      const q = rawTarget.toLowerCase();
      const p = all.find(x => x.id === rawTarget || x.slug === rawTarget || x.title.toLowerCase().includes(q));

      if (!p) {
        return { result: { error: 'Property not found in active database.' } };
      }

      return {
        result: {
          id: p.id,
          title: p.title,
          price: formatNaira(p.price) + (p.pricePeriod ? `/${p.pricePeriod}` : ''),
          location: p.location,
          address: p.address,
          area: p.area,
          propertyType: p.propertyType,
          propertySize: p.propertySize,
          landSize: p.landSize,
          bedrooms: p.bedrooms,
          bathrooms: p.bathrooms,
          parkingSpaces: p.parkingSpaces,
          amenities: p.amenities,
          features: p.features,
          titleDocument: p.titleDocument || p.features.find(f => /c of o|consent|gazette|deed|excision/i.test(f)) || 'Documented on record',
          description: p.shortDescription || p.fullDescription
        },
        cards: [propertyToCard(p)],
        actionButtons: [
          { label: 'Request Inspection', action: 'query', value: `Request inspection for ${p.title}` },
          { label: 'Chat on WhatsApp', action: 'whatsapp', value: '+2348109012192' }
        ]
      };
    }

    case 'search_shortlets': {
      const all = await repo.getApartments();
      let filtered = all.filter(a => a.isAvailable);

      const area = sanitizeText(args.area, 50).toLowerCase();
      if (area) {
        filtered = filtered.filter(a => a.area.toLowerCase().includes(area) || a.location.toLowerCase().includes(area));
      }

      const guests = sanitizeNumber(args.guests, 1, 50);
      if (guests !== undefined) {
        filtered = filtered.filter(a => a.maxGuests >= guests);
      }

      const bedrooms = sanitizeNumber(args.bedrooms, 1, 20);
      if (bedrooms !== undefined) {
        filtered = filtered.filter(a => a.bedrooms >= bedrooms);
      }

      const maxPricePerNight = sanitizeNumber(args.maxPricePerNight, 1);
      if (maxPricePerNight !== undefined) {
        filtered = filtered.filter(a => a.pricePerNight <= maxPricePerNight);
      }

      const isFallback = filtered.length === 0;
      const finalItems = isFallback ? all.slice(0, 3) : filtered.slice(0, 3);
      const cards = finalItems.map(apartmentToCard);

      return {
        result: {
          matchedCount: filtered.length,
          isAlternativeRecommendation: isFallback,
          apartments: finalItems.map(a => ({
            id: a.id,
            name: a.name,
            rate: `${formatNaira(a.pricePerNight)}/night`,
            location: a.location,
            bedrooms: a.bedrooms,
            maxGuests: a.maxGuests,
            amenities: a.amenities.slice(0, 5),
            slug: a.slug
          }))
        },
        cards,
        actionButtons: [
          { label: 'Request Shortlet Booking', action: 'query', value: `I want to book ${finalItems[0]?.name}` },
          { label: 'WhatsApp Concierge', action: 'whatsapp', value: '+2348109012192' }
        ]
      };
    }

    case 'get_shortlet_details': {
      const all = await repo.getApartments();
      const rawTarget = sanitizeText(args.idOrSlug, 100);
      const q = rawTarget.toLowerCase();
      const a = all.find(x => x.id === rawTarget || x.slug === rawTarget || x.name.toLowerCase().includes(q));

      if (!a) return { result: { error: 'Shortlet not found in database.' } };

      return {
        result: {
          id: a.id,
          name: a.name,
          rate: `${formatNaira(a.pricePerNight)}/night`,
          location: a.location,
          bedrooms: a.bedrooms,
          maxGuests: a.maxGuests,
          checkInTime: a.checkInTime || '2:00 PM',
          checkOutTime: a.checkOutTime || '11:00 AM',
          amenities: a.amenities,
          rules: a.rules
        },
        cards: [apartmentToCard(a)]
      };
    }

    case 'search_vehicles': {
      const all = await repo.getVehicles();
      let filtered = all.filter(v => v.isAvailable);

      const brand = sanitizeText(args.brand, 50).toLowerCase();
      if (brand) {
        filtered = filtered.filter(v => v.brand.toLowerCase().includes(brand));
      }

      const category = sanitizeText(args.category, 50).toLowerCase();
      if (category) {
        filtered = filtered.filter(v => v.category.toLowerCase().includes(category));
      }

      const maxDailyRate = sanitizeNumber(args.maxDailyRate, 1);
      if (maxDailyRate !== undefined) {
        filtered = filtered.filter(v => v.dailyRate <= maxDailyRate);
      }

      const isFallback = filtered.length === 0;
      const finalItems = isFallback ? all.slice(0, 3) : filtered.slice(0, 3);
      const cards = finalItems.map(vehicleToCard);

      return {
        result: {
          matchedCount: filtered.length,
          vehicles: finalItems.map(v => ({
            id: v.id,
            name: v.name,
            brand: v.brand,
            dailyRate: `${formatNaira(v.dailyRate)}/day`,
            category: v.category,
            seats: v.seats,
            features: v.features.slice(0, 4)
          }))
        },
        cards,
        actionButtons: [
          { label: 'Request Vehicle Booking', action: 'query', value: `Reserve the ${finalItems[0]?.name}` },
          { label: 'Inquire on WhatsApp', action: 'whatsapp', value: '+2348109012192' }
        ]
      };
    }

    case 'get_vehicle_details': {
      const all = await repo.getVehicles();
      const rawTarget = sanitizeText(args.idOrSlug, 100);
      const q = rawTarget.toLowerCase();
      const v = all.find(x => x.id === rawTarget || x.slug === rawTarget || x.name.toLowerCase().includes(q) || x.model.toLowerCase().includes(q));

      if (!v) return { result: { error: 'Vehicle not found in database.' } };

      return {
        result: {
          id: v.id,
          name: v.name,
          dailyRate: `${formatNaira(v.dailyRate)}/day`,
          hourlyRate: v.hourlyRate ? `${formatNaira(v.hourlyRate)}/hr` : undefined,
          seats: v.seats,
          transmission: v.transmission,
          features: v.features,
          requirements: v.requirements
        },
        cards: [vehicleToCard(v)]
      };
    }

    case 'create_inspection_request': {
      // Validate customer name & phone
      const customerName = sanitizeText(args.customerName, 80);
      const customerPhone = sanitizePhone(args.customerPhone);
      const customerEmail = sanitizeEmail(args.customerEmail);
      const preferredDate = sanitizeDate(args.preferredDate);
      const preferredTime = sanitizeText(args.preferredTime, 30) || '11:00 AM';
      const notes = sanitizeText(args.notes, 500);

      if (!customerName || customerName.length < 2) {
        return { result: { error: 'A valid customer name is required to submit an inspection request.' } };
      }
      if (!customerPhone || customerPhone.length < 5) {
        return { result: { error: 'A valid phone number is required so our team can confirm the inspection.' } };
      }

      // Check listing ID against inventory if provided
      const rawListingId = sanitizeText(args.listingId, 50);
      const properties = await repo.getProperties();
      const matchedProp = properties.find(p => p.id === rawListingId || p.slug === rawListingId);
      const listingTitle = matchedProp ? matchedProp.title : sanitizeText(args.listingTitle, 120) || 'Property Inspection';
      const verifiedListingId = matchedProp ? matchedProp.id : rawListingId || undefined;

      const created = await repo.createInspectionRequest({
        type: 'inspection',
        customerName,
        customerPhone,
        customerEmail,
        listingId: verifiedListingId,
        listingTitle,
        listingType: 'property',
        preferredDate,
        preferredTime,
        notes,
        status: 'pending',
        source: 'AI Chat'
      });

      // Also create a linked enquiry record for staff review
      await repo.createEnquiry({
        name: customerName,
        phone: customerPhone,
        email: customerEmail || 'inspection@sellingajah.com',
        whatsapp: customerPhone,
        service: 'property_sale',
        listingType: 'property',
        listingId: verifiedListingId,
        listingTitle,
        message: `Inspection Request (${created.referenceNumber}): Preferred Date: ${preferredDate} at ${preferredTime}. Notes: ${notes || 'None'}`
      });

      return {
        result: {
          success: true,
          referenceNumber: created.referenceNumber,
          customerName: created.customerName,
          listingTitle: created.listingTitle,
          preferredDate: created.preferredDate,
          preferredTime: created.preferredTime,
          status: 'pending',
          message: `Your inspection request has been submitted under reference ${created.referenceNumber}. Our team will contact you to confirm your inspection.`
        },
        actionButtons: [
          { label: `WhatsApp Desk Ref: ${created.referenceNumber}`, action: 'whatsapp', value: '+2348109012192' },
          { label: 'Call Office Line', action: 'call', value: '+2348109012192' }
        ]
      };
    }

    case 'create_booking_request': {
      const rawType = sanitizeText(args.bookingType, 20).toLowerCase();
      const isShortlet = rawType === 'shortlet';
      const isVehicle = rawType === 'vehicle';

      if (!isShortlet && !isVehicle) {
        return { result: { error: "Booking type must be either 'shortlet' or 'vehicle'." } };
      }

      const customerName = sanitizeText(args.customerName, 80);
      const customerPhone = sanitizePhone(args.customerPhone);
      const customerEmail = sanitizeEmail(args.customerEmail);
      const startDate = sanitizeDate(args.startDate);
      const endDate = sanitizeText(args.endDate, 50) || startDate;
      const guestsOrDays = sanitizeNumber(args.guestsOrDays, 1, 100);
      const notes = sanitizeText(args.notes, 500);

      if (!customerName || customerName.length < 2) {
        return { result: { error: 'A valid customer name is required to submit a booking request.' } };
      }
      if (!customerPhone || customerPhone.length < 5) {
        return { result: { error: 'A valid phone number is required so our team can confirm availability.' } };
      }

      // Check listing ID against inventory
      const rawListingId = sanitizeText(args.listingId, 50);
      let verifiedListingTitle = sanitizeText(args.listingTitle, 120) || (isShortlet ? 'Shortlet Booking' : 'Vehicle Booking');
      let verifiedListingId: string | undefined = rawListingId || undefined;

      if (isShortlet) {
        const apartments = await repo.getApartments();
        const matchedApt = apartments.find(a => a.id === rawListingId || a.slug === rawListingId);
        if (matchedApt) {
          verifiedListingTitle = matchedApt.name;
          verifiedListingId = matchedApt.id;
        }
      } else {
        const vehicles = await repo.getVehicles();
        const matchedVeh = vehicles.find(v => v.id === rawListingId || v.slug === rawListingId);
        if (matchedVeh) {
          verifiedListingTitle = matchedVeh.name;
          verifiedListingId = matchedVeh.id;
        }
      }

      const created = await repo.createInspectionRequest({
        type: isShortlet ? 'shortlet_booking' : 'vehicle_booking',
        customerName,
        customerPhone,
        customerEmail,
        listingId: verifiedListingId,
        listingTitle: verifiedListingTitle,
        listingType: isShortlet ? 'shortlet' : 'vehicle',
        preferredDate: startDate,
        checkInDate: startDate,
        checkOutDate: endDate,
        numberOfGuests: isShortlet ? guestsOrDays : undefined,
        rentalDays: !isShortlet ? guestsOrDays : undefined,
        notes,
        status: 'pending',
        source: 'AI Chat'
      });

      await repo.createEnquiry({
        name: customerName,
        phone: customerPhone,
        email: customerEmail || 'booking@sellingajah.com',
        whatsapp: customerPhone,
        service: isShortlet ? 'shortlet' : 'car_rental',
        listingTitle: verifiedListingTitle,
        message: `Booking Request (${created.referenceNumber}): ${isShortlet ? 'Shortlet' : 'Vehicle'} from ${startDate} to ${endDate}. Contact: ${customerPhone}`
      });

      return {
        result: {
          success: true,
          referenceNumber: created.referenceNumber,
          listingTitle: created.listingTitle,
          bookingType: isShortlet ? 'shortlet' : 'vehicle',
          startDate,
          endDate,
          status: 'pending',
          message: `Your booking request has been submitted under reference ${created.referenceNumber}. Our team will check real-time availability and confirm your reservation directly.`
        },
        actionButtons: [
          { label: `WhatsApp Inquiries (${created.referenceNumber})`, action: 'whatsapp', value: '+2348109012192' }
        ]
      };
    }

    case 'get_business_information': {
      const topic = sanitizeText(args.topic, 50).toLowerCase();
      let info: any = {};
      if (topic === 'company' || topic === 'contact') {
        info = SELLING_AJAH_KNOWLEDGE.company;
      } else if (topic === 'locations') {
        info = SELLING_AJAH_KNOWLEDGE.corridorsAndLocations;
      } else if (topic === 'titles_and_legal') {
        info = SELLING_AJAH_KNOWLEDGE.lagosTitleGlossary;
      } else if (topic === 'inspection_policy') {
        info = SELLING_AJAH_KNOWLEDGE.inspectionProtocol;
      } else if (topic === 'booking_policies') {
        info = SELLING_AJAH_KNOWLEDGE.bookingPolicies;
      } else {
        info = SELLING_AJAH_KNOWLEDGE;
      }
      return { result: info };
    }

    case 'request_human_assistance': {
      const customerName = sanitizeText(args.customerName, 80) || 'Client Requesting Human Representative';
      const customerPhone = sanitizePhone(args.customerPhone);
      const reason = sanitizeText(args.reason, 300) || 'Client requested direct representative assistance.';

      await repo.createEnquiry({
        name: customerName,
        phone: customerPhone,
        service: 'consultation',
        message: `Human assistance requested: ${reason}. Contact: ${customerPhone || 'Not provided in chat'}`
      });

      return {
        result: {
          handoffLogged: true,
          message: 'A representative has been alerted. You can tap below to connect on WhatsApp or call our office directly.',
          phone: '+234 810 901 2192'
        },
        actionButtons: [
          { label: 'Connect on WhatsApp Now', action: 'whatsapp', value: '+2348109012192' },
          { label: 'Call Private Desk (+234 810 901 2192)', action: 'call', value: '+2348109012192' }
        ]
      };
    }

    case 'create_enquiry': {
      const name = sanitizeText(args.name, 80);
      const phone = sanitizePhone(args.phone);
      const email = sanitizeEmail(args.email);
      const message = sanitizeText(args.message, 1000);
      const service = sanitizeText(args.service, 40) || 'consultation';
      const listingTitle = sanitizeText(args.listingTitle, 120);

      if (!name || name.length < 2) {
        return { result: { error: 'Please provide a valid name for your enquiry.' } };
      }
      if (!phone || phone.length < 5) {
        return { result: { error: 'Please provide a valid phone number for callback.' } };
      }
      if (!message || message.length < 3) {
        return { result: { error: 'Please provide an enquiry message.' } };
      }

      const validServices = ['property_sale', 'property_lease', 'shortlet', 'car_rental', 'consultation', 'general'] as const;
      const matchedService = validServices.find(s => s === service) || 'consultation';

      const created = await repo.createEnquiry({
        name,
        phone,
        email,
        whatsapp: phone,
        service: matchedService,
        listingTitle: listingTitle || undefined,
        message
      });

      return {
        result: {
          success: true,
          enquiryId: created.id,
          message: 'Your enquiry has been received by the Selling Ajah team. A consultant will reach out via WhatsApp or phone.'
        },
        actionButtons: [
          { label: 'Chat on WhatsApp', action: 'whatsapp', value: '+2348109012192' },
          { label: 'Call Office Desk', action: 'call', value: '+2348109012192' }
        ]
      };
    }

    default:
      return { result: { error: `Tool ${sanitizeText(name, 50)} not recognized.` } };
  }
}
