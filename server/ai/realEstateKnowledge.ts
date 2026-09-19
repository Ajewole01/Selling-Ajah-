/**
 * General Nigerian Real Estate Knowledge Base
 *
 * Provides educational, accurate, and balanced explanations for:
 * - Titles and land documentation in Lagos (C of O, Governor's Consent, Gazette, Excision, Deed of Assignment, Survey Plan)
 * - Due diligence checklist before buying land or properties in Lagos
 * - Property typologies (Detached, Semi-Detached, Terrace, Apartment)
 * - Ajah corridor market insights, rental yields, capital growth, and balanced risk considerations
 * - Tenant fees and rental structures in Lagos
 */

export interface KnowledgeTopic {
  title: string;
  summary: string;
  keyPoints: string[];
  caveats?: string;
}

export const REAL_ESTATE_TOPICS: Record<string, KnowledgeTopic> = {
  c_of_o: {
    title: 'Certificate of Occupancy (C of O)',
    summary: 'A formal state title document issued by the Lagos State Government granting the holder exclusive leasehold ownership of land for a 99-year term under the Land Use Act 1978.',
    keyPoints: [
      'It is the first formal official title issued by the state government on a parcel of virgin land.',
      'Only one C of O can ever be issued for any single parcel of land.',
      'Once a property with a C of O is subsequently sold or transferred to a new buyer, the new transaction requires Governor\'s Consent, not another C of O.',
      'A registered C of O can be verified directly at the Lagos State Lands Bureau in Alausa, Ikeja.'
    ],
    caveats: 'Always chart the survey coordinates to confirm the land falls within the perimeter of the registered C of O.'
  },

  governors_consent: {
    title: "Governor's Consent",
    summary: "Mandatory statutory approval by the Lagos State Governor validating the transfer, assignment, or sale of land that already has a state title (such as a Certificate of Occupancy or an approved layout).",
    keyPoints: [
      'Under Section 22 of the Land Use Act 1978, it is unlawful to alienate or transfer title to land without the consent of the State Governor.',
      'Whenever an owner with a C of O or prior Consent sells a property, the Deed of Assignment must be submitted to the Lands Bureau to receive the Governor\'s Consent endorsement stamp.',
      'Governor\'s Consent gives the new purchaser undisputed, legally registered ownership recognized by Lagos State courts and financial institutions for mortgage collateral.'
    ],
    caveats: 'Processing Governor\'s Consent takes several months and incurs state stamp duties and registration fees.'
  },

  deed_of_assignment: {
    title: 'Deed of Assignment',
    summary: 'The primary legal contract between a seller (assignor) and buyer (assignee) conveying unencumbered rights, title, and interest in a real estate property.',
    keyPoints: [
      'Prepared and endorsed by a qualified Nigerian property attorney.',
      'Specifies the purchase price, exact property boundaries, surveyor plan number, covenants, and signatures of both parties and witnesses.',
      'Serves as the vital link in the root of title and is the exact document submitted to obtain Governor\'s Consent.'
    ]
  },

  survey_plan: {
    title: 'Registered Survey Plan',
    summary: 'A precise geometric document drawn by a licensed surveyor and lodged with the Lagos State Surveyor-General showing boundary coordinates, beacon numbers, total acreage, and parcel orientation.',
    keyPoints: [
      'Indicates whether the land is free from government acquisition or committed infrastructure setbacks.',
      'Coordinates are charted at the Surveyor-General\'s Office in Alausa to confirm whether the land is "Free" or "Committed".',
      'Never purchase land without sighting an original registered survey plan and independent charting.'
    ]
  },

  excision_and_gazette: {
    title: 'Excision & Government Gazette',
    summary: 'The legal release of designated land parcels from government acquisition back to the indigenous community, followed by official recording in the Lagos State Government Gazette.',
    keyPoints: [
      'When the Land Use Act vested all land in the state governor, villages were granted "Excisions" to retain communal lands.',
      'A Gazette is the official government gazette publication documenting the excision coordinates, volume number, and boundary description.',
      'Land with a published Gazette is considered free for private acquisition and can subsequently be processed for Governor\'s Consent or C of O.',
      '"Excision in Process" means the application has been submitted to the government but has not yet been approved or gazetted; it carries higher transaction risk until gazetted.'
    ]
  },

  due_diligence_checklist: {
    title: 'Due Diligence Checklist Before Buying Land or Property in Lagos',
    summary: 'Essential verification steps to ensure clean legal title, prevent fraud, and avoid purchasing under government committed acquisitions.',
    keyPoints: [
      '1. Coordinate Charting: Take the survey plan coordinates to the Lagos State Surveyor-General\'s Office (Alausa) to confirm the land is completely free from government acquisition, drainage corridors, or road alignments.',
      '2. Lands Bureau Search: Conduct a formal title search at the Alausa Lands Registry to verify the registered owner, encumbrances, court litigation, or existing bank mortgages.',
      '3. Physical Site Inspection: Visit the property in person during daytime and ideally after rain to evaluate topography, flood drainage, neighborhood infrastructure, access roads, and verify that boundary beacons match the survey plan.',
      '4. Root of Title & Family Verification: If buying from traditional landowners ("omo onile"), verify that the accredited family heads and principal members are united in the conveyance.',
      '5. Professional Legal Representation: Engage a qualified property solicitor to conduct document vetting, draft the contract of sale, and oversee signing and stamp duties.'
    ]
  },

  property_typologies: {
    title: 'Detached vs Semi-Detached vs Terrace Duplexes',
    summary: 'Clarification of core architectural and spatial formats common in the Lagos luxury market.',
    keyPoints: [
      'Fully Detached Duplex: Standalone residential structure with complete private compound, own perimeter fence, independent gate, and no shared walls with neighbors.',
      'Semi-Detached Duplex: Two mirror-image homes joined by a single common partition party wall, each having its own separate gate, compound, and privacy on three sides.',
      'Terrace Duplex: A contiguous row of three or more identical multi-level units sharing side walls, typically located inside a managed, serviced gated estate with shared compound and security.'
    ]
  },

  ajah_market_assessment: {
    title: 'Ajah Corridor Real Estate Market & Investment Overview',
    summary: 'Balanced and objective overview of investment dynamics, rental yields, and infrastructure in the Ajah and Lekki-Epe expressway corridor.',
    keyPoints: [
      'Strong Capital Growth: Driven by major commercial developments along the Lekki-Epe corridor, including the Lekki Regional Road, Coastal Highway, Dangote Refinery, and Lekki Free Zone.',
      'Rental Yields: Residential properties typically deliver 6% to 9% gross annual rental yield; well-managed serviced shortlets can yield 12% to 18% depending on occupancy rates and location quality.',
      'Infrastructure Considerations: Investors should inspect access roads, estate drainage systems, and proximity to major intersections like Ajah Jubilee Bridge and Abraham Adesanya roundabout.',
      'Balanced View: Real estate values in Ajah have grown consistently, but buyers must perform due diligence on title documentation, verify estate management fees, and factor in rush-hour traffic along the Lekki-Epe axis.'
    ],
    caveats: 'Real estate yields vary based on market conditions, maintenance, and occupancy; Selling Ajah provides factual market trends without speculative guarantees.'
  }
};
