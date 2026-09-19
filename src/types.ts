export type ListingType = 'sale' | 'rent' | 'shortlet';

export type PropertyStatus = 'available' | 'sold' | 'rented' | 'pending' | 'draft';

export type VehicleStatus = 'available' | 'booked' | 'maintenance' | 'unavailable';

export type ApartmentStatus = 'available' | 'booked' | 'unavailable';

export type EnquiryStatus = 'new' | 'contacted' | 'in_progress' | 'closed' | 'resolved';

export type UserRole = 'super_admin' | 'admin';

export interface Property {
  id: string;
  title: string;
  slug: string;
  refNumber: string;
  shortDescription: string;
  fullDescription: string;
  description?: string;
  propertyType: 'Duplex' | 'Detached Duplex' | 'Semi Detached' | 'Terrace' | 'Apartment' | 'Mansion' | 'Penthouse' | 'Land' | 'Commercial' | string;
  listingType: 'sale' | 'rent';
  price: number;
  pricePeriod?: string; // e.g., 'per annum' for rent
  previousPrice?: number;
  location: string; // e.g. "Ajah, Lekki, Lagos"
  area: string; // e.g. "Ajah", "Lekki Phase 1", "Chevron", "Ikota", "Sangotedo", "Abraham Adesanya", "VGC", "Orchid Road"
  address: string;
  bedrooms: number;
  bathrooms: number;
  toilets: number;
  parkingSpaces: number;
  propertySize?: string; // e.g. "450 sqm"
  landSize?: string; // e.g. "600 sqm"
  amenities: string[];
  features: string[];
  titleDocument?: string;
  googleMapsUrl?: string;
  videoUrl?: string;
  virtualTourUrl?: string;
  mainImage: string;
  gallery: string[];
  images?: string[];
  status: PropertyStatus;
  isFeatured: boolean;
  seoTitle?: string;
  seoDescription?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ServicedApartment {
  id: string;
  name: string;
  slug: string;
  location: string;
  area: string;
  address: string;
  pricePerNight: number;
  bedrooms: number;
  bathrooms: number;
  maxGuests: number;
  amenities: string[];
  rules: string[];
  checkInTime: string;
  checkOutTime: string;
  isAvailable: boolean;
  status: ApartmentStatus;
  isFeatured: boolean;
  description: string;
  mainImage: string;
  gallery: string[];
  images?: string[];
  seoTitle?: string;
  seoDescription?: string;
  createdAt: string;
}

export interface LuxuryVehicle {
  id: string;
  name: string;
  slug: string;
  brand: string;
  model: string;
  year: number;
  category: 'SUV' | 'Luxury Sedan' | 'Executive' | 'Sports' | 'Premium';
  dailyRate: number;
  hourlyRate?: number;
  transmission: 'Automatic' | 'Manual';
  seats: number;
  fuelType: 'Petrol' | 'Diesel' | 'Hybrid';
  color: string;
  features: string[];
  requirements: string[];
  status: VehicleStatus;
  isAvailable: boolean;
  isFeatured: boolean;
  mainImage: string;
  gallery: string[];
  images?: string[];
  description: string;
  shortDescription?: string;
  seoTitle?: string;
  seoDescription?: string;
  createdAt: string;
}

export interface Enquiry {
  id: string;
  name: string;
  phone: string;
  email: string;
  whatsapp?: string;
  service: 'property_sale' | 'property_lease' | 'shortlet' | 'car_rental' | 'consultation' | 'general';
  listingType?: 'property' | 'apartment' | 'vehicle' | 'custom_request';
  listingId?: string;
  listingTitle?: string;
  propertyTitle?: string;
  message: string;
  budget?: string;
  preferredLocation?: string;
  date: string;
  status: EnquiryStatus;
  notes?: string;
}

export interface Testimonial {
  id: string;
  name: string;
  role: string;
  avatar: string;
  rating: number;
  text: string;
  serviceOrProperty: string;
  isFeatured: boolean;
  createdAt: string;
}

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
  category: 'Buying' | 'Renting' | 'Shortlets' | 'Cars' | 'General';
}

export type FAQItem = FaqItem;

export interface SiteSettings {
  businessName: string;
  companyName?: string;
  phone: string;
  whatsapp: string;
  email: string;
  officeAddress: string;
  address?: string;
  businessHours: string;
  socialLinks: {
    instagram?: string;
    facebook?: string;
    twitter?: string;
    linkedin?: string;
    youtube?: string;
  };
  defaultSeoTitle: string;
  defaultSeoDescription: string;
  heroHeadline: string;
  heroSubheadline: string;
}

export interface AdminUser {
  id: string;
  username: string;
  name: string;
  email: string;
  role: UserRole;
  token?: string;
}

export interface ChatCard {
  id: string;
  title: string;
  price: number;
  formattedPrice: string;
  location: string;
  image: string;
  type: 'property' | 'apartment' | 'vehicle' | 'shortlet' | 'car';
  slug: string;
  details?: string;
}

export interface ChatActionButton {
  label: string;
  action: string;
  value?: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant' | 'system';
  text: string;
  timestamp: string;
  listingCards?: ChatCard[];
  actionButtons?: ChatActionButton[];
  suggestLeadCapture?: boolean;
  isVoiceTranscript?: boolean;
  handoffRequested?: boolean;
}

export type InspectionStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled';

export interface InspectionRequest {
  id: string;
  type: 'inspection' | 'shortlet_booking' | 'vehicle_booking';
  referenceNumber: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  listingId?: string;
  listingTitle: string;
  listingType: 'property' | 'shortlet' | 'vehicle';
  listingSlug?: string;
  preferredDate: string;
  preferredTime?: string;
  checkInDate?: string;
  checkOutDate?: string;
  numberOfGuests?: number;
  rentalDays?: number;
  notes?: string;
  status: InspectionStatus;
  source: 'AI Chat' | 'AI Voice' | 'AI Phone' | 'Website Direct';
  createdAt: string;
  updatedAt?: string;
}

export interface AiConversationRecord {
  id: string;
  channel: 'chat' | 'voice' | 'phone';
  customerName?: string;
  customerPhone?: string;
  customerEmail?: string;
  startedAt: string;
  endedAt?: string;
  intent: string;
  outcome: 'lead_captured' | 'inspection_requested' | 'booking_requested' | 'information_provided' | 'human_handoff' | 'ongoing';
  humanHandoffRequested: boolean;
  summary: string;
  messageCount: number;
  relatedListingIds?: string[];
  transcript?: Array<{ sender: 'user' | 'assistant' | 'system'; text: string; timestamp?: string }>;
  createdAt: string;
}

export interface AiConciergeSettings {
  enabled: boolean;
  assistantName: string;
  voicePersona: 'Amina (Luxury Female)' | 'Zainab (Warm Executive)' | 'Kore (Refined Calm)';
  welcomeGreeting: string;
  phoneGreeting: string;
  inspectionNotice: string;
  bookingNotice: string;
  disclaimerNotice: string;
  businessBio: string;
  allowedAreas: string[];
  fallbackWhatsApp: string;
  fallbackPhone: string;
  telephonyEnabled: boolean;
  telephonyProvider: 'twilio' | 'africas_talking' | 'custom_sip';
}

