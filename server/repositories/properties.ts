import { getSupabase } from '../supabase.js';
import { db as localDb } from '../db.js';
import type { Property } from '../../src/types.js';

function mapRowToProperty(row: any): Property {
  const fullDesc = row.full_description || row.description || '';
  const shortDesc = row.short_description || (fullDesc ? fullDesc.slice(0, 150) + '...' : '');
  const gallery = Array.isArray(row.gallery) && row.gallery.length > 0 ? row.gallery : (row.main_image ? [row.main_image] : []);

  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    refNumber: row.ref_number || '',
    shortDescription: shortDesc,
    fullDescription: fullDesc,
    description: fullDesc,
    propertyType: row.property_type || 'Duplex',
    listingType: row.listing_type || 'sale',
    price: Number(row.price),
    previousPrice: row.previous_price ? Number(row.previous_price) : undefined,
    pricePeriod: row.price_period || undefined,
    location: row.location || '',
    area: row.area || '',
    address: row.address || '',
    bedrooms: Number(row.bedrooms) || 0,
    bathrooms: Number(row.bathrooms) || 0,
    toilets: Number(row.toilets) || 0,
    parkingSpaces: Number(row.parking_spaces) || 0,
    propertySize: row.property_size || undefined,
    landSize: row.land_size || undefined,
    amenities: Array.isArray(row.amenities) ? row.amenities : [],
    features: Array.isArray(row.features) ? row.features : [],
    googleMapsUrl: row.google_maps_url || undefined,
    videoUrl: row.video_url || undefined,
    mainImage: row.main_image || '',
    gallery,
    images: gallery,
    status: row.status || 'available',
    isFeatured: Boolean(row.is_featured),
    seoTitle: row.seo_title || undefined,
    seoDescription: row.seo_description || undefined,
    createdAt: row.created_at || new Date().toISOString(),
    updatedAt: row.updated_at || new Date().toISOString()
  };
}

function mapPropertyToRow(p: Partial<Property>): any {
  const row: any = {};
  if (p.id !== undefined) row.id = p.id;
  if (p.title !== undefined) row.title = p.title;
  if (p.slug !== undefined) row.slug = p.slug;
  if (p.refNumber !== undefined) row.ref_number = p.refNumber;
  if (p.shortDescription !== undefined) row.short_description = p.shortDescription;
  else if ((p as any).description !== undefined && !p.fullDescription) row.short_description = (p as any).description.slice(0, 150) + '...';
  
  if (p.fullDescription !== undefined) row.full_description = p.fullDescription;
  else if ((p as any).description !== undefined) row.full_description = (p as any).description;

  if (p.propertyType !== undefined) row.property_type = p.propertyType;
  if (p.listingType !== undefined) row.listing_type = p.listingType;
  if (p.price !== undefined) row.price = p.price;
  if (p.previousPrice !== undefined) row.previous_price = p.previousPrice;
  if (p.pricePeriod !== undefined) row.price_period = p.pricePeriod;
  if (p.location !== undefined) row.location = p.location;
  if (p.area !== undefined) row.area = p.area;
  if (p.address !== undefined) row.address = p.address;
  if (p.bedrooms !== undefined) row.bedrooms = p.bedrooms;
  if (p.bathrooms !== undefined) row.bathrooms = p.bathrooms;
  if (p.toilets !== undefined) row.toilets = p.toilets;
  if (p.parkingSpaces !== undefined) row.parking_spaces = p.parkingSpaces;
  if (p.propertySize !== undefined) row.property_size = p.propertySize;
  if (p.landSize !== undefined) row.land_size = p.landSize;
  if (p.amenities !== undefined) row.amenities = p.amenities;
  if (p.features !== undefined) row.features = p.features;
  if (p.googleMapsUrl !== undefined) row.google_maps_url = p.googleMapsUrl;
  if (p.videoUrl !== undefined) row.video_url = p.videoUrl;
  if (p.mainImage !== undefined) row.main_image = p.mainImage;
  
  if (p.gallery !== undefined && Array.isArray(p.gallery) && p.gallery.length > 0) {
    row.gallery = p.gallery;
  } else if ((p as any).images !== undefined && Array.isArray((p as any).images) && (p as any).images.length > 0) {
    row.gallery = (p as any).images;
  } else if (p.mainImage) {
    row.gallery = [p.mainImage];
  }

  if (p.status !== undefined) row.status = p.status;
  if (p.isFeatured !== undefined) row.is_featured = p.isFeatured;
  if (p.seoTitle !== undefined) row.seo_title = p.seoTitle;
  if (p.seoDescription !== undefined) row.seo_description = p.seoDescription;
  if (p.createdAt !== undefined) row.created_at = p.createdAt;
  if (p.updatedAt !== undefined) row.updated_at = p.updatedAt;
  return row;
}

export async function getProperties(filters?: {
  listingType?: string;
  area?: string;
  status?: string;
  minPrice?: number;
  maxPrice?: number;
  bedrooms?: number;
  featured?: boolean;
}): Promise<Property[]> {
  const supabase = getSupabase();
  if (!supabase) {
    return localDb.getProperties(filters);
  }

  let query = supabase.from('properties').select('*');

  if (filters?.listingType) query = query.eq('listing_type', filters.listingType);
  if (filters?.area) query = query.ilike('area', `%${filters.area}%`);
  if (filters?.status) query = query.eq('status', filters.status);
  if (filters?.minPrice !== undefined) query = query.gte('price', filters.minPrice);
  if (filters?.maxPrice !== undefined) query = query.lte('price', filters.maxPrice);
  if (filters?.bedrooms !== undefined) query = query.gte('bedrooms', filters.bedrooms);
  if (filters?.featured !== undefined) query = query.eq('is_featured', filters.featured);

  query = query.order('created_at', { ascending: false });

  const { data, error } = await query;
  if (error) {
    console.error('Supabase getProperties error:', error);
    return localDb.getProperties(filters);
  }
  return (data || []).map(mapRowToProperty);
}

export async function getPropertyBySlug(slug: string): Promise<Property | null> {
  const supabase = getSupabase();
  if (!supabase) {
    return localDb.getPropertyBySlug(slug) || null;
  }

  const { data, error } = await supabase
    .from('properties')
    .select('*')
    .eq('slug', slug)
    .maybeSingle();

  if (error) {
    console.error('Supabase getPropertyBySlug error:', error);
    return localDb.getPropertyBySlug(slug) || null;
  }
  if (!data) {
    // Also attempt ID lookup if slug matches id
    const byId = await getPropertyById(slug);
    return byId;
  }
  return mapRowToProperty(data);
}

export async function getPropertyById(id: string): Promise<Property | null> {
  const supabase = getSupabase();
  if (!supabase) {
    return localDb.getProperties().find(p => p.id === id) || null;
  }

  const { data, error } = await supabase
    .from('properties')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error || !data) return null;
  return mapRowToProperty(data);
}

export async function createProperty(prop: Partial<Property>): Promise<Property> {
  const supabase = getSupabase();
  const id = prop.id || 'prop-' + Date.now();
  const slug = prop.slug || (prop.title || 'prop').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') + '-' + Date.now();
  const now = new Date().toISOString();

  const newProp: Property = {
    id,
    title: prop.title || 'Untitled Property',
    slug,
    refNumber: prop.refNumber || `SA-${Date.now().toString().slice(-4)}`,
    shortDescription: prop.shortDescription || '',
    fullDescription: prop.fullDescription || '',
    propertyType: prop.propertyType || 'Duplex',
    listingType: prop.listingType || 'sale',
    price: Number(prop.price) || 0,
    previousPrice: prop.previousPrice,
    pricePeriod: prop.pricePeriod,
    location: prop.location || 'Ajah, Lagos',
    area: prop.area || 'Ajah',
    address: prop.address || '',
    bedrooms: Number(prop.bedrooms) || 0,
    bathrooms: Number(prop.bathrooms) || 0,
    toilets: Number(prop.toilets) || 0,
    parkingSpaces: Number(prop.parkingSpaces) || 0,
    propertySize: prop.propertySize,
    landSize: prop.landSize,
    amenities: prop.amenities || [],
    features: prop.features || [],
    googleMapsUrl: prop.googleMapsUrl,
    videoUrl: prop.videoUrl,
    mainImage: prop.mainImage || '',
    gallery: prop.gallery || (prop.mainImage ? [prop.mainImage] : []),
    status: prop.status || 'available',
    isFeatured: Boolean(prop.isFeatured),
    seoTitle: prop.seoTitle,
    seoDescription: prop.seoDescription,
    createdAt: now,
    updatedAt: now
  };

  if (!supabase) {
    return localDb.createProperty(newProp as any);
  }

  const row = mapPropertyToRow(newProp);
  const { data, error } = await supabase
    .from('properties')
    .insert([row])
    .select()
    .single();

  if (error) {
    console.error('Supabase createProperty error:', error);
    throw new Error(error.message);
  }
  return mapRowToProperty(data);
}

export async function updateProperty(id: string, updates: Partial<Property>): Promise<Property | null> {
  const supabase = getSupabase();
  if (!supabase) {
    return localDb.updateProperty(id, updates);
  }

  const rowUpdates = mapPropertyToRow({
    ...updates,
    updatedAt: new Date().toISOString()
  });
  delete rowUpdates.id;

  const { data, error } = await supabase
    .from('properties')
    .update(rowUpdates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Supabase updateProperty error:', error);
    return null;
  }
  return mapRowToProperty(data);
}

export async function deleteProperty(id: string): Promise<boolean> {
  const supabase = getSupabase();
  if (!supabase) {
    return localDb.deleteProperty(id);
  }

  const { error } = await supabase
    .from('properties')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Supabase deleteProperty error:', error);
    return false;
  }
  return true;
}

export async function duplicateProperty(id: string): Promise<Property | null> {
  const orig = await getPropertyById(id);
  if (!orig) return null;

  const { id: _oldId, slug: _oldSlug, ...rest } = orig;
  return createProperty({
    ...rest,
    title: `${orig.title} (Copy)`,
    slug: `${orig.slug}-copy-${Date.now()}`
  });
}
