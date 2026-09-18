-- ==============================================================================
-- SELLING AJAH: AI CONCIERGE & TELEPHONY ENTERPRISE SCHEMA FOR SUPABASE
-- Run this script in the Supabase SQL Editor to provision persistent database tables
-- ==============================================================================
-- IDEMPOTENCY & SAFETY GUARANTEES:
-- - 100% IDEMPOTENT: Safe to run repeatedly without errors.
-- - NO existing tables are dropped or modified.
-- - NO existing customer records, conversations, or inventory are deleted or reset.
-- - Existing data in inspection_requests, ai_conversations, ai_settings is PRESERVED.
-- - NO public / anonymous INSERT or SELECT access is granted.
-- - Policies safely use DROP POLICY IF EXISTS before CREATE POLICY.
-- - Server operations execute strictly server-side via Supabase service_role.
-- ==============================================================================

-- 1. Inspection & Booking Requests Table (Non-destructive)
CREATE TABLE IF NOT EXISTS public.inspection_requests (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL DEFAULT 'inspection', -- 'inspection' | 'shortlet_booking' | 'vehicle_booking'
  reference_number TEXT NOT NULL UNIQUE,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_email TEXT,
  listing_id TEXT,
  listing_title TEXT NOT NULL,
  listing_type TEXT NOT NULL DEFAULT 'property', -- 'property' | 'shortlet' | 'vehicle'
  listing_slug TEXT,
  preferred_date TEXT NOT NULL,
  preferred_time TEXT,
  check_in_date TEXT,
  check_out_date TEXT,
  number_of_guests INTEGER,
  rental_days INTEGER,
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending' | 'requested' | 'awaiting_confirmation' | 'confirmed' | 'completed' | 'cancelled'
  source TEXT NOT NULL DEFAULT 'AI Chat', -- 'AI Chat' | 'AI Voice' | 'AI Phone' | 'Website Direct'
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_inspection_requests_status ON public.inspection_requests(status);
CREATE INDEX IF NOT EXISTS idx_inspection_requests_type ON public.inspection_requests(type);
CREATE INDEX IF NOT EXISTS idx_inspection_requests_created ON public.inspection_requests(created_at DESC);

-- 2. AI Conversation Logs Table (Non-destructive)
CREATE TABLE IF NOT EXISTS public.ai_conversations (
  id TEXT PRIMARY KEY,
  channel TEXT NOT NULL DEFAULT 'chat', -- 'chat' | 'voice' | 'phone'
  customer_name TEXT,
  customer_phone TEXT,
  customer_email TEXT,
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ended_at TIMESTAMPTZ,
  intent TEXT NOT NULL DEFAULT 'General Inquiries',
  outcome TEXT NOT NULL DEFAULT 'information_provided',
  human_handoff_requested BOOLEAN NOT NULL DEFAULT FALSE,
  summary TEXT,
  message_count INTEGER NOT NULL DEFAULT 1,
  related_listing_ids JSONB DEFAULT '[]'::JSONB,
  transcript JSONB DEFAULT '[]'::JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ai_conversations_channel ON public.ai_conversations(channel);
CREATE INDEX IF NOT EXISTS idx_ai_conversations_handoff ON public.ai_conversations(human_handoff_requested);
CREATE INDEX IF NOT EXISTS idx_ai_conversations_created ON public.ai_conversations(created_at DESC);

-- 3. AI Concierge Settings Table (Non-destructive)
CREATE TABLE IF NOT EXISTS public.ai_settings (
  id TEXT PRIMARY KEY DEFAULT 'default',
  enabled BOOLEAN NOT NULL DEFAULT TRUE,
  assistant_name TEXT NOT NULL DEFAULT 'Selling Ajah Concierge',
  voice_persona TEXT NOT NULL DEFAULT 'Amina',
  welcome_greeting TEXT NOT NULL,
  phone_greeting TEXT NOT NULL,
  inspection_notice TEXT NOT NULL,
  booking_notice TEXT NOT NULL,
  disclaimer_notice TEXT NOT NULL,
  business_bio TEXT NOT NULL,
  allowed_areas TEXT[] DEFAULT ARRAY['Ajah', 'Abraham Adesanya', 'Orchid Road', 'Chevron', 'VGC', 'Ikota', 'Sangotedo', 'Lekki Phase 1'],
  fallback_whatsapp TEXT NOT NULL DEFAULT '+234 810 901 2192',
  fallback_phone TEXT NOT NULL DEFAULT '+234 810 901 2192',
  telephony_enabled BOOLEAN NOT NULL DEFAULT TRUE,
  telephony_provider TEXT NOT NULL DEFAULT 'twilio',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Seed default AI settings if not present (factual, no unsupported assumptions, does not overwrite existing data)
INSERT INTO public.ai_settings (
  id,
  enabled,
  assistant_name,
  voice_persona,
  welcome_greeting,
  phone_greeting,
  inspection_notice,
  booking_notice,
  disclaimer_notice,
  business_bio,
  fallback_whatsapp,
  fallback_phone,
  telephony_enabled
) VALUES (
  'default',
  TRUE,
  'Selling Ajah Concierge',
  'Amina',
  'Welcome to Selling Ajah. I am your assistant for property inquiries, serviced shortlets, and vehicle rentals. How may I assist you today?',
  'Thank you for calling Selling Ajah. You are speaking with Selling Ajah''s AI Concierge. I can help with property inquiries, serviced shortlets, vehicle rentals, or taking an inspection request. How can I direct your inquiry today?',
  'Inspection requests are submitted for staff review. Our team will verify property access and confirm your appointment directly.',
  'Booking requests are submitted as pending reservations. A team member will verify availability and confirm your reservation.',
  'Property details, titles, prices, and amenities reflect documented database records in the active portfolio.',
  'Selling Ajah provides residential and commercial property sales, vetted serviced shortlets, and vehicle rentals in the Ajah and Lekki corridor.',
  '+234 810 901 2192',
  '+234 810 901 2192',
  TRUE
) ON CONFLICT (id) DO NOTHING;

-- ==============================================================================
-- SECURITY ARCHITECTURE: RLS & STRICT PERMISSIONS
-- Browser -> Selling Ajah Server API -> Supabase service_role
-- Operational tables are NOT exposed to anonymous or public users.
-- ==============================================================================

-- Enable Row Level Security on all three tables (Idempotent)
ALTER TABLE public.inspection_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_settings ENABLE ROW LEVEL SECURITY;

-- Revoke all permissions from anon and public roles (Idempotent)
REVOKE ALL ON TABLE public.inspection_requests FROM anon, public;
REVOKE ALL ON TABLE public.ai_conversations FROM anon, public;
REVOKE ALL ON TABLE public.ai_settings FROM anon, public;

-- Grant permissions strictly to service_role used by Selling Ajah server backend (Idempotent)
GRANT ALL ON TABLE public.inspection_requests TO service_role;
GRANT ALL ON TABLE public.ai_conversations TO service_role;
GRANT ALL ON TABLE public.ai_settings TO service_role;

-- Authenticated staff permissions for optional internal dashboard access (Idempotent)
GRANT SELECT, UPDATE ON TABLE public.inspection_requests TO authenticated;
GRANT SELECT ON TABLE public.ai_conversations TO authenticated;
GRANT ALL ON TABLE public.ai_settings TO authenticated;

-- ==============================================================================
-- IDEMPOTENT RLS POLICIES FOR AI CONCIERGE TABLES
-- Drops prior versions of these specific policies if already created, then creates them.
-- Never drops tables or deletes data.
-- ==============================================================================

-- Clean up any legacy anon policies if they exist from prior runs
DROP POLICY IF EXISTS "Allow anonymous insert to inspection_requests" ON public.inspection_requests;
DROP POLICY IF EXISTS "Allow public insert to inspection_requests" ON public.inspection_requests;
DROP POLICY IF EXISTS "Allow anonymous insert to ai_conversations" ON public.ai_conversations;
DROP POLICY IF EXISTS "Allow public insert to ai_conversations" ON public.ai_conversations;

-- 1. Policies for inspection_requests
DROP POLICY IF EXISTS "Allow authenticated staff to read inspection_requests" ON public.inspection_requests;
CREATE POLICY "Allow authenticated staff to read inspection_requests" 
  ON public.inspection_requests FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Allow authenticated staff to update inspection_requests" ON public.inspection_requests;
CREATE POLICY "Allow authenticated staff to update inspection_requests" 
  ON public.inspection_requests FOR UPDATE TO authenticated USING (true);

-- 2. Policies for ai_conversations
DROP POLICY IF EXISTS "Allow authenticated staff to read ai_conversations" ON public.ai_conversations;
CREATE POLICY "Allow authenticated staff to read ai_conversations" 
  ON public.ai_conversations FOR SELECT TO authenticated USING (true);

-- 3. Policies for ai_settings
DROP POLICY IF EXISTS "Allow authenticated staff to manage ai_settings" ON public.ai_settings;
CREATE POLICY "Allow authenticated staff to manage ai_settings" 
  ON public.ai_settings FOR ALL TO authenticated USING (true);
