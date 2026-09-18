import { getSupabase } from '../supabase.js';
import { db as localDb } from '../db.js';
import type { InspectionRequest } from '../../src/types.js';

function mapRowToInspection(row: any): InspectionRequest {
  return {
    id: row.id,
    type: row.type || 'inspection',
    referenceNumber: row.reference_number || row.ref_number || ('INSP-' + row.id.slice(-5)),
    customerName: row.customer_name || row.name || 'Prospective Client',
    customerPhone: row.customer_phone || row.phone || '',
    customerEmail: row.customer_email || row.email || undefined,
    listingId: row.listing_id || undefined,
    listingTitle: row.listing_title || 'General Advisory Request',
    listingType: row.listing_type || 'property',
    listingSlug: row.listing_slug || undefined,
    preferredDate: row.preferred_date || new Date().toISOString().split('T')[0],
    preferredTime: row.preferred_time || undefined,
    checkInDate: row.check_in_date || undefined,
    checkOutDate: row.check_out_date || undefined,
    numberOfGuests: row.number_of_guests ? Number(row.number_of_guests) : undefined,
    rentalDays: row.rental_days ? Number(row.rental_days) : undefined,
    notes: row.notes || undefined,
    status: row.status || 'pending',
    source: row.source || 'AI Chat',
    createdAt: row.created_at || row.date || new Date().toISOString(),
    updatedAt: row.updated_at || undefined
  };
}

function mapInspectionToRow(req: Partial<InspectionRequest>): any {
  const row: any = {};
  if (req.id !== undefined) row.id = req.id;
  if (req.type !== undefined) row.type = req.type;
  if (req.referenceNumber !== undefined) row.reference_number = req.referenceNumber;
  if (req.customerName !== undefined) row.customer_name = req.customerName;
  if (req.customerPhone !== undefined) row.customer_phone = req.customerPhone;
  if (req.customerEmail !== undefined) row.customer_email = req.customerEmail;
  if (req.listingId !== undefined) row.listing_id = req.listingId;
  if (req.listingTitle !== undefined) row.listing_title = req.listingTitle;
  if (req.listingType !== undefined) row.listing_type = req.listingType;
  if (req.listingSlug !== undefined) row.listing_slug = req.listingSlug;
  if (req.preferredDate !== undefined) row.preferred_date = req.preferredDate;
  if (req.preferredTime !== undefined) row.preferred_time = req.preferredTime;
  if (req.checkInDate !== undefined) row.check_in_date = req.checkInDate;
  if (req.checkOutDate !== undefined) row.check_out_date = req.checkOutDate;
  if (req.numberOfGuests !== undefined) row.number_of_guests = req.numberOfGuests;
  if (req.rentalDays !== undefined) row.rental_days = req.rentalDays;
  if (req.notes !== undefined) row.notes = req.notes;
  if (req.status !== undefined) row.status = req.status;
  if (req.source !== undefined) row.source = req.source;
  if (req.createdAt !== undefined) row.created_at = req.createdAt;
  row.updated_at = new Date().toISOString();
  return row;
}

export async function getInspectionRequests(): Promise<InspectionRequest[]> {
  const supabase = getSupabase();
  if (!supabase) {
    return localDb.getInspectionRequests();
  }

  const { data, error } = await supabase
    .from('inspection_requests')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.warn('Supabase getInspectionRequests error, falling back to localDb:', error.message);
    return localDb.getInspectionRequests();
  }
  return (data || []).map(mapRowToInspection);
}

export async function getInspectionRequestById(id: string): Promise<InspectionRequest | null> {
  const supabase = getSupabase();
  if (!supabase) {
    return localDb.getInspectionRequestById(id);
  }

  const { data, error } = await supabase
    .from('inspection_requests')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error || !data) {
    return localDb.getInspectionRequestById(id);
  }
  return mapRowToInspection(data);
}

export async function createInspectionRequest(req: Partial<InspectionRequest>): Promise<InspectionRequest> {
  const supabase = getSupabase();
  const id = req.id || 'insp-' + Date.now();
  const refNum = req.referenceNumber || (req.type === 'shortlet_booking' ? 'BKG-' : req.type === 'vehicle_booking' ? 'VEH-' : 'INSP-') + Math.floor(10000 + Math.random() * 90000);
  const now = new Date().toISOString();

  const prepared: InspectionRequest = {
    id,
    type: req.type || 'inspection',
    referenceNumber: refNum,
    customerName: req.customerName || 'Prospective Client',
    customerPhone: req.customerPhone || '',
    customerEmail: req.customerEmail,
    listingId: req.listingId,
    listingTitle: req.listingTitle || 'General Advisory Request',
    listingType: req.listingType || 'property',
    listingSlug: req.listingSlug,
    preferredDate: req.preferredDate || now.split('T')[0],
    preferredTime: req.preferredTime || '11:00 AM',
    checkInDate: req.checkInDate,
    checkOutDate: req.checkOutDate,
    numberOfGuests: req.numberOfGuests,
    rentalDays: req.rentalDays,
    notes: req.notes,
    status: req.status || 'pending',
    source: req.source || 'AI Chat',
    createdAt: req.createdAt || now,
    updatedAt: now
  };

  // Always sync to localDb first for zero-latency local fallback
  localDb.createInspectionRequest(prepared);

  if (!supabase) {
    return prepared;
  }

  try {
    const row = mapInspectionToRow(prepared);
    const { data, error } = await supabase
      .from('inspection_requests')
      .insert([row])
      .select()
      .single();

    if (error) {
      console.warn('Supabase createInspectionRequest warning, localDb used:', error.message);
      return prepared;
    }
    return mapRowToInspection(data);
  } catch (err: any) {
    console.warn('Supabase insert exception:', err.message);
    return prepared;
  }
}

export async function updateInspectionRequest(id: string, updates: Partial<InspectionRequest>): Promise<InspectionRequest | null> {
  const localUpdated = localDb.updateInspectionRequest(id, updates);
  const supabase = getSupabase();
  if (!supabase) {
    return localUpdated;
  }

  try {
    const rowUpdates = mapInspectionToRow(updates);
    delete rowUpdates.id;

    const { data, error } = await supabase
      .from('inspection_requests')
      .update(rowUpdates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.warn('Supabase updateInspectionRequest warning:', error.message);
      return localUpdated;
    }
    return mapRowToInspection(data);
  } catch (err) {
    return localUpdated;
  }
}

export async function deleteInspectionRequest(id: string): Promise<boolean> {
  localDb.deleteInspectionRequest(id);
  const supabase = getSupabase();
  if (!supabase) {
    return true;
  }

  try {
    const { error } = await supabase
      .from('inspection_requests')
      .delete()
      .eq('id', id);

    if (error) {
      console.warn('Supabase deleteInspectionRequest warning:', error.message);
    }
    return true;
  } catch {
    return true;
  }
}
