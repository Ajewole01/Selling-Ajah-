import { getSupabase } from '../supabase.js';
import { db as localDb } from '../db.js';
import type { AiConversationRecord, AiConciergeSettings } from '../../src/types.js';

function mapRowToConversation(row: any): AiConversationRecord {
  return {
    id: row.id,
    channel: row.channel || 'chat',
    customerName: row.customer_name || undefined,
    customerPhone: row.customer_phone || undefined,
    customerEmail: row.customer_email || undefined,
    startedAt: row.started_at || row.created_at || new Date().toISOString(),
    endedAt: row.ended_at || undefined,
    intent: row.intent || 'General Inquiries',
    outcome: row.outcome || 'information_provided',
    humanHandoffRequested: Boolean(row.human_handoff_requested),
    summary: row.summary || '',
    messageCount: row.message_count ? Number(row.message_count) : 1,
    relatedListingIds: Array.isArray(row.related_listing_ids) ? row.related_listing_ids : [],
    transcript: Array.isArray(row.transcript) ? row.transcript : [],
    createdAt: row.created_at || new Date().toISOString()
  };
}

function mapConversationToRow(rec: Partial<AiConversationRecord>): any {
  const row: any = {};
  if (rec.id !== undefined) row.id = rec.id;
  if (rec.channel !== undefined) row.channel = rec.channel;
  if (rec.customerName !== undefined) row.customer_name = rec.customerName;
  if (rec.customerPhone !== undefined) row.customer_phone = rec.customerPhone;
  if (rec.customerEmail !== undefined) row.customer_email = rec.customerEmail;
  if (rec.startedAt !== undefined) row.started_at = rec.startedAt;
  if (rec.endedAt !== undefined) row.ended_at = rec.endedAt;
  if (rec.intent !== undefined) row.intent = rec.intent;
  if (rec.outcome !== undefined) row.outcome = rec.outcome;
  if (rec.humanHandoffRequested !== undefined) row.human_handoff_requested = rec.humanHandoffRequested;
  if (rec.summary !== undefined) row.summary = rec.summary;
  if (rec.messageCount !== undefined) row.message_count = rec.messageCount;
  if (rec.relatedListingIds !== undefined) row.related_listing_ids = rec.relatedListingIds;
  if (rec.transcript !== undefined) row.transcript = rec.transcript;
  row.created_at = rec.createdAt || new Date().toISOString();
  return row;
}

export async function getConversations(): Promise<AiConversationRecord[]> {
  const supabase = getSupabase();
  if (!supabase) {
    return localDb.getConversations();
  }

  const { data, error } = await supabase
    .from('ai_conversations')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.warn('Supabase getConversations warning, falling back to localDb:', error.message);
    return localDb.getConversations();
  }
  return (data || []).map(mapRowToConversation);
}

export async function getConversationById(id: string): Promise<AiConversationRecord | null> {
  const supabase = getSupabase();
  if (!supabase) {
    return localDb.getConversationById(id);
  }

  const { data, error } = await supabase
    .from('ai_conversations')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error || !data) {
    return localDb.getConversationById(id);
  }
  return mapRowToConversation(data);
}

export async function saveConversation(rec: Partial<AiConversationRecord>): Promise<AiConversationRecord> {
  const localSaved = localDb.saveConversation(rec);
  const supabase = getSupabase();
  if (!supabase) {
    return localSaved;
  }

  try {
    const row = mapConversationToRow(localSaved);
    const { data, error } = await supabase
      .from('ai_conversations')
      .upsert(row)
      .select()
      .single();

    if (error) {
      console.warn('Supabase saveConversation warning:', error.message);
      return localSaved;
    }
    return mapRowToConversation(data);
  } catch {
    return localSaved;
  }
}

export async function deleteConversation(id: string): Promise<boolean> {
  localDb.deleteConversation(id);
  const supabase = getSupabase();
  if (!supabase) {
    return true;
  }

  try {
    await supabase.from('ai_conversations').delete().eq('id', id);
    return true;
  } catch {
    return true;
  }
}

// AI Settings Repository
export async function getAiConciergeSettings(): Promise<AiConciergeSettings> {
  const supabase = getSupabase();
  if (!supabase) {
    return localDb.getAiConciergeSettings();
  }

  try {
    const { data, error } = await supabase
      .from('ai_settings')
      .select('*')
      .eq('id', 'default')
      .maybeSingle();

    if (error || !data) {
      return localDb.getAiConciergeSettings();
    }
    return {
      enabled: data.enabled ?? true,
      assistantName: data.assistant_name || 'Selling Ajah Concierge',
      voicePersona: data.voice_persona || 'Amina (Luxury Female)',
      welcomeGreeting: data.welcome_greeting || '',
      phoneGreeting: data.phone_greeting || '',
      inspectionNotice: data.inspection_notice || '',
      bookingNotice: data.booking_notice || '',
      disclaimerNotice: data.disclaimer_notice || '',
      businessBio: data.business_bio || '',
      allowedAreas: data.allowed_areas || ['Ajah', 'Lekki Phase 1', 'Abraham Adesanya'],
      fallbackWhatsApp: data.fallback_whatsapp || '+234 810 901 2192',
      fallbackPhone: data.fallback_phone || '+234 810 901 2192',
      telephonyEnabled: data.telephony_enabled ?? true,
      telephonyProvider: data.telephony_provider || 'twilio'
    };
  } catch {
    return localDb.getAiConciergeSettings();
  }
}

export async function updateAiConciergeSettings(settings: Partial<AiConciergeSettings>): Promise<AiConciergeSettings> {
  const localUpdated = localDb.updateAiConciergeSettings(settings);
  const supabase = getSupabase();
  if (!supabase) {
    return localUpdated;
  }

  try {
    const row: any = {
      id: 'default',
      updated_at: new Date().toISOString()
    };
    if (settings.enabled !== undefined) row.enabled = settings.enabled;
    if (settings.assistantName !== undefined) row.assistant_name = settings.assistantName;
    if (settings.voicePersona !== undefined) row.voice_persona = settings.voicePersona;
    if (settings.welcomeGreeting !== undefined) row.welcome_greeting = settings.welcomeGreeting;
    if (settings.phoneGreeting !== undefined) row.phone_greeting = settings.phoneGreeting;
    if (settings.inspectionNotice !== undefined) row.inspection_notice = settings.inspectionNotice;
    if (settings.bookingNotice !== undefined) row.booking_notice = settings.bookingNotice;
    if (settings.disclaimerNotice !== undefined) row.disclaimer_notice = settings.disclaimerNotice;
    if (settings.businessBio !== undefined) row.business_bio = settings.businessBio;
    if (settings.allowedAreas !== undefined) row.allowed_areas = settings.allowedAreas;
    if (settings.fallbackWhatsApp !== undefined) row.fallback_whatsapp = settings.fallbackWhatsApp;
    if (settings.fallbackPhone !== undefined) row.fallback_phone = settings.fallbackPhone;
    if (settings.telephonyEnabled !== undefined) row.telephony_enabled = settings.telephonyEnabled;
    if (settings.telephonyProvider !== undefined) row.telephony_provider = settings.telephonyProvider;

    await supabase.from('ai_settings').upsert(row);
    return localUpdated;
  } catch {
    return localUpdated;
  }
}
