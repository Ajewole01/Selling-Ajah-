import { getSupabase } from '../supabase.js';
import { db as localDb } from '../db.js';
import type { ServicedApartment } from '../../src/types.js';

function mapRowToApartment(row: any): ServicedApartment {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    location: row.location || '',
    area: row.area || '',
    address: row.address || '',
    pricePerNight: Number(row.price_per_night),
    bedrooms: Number(row.bedrooms) || 0,
    bathrooms: Number(row.bathrooms) || 0,
    maxGuests: Number(row.max_guests) || 1,
    amenities: Array.isArray(row.amenities) ? row.amenities : [],
    rules: Array.isArray(row.rules) ? row.rules : [],
    checkInTime: row.check_in_time || '2:00 PM',
    checkOutTime: row.check_out_time || '11:00 AM',
    isAvailable: Boolean(row.is_available),
    status: row.status || 'available',
    isFeatured: Boolean(row.is_featured),
    description: row.description || '',
    mainImage: row.main_image || '',
    gallery: Array.isArray(row.gallery) ? row.gallery : [],
    seoTitle: row.seo_title || undefined,
    seoDescription: row.seo_description || undefined,
    createdAt: row.created_at || new Date().toISOString()
  };
}

function mapApartmentToRow(a: Partial<ServicedApartment>): any {
  const row: any = {};
  if (a.id !== undefined) row.id = a.id;
  if (a.name !== undefined) row.name = a.name;
  if (a.slug !== undefined) row.slug = a.slug;
  if (a.location !== undefined) row.location = a.location;
  if (a.area !== undefined) row.area = a.area;
  if (a.address !== undefined) row.address = a.address;
  if (a.pricePerNight !== undefined) row.price_per_night = a.pricePerNight;
  if (a.bedrooms !== undefined) row.bedrooms = a.bedrooms;
  if (a.bathrooms !== undefined) row.bathrooms = a.bathrooms;
  if (a.maxGuests !== undefined) row.max_guests = a.maxGuests;
  if (a.amenities !== undefined) row.amenities = a.amenities;
  if (a.rules !== undefined) row.rules = a.rules;
  if (a.checkInTime !== undefined) row.check_in_time = a.checkInTime;
  if (a.checkOutTime !== undefined) row.check_out_time = a.checkOutTime;
  if (a.isAvailable !== undefined) row.is_available = a.isAvailable;
  if (a.status !== undefined) row.status = a.status;
  if (a.isFeatured !== undefined) row.is_featured = a.isFeatured;
  if (a.description !== undefined) row.description = a.description;
  if (a.mainImage !== undefined) row.main_image = a.mainImage;
  if (a.gallery !== undefined) row.gallery = a.gallery;
  if (a.seoTitle !== undefined) row.seo_title = a.seoTitle;
  if (a.seoDescription !== undefined) row.seo_description = a.seoDescription;
  if (a.createdAt !== undefined) row.created_at = a.createdAt;
  return row;
}

export async function getApartments(filters?: {
  area?: string;
  maxGuests?: number;
  featured?: boolean;
  status?: string;
}): Promise<ServicedApartment[]> {
  const supabase = getSupabase();
  if (!supabase) {
    return localDb.getApartments(filters);
  }

  let query = supabase.from('apartments').select('*');

  if (filters?.area) query = query.ilike('area', `%${filters.area}%`);
  if (filters?.maxGuests !== undefined) query = query.gte('max_guests', filters.maxGuests);
  if (filters?.featured !== undefined) query = query.eq('is_featured', filters.featured);
  if (filters?.status) query = query.eq('status', filters.status);

  query = query.order('created_at', { ascending: false });

  const { data, error } = await query;
  if (error) {
    console.error('Supabase getApartments error:', error);
    return localDb.getApartments(filters);
  }
  return (data || []).map(mapRowToApartment);
}

export async function getApartmentBySlug(slug: string): Promise<ServicedApartment | null> {
  const supabase = getSupabase();
  if (!supabase) {
    return localDb.getApartmentBySlug(slug) || null;
  }

  const { data, error } = await supabase
    .from('apartments')
    .select('*')
    .eq('slug', slug)
    .maybeSingle();

  if (error) {
    console.error('Supabase getApartmentBySlug error:', error);
    return localDb.getApartmentBySlug(slug) || null;
  }
  if (!data) {
    return getApartmentById(slug);
  }
  return mapRowToApartment(data);
}

export async function getApartmentById(id: string): Promise<ServicedApartment | null> {
  const supabase = getSupabase();
  if (!supabase) {
    return localDb.getApartments().find(a => a.id === id) || null;
  }

  const { data, error } = await supabase
    .from('apartments')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error || !data) return null;
  return mapRowToApartment(data);
}

export async function createApartment(apt: Partial<ServicedApartment>): Promise<ServicedApartment> {
  const supabase = getSupabase();
  const id = apt.id || 'apt-' + Date.now();
  const slug = apt.slug || (apt.name || 'apt').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') + '-' + Date.now();
  const now = new Date().toISOString();

  const newApt: ServicedApartment = {
    id,
    name: apt.name || 'Untitled Apartment',
    slug,
    location: apt.location || 'Ajah, Lagos',
    area: apt.area || 'Ajah',
    address: apt.address || '',
    pricePerNight: Number(apt.pricePerNight) || 0,
    bedrooms: Number(apt.bedrooms) || 1,
    bathrooms: Number(apt.bathrooms) || 1,
    maxGuests: Number(apt.maxGuests) || 2,
    amenities: apt.amenities || [],
    rules: apt.rules || [],
    checkInTime: apt.checkInTime || '2:00 PM',
    checkOutTime: apt.checkOutTime || '11:00 AM',
    isAvailable: apt.isAvailable !== undefined ? apt.isAvailable : true,
    status: apt.status || 'available',
    isFeatured: Boolean(apt.isFeatured),
    description: apt.description || '',
    mainImage: apt.mainImage || '',
    gallery: apt.gallery || (apt.mainImage ? [apt.mainImage] : []),
    seoTitle: apt.seoTitle,
    seoDescription: apt.seoDescription,
    createdAt: now
  };

  if (!supabase) {
    return localDb.createApartment(newApt as any);
  }

  const row = mapApartmentToRow(newApt);
  const { data, error } = await supabase
    .from('apartments')
    .insert([row])
    .select()
    .single();

  if (error) {
    console.error('Supabase createApartment error:', error);
    throw new Error(error.message);
  }
  return mapRowToApartment(data);
}

export async function updateApartment(id: string, updates: Partial<ServicedApartment>): Promise<ServicedApartment | null> {
  const supabase = getSupabase();
  if (!supabase) {
    return localDb.updateApartment(id, updates);
  }

  const rowUpdates = mapApartmentToRow(updates);
  delete rowUpdates.id;

  const { data, error } = await supabase
    .from('apartments')
    .update(rowUpdates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Supabase updateApartment error:', error);
    return null;
  }
  return mapRowToApartment(data);
}

export async function deleteApartment(id: string): Promise<boolean> {
  const supabase = getSupabase();
  if (!supabase) {
    return localDb.deleteApartment(id);
  }

  const { error } = await supabase
    .from('apartments')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Supabase deleteApartment error:', error);
    return false;
  }
  return true;
}
