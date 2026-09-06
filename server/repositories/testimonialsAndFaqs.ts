import { getSupabase } from '../supabase.js';
import { db as localDb } from '../db.js';
import type { Testimonial, FaqItem } from '../../src/types.js';

export async function getTestimonials(): Promise<Testimonial[]> {
  const supabase = getSupabase();
  if (!supabase) {
    return localDb.getTestimonials();
  }

  const { data, error } = await supabase
    .from('testimonials')
    .select('*')
    .order('created_at', { ascending: false });

  if (error || !data) return localDb.getTestimonials();
  return data.map((row: any) => ({
    id: row.id,
    name: row.name,
    role: row.role || '',
    avatar: row.avatar || '',
    rating: Number(row.rating) || 5,
    text: row.text,
    serviceOrProperty: row.service_or_property || '',
    isFeatured: Boolean(row.is_featured),
    createdAt: row.created_at || new Date().toISOString()
  }));
}

export async function createTestimonial(t: Partial<Testimonial>): Promise<Testimonial> {
  const supabase = getSupabase();
  const id = t.id || 'test-' + Date.now();
  const now = new Date().toISOString();

  const item: Testimonial = {
    id,
    name: t.name || 'Anonymous',
    role: t.role || 'Client',
    avatar: t.avatar || '',
    rating: Number(t.rating) || 5,
    text: t.text || '',
    serviceOrProperty: t.serviceOrProperty || '',
    isFeatured: t.isFeatured !== undefined ? t.isFeatured : true,
    createdAt: now
  };

  if (!supabase) return localDb.createTestimonial(item as any);

  const { data, error } = await supabase
    .from('testimonials')
    .insert([{
      id,
      name: item.name,
      role: item.role,
      avatar: item.avatar,
      rating: item.rating,
      text: item.text,
      service_or_property: item.serviceOrProperty,
      is_featured: item.isFeatured,
      created_at: now
    }])
    .select()
    .single();

  if (error) throw new Error(error.message);
  return item;
}

export async function deleteTestimonial(id: string): Promise<boolean> {
  const supabase = getSupabase();
  if (!supabase) return localDb.deleteTestimonial(id);

  const { error } = await supabase.from('testimonials').delete().eq('id', id);
  return !error;
}

export async function getFaqs(): Promise<FaqItem[]> {
  const supabase = getSupabase();
  if (!supabase) return localDb.getFaqs();

  const { data, error } = await supabase.from('faqs').select('*');
  if (error || !data) return localDb.getFaqs();

  return data.map((row: any) => ({
    id: row.id,
    category: row.category || 'General',
    question: row.question,
    answer: row.answer
  }));
}
