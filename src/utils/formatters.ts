import { OFFICIAL_CONTACT } from '../constants/contact';

export function formatNaira(amount: number, short: boolean = false): string {
  if (short) {
    if (amount >= 1_000_000_000) {
      return `₦${(amount / 1_000_000_000).toFixed(1).replace(/\.0$/, '')}B`;
    }
    if (amount >= 1_000_000) {
      return `₦${(amount / 1_000_000).toFixed(1).replace(/\.0$/, '')}M`;
    }
    if (amount >= 1_000) {
      return `₦${(amount / 1_000).toFixed(0)}K`;
    }
  }
  return '₦' + amount.toLocaleString('en-NG');
}

export function formatWhatsAppUrl(phone?: string, text?: string): string {
  // Strip non-digits
  const raw = (phone || '').replace(/[^0-9]/g, '');
  // If empty, invalid, or matching old placeholder, fall back to official link number
  const cleanPhone = (raw && raw !== '2348123456789' && raw !== '08123456789')
    ? raw
    : OFFICIAL_CONTACT.whatsappNumber;

  if (!text) {
    return `https://wa.me/${cleanPhone}`;
  }
  const encoded = encodeURIComponent(text);
  return `https://wa.me/${cleanPhone}?text=${encoded}`;
}

export function formatTelUrl(phone: string): string {
  return `tel:${phone.replace(/[^0-9+]/g, '')}`;
}

export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}
