import { getSupabase } from '../supabase.js';
import { db as localDb } from '../db.js';
import type { Enquiry } from '../../src/types.js';

function mapRowToEnquiry(row: any): Enquiry {
  return {
    id: row.id,
    name: row.name,
    phone: row.phone || '',
    email: row.email || '',
    whatsapp: row.whatsapp || undefined,
    service: row.service || 'general',
    listingType: row.listing_type || undefined,
    listingId: row.listing_id || row.property_id || undefined,
    listingTitle: row.listing_title || row.property_title || undefined,
    budget: row.budget || undefined,
    preferredLocation: row.preferred_location || undefined,
    message: row.message || '',
    status: row.status || 'new',
    notes: row.notes || undefined,
    date: row.date || row.created_at || new Date().toISOString()
  };
}

function mapEnquiryToRow(e: Partial<Enquiry>): any {
  const row: any = {};
  if (e.id !== undefined) row.id = e.id;
  if (e.name !== undefined) row.name = e.name;
  if (e.phone !== undefined) row.phone = e.phone;
  if (e.email !== undefined) row.email = e.email;
  if (e.whatsapp !== undefined) row.whatsapp = e.whatsapp;
  if (e.service !== undefined) row.service = e.service;
  if (e.listingType !== undefined) row.listing_type = e.listingType;
  if (e.listingId !== undefined) {
    row.listing_id = e.listingId;
    row.property_id = e.listingId;
  }
  if (e.listingTitle !== undefined) {
    row.listing_title = e.listingTitle;
    row.property_title = e.listingTitle;
  }
  if (e.budget !== undefined) row.budget = e.budget;
  if (e.preferredLocation !== undefined) row.preferred_location = e.preferredLocation;
  if (e.message !== undefined) row.message = e.message;
  if (e.status !== undefined) row.status = e.status;
  if (e.notes !== undefined) row.notes = e.notes;
  if (e.date !== undefined) row.date = e.date;
  return row;
}

export async function getEnquiries(): Promise<Enquiry[]> {
  const supabase = getSupabase();
  if (!supabase) {
    return localDb.getEnquiries();
  }

  const { data, error } = await supabase
    .from('enquiries')
    .select('*')
    .order('date', { ascending: false });

  if (error) {
    console.error('Supabase getEnquiries error:', error);
    return localDb.getEnquiries();
  }
  return (data || []).map(mapRowToEnquiry);
}

export async function createEnquiry(enq: Partial<Enquiry>): Promise<Enquiry> {
  const supabase = getSupabase();
  const id = enq.id || 'enq-' + Date.now();
  const now = new Date().toISOString();

  const newEnq: Enquiry = {
    id,
    name: enq.name || 'Anonymous',
    phone: enq.phone || '',
    email: enq.email || '',
    whatsapp: enq.whatsapp,
    service: enq.service || 'general',
    listingType: enq.listingType,
    listingId: enq.listingId || (enq as any).propertyId,
    listingTitle: enq.listingTitle || (enq as any).propertyTitle,
    budget: enq.budget,
    preferredLocation: enq.preferredLocation,
    message: enq.message || '',
    status: enq.status || 'new',
    notes: enq.notes,
    date: enq.date || now
  };

  if (!supabase) {
    return localDb.createEnquiry(newEnq as any);
  }

  const row = mapEnquiryToRow(newEnq);
  const { data, error } = await supabase
    .from('enquiries')
    .insert([row])
    .select()
    .single();

  if (error) {
    console.error('Supabase createEnquiry error:', error);
    throw new Error(error.message);
  }
  return mapRowToEnquiry(data);
}

export async function updateEnquiry(id: string, updates: Partial<Enquiry>): Promise<Enquiry | null> {
  const supabase = getSupabase();
  if (!supabase) {
    return localDb.updateEnquiry(id, updates);
  }

  const rowUpdates = mapEnquiryToRow(updates);
  delete rowUpdates.id;

  const { data, error } = await supabase
    .from('enquiries')
    .update(rowUpdates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Supabase updateEnquiry error:', error);
    return null;
  }
  return mapRowToEnquiry(data);
}

export async function deleteEnquiry(id: string): Promise<boolean> {
  const supabase = getSupabase();
  if (!supabase) {
    return localDb.deleteEnquiry(id);
  }

  const { error } = await supabase
    .from('enquiries')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Supabase deleteEnquiry error:', error);
    return false;
  }
  return true;
}
