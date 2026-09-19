/**
 * Selling Ajah AI Intent Router
 *
 * Provides deterministic and robust classification across 28+ conversation intents.
 * Strictly separates:
 * 1. Conversational & Social queries (Greeting, Casual, Ack, Closing) -> NEVER triggers inventory
 * 2. Business Knowledge queries (Company, Founder, Services, Contact, Socials) -> Grounded in businessKnowledge.ts, NO inventory
 * 3. Real Estate Education (Titles, Due Diligence, Typologies, Market Assessment) -> Grounded in realEstateKnowledge.ts, NO inventory
 * 4. Human Handoff (WhatsApp, Call, Senior Partner) -> Handoff flow, NO inventory
 * 5. Inventory Operations (Property Search, Shortlet Search, Vehicle Search, Inspection, Booking) -> ONLY these trigger database search tools!
 * 6. Off-Topic queries -> Graceful redirection, NEVER triggers inventory
 */

import { getVerifiedBusinessProfile } from './businessKnowledge.js';
import { REAL_ESTATE_TOPICS } from './realEstateKnowledge.js';

export type ConciergeIntentType =
  | 'GREETING'
  | 'CASUAL'
  | 'ACKNOWLEDGEMENT'
  | 'CLOSING'
  | 'COMPANY_INFO'
  | 'FOUNDER_CEO_INFO'
  | 'CONTACT_INFO'
  | 'SOCIAL_MEDIA_INFO'
  | 'SERVICES_INFO'
  | 'LOCATION_REAL_ESTATE'
  | 'GENERAL_REAL_ESTATE_TITLE'
  | 'BUYING_GUIDANCE_DUE_DILIGENCE'
  | 'PROPERTY_TYPOLOGY'
  | 'INVESTMENT_EDUCATION'
  | 'RENTING_GUIDANCE'
  | 'MORTGAGE_FINANCING'
  | 'HUMAN_HANDOFF'
  | 'PROPERTY_INSPECTION'
  | 'SHORTLET_BOOKING'
  | 'VEHICLE_BOOKING'
  | 'PROPERTY_SEARCH'
  | 'PROPERTY_DETAIL'
  | 'PROPERTY_COMPARISON'
  | 'SHORTLET_SEARCH'
  | 'SHORTLET_DETAIL'
  | 'VEHICLE_SEARCH'
  | 'VEHICLE_DETAIL'
  | 'OFF_TOPIC';

export interface IntentClassificationResult {
  intent: ConciergeIntentType;
  confidence: number;
  requiresInventorySearch: boolean;
  directAnswer?: string;
  directActionButtons?: Array<{ label: string; action: string; value: string }>;
  suggestedCards?: any[];
}

/**
 * Deterministic intent classifier
 */
export function routeConciergeIntent(
  userText: string,
  context: {
    lastIntent?: string;
    hasActiveInspection?: boolean;
    hasSelectedListing?: boolean;
    selectedListingTitle?: string;
  }
): IntentClassificationResult {
  const text = (userText || '').trim();
  const lower = text.toLowerCase();

  // Helper for whole-phrase matching or exact word
  const matchExactOrStartsWith = (patterns: string[]) => {
    return patterns.some(p => lower === p || lower.startsWith(p + ' ') || lower.endsWith(' ' + p));
  };

  const containsAny = (keywords: string[]) => {
    return keywords.some(k => lower.includes(k));
  };

  if (/\b(?:car|cars|vehicle|vehicles|chauffeur|chauffeured|self-drive|car rental|vehicle rental)\b/i.test(lower)) {
    return {
      intent: 'SERVICES_INFO',
      confidence: 0.99,
      requiresInventorySearch: false,
      directAnswer: 'Selling Ajah currently focuses on property sales, residential rentals and serviced shortlets.',
      directActionButtons: [
        { label: 'Browse Properties', action: 'query', value: 'Show verified properties for sale in Ajah' },
        { label: 'Serviced Shortlets', action: 'query', value: 'Show serviced shortlets in Ajah' }
      ]
    };
  }

  // 1. GREETINGS (Strict: NEVER trigger inventory)
  const greetingPhrases = [
    'hi', 'hello', 'hey', 'good morning', 'good afternoon', 'good evening',
    'good day', 'greetings', 'howdy', 'yo', 'salut', 'sup', 'morning', 'afternoon', 'evening'
  ];
  if (greetingPhrases.includes(lower) || matchExactOrStartsWith(['hello', 'hi there', 'good morning', 'good afternoon', 'good evening', 'hey there'])) {
    return {
      intent: 'GREETING',
      confidence: 0.98,
      requiresInventorySearch: false,
      directAnswer: "Hello! Welcome to Selling Ajah. I am your private advisor for verified properties, serviced shortlets, and real estate guidance across the Ajah corridor.\n\nHow may I assist you today? You can search properties, ask about verified land titles, book an inspection, or learn about our services.",
      directActionButtons: [
        { label: 'View Available Properties', action: 'query', value: 'Show me verified properties for sale in Ajah' },
        { label: 'Serviced Shortlets', action: 'query', value: 'Show me serviced shortlets in Ajah' }
      ]
    };
  }

  // 2. CASUAL / SMALL TALK (Strict: NEVER trigger inventory)
  if (
    lower === 'how are you' || lower === 'how are you?' ||
    lower === "how're you" || lower === 'how do you do' ||
    lower === "what's up" || lower === 'what is up' ||
    lower === 'who are you' || lower === 'who are you?' ||
    lower === 'what are you' || lower === 'are you an ai' ||
    lower === 'are you human'
  ) {
    return {
      intent: 'CASUAL',
      confidence: 0.95,
      requiresInventorySearch: false,
      directAnswer: "I am doing excellently, thank you for asking! I am the Selling Ajah AI Concierge, dedicated to helping you discover verified properties and serviced shortlet apartments across the Ajah corridor.\n\nWhat would you like to explore today?"
    };
  }

  // 3. ACKNOWLEDGEMENT (Strict: NEVER trigger inventory)
  const ackPhrases = [
    'thanks', 'thank you', 'thank you so much', 'thanks a lot', 'thanks alot',
    'great thanks', 'okay thanks', 'ok thanks', 'alright thanks', 'noted',
    'understood', 'ok', 'okay', 'alright', 'cool', 'perfect', 'awesome'
  ];
  if (ackPhrases.includes(lower) || lower === 'thank you!' || lower === 'thanks!') {
    return {
      intent: 'ACKNOWLEDGEMENT',
      confidence: 0.95,
      requiresInventorySearch: false,
      directAnswer: "You're very welcome! If there is anything else you need—whether scheduling an on-site property inspection, checking title documentation, or arranging luxury rentals—please let me know."
    };
  }

  // 4. CLOSING (Strict: NEVER trigger inventory)
  const closingPhrases = ['bye', 'goodbye', 'see you', 'have a nice day', 'talk to you later', 'good night'];
  if (closingPhrases.includes(lower) || matchExactOrStartsWith(['goodbye', 'bye bye', 'have a good day'])) {
    return {
      intent: 'CLOSING',
      confidence: 0.95,
      requiresInventorySearch: false,
      directAnswer: "Thank you for visiting Selling Ajah. Have a wonderful day, and feel free to return whenever you are ready to explore properties or arrange viewings along the Lekki-Ajah corridor!"
    };
  }

  // 5. HUMAN HANDOFF
  if (
    containsAny([
      'talk to a human', 'speak to a human', 'talk to human', 'speak with an agent',
      'talk to an agent', 'speak to a representative', 'human agent', 'live person',
      'real person', 'call me', 'give me your number to call', 'speak with someone'
    ])
  ) {
    const profile = getVerifiedBusinessProfile();
    return {
      intent: 'HUMAN_HANDOFF',
      confidence: 0.98,
      requiresInventorySearch: false,
      directAnswer: `Certainly! Our Senior Advisory Team is available to speak with you directly.\n\n* **Direct Phone:** [${profile.contact.phone}](tel:${profile.contact.phone.replace(/\s+/g, '')})\n* **WhatsApp Concierge:** [${profile.contact.whatsapp}](https://wa.me/${profile.contact.whatsapp.replace(/[^0-9]/g, '')})\n* **Office:** ${profile.office.address}\n* **Hours:** ${profile.office.hours}\n\nYou can also click the WhatsApp button below for immediate direct messaging.`,
      directActionButtons: [
        { label: 'Chat on WhatsApp', action: 'whatsapp', value: profile.contact.whatsapp }
      ]
    };
  }

  // 6. FOUNDER / CEO INFO
  if (
    containsAny([
      'who is the ceo', 'who is the founder', 'who founded', 'who owns selling ajah',
      'chisom chiejina', 'chisom', 'about the founder', 'about the ceo', 'tell me about chisom',
      'who is dr amb chisom chiejina', 'who is chisom'
    ])
  ) {
    const profile = getVerifiedBusinessProfile();
    const ceo = profile.ceoAndFounder;
    return {
      intent: 'FOUNDER_CEO_INFO',
      confidence: 0.96,
      requiresInventorySearch: false,
      directAnswer: `**${ceo.fullName}** is the Founder & CEO of **DOLYN Global Investments Ltd** and Selling Ajah.\n\n* **Background:** ${ceo.backgroundSummary}\n* **Motto:** "${ceo.quote}"\n* **Community Impact:** ${ceo.communityInvolvement}\n* **Accreditations:** ${ceo.credentials.join(' • ')}\n\nSelling Ajah focuses on property sales, residential rentals and serviced shortlets in the Ajah corridor.`,
      directActionButtons: [
        { label: 'Explore DOLYN Brands', action: 'query', value: 'Tell me about the DOLYN family of brands' },
        { label: 'Our Services', action: 'query', value: 'What services does Selling Ajah offer?' }
      ]
    };
  }

  // 7. COMPANY INFO & DOLYN BRANDS
  if (
    containsAny([
      'tell me about selling ajah', 'what is selling ajah', 'what does selling ajah do',
      'about selling ajah', 'about the company', 'who is selling ajah', 'dolyn brands',
      'dolyn global', 'dolyn family', 'parent company'
    ])
  ) {
    const profile = getVerifiedBusinessProfile();
    const brandsList = profile.dolynFamilyBrands
      .map(b => `* **${b.name}** (${b.handle}): ${b.description}`)
      .join('\n');

    return {
      intent: 'COMPANY_INFO',
      confidence: 0.95,
      requiresInventorySearch: false,
      directAnswer: `**Selling Ajah** (${profile.rcNumber}) is the premier real estate and lifestyle concierge portal dedicated to the Ajah and Lekki corridor, operating under **${profile.parentCompany}**.\n\nFounded by **${profile.ceoAndFounder.fullName}**, the DOLYN family comprises six specialized divisions:\n\n${brandsList}\n\nOur office is located at **${profile.office.address}** (${profile.office.landmark}). We ensure every property transaction is backed by verified title documentation.`,
      directActionButtons: [
        { label: 'Verified Properties', action: 'query', value: 'Show verified properties for sale in Ajah' },
        { label: 'Contact Us', action: 'query', value: 'How do I contact Selling Ajah?' }
      ]
    };
  }

  // 8. CONTACT INFO & OFFICE LOCATION
  if (
    containsAny([
      'contact you', 'contact info', 'phone number', 'email address', 'office address',
      'where is your office', 'how to reach you', 'how can i reach you', 'where are you located',
      'opening hours', 'business hours', 'address of selling ajah'
    ])
  ) {
    const profile = getVerifiedBusinessProfile();
    return {
      intent: 'CONTACT_INFO',
      confidence: 0.95,
      requiresInventorySearch: false,
      directAnswer: `You can reach Selling Ajah directly through any of our official channels:\n\n* **Office Address:** ${profile.office.address}\n* **Landmark:** ${profile.office.landmark}\n* **Business Hours:** ${profile.office.hours}\n* **Phone:** [${profile.contact.phone}](tel:${profile.contact.phone.replace(/\s+/g, '')})\n* **WhatsApp:** [${profile.contact.whatsapp}](https://wa.me/${profile.contact.whatsapp.replace(/[^0-9]/g, '')})\n* **Email:** [${profile.contact.email}](mailto:${profile.contact.email})`,
      directActionButtons: [
        { label: 'WhatsApp Concierge', action: 'whatsapp', value: profile.contact.whatsapp },
        { label: 'Call Office', action: 'call', value: profile.contact.phone }
      ]
    };
  }

  // 9. SOCIAL MEDIA INFO
  if (
    containsAny([
      'social media', 'instagram', 'facebook', 'twitter', 'tiktok', 'youtube', 'linkedin',
      'handle', 'social accounts', 'follow you'
    ])
  ) {
    const profile = getVerifiedBusinessProfile();
    const isAskingAboutTikTok = containsAny(['tiktok', 'tik tok']);

    if (isAskingAboutTikTok) {
      return {
        intent: 'SOCIAL_MEDIA_INFO',
        confidence: 0.95,
        requiresInventorySearch: false,
        directAnswer: `I do not currently have a verified TikTok account for Selling Ajah in our official business directory.\n\nYou can follow us on our primary verified platforms:\n\n* **Instagram:** [${profile.verifiedSocials.instagram.handle}](${profile.verifiedSocials.instagram.url})\n* **Facebook:** [Selling Ajah](${profile.verifiedSocials.facebook?.url})\n* **Twitter/X:** [${profile.verifiedSocials.twitter?.handle}](${profile.verifiedSocials.twitter?.url})\n* **WhatsApp Concierge:** ${profile.contact.whatsapp}`,
        directActionButtons: [
          { label: 'Visit Instagram', action: 'external_link', value: profile.verifiedSocials.instagram.url }
        ]
      };
    }

    return {
      intent: 'SOCIAL_MEDIA_INFO',
      confidence: 0.95,
      requiresInventorySearch: false,
      directAnswer: `Connect with Selling Ajah across our official verified social channels:\n\n* **Instagram:** [${profile.verifiedSocials.instagram.handle}](${profile.verifiedSocials.instagram.url})\n* **Facebook:** [Selling Ajah](${profile.verifiedSocials.facebook?.url})\n* **Twitter/X:** [${profile.verifiedSocials.twitter?.handle}](${profile.verifiedSocials.twitter?.url})\n* **LinkedIn:** [Selling Ajah](${profile.verifiedSocials.linkedin?.url})\n* **YouTube:** [Selling Ajah](${profile.verifiedSocials.youtube?.url})`,
      directActionButtons: [
        { label: 'Visit Instagram', action: 'external_link', value: profile.verifiedSocials.instagram.url }
      ]
    };
  }

  // 10. SERVICES INFO
  if (
    containsAny([
      'what services', 'services do you offer', 'what do you do', 'do you sell houses',
      'do you do rentals', 'do you have shortlets', 'do you rent cars'
    ])
  ) {
    const profile = getVerifiedBusinessProfile();
    const servicesList = profile.services
      .map(s => `* **${s.title}:** ${s.description}`)
      .join('\n');

    return {
      intent: 'SERVICES_INFO',
      confidence: 0.95,
      requiresInventorySearch: false,
      directAnswer: `Selling Ajah provides end-to-end luxury real estate and lifestyle advisory services across the Ajah and Lekki corridor:\n\n${servicesList}\n\nAll property transactions are accompanied by verified title searches and full inspection support.`,
      directActionButtons: [
        { label: 'Browse Properties', action: 'query', value: 'Show verified properties for sale in Ajah' },
        { label: 'Serviced Shortlets', action: 'query', value: 'Show serviced shortlets' }
      ]
    };
  }

  // 11. GENERAL REAL ESTATE TITLES (C of O, Governor's Consent, Deed of Assignment, Survey)
  if (
    containsAny([
      'c of o', 'certificate of occupancy', "governor's consent", 'governors consent', 'governor consent',
      'deed of assignment', 'survey plan', 'excision', 'gazette', 'land title', 'difference between c of o and governor'
    ])
  ) {
    const isCofO = containsAny(['c of o', 'certificate of occupancy']);
    const isConsent = containsAny(["governor's consent", 'governors consent', 'governor consent']);
    const isDeed = containsAny(['deed of assignment']);
    const isSurvey = containsAny(['survey plan']);
    const isExcision = containsAny(['excision', 'gazette']);

    if (isCofO && isConsent) {
      return {
        intent: 'GENERAL_REAL_ESTATE_TITLE',
        confidence: 0.96,
        requiresInventorySearch: false,
        directAnswer: `**Difference between C of O and Governor's Consent in Lagos:**\n\n* **Certificate of Occupancy (C of O):** This is the **first formal title** issued by the Lagos State Government on virgin land, granting a 99-year leasehold ownership to the original applicant under the Land Use Act 1978. Only one C of O is ever issued for any specific parcel of land.\n\n* **Governor's Consent:** When the owner of a property with a C of O subsequent sells or transfers it to a new buyer, the law (Section 22 of the Land Use Act) requires the Lagos State Governor's formal consent to legalise the transfer. The Governor signs and stamps the new Deed of Assignment, creating **Governor's Consent**.\n\nBoth are considered the highest and safest legal titles for property ownership in Lagos, acceptable as bank mortgage collateral.`,
        directActionButtons: [
          { label: 'Due Diligence Checklist', action: 'query', value: 'What due diligence should I do before buying land in Lagos?' },
          { label: 'Properties with Governor\'s Consent', action: 'query', value: 'Show properties with Governor\'s Consent title' }
        ]
      };
    }

    if (isCofO) {
      const topic = REAL_ESTATE_TOPICS.c_of_o;
      return {
        intent: 'GENERAL_REAL_ESTATE_TITLE',
        confidence: 0.95,
        requiresInventorySearch: false,
        directAnswer: `**${topic.title}:**\n\n${topic.summary}\n\n**Key Facts:**\n${topic.keyPoints.map(p => `* ${p}`).join('\n')}\n\n*Note: ${topic.caveats}*`
      };
    }

    if (isConsent) {
      const topic = REAL_ESTATE_TOPICS.governors_consent;
      return {
        intent: 'GENERAL_REAL_ESTATE_TITLE',
        confidence: 0.95,
        requiresInventorySearch: false,
        directAnswer: `**${topic.title}:**\n\n${topic.summary}\n\n**Key Facts:**\n${topic.keyPoints.map(p => `* ${p}`).join('\n')}\n\n*Note: ${topic.caveats}*`
      };
    }

    if (isDeed) {
      const topic = REAL_ESTATE_TOPICS.deed_of_assignment;
      return {
        intent: 'GENERAL_REAL_ESTATE_TITLE',
        confidence: 0.95,
        requiresInventorySearch: false,
        directAnswer: `**${topic.title}:**\n\n${topic.summary}\n\n**Key Facts:**\n${topic.keyPoints.map(p => `* ${p}`).join('\n')}`
      };
    }

    if (isSurvey) {
      const topic = REAL_ESTATE_TOPICS.survey_plan;
      return {
        intent: 'GENERAL_REAL_ESTATE_TITLE',
        confidence: 0.95,
        requiresInventorySearch: false,
        directAnswer: `**${topic.title}:**\n\n${topic.summary}\n\n**Key Facts:**\n${topic.keyPoints.map(p => `* ${p}`).join('\n')}`
      };
    }

    if (isExcision) {
      const topic = REAL_ESTATE_TOPICS.excision_and_gazette;
      return {
        intent: 'GENERAL_REAL_ESTATE_TITLE',
        confidence: 0.95,
        requiresInventorySearch: false,
        directAnswer: `**${topic.title}:**\n\n${topic.summary}\n\n**Key Facts:**\n${topic.keyPoints.map(p => `* ${p}`).join('\n')}`
      };
    }
  }

  // 12. DUE DILIGENCE / BUYING GUIDANCE
  if (
    containsAny([
      'due diligence', 'what should i check before buying', 'how to buy land in lagos',
      'steps to buy property', 'avoid land scam', 'omo onile', 'charting survey',
      'verification before buying'
    ])
  ) {
    const topic = REAL_ESTATE_TOPICS.due_diligence_checklist;
    return {
      intent: 'BUYING_GUIDANCE_DUE_DILIGENCE',
      confidence: 0.96,
      requiresInventorySearch: false,
      directAnswer: `**${topic.title}:**\n\n${topic.summary}\n\n${topic.keyPoints.map(p => `* **${p.split(':')[0]}:** ${p.split(':').slice(1).join(':').trim()}`).join('\n')}\n\nAt Selling Ajah, our legal team verifies land coordinates and title searches before listing any property.`,
      directActionButtons: [
        { label: 'Speak to Legal Advisor', action: 'whatsapp', value: '+2348109012192' },
        { label: 'View Verified Properties', action: 'query', value: 'Show verified properties with clean title' }
      ]
    };
  }

  // 13. PROPERTY TYPOLOGY (Detached vs Semi-Detached vs Terrace)
  if (
    containsAny([
      'detached vs semi', 'semi detached vs terrace', 'difference between detached',
      'what is a terrace', 'what is a semi detached', 'duplex types', 'property types'
    ])
  ) {
    const topic = REAL_ESTATE_TOPICS.property_typologies;
    return {
      intent: 'PROPERTY_TYPOLOGY',
      confidence: 0.95,
      requiresInventorySearch: false,
      directAnswer: `**${topic.title}:**\n\n${topic.summary}\n\n${topic.keyPoints.map(p => `* **${p.split(':')[0]}:** ${p.split(':').slice(1).join(':').trim()}`).join('\n')}`,
      directActionButtons: [
        { label: 'Fully Detached Duplexes', action: 'query', value: 'Show fully detached duplexes for sale' },
        { label: 'Terrace Duplexes', action: 'query', value: 'Show terrace duplexes for sale' }
      ]
    };
  }

  // 14. INVESTMENT EDUCATION / AJAH MARKET ASSESSMENT
  if (
    containsAny([
      'is ajah good for investment', 'is ajah a good place to invest', 'rental yield in ajah',
      'return on investment in ajah', 'real estate investment in ajah', 'capital appreciation in ajah'
    ])
  ) {
    const topic = REAL_ESTATE_TOPICS.ajah_market_assessment;
    return {
      intent: 'INVESTMENT_EDUCATION',
      confidence: 0.95,
      requiresInventorySearch: false,
      directAnswer: `**${topic.title}:**\n\n${topic.summary}\n\n**Market Highlights:**\n${topic.keyPoints.map(p => `* ${p}`).join('\n')}\n\n*Important:* ${topic.caveats}`,
      directActionButtons: [
        { label: 'High Yield Investment Deals', action: 'query', value: 'Show properties with high rental potential in Ajah' },
        { label: 'Speak with Investment Advisor', action: 'whatsapp', value: '+2348109012192' }
      ]
    };
  }

  // 15. TENANCY & RENTING GUIDANCE
  if (
    containsAny([
      'tenant fees', 'agency fee', 'legal fee', 'caution fee', 'service charge',
      'how much are agency fees in lagos', 'renting in lagos'
    ])
  ) {
    return {
      intent: 'RENTING_GUIDANCE',
      confidence: 0.95,
      requiresInventorySearch: false,
      directAnswer: `**Standard Renting Costs & Breakdown in Lagos State:**\n\n* **Basic Rent:** Payable annually in advance for most residential properties.\n* **Agency Fee:** Standard practice in Lagos is typically 10% of the annual rent.\n* **Legal / Agreement Fee:** Typically 10% of the annual rent covering tenancy contract drafting and execution.\n* **Caution / Security Deposit:** Usually 5% to 10% of annual rent (refundable upon vacating if premises remain undamaged).\n* **Service Charge:** For serviced estates or apartments, covering 24/7 security, central generator/power, waste disposal, and compound maintenance.\n\n*Tip:* Always request a clear service charge breakdown before signing a residential tenancy agreement.`
    };
  }

  // 15b. MORTGAGES & FINANCING
  if (
    containsAny([
      'mortgage', 'home loan', 'nhf', 'financing', 'bank loan for property', 'can i get a mortgage'
    ])
  ) {
    return {
      intent: 'MORTGAGE_FINANCING',
      confidence: 0.95,
      requiresInventorySearch: false,
      directAnswer: `**Property Mortgages & Financing in Lagos:**\n\n* **Commercial Bank Mortgages:** Primary mortgage institutions and commercial banks in Nigeria offer residential mortgages typically with equity contributions of 20% to 30%, tenures of 5 to 20 years, and interest rates varying between 18% to 26% depending on prevailing CBN monetary policy.\n* **National Housing Fund (NHF):** Administered by the Federal Mortgage Bank of Nigeria (FMBN), providing loans up to ₦15 Million at concessionary rates (approx. 6%) for eligible registered contributors.\n* **Developer Milestone Installment Plans:** Most off-plan and newly developed duplexes along the Ajah-Lekki corridor offer milestone payment plans (e.g. 30% initial deposit with balance spread over 6 to 18 months during construction).\n* **Collateral Requirement:** Banks strictly require clean, perfected title documentation—specifically a Certificate of Occupancy (C of O) or registered Governor's Consent.\n\nOur advisory team works directly with developers offering flexible milestone installment structures.`,
      directActionButtons: [
        { label: 'Payment Plan Properties', action: 'query', value: 'Show properties with installment payment plans' },
        { label: 'Speak to Financing Advisor', action: 'whatsapp', value: '+2348109012192' }
      ]
    };
  }

  // 16. LOCATION REAL ESTATE (Questions about specific areas in the corridor)
  if (
    containsAny([
      'tell me about abraham adesanya', 'is orchid road good', 'tell me about sangotedo',
      'tell me about vgc', 'tell me about ikota', 'how is ajah like', 'tell me about chevron'
    ])
  ) {
    return {
      intent: 'LOCATION_REAL_ESTATE',
      confidence: 0.93,
      requiresInventorySearch: false,
      directAnswer: `The **Ajah corridor** is one of Lagos' most vibrant residential and investment hubs, comprising distinct neighborhood clusters:\n\n* **Abraham Adesanya:** Established, gated, family-friendly estate hub with strong connectivity to the express and the Lekki Coastal Highway.\n* **Orchid Road:** High-growth modern duplex hub with stylish contemporary architecture and serviced estates.\n* **Chevron / Ikota:** Established luxury enclave close to major commercial headquarters and lifestyle centers.\n* **Sangotedo:** Fast-developing residential zone home to Novare Mall (Shoprite) and top international schools.\n* **VGC (Victoria Garden City):** Master-planned luxury community with world-class private drainage, parks, and security.`,
      directActionButtons: [
        { label: 'Properties in Abraham Adesanya', action: 'query', value: 'Show properties in Abraham Adesanya' },
        { label: 'Properties in Orchid Road', action: 'query', value: 'Show properties in Orchid Road' }
      ]
    };
  }

  // 17. INSPECTION REQUEST FLOW
  if (
    containsAny([
      'book inspection', 'schedule inspection', 'book an inspection', 'schedule an inspection',
      'view this property', 'inspect this house', 'inspect it', 'site visit', 'physical inspection'
    ])
  ) {
    return {
      intent: 'PROPERTY_INSPECTION',
      confidence: 0.96,
      requiresInventorySearch: false // Handled by inspection multi-turn state
    };
  }

  // 18. SHORTLET BOOKING
  if (
    containsAny([
      'book shortlet', 'book this shortlet', 'book the apartment', 'reserve shortlet',
      'reserve this apartment'
    ])
  ) {
    return {
      intent: 'SHORTLET_BOOKING',
      confidence: 0.95,
      requiresInventorySearch: false
    };
  }

  // 19. VEHICLE BOOKING
  if (
    containsAny([
      'book this car', 'rent this vehicle', 'book the car', 'reserve this car', 'book this vehicle'
    ])
  ) {
    return {
      intent: 'VEHICLE_BOOKING',
      confidence: 0.95,
      requiresInventorySearch: false
    };
  }

  // 20. SHORTLET SEARCH
  if (
    containsAny([
      'shortlet', 'short stay', 'serviced apartment', 'holiday home', 'apartment for a week',
      'shortlet in ajah', 'furnished apartment'
    ])
  ) {
    return {
      intent: 'SHORTLET_SEARCH',
      confidence: 0.94,
      requiresInventorySearch: true
    };
  }

  // 21. VEHICLE SEARCH
  if (
    containsAny([
      'rent a car', 'hire a car', 'car rental', 'luxury car', 'suv rental', 'prado', 'mercedes g63',
      'vehicle hire', 'chauffeur'
    ])
  ) {
    return {
      intent: 'VEHICLE_SEARCH',
      confidence: 0.94,
      requiresInventorySearch: true
    };
  }

  // 22. PROPERTY DETAIL (Features, title, price of previously shown listing)
  if (
    containsAny([
      'tell me more about this property', 'tell me about the property', 'features of this property',
      'what title does it have', 'how much is the service charge', 'more details on the house',
      'what is the title of this property', 'more photos of this property', 'tell me more about it'
    ]) &&
    (context.hasSelectedListing || context.selectedListingTitle)
  ) {
    return {
      intent: 'PROPERTY_DETAIL',
      confidence: 0.95,
      requiresInventorySearch: false // Uses cached/selected listing in session
    };
  }

  // 23. PROPERTY SEARCH (User explicitly asking for properties to buy or rent)
  if (
    containsAny([
      'property', 'properties', 'house', 'houses', 'duplex', 'duplexes', 'terrace',
      'bungalow', 'mansion', 'flat', 'buy a house', 'for sale', 'houses in ajah',
      'budget', 'naira', 'bedroom', 'detached', 'semi-detached', 'looking for a home'
    ])
  ) {
    return {
      intent: 'PROPERTY_SEARCH',
      confidence: 0.92,
      requiresInventorySearch: true
    };
  }

  // 24. OFF-TOPIC (Math, programming, unrelated trivia)
  const isCodeOrMath = /^(def |function |import |const |let |var |print\(|select \*)/i.test(lower);
  const isUnrelatedTrivia = containsAny([
    'capital of france', 'who won the premier league', 'recipe for', 'write a poem',
    'python code', 'javascript function', 'how to bake'
  ]);

  if (isCodeOrMath || isUnrelatedTrivia) {
    return {
      intent: 'OFF_TOPIC',
      confidence: 0.95,
      requiresInventorySearch: false,
      directAnswer: "I am specialized exclusively as your luxury real estate, serviced shortlet, and executive lifestyle concierge for Selling Ajah and the Lekki corridor. While I cannot assist with general code or unrelated trivia, I would be delighted to help you explore verified properties, check land titles, or coordinate a property inspection.\n\nHow may I assist your real estate journey today?"
    };
  }

  // Default fallback: If user query contains numbers or location, consider property search
  return {
    intent: 'PROPERTY_SEARCH',
    confidence: 0.5,
    requiresInventorySearch: true
  };
}
