/**
 * Factual knowledge base for Selling Ajah AI Concierge.
 * Grounded strictly in authentic database records and standard real estate terminology.
 * The AI must never present unsupported assumptions as company facts.
 * Listing-specific details (amenities, power, chauffeur, titles) must come from database records.
 */

export const SELLING_AJAH_KNOWLEDGE = {
  company: {
    name: 'Selling Ajah',
    legalName: 'Selling Ajah Real Estate & Concierge',
    headquarters: 'Off Lekki-Epe Expressway, Ajah, Lagos State, Nigeria',
    phone: '+234 810 901 2192',
    whatsapp: '+234 810 901 2192',
    email: 'info@sellingajah.com',
    officeHours: 'Monday – Saturday: 8:00 AM – 6:00 PM (WAT)',
    focus: 'Property sales, residential rentals, and serviced shortlets across the Ajah corridor.'
  },

  services: [
    {
      title: 'Property Sales & Rentals',
      description: 'Residential and commercial properties in Ajah and Lekki. Documented titles and specifications are listed on each property record.'
    },
    {
      title: 'Serviced Shortlets',
      description: 'Furnished apartments available for short-term stays. Specific amenities, power arrangements, and rules are detailed in each listing.'
    }
  ],

  corridorsAndLocations: {
    'Ajah': 'Central hub of the corridor, offering various gated estates, proximity to Jubilee Bridge, and diverse residential properties.',
    'Abraham Adesanya': 'Established residential area featuring gated communities and direct connectivity along the corridor.',
    'Orchid Road': 'Fast-growing residential corridor with contemporary duplexes, terraces, and apartments.',
    'Chevron': 'Established commercial and residential district situated along the Lekki-Epe Expressway.',
    'VGC (Victoria Garden City)': 'Master-planned residential community with controlled access and private infrastructure.',
    'Ikota': 'Accessible district close to commercial centers featuring modern townhouses and duplexes.',
    'Sangotedo': 'Growing residential area home to Novare Mall, schools, and developing residential estates.',
    'Lekki Phase 1': 'Prominent residential and commercial district with apartments, offices, and lifestyle destinations.'
  },

  lagosTitleGlossary: {
    "Governor's Consent": 'Statutory consent signed by the Lagos State Governor (or delegated authority) validating the transfer of ownership of land with an existing state title.',
    "Certificate of Occupancy (C of O)": 'A state government land grant document issued to an individual or entity for a 99-year term.',
    "Gazette": 'An official Lagos State government publication recording an excision granted to an indigenous community.',
    "Excision in Process / Approved Layout": 'Land undergoing formal government excision or covered by an approved layout survey.',
    "Deed of Assignment": 'Legal instrument between assignor and assignee conveying ownership rights and title in a property.'
  },

  inspectionProtocol: {
    requestPolicy: 'All inspection bookings made through the concierge are recorded as pending requests. A representative will confirm date, time, and access details with the client before the inspection takes place.',
    inPerson: 'Scheduled physical viewing coordinated with property representatives.',
    virtual: 'Live video walkthrough conducted via WhatsApp or video call upon request and staff confirmation.'
  },

  bookingPolicies: {
    requestNotice: 'All shortlet booking inquiries are submitted as pending requests awaiting availability and calendar confirmation by staff.',
    shortlets: 'Check-in, check-out times, security deposits, and specific amenities (including electricity and internet) are determined by each individual listing record.'
  },

  humanHandoffTriggers: [
    'Client explicitly requests to speak with a human agent, broker, or manager',
    'Client wants to negotiate price, payment plans, or contract terms',
    'Client asks for custom legal documentation or bespoke title verifications',
    'Client requests urgent same-day booking confirmation or assistance'
  ]
};
