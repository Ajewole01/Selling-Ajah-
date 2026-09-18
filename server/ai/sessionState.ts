import type { Property, ServicedApartment, LuxuryVehicle, ChatCard } from '../../src/types.js';

export interface ParsedCriteria {
  intent?: 'property_search' | 'shortlet_search' | 'vehicle_search' | 'inspection_flow' | 'booking_flow' | 'general' | 'handoff';
  bedrooms?: number;
  area?: string;
  budget?: number;
  maxPrice?: number;
  minPrice?: number;
  listingType?: 'sale' | 'rent';
  propertyType?: string;
  parkingSpaces?: number;
  guests?: number;
  rentalDays?: number;
  brand?: string;
  category?: string;
}

export interface ConversationSession {
  sessionId: string;
  channel: 'chat' | 'voice' | 'phone';
  intent: 'property_search' | 'shortlet_search' | 'vehicle_search' | 'inspection_flow' | 'booking_flow' | 'general' | 'handoff';
  
  // Accumulated Search Criteria
  criteria: {
    bedrooms?: number;
    area?: string;
    budget?: number;
    maxPrice?: number;
    minPrice?: number;
    listingType?: 'sale' | 'rent';
    propertyType?: string;
    parkingSpaces?: number;
    guests?: number;
    rentalDays?: number;
    brand?: string;
    category?: string;
  };

  // Last search results memory
  lastResultIds: string[];
  lastResultType?: 'property' | 'shortlet' | 'vehicle';
  lastResults?: Array<{ id: string; title: string; type: string; price: number; slug?: string }>;

  // Selected item for detail questions / inspection
  selectedListingId?: string;
  selectedListingTitle?: string;
  selectedListingType?: 'property' | 'shortlet' | 'vehicle';
  selectedListingSlug?: string;

  // Active Multi-Turn Inspection / Booking Flow
  flowState?: 'idle' | 'awaiting_date' | 'awaiting_time' | 'awaiting_contact' | 'confirming';
  flowType?: 'inspection' | 'shortlet_booking' | 'vehicle_booking';
  lastInspectionRef?: string;
  lastInspectionTitle?: string;
  draftBooking?: {
    listingId?: string;
    listingTitle?: string;
    listingType?: 'property' | 'shortlet' | 'vehicle';
    preferredDate?: string;
    preferredTime?: string;
    checkInDate?: string;
    checkOutDate?: string;
    guests?: number;
    rentalDays?: number;
    customerName?: string;
    customerPhone?: string;
    customerEmail?: string;
    notes?: string;
  };

  updatedAt: number;
}

// In-memory multi-turn session store
const sessions = new Map<string, ConversationSession>();

export function getOrCreateSession(sessionId: string, channel: 'chat' | 'voice' | 'phone' = 'chat'): ConversationSession {
  let session = sessions.get(sessionId);
  if (!session) {
    session = {
      sessionId,
      channel,
      intent: 'general',
      criteria: {},
      lastResultIds: [],
      updatedAt: Date.now()
    };
    sessions.set(sessionId, session);
  }
  session.updatedAt = Date.now();
  return session;
}

export function saveSession(session: ConversationSession): void {
  session.updatedAt = Date.now();
  sessions.set(session.sessionId, session);
}

// Clean up stale sessions older than 4 hours
const cleanupInterval = setInterval(() => {
  const cutoff = Date.now() - 4 * 3600 * 1000;
  for (const [id, s] of sessions.entries()) {
    if (s.updatedAt < cutoff) {
      sessions.delete(id);
    }
  }
}, 30 * 60 * 1000);
if (cleanupInterval.unref) {
  cleanupInterval.unref();
}

// ============================================================================
// STRICT PARSER: INDEPENDENT NUMERIC ATTRIBUTES AND MONEY PARSING
// ============================================================================

/**
 * Parses Nigerian Naira money / budget values STRICTLY.
 * Must NEVER match plain numbers (like bedrooms, parking spaces, sqm, guests, days).
 */
export function parseMoneyAmount(text: string): number | undefined {
  if (!text) return undefined;
  const lower = text.toLowerCase();

  // 1. Explicit Nigerian currency prefix/patterns:
  // e.g. "₦200 million", "₦200m", "₦200,000,000", "200 million naira", "200m naira"
  // e.g. "budget is 200 million", "budget around 200m", "under 150m", "below 100m", "up to 80 million"
  
  // Pattern A: Symbol or word "naira" or "ngn" with number and optional unit
  const nairaPattern = /(?:₦|naira|ngn)\s*(\d+(?:[.,]\d+)?)\s*(b|billion|m|million|k|thousand)?\b/i;
  const matchA = lower.match(nairaPattern);
  if (matchA) {
    const rawVal = parseFloat(matchA[1].replace(/,/g, ''));
    const unit = (matchA[2] || '').toLowerCase();
    if (unit.startsWith('b')) return rawVal * 1_000_000_000;
    if (unit.startsWith('m')) return rawVal * 1_000_000;
    if (unit.startsWith('k')) return rawVal * 1_000;
    // If no unit, but rawVal >= 100000, it is a full currency figure (e.g. ₦150000000)
    if (rawVal >= 50_000) return rawVal;
    // If someone writes ₦200 without unit in Nigerian real estate context, they usually mean ₦200M if > 20
    if (rawVal >= 20 && rawVal <= 1000) return rawVal * 1_000_000;
    return rawVal;
  }

  // Pattern B: Number followed immediately by 'million' or 'billion' or 'm' (e.g. "200 million", "200m", "150m budget")
  // Note: ensure 'm' is not part of another word (e.g. 'meters', 'minutes')
  const millionPattern = /\b(\d+(?:[.,]\d+)?)\s*(million|millions|billion|billions)\b/i;
  const matchB = lower.match(millionPattern);
  if (matchB) {
    const rawVal = parseFloat(matchB[1].replace(/,/g, ''));
    const unit = matchB[2].toLowerCase();
    if (unit.startsWith('b')) return rawVal * 1_000_000_000;
    return rawVal * 1_000_000;
  }

  // Pattern C: Number with 'm' suffix attached or followed by money context words:
  // e.g. "200m", "under 150m", "max 100m", "around 250m", "100m budget"
  // Must NOT match "600sqm", "500m2", "10am", "10pm"
  const mSuffixPattern = /(?:budget\s*(?:of|is|around|about)?|under|below|less than|max|up to|around|approx|price\s*(?:of|is)?)\s*(\d+(?:[.,]\d+)?)\s*m\b(?!\s*(?:sqm|meter|metre|wide|long))/i;
  const matchC = lower.match(mSuffixPattern);
  if (matchC) {
    const rawVal = parseFloat(matchC[1].replace(/,/g, ''));
    return rawVal * 1_000_000;
  }

  // Pattern D: standalone "200m" where 'm' is specifically denoting millions in budget context:
  const standaloneM = /\b(\d+(?:[.,]\d+)?)\s*m\b(?!\s*(?:sqm|meter|metre|wide|deep|road|radius|away))/i;
  // Only accept standalone "200m" if the sentence has financial context words OR the number is >= 10
  if (/\b(?:budget|cost|price|spend|afford|worth|under|up to|max|around|about|per annum|per year|yearly|annual|a year|annually)\b/i.test(lower)) {
    const matchD = lower.match(standaloneM);
    if (matchD) {
      const rawVal = parseFloat(matchD[1].replace(/,/g, ''));
      return rawVal * 1_000_000;
    }
  }

  // Pattern E: "budget of 200,000,000" or "under 200,000,000"
  const fullFigurePattern = /(?:budget\s*(?:of|is|around|about)?|under|below|less than|max|up to|around|approx|price\s*(?:of|is)?)\s*(\d{1,3}(?:,\d{3})+|\d{6,12})\b/i;
  const matchE = lower.match(fullFigurePattern);
  if (matchE) {
    const rawVal = parseFloat(matchE[1].replace(/,/g, ''));
    return rawVal;
  }

  return undefined;
}

/**
 * Extracts non-budget numeric attributes safely.
 * These are completely shielded from money parsing.
 */
export function extractAttributes(text: string) {
  const lower = text.toLowerCase();

  // 1. Bedrooms: "4-bedroom", "4 bedroom", "4 bed", "4bed", "4 rooms", "4 beds"
  const bedMatch = lower.match(/\b(\d+)\s*[-]?\s*(?:bed|bedroom|bedrooms|rooms|bhk)\b/i);
  const bedrooms = bedMatch ? parseInt(bedMatch[1], 10) : undefined;

  // 2. Parking spaces / cars: "parking for 2 cars", "2 cars", "2 parking spaces"
  const parkMatch = lower.match(/\b(?:parking\s*(?:for|space[s]?)?\s*)?(\d+)\s*(?:car|cars|parking\s*space[s]?|vehicles?)\b/i);
  const parkingSpaces = parkMatch ? parseInt(parkMatch[1], 10) : undefined;

  // 3. Guests: "5 guests", "for 5 people", "5 persons"
  const guestMatch = lower.match(/\b(\d+)\s*(?:guest|guests|people|persons)\b/i);
  const guests = guestMatch ? parseInt(guestMatch[1], 10) : undefined;

  // 4. Rental days / nights: "3 days", "3 nights", "for 7 days"
  const dayMatch = lower.match(/\b(\d+)\s*(?:day|days|night|nights)\b/i);
  const rentalDays = dayMatch ? parseInt(dayMatch[1], 10) : undefined;

  // 5. Land size / area: "600sqm", "600 sqm"
  const sqmMatch = lower.match(/\b(\d+)\s*(?:sqm|sq m|square\s*meters?)\b/i);
  const sqm = sqmMatch ? parseInt(sqmMatch[1], 10) : undefined;

  // 6. Bathrooms
  const bathMatch = lower.match(/\b(\d+)\s*[-]?\s*(?:bath|bathroom|baths|bathrooms)\b/i);
  const bathrooms = bathMatch ? parseInt(bathMatch[1], 10) : undefined;

  // 7. Area / Location matching
  const supportedAreas = [
    { name: 'Abraham Adesanya', aliases: ['abraham adesanya', 'adesanya'] },
    { name: 'Orchid Road', aliases: ['orchid road', 'orchid'] },
    { name: 'Chevron', aliases: ['chevron', 'chevron toll gate', 'chevron drive'] },
    { name: 'VGC', aliases: ['vgc', 'victoria garden city'] },
    { name: 'Ikota', aliases: ['ikota', 'ikota villa'] },
    { name: 'Sangotedo', aliases: ['sangotedo', 'novare mall'] },
    { name: 'Lekki Phase 1', aliases: ['lekki phase 1', 'lekki 1', 'phase 1'] },
    { name: 'Ajah', aliases: ['ajah', 'ajah jubilee', 'badore', 'awoyaya', 'ogombo'] },
    { name: 'Lekki', aliases: ['lekki'] }
  ];

  let area: string | undefined;
  for (const item of supportedAreas) {
    if (item.aliases.some(alias => lower.includes(alias))) {
      area = item.name;
      break;
    }
  }

  // 8. Property type detection (land, duplex, terrace, house, apartment)
  let propertyType: string | undefined;
  if (/\b(?:land|plot|plots)\b/i.test(lower)) propertyType = 'Land';
  else if (/\b(?:duplex|detached|semi-detached|semi detached)\b/i.test(lower)) propertyType = 'Duplex';
  else if (/\bterrace\b/i.test(lower)) propertyType = 'Terrace';
  else if (/\b(?:house|home)\b/i.test(lower)) propertyType = 'House';
  else if (/\b(?:flat|apartment)\b/i.test(lower)) propertyType = 'Apartment';

  // 9. Listing Type: sale vs rent strictly from user explicit words
  let listingType: 'sale' | 'rent' | undefined;
  if (/\b(?:rent|to rent|for rent|lease|per annum|yearly|annual rent)\b/i.test(lower) && !/\b(?:buy|purchase|for sale|sale)\b/i.test(lower)) {
    listingType = 'rent';
  } else if (/\b(?:buy|purchase|to buy|for sale|sale|outright)\b/i.test(lower)) {
    listingType = 'sale';
  }

  return {
    bedrooms,
    bathrooms,
    parkingSpaces,
    guests,
    rentalDays,
    sqm,
    area,
    propertyType,
    listingType
  };
}

/**
 * Resolves references to previously recommended listings:
 * - "the first one", "first property", "#1", "number one", "first" -> index 0
 * - "the second one", "second", "#2", "number two" -> index 1
 * - "the third one", "third", "#3", "number three" -> index 2
 * - "the property", "this property", "that property", "the house", "this house", "that house",
 *   "the land", "this land", "that land", "the apartment", "this apartment", "that apartment",
 *   "the car", "this car", "that car", "the vehicle", "this vehicle", "that vehicle",
 *   "the listing", "this listing", "that listing", "it", "this one", "that one"
 *   -> selectedListingId || index 0 (especially when single result)
 */
export function resolveListingReference(
  text: string,
  session: ConversationSession
): { resolvedId?: string; isReference: boolean } {
  const lower = text.toLowerCase().trim();
  const lastIds = session.lastResultIds || [];

  // Ordinal checks
  if (/\b(?:first|1st|number 1|number one|#1|option 1|top one)\b/i.test(lower)) {
    if (lastIds.length > 0) return { resolvedId: lastIds[0], isReference: true };
  }
  if (/\b(?:second|2nd|number 2|number two|#2|option 2|middle one)\b/i.test(lower)) {
    if (lastIds.length > 1) return { resolvedId: lastIds[1], isReference: true };
  }
  if (/\b(?:third|3rd|number 3|number three|#3|option 3|last one)\b/i.test(lower)) {
    if (lastIds.length > 2) return { resolvedId: lastIds[2], isReference: true };
  }

  // Pronoun / Entity reference checks:
  // "the property", "this property", "that property", "the house", "this house", "that house",
  // "the land", "this land", "that land", "the apartment", "this apartment", "that apartment",
  // "the car", "this car", "that car", "the vehicle", "this vehicle", "that vehicle",
  // "the listing", "this listing", "that listing", "it", "this one", "that one"
  const entityRefPattern = /\b(?:it|this one|that one|the property|this property|that property|the house|this house|that house|the land|this land|that land|the apartment|this apartment|that apartment|the shortlet|this shortlet|that shortlet|the car|this car|that car|the vehicle|this vehicle|that vehicle|the listing|this listing|that listing|the duplex|this duplex|that duplex)\b/i;
  
  if (entityRefPattern.test(lower)) {
    if (session.selectedListingId) {
      return { resolvedId: session.selectedListingId, isReference: true };
    }
    if (lastIds.length > 0) {
      return { resolvedId: lastIds[0], isReference: true };
    }
  }

  // When the immediately preceding result set contains ONE listing, or a listing is already selected,
  // references or detail questions unambiguously resolve to that listing.
  if (session.selectedListingId) {
    return { resolvedId: session.selectedListingId, isReference: true };
  }
  if (lastIds.length === 1) {
    return { resolvedId: lastIds[0], isReference: true };
  }

  return { isReference: false };
}

export type DetailFocus = 'all' | 'features' | 'location' | 'title' | 'size';

/**
 * Classifies user intent for the current turn with proper conversational routing:
 * - Acknowledgements / Gratitude / Closing (must NOT trigger inventory search)
 * - Detail queries (features, title, size, location, full details on selected or single listing)
 * - Inspection & booking flows
 * - Search refinement vs new search
 */
export function classifyTurnIntent(text: string, session: ConversationSession): {
  action: 'ACKNOWLEDGEMENT' | 'SELECT_AND_VIEW' | 'INSPECT' | 'BOOK' | 'REFINE_SEARCH' | 'NEW_SEARCH' | 'HANDOFF' | 'GENERAL';
  resolvedListingId?: string;
  detailFocus?: DetailFocus;
} {
  const lower = text.toLowerCase().trim();

  // 1. Human handoff
  if (/\b(?:human|agent|broker|speak with (?:a )?person|real person|manager|negotiat|call me now)\b/i.test(lower)) {
    return { action: 'HANDOFF' };
  }

  // 2. Normal Human Acknowledgements / Gratitude / Conversational closing (Bug 2)
  // "thanks", "thank you", "thanks a lot", "thanks alot", "great thanks", "okay thanks", "alright",
  // "perfect", "nice", "awesome", "got it", "okay", "that's all", "bye", "goodbye", "talk later"
  const isPureAck = /^(?:great|good|alright|ok|okay)?\s*(?:thanks|thank you|thanks a lot|thanks alot|alright|all right|perfect|nice|awesome|got it|okay|ok|cool|that's all|thats all|bye|goodbye|good bye|talk later|cheers)[\s!.]*$/i.test(lower);
  const hasAckKeyword = /\b(?:thanks|thank you|thanks a lot|thanks alot|great thanks|okay thanks|ok thanks|cheers)\b/i.test(lower);
  const isFarewell = /\b(?:bye|goodbye|good bye|talk later|see you|see ya)\b/i.test(lower);
  const hasSearchOrActionKeyword = /\b(?:looking|find|search|need|want|budget|million|naira|inspect|inspection|viewing|tour|book|reserve|tell me|features|details|house|property|land|duplex|apartment|car|vehicle|buy|rent)\b/i.test(lower);

  if (isPureAck || ((hasAckKeyword || isFarewell) && !hasSearchOrActionKeyword)) {
    return { action: 'ACKNOWLEDGEMENT' };
  }

  // 3. Inspection request ("Can I inspect it?", "I want to inspect", "Schedule a viewing", "Book inspection", "book an inspection for me on this property")
  if (/\b(?:inspect|inspection|viewing|schedule a tour|book a tour|site visit|can i visit|come see)\b/i.test(lower) ||
      (/\bbook\b/i.test(lower) && /\b(?:inspection|viewing|property|house|land|duplex)\b/i.test(lower) && !/\b(?:shortlet|apartment|vehicle|car)\b/i.test(lower))) {
    const { resolvedId } = resolveListingReference(text, session);
    return {
      action: 'INSPECT',
      resolvedListingId: resolvedId || session.selectedListingId || session.lastResultIds[0]
    };
  }

  // 4. Booking request for shortlet or vehicle ("Can I book it?", "I want to reserve")
  if (/\b(?:book|reserve|reservation|rent this|hire this)\b/i.test(lower) && !/\b(?:inspect|inspection)\b/i.test(lower)) {
    const { resolvedId } = resolveListingReference(text, session);
    return {
      action: 'BOOK',
      resolvedListingId: resolvedId || session.selectedListingId || session.lastResultIds[0]
    };
  }

  // 5. Detail request (Bug 1 & Bug 5)
  // "tell me more", "tell me more about it", "tell me more about the property", "good tell me more about the property"
  // "more details", "give me the details", "what does it have?", "what are the features?", "where exactly is it?",
  // "what title does it have?", "how big is it?", "what is the size?", etc.
  const isFeatureQuery = /\b(?:what does it have|what are the features|features of|what features|tell me the features|does it have)\b/i.test(lower);
  const isTitleQuery = /\b(?:what title|title document|what is the title|c of o|governor'?s consent|gazette|deed)\b/i.test(lower);
  const isLocationQuery = /\b(?:where exactly is it|where is it located|what is the address|where is it|exact location)\b/i.test(lower);
  const isSizeQuery = /\b(?:how big is it|what is the size|how many sqm|what size|land size|property size)\b/i.test(lower);
  const isGeneralDetailQuery = /\b(?:tell me more|more details|give me (?:the )?details|details on|tell me about|info on|show me details|full details|specification)\b/i.test(lower);
  const isOrdinalDetail = /\b(?:first one|second one|third one|#1|#2|#3|number 1|number 2|number 3)\b/i.test(lower);

  const isDetailIntent = isFeatureQuery || isTitleQuery || isLocationQuery || isSizeQuery || isGeneralDetailQuery || isOrdinalDetail;

  if (isDetailIntent) {
    const { resolvedId } = resolveListingReference(text, session);
    const targetId = resolvedId || session.selectedListingId || (session.lastResultIds.length === 1 ? session.lastResultIds[0] : (isOrdinalDetail ? resolvedId : undefined));
    if (targetId) {
      let detailFocus: DetailFocus = 'all';
      if (isFeatureQuery) detailFocus = 'features';
      else if (isTitleQuery) detailFocus = 'title';
      else if (isLocationQuery) detailFocus = 'location';
      else if (isSizeQuery) detailFocus = 'size';
      return {
        action: 'SELECT_AND_VIEW',
        resolvedListingId: targetId,
        detailFocus
      };
    }
  }

  // 6. Shortlet or vehicle search
  if (/\b(?:car|vehicle|fleet|suv|sedan|drive|driver)\b/i.test(lower) && !/\b(?:duplex|house|terrace|land|bedroom)\b/i.test(lower)) {
    return { action: 'NEW_SEARCH' };
  }
  if (/\b(?:shortlet|apartment|vacation home|stay|night)\b/i.test(lower) && !/\b(?:buy|sale|duplex)\b/i.test(lower)) {
    return { action: 'NEW_SEARCH' };
  }

  // 7. Refinement: User provides a budget or modifies existing search criteria
  const hasBudget = parseMoneyAmount(text) !== undefined;
  const attrs = extractAttributes(text);
  const hasAttribute = attrs.bedrooms !== undefined || attrs.area !== undefined || attrs.listingType !== undefined || attrs.propertyType !== undefined;

  // If user previously searched properties and now provides budget, it is a refinement!
  if ((hasBudget || hasAttribute) && session.lastResultIds.length > 0) {
    return { action: 'REFINE_SEARCH' };
  }

  // 8. If user provides a fresh search query with attributes
  if (hasAttribute || hasBudget || /\b(?:looking for|find me|show me|search|need|want|houses?|duplex|property|land)\b/i.test(lower)) {
    return { action: 'NEW_SEARCH' };
  }

  // General questions (office, titles, company)
  return { action: 'GENERAL' };
}
