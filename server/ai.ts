import { GoogleGenAI } from '@google/genai';
import { db } from './db.js';
import { ChatCard, Property, ServicedApartment, LuxuryVehicle } from '../src/types.js';

let aiClient: GoogleGenAI | null = null;

function getAiClient(): GoogleGenAI | null {
  if (!process.env.GEMINI_API_KEY) {
    return null;
  }
  if (!aiClient) {
    aiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

export interface AiChatInput {
  message: string;
  history?: Array<{ sender: 'user' | 'assistant'; text: string }>;
  userContactInfo?: { name?: string; phone?: string; email?: string };
}

export interface AiChatResponse {
  reply: string;
  cards?: ChatCard[];
  actionButtons?: { label: string; action: string; value?: string }[];
  leadCaptured?: boolean;
}

function formatNaira(num: number): string {
  return '₦' + num.toLocaleString('en-NG');
}

// Convert DB items to cards
function propToCard(p: Property): ChatCard {
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

function aptToCard(a: ServicedApartment): ChatCard {
  return {
    id: a.id,
    title: a.name,
    price: a.pricePerNight,
    formattedPrice: `${formatNaira(a.pricePerNight)}/night`,
    location: a.location,
    image: a.mainImage,
    type: 'apartment',
    slug: a.slug,
    details: `${a.bedrooms} Beds • Up to ${a.maxGuests} Guests • 24/7 Power`
  };
}

function vehToCard(v: LuxuryVehicle): ChatCard {
  return {
    id: v.id,
    title: v.name,
    price: v.dailyRate,
    formattedPrice: `${formatNaira(v.dailyRate)}/day`,
    location: 'Lagos & Lekki Axis (Chauffeur Included)',
    image: v.mainImage,
    type: 'vehicle',
    slug: v.slug,
    details: `${v.category} • ${v.seats} Seats • ${v.transmission}`
  };
}

// Extract budget from string (e.g. 150m, 150 million, 80k, 5,000,000, ₦120M)
function parseBudget(text: string): { maxPrice?: number; minPrice?: number } {
  const clean = text.toLowerCase();
  
  // Look for patterns like "below 150m", "under 150 million", "under ₦150M"
  const underMatch = clean.match(/(?:under|below|less than|max|up to|budget of)?\s*(?:₦|naira)?\s*(\d+(?:\.\d+)?)\s*(m|million|k|thousand|b|billion)?/i);
  if (underMatch) {
    const val = parseFloat(underMatch[1]);
    const unit = (underMatch[2] || '').toLowerCase();
    let multiplier = 1;
    if (unit.startsWith('m')) multiplier = 1_000_000;
    else if (unit.startsWith('b')) multiplier = 1_000_000_000;
    else if (unit.startsWith('k')) multiplier = 1_000;
    else if (val < 1000) multiplier = 1_000_000; // e.g. "under 150" in Lagos real estate context usually means 150M
    return { maxPrice: val * multiplier };
  }
  return {};
}

export async function processAiMessage(input: AiChatInput): Promise<AiChatResponse> {
  const userText = input.message.trim();
  const lower = userText.toLowerCase();
  const settings = db.getSettings();

  // 1. Check if user is submitting lead / contact info (e.g. "My name is John, 08012345678, john@gmail.com")
  const emailMatch = userText.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
  const phoneMatch = userText.match(/(?:\+?234|0)[789]\d{9}/);

  if (emailMatch || phoneMatch || input.userContactInfo) {
    const name = input.userContactInfo?.name || (userText.match(/(?:my name is|i am|this is)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/i)?.[1]) || 'Visitor via AI Assistant';
    const email = emailMatch ? emailMatch[0] : (input.userContactInfo?.email || 'chat-lead@sellingajah.com');
    const phone = phoneMatch ? phoneMatch[0] : (input.userContactInfo?.phone || '+234 800 000 0000');

    // Create enquiry in DB
    db.createEnquiry({
      name,
      email,
      phone,
      whatsapp: phone,
      service: 'consultation',
      listingType: 'custom_request',
      message: `Lead captured via AI Assistant during conversation. User inquiry: "${userText}"`,
      status: 'new'
    });

    return {
      reply: `Thank you, ${name}! Your details have been securely logged with our Senior Client Advisory Team. An executive advisor will reach out to you directly via WhatsApp and phone shortly. In the meantime, feel free to ask me anything else about properties, shortlets, or luxury rentals in Ajah!`,
      actionButtons: [
        { label: 'Chat on WhatsApp', action: 'whatsapp', value: settings.whatsapp || '+2348109012192' },
        { label: 'Browse Properties', action: 'navigate', value: '/properties' }
      ],
      leadCaptured: true
    };
  }

  // 2. Fetch live data context from DB
  const allProps = db.getProperties({ status: 'available' });
  const allApts = db.getApartments({ status: 'available' });
  const allVehs = db.getVehicles({ status: 'available' });

  // Check query intent (cars, shortlets, properties, services, general)
  const isCarQuery = /car|vehicle|rent|drive|mercedes|g63|g-wagon|range rover|lexus|rolls|lx600|suv/i.test(lower) && !/house|duplex|land|flat/i.test(lower);
  const isShortletQuery = /shortlet|apartment|stay|night|vacation|holiday|hotel|guest/i.test(lower) && !/buy|sale|land|duplex for sale/i.test(lower);
  const isServiceQuery = /service|what do you do|how does it work|sell my|consultation/i.test(lower);

  let matchedCards: ChatCard[] = [];

  if (isCarQuery) {
    let vehs = allVehs;
    if (lower.includes('g63') || lower.includes('mercedes') || lower.includes('amg') || lower.includes('g-wagon')) {
      vehs = vehs.filter(v => v.name.toLowerCase().includes('g63') || v.brand.toLowerCase().includes('mercedes'));
    } else if (lower.includes('range') || lower.includes('rover')) {
      vehs = vehs.filter(v => v.name.toLowerCase().includes('range rover'));
    } else if (lower.includes('lexus') || lower.includes('lx600')) {
      vehs = vehs.filter(v => v.name.toLowerCase().includes('lexus'));
    } else if (lower.includes('rolls') || lower.includes('ghost')) {
      vehs = vehs.filter(v => v.name.toLowerCase().includes('rolls-royce'));
    }
    matchedCards = (vehs.length > 0 ? vehs : allVehs.slice(0, 3)).map(vehToCard);
  } else if (isShortletQuery) {
    let apts = allApts;
    if (lower.includes('lekki')) {
      apts = apts.filter(a => a.location.toLowerCase().includes('lekki') || a.area.toLowerCase().includes('lekki'));
    } else if (lower.includes('ajah')) {
      apts = apts.filter(a => a.location.toLowerCase().includes('ajah') || a.area.toLowerCase().includes('ajah'));
    } else if (lower.includes('chevron')) {
      apts = apts.filter(a => a.location.toLowerCase().includes('chevron') || a.area.toLowerCase().includes('chevron'));
    }

    // Guests check
    const guestMatch = lower.match(/(\d+)\s*(?:people|guest|person|persons)/);
    if (guestMatch) {
      const g = parseInt(guestMatch[1], 10);
      const filtered = apts.filter(a => a.maxGuests >= g);
      if (filtered.length > 0) apts = filtered;
    }
    matchedCards = (apts.length > 0 ? apts : allApts.slice(0, 3)).map(aptToCard);
  } else {
    // Property Search
    let props = allProps;

    // Filter by listing type
    if (/rent|lease|per year|per annum/i.test(lower) && !/sale|buy/i.test(lower)) {
      props = props.filter(p => p.listingType === 'rent');
    } else if (/sale|buy|purchase/i.test(lower)) {
      props = props.filter(p => p.listingType === 'sale');
    }

    // Filter by area
    if (lower.includes('abraham adesanya')) {
      props = props.filter(p => p.area.toLowerCase().includes('abraham adesanya'));
    } else if (lower.includes('vgc') || lower.includes('victoria garden city')) {
      props = props.filter(p => p.area.toLowerCase().includes('vgc'));
    } else if (lower.includes('sangotedo')) {
      props = props.filter(p => p.area.toLowerCase().includes('sangotedo'));
    } else if (lower.includes('chevron')) {
      props = props.filter(p => p.area.toLowerCase().includes('chevron'));
    } else if (lower.includes('ikota')) {
      props = props.filter(p => p.area.toLowerCase().includes('ikota'));
    } else if (lower.includes('orchid')) {
      props = props.filter(p => p.area.toLowerCase().includes('orchid'));
    } else if (lower.includes('ajah')) {
      props = props.filter(p => p.location.toLowerCase().includes('ajah') || p.area.toLowerCase().includes('ajah'));
    }

    // Bedrooms
    const bedMatch = lower.match(/(\d+)\s*(?:bed|bedroom|bhk)/i);
    if (bedMatch) {
      const b = parseInt(bedMatch[1], 10);
      const withBeds = props.filter(p => p.bedrooms === b);
      if (withBeds.length > 0) {
        props = withBeds;
      }
    }

    // Budget
    const budget = parseBudget(userText);
    if (budget.maxPrice) {
      const withBudget = props.filter(p => p.price <= budget.maxPrice!);
      if (withBudget.length > 0) {
        props = withBudget;
      } else {
        // Fallback: Show closest alternatives
        props.sort((a, b) => Math.abs(a.price - budget.maxPrice!) - Math.abs(b.price - budget.maxPrice!));
      }
    }

    matchedCards = (props.length > 0 ? props.slice(0, 4) : allProps.slice(0, 3)).map(propToCard);
  }

  // 3. Now let's call Gemini API if available to format a natural, articulate, authoritative response!
  const genAI = getAiClient();

  if (genAI) {
    try {
      const systemInstruction = `You are the official Selling Ajah AI Property & Lifestyle Advisor.
Selling Ajah is a premier Nigerian real estate and luxury lifestyle company based in Ajah, Lekki, Lagos.
Key Facts:
- We offer: Verified Properties for Sale, Properties for Rent, Serviced Apartments / Shortlets (24/7 power, Starlink), Luxury Car Rentals (Mercedes G63 AMG, Range Rover Autobiography, Lexus LX600, Rolls-Royce Ghost with executive chauffeurs), and Real Estate Advisory / Legal Due Diligence.
- Locations served: Ajah, Lekki Phase 1, Sangotedo, Abraham Adesanya, Chevron, VGC, Ikota, Orchid Road, Lagos.
- Contact: Phone/WhatsApp ${settings.whatsapp}, Email ${settings.email}.
- Strictly adhere to verified listings in the database provided. NEVER hallucinate fake prices, non-existent listings, or false specifications.
- If an exact match is not found within budget, politely explain that you found close alternatives from the active database.
- Offer proactive help such as booking an in-person or live virtual inspection via WhatsApp.
- Keep tone professional, welcoming, knowledgeable, and elegant (warm Lagos luxury hospitality). Format with clean bullet points or short paragraphs where appropriate.`;

      const prompt = `User Query: "${userText}"
Matching Database Items Available:
${JSON.stringify(matchedCards, null, 2)}

Please write a warm, expert, concise response assisting the client. Highlight the matched listings if any, explaining their key merits, and suggest an inspection or WhatsApp consultation. Keep it under 150 words.`;

      const response = await genAI.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          systemInstruction,
          temperature: 0.7,
        }
      });

      const replyText = response.text || '';
      if (replyText.trim()) {
        return {
          reply: replyText.trim(),
          cards: matchedCards,
          actionButtons: [
            { label: 'WhatsApp an Agent', action: 'whatsapp', value: settings.whatsapp },
            { label: 'Schedule Inspection', action: 'inspection', value: matchedCards[0]?.id },
            { label: 'Speak with Advisor', action: 'lead_form' }
          ]
        };
      }
    } catch (err) {
      console.warn('Gemini API call warning in server/ai.ts, utilizing local luxury assistant engine:', err);
    }
  }

  // Deterministic high-quality fallback if Gemini key is not configured or in offline mode
  let fallbackReply = '';
  if (isCarQuery) {
    fallbackReply = `Here are our flagship luxury vehicles available for executive hire in Ajah and Lekki. All rentals include our certified protocol chauffeurs, comprehensive insurance, and 24/7 client dispatch. Would you like to check availability for specific dates?`;
  } else if (isShortletQuery) {
    fallbackReply = `Here are our verified luxury serviced apartments and penthouses. Each property features guaranteed 24/7 electricity, high-speed Starlink WiFi, daily housekeeping, and premium security. Would you like me to reserve one for your stay?`;
  } else if (isServiceQuery) {
    fallbackReply = `Selling Ajah is your premier gateway to the Lekki-Ajah real estate corridor. We provide:
1. Verified Properties for Sale (Governor's Consent & C of O)
2. Long-term Residential & Commercial Leases
3. Serviced Waterfront Penthouses & Shortlets
4. Chauffeur-driven Luxury Vehicles (G63 AMG, Range Rover)
5. Title Verification & Property Investment Consultation.`;
  } else if (matchedCards.length > 0) {
    fallbackReply = `I found these verified listings matching your preferences in Ajah and Lekki. Each property has been inspected and verified by our advisory team. You can click on any card to view the full gallery, or connect with us on WhatsApp for a live video walkthrough.`;
  } else {
    fallbackReply = `I'd love to help you find the perfect property or lifestyle service in Ajah, Lekki, or Lagos. Let me know your preferred location (e.g., Ajah, Abraham Adesanya, VGC, Chevron), budget, or number of bedrooms!`;
  }

  return {
    reply: fallbackReply,
    cards: matchedCards,
    actionButtons: [
      { label: 'Chat on WhatsApp', action: 'whatsapp', value: settings.whatsapp },
      { label: 'Talk to an Agent', action: 'call', value: settings.phone },
      { label: 'Send Enquiry', action: 'lead_form' }
    ]
  };
}
