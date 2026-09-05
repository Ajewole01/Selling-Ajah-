/**
 * Official Selling Ajah Contact Configuration
 * Single Source of Truth for all contact channels across the application.
 */

export const OFFICIAL_CONTACT = {
  brandName: 'Selling Ajah',
  // Official Display WhatsApp and Phone (+234 810 901 2192)
  phone: '+234 810 901 2192',
  whatsappDisplay: '+234 810 901 2192',
  // Official International WhatsApp digits for wa.me links (2348109012192)
  whatsappNumber: '2348109012192',
  // Direct wa.me link
  whatsappUrl: 'https://wa.me/2348109012192',
  // Official Email & Address
  email: 'info@sellingajah.com',
  address: 'Suite 4B, Admiralty Way / Lekki-Epe Expressway, Beside Ajah Jubilee Bridge, Lagos, Nigeria',
  businessHours: 'Monday - Saturday: 8:00 AM - 7:00 PM | Sunday: By Appointment'
};

export const OFFICIAL_WHATSAPP = {
  display: OFFICIAL_CONTACT.whatsappDisplay,
  linkNumber: OFFICIAL_CONTACT.whatsappNumber,
  directUrl: OFFICIAL_CONTACT.whatsappUrl
};
