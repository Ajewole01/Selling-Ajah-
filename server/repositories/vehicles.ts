import { getSupabase } from '../supabase.js';
import { db as localDb } from '../db.js';
import type { LuxuryVehicle } from '../../src/types.js';

function mapRowToVehicle(row: any): LuxuryVehicle {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    brand: row.brand || '',
    model: row.model || '',
    year: Number(row.year) || new Date().getFullYear(),
    category: row.category || 'SUV',
    dailyRate: Number(row.daily_rate),
    hourlyRate: row.hourly_rate ? Number(row.hourly_rate) : undefined,
    transmission: row.transmission || 'Automatic',
    seats: Number(row.seats) || 5,
    fuelType: row.fuel_type || 'Petrol',
    color: row.color || '',
    features: Array.isArray(row.features) ? row.features : [],
    requirements: Array.isArray(row.requirements) ? row.requirements : [],
    status: row.status || 'available',
    isAvailable: Boolean(row.is_available),
    isFeatured: Boolean(row.is_featured),
    mainImage: row.main_image || '',
    gallery: Array.isArray(row.gallery) ? row.gallery : [],
    description: row.description || '',
    shortDescription: row.short_description || '',
    seoTitle: row.seo_title || undefined,
    seoDescription: row.seo_description || undefined,
    createdAt: row.created_at || new Date().toISOString()
  };
}

function mapVehicleToRow(v: Partial<LuxuryVehicle>): any {
  const row: any = {};
  if (v.id !== undefined) row.id = v.id;
  if (v.name !== undefined) row.name = v.name;
  if (v.slug !== undefined) row.slug = v.slug;
  if (v.brand !== undefined) row.brand = v.brand;
  if (v.model !== undefined) row.model = v.model;
  if (v.year !== undefined) row.year = v.year;
  if (v.category !== undefined) row.category = v.category;
  if (v.dailyRate !== undefined) row.daily_rate = v.dailyRate;
  if (v.hourlyRate !== undefined) row.hourly_rate = v.hourlyRate;
  if (v.transmission !== undefined) row.transmission = v.transmission;
  if (v.seats !== undefined) row.seats = v.seats;
  if (v.fuelType !== undefined) row.fuel_type = v.fuelType;
  if (v.color !== undefined) row.color = v.color;
  if (v.features !== undefined) row.features = v.features;
  if (v.requirements !== undefined) row.requirements = v.requirements;
  if (v.status !== undefined) row.status = v.status;
  if (v.isAvailable !== undefined) row.is_available = v.isAvailable;
  if (v.isFeatured !== undefined) row.is_featured = v.isFeatured;
  if (v.mainImage !== undefined) row.main_image = v.mainImage;
  if (v.gallery !== undefined) row.gallery = v.gallery;
  if (v.description !== undefined) row.description = v.description;
  if (v.shortDescription !== undefined) row.short_description = v.shortDescription;
  if (v.seoTitle !== undefined) row.seo_title = v.seoTitle;
  if (v.seoDescription !== undefined) row.seo_description = v.seoDescription;
  if (v.createdAt !== undefined) row.created_at = v.createdAt;
  return row;
}

export async function getVehicles(filters?: {
  category?: string;
  brand?: string;
  featured?: boolean;
  status?: string;
}): Promise<LuxuryVehicle[]> {
  const supabase = getSupabase();
  if (!supabase) {
    return localDb.getVehicles(filters);
  }

  let query = supabase.from('vehicles').select('*');

  if (filters?.category) query = query.eq('category', filters.category);
  if (filters?.brand) query = query.ilike('brand', `%${filters.brand}%`);
  if (filters?.featured !== undefined) query = query.eq('is_featured', filters.featured);
  if (filters?.status) query = query.eq('status', filters.status);

  query = query.order('created_at', { ascending: false });

  const { data, error } = await query;
  if (error) {
    console.error('Supabase getVehicles error:', error);
    return localDb.getVehicles(filters);
  }
  return (data || []).map(mapRowToVehicle);
}

export async function getVehicleBySlug(slug: string): Promise<LuxuryVehicle | null> {
  const supabase = getSupabase();
  if (!supabase) {
    return localDb.getVehicleBySlug(slug) || null;
  }

  const { data, error } = await supabase
    .from('vehicles')
    .select('*')
    .eq('slug', slug)
    .maybeSingle();

  if (error) {
    console.error('Supabase getVehicleBySlug error:', error);
    return localDb.getVehicleBySlug(slug) || null;
  }
  if (!data) {
    return getVehicleById(slug);
  }
  return mapRowToVehicle(data);
}

export async function getVehicleById(id: string): Promise<LuxuryVehicle | null> {
  const supabase = getSupabase();
  if (!supabase) {
    return localDb.getVehicles().find(v => v.id === id) || null;
  }

  const { data, error } = await supabase
    .from('vehicles')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error || !data) return null;
  return mapRowToVehicle(data);
}

export async function createVehicle(veh: Partial<LuxuryVehicle>): Promise<LuxuryVehicle> {
  const supabase = getSupabase();
  const id = veh.id || 'veh-' + Date.now();
  const slug = veh.slug || (veh.name || 'car').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') + '-' + Date.now();
  const now = new Date().toISOString();

  const newVeh: LuxuryVehicle = {
    id,
    name: veh.name || 'Untitled Luxury Vehicle',
    slug,
    brand: veh.brand || 'Luxury',
    model: veh.model || '',
    year: Number(veh.year) || new Date().getFullYear(),
    category: veh.category || 'SUV',
    dailyRate: Number(veh.dailyRate) || 0,
    hourlyRate: veh.hourlyRate ? Number(veh.hourlyRate) : undefined,
    transmission: veh.transmission || 'Automatic',
    seats: Number(veh.seats) || 5,
    fuelType: veh.fuelType || 'Petrol',
    color: veh.color || 'Black',
    features: veh.features || [],
    requirements: veh.requirements || [],
    status: veh.status || 'available',
    isAvailable: veh.isAvailable !== undefined ? veh.isAvailable : true,
    isFeatured: Boolean(veh.isFeatured),
    mainImage: veh.mainImage || '',
    gallery: veh.gallery || (veh.mainImage ? [veh.mainImage] : []),
    description: veh.description || '',
    shortDescription: veh.shortDescription || '',
    seoTitle: veh.seoTitle,
    seoDescription: veh.seoDescription,
    createdAt: now
  };

  if (!supabase) {
    return localDb.createVehicle(newVeh as any);
  }

  const row = mapVehicleToRow(newVeh);
  const { data, error } = await supabase
    .from('vehicles')
    .insert([row])
    .select()
    .single();

  if (error) {
    console.error('Supabase createVehicle error:', error);
    throw new Error(error.message);
  }
  return mapRowToVehicle(data);
}

export async function updateVehicle(id: string, updates: Partial<LuxuryVehicle>): Promise<LuxuryVehicle | null> {
  const supabase = getSupabase();
  if (!supabase) {
    return localDb.updateVehicle(id, updates);
  }

  const rowUpdates = mapVehicleToRow(updates);
  delete rowUpdates.id;

  const { data, error } = await supabase
    .from('vehicles')
    .update(rowUpdates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Supabase updateVehicle error:', error);
    return null;
  }
  return mapRowToVehicle(data);
}

export async function deleteVehicle(id: string): Promise<boolean> {
  const supabase = getSupabase();
  if (!supabase) {
    return localDb.deleteVehicle(id);
  }

  const { error } = await supabase
    .from('vehicles')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Supabase deleteVehicle error:', error);
    return false;
  }
  return true;
}
