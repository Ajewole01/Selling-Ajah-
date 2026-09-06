import { getSupabase } from '../supabase.js';
import { db as localDb } from '../db.js';
import type { SiteSettings } from '../../src/types.js';

function mapRowToSettings(row: any): SiteSettings {
  return {
    businessName: row.business_name || 'Selling Ajah',
    companyName: row.business_name || 'Selling Ajah',
    phone: row.phone || '+234 812 345 6789',
    whatsapp: row.whatsapp || '+234 812 345 6789',
    email: row.email || 'info@sellingajah.com',
    officeAddress: row.office_address || 'Ajah, Lagos, Nigeria',
    address: row.office_address || 'Ajah, Lagos, Nigeria',
    businessHours: row.business_hours || 'Mon - Sat: 8:00 AM - 6:00 PM',
    socialLinks: row.social_links || { instagram: '', facebook: '', twitter: '', linkedin: '' },
    defaultSeoTitle: row.default_seo_title || 'Selling Ajah | Premium Properties, Shortlets & Luxury Cars',
    defaultSeoDescription: row.default_seo_description || 'Find luxury duplexes, serviced shortlets, and premium car hire in Ajah & Lekki.',
    heroHeadline: row.hero_headline || 'Luxury Properties & Lifestyle in Ajah',
    heroSubheadline: row.hero_subheadline || 'Discover curated duplexes, shortlets, and luxury car rentals.'
  };
}

export async function getSettings(): Promise<SiteSettings> {
  const supabase = getSupabase();
  if (!supabase) {
    return localDb.getSettings();
  }

  const { data, error } = await supabase
    .from('site_settings')
    .select('*')
    .eq('id', 'default')
    .maybeSingle();

  if (error || !data) {
    return localDb.getSettings();
  }
  return mapRowToSettings(data);
}

export async function updateSettings(settings: Partial<SiteSettings>): Promise<SiteSettings> {
  const supabase = getSupabase();
  if (!supabase) {
    return localDb.updateSettings(settings);
  }

  const rowUpdates: any = {
    updated_at: new Date().toISOString()
  };
  if (settings.businessName || settings.companyName) rowUpdates.business_name = settings.businessName || settings.companyName;
  if (settings.phone) rowUpdates.phone = settings.phone;
  if (settings.whatsapp) rowUpdates.whatsapp = settings.whatsapp;
  if (settings.email) rowUpdates.email = settings.email;
  if (settings.officeAddress || settings.address) rowUpdates.office_address = settings.officeAddress || settings.address;
  if (settings.businessHours) rowUpdates.business_hours = settings.businessHours;
  if (settings.socialLinks) rowUpdates.social_links = settings.socialLinks;
  if (settings.defaultSeoTitle) rowUpdates.default_seo_title = settings.defaultSeoTitle;
  if (settings.defaultSeoDescription) rowUpdates.default_seo_description = settings.defaultSeoDescription;
  if (settings.heroHeadline) rowUpdates.hero_headline = settings.heroHeadline;
  if (settings.heroSubheadline) rowUpdates.hero_subheadline = settings.heroSubheadline;

  const { data, error } = await supabase
    .from('site_settings')
    .upsert({ id: 'default', ...rowUpdates })
    .select()
    .single();

  if (error) {
    console.error('Supabase updateSettings error:', error);
    return localDb.updateSettings(settings);
  }
  return mapRowToSettings(data);
}
